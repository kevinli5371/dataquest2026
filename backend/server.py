import asyncio
import json
import math
import os
import time
import urllib.request
from contextlib import asynccontextmanager

import cv2
import mediapipe as mp
import numpy as np
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from ultralytics import YOLO

# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------
YOLO_MODEL_PATH = "backend/model/dataset/runs/detect/train/weights/best.pt"
HAND_MODEL_PATH = "backend/model/hand_landmarker.task"
HAND_MODEL_URL = (
    "https://storage.googleapis.com/mediapipe-models/"
    "hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task"
)
CONF_THRESHOLD = 0.25
PROXIMITY_THRESHOLD = 100   # pixels
SPEAK_COOLDOWN = 1.5        # seconds between proximity events
JPEG_QUALITY = 75           # 0-100, lower = smaller frames
TARGET_FPS = 20


# ---------------------------------------------------------------------------
# Model initialisation (done once at startup)
# ---------------------------------------------------------------------------
def ensure_hand_model(path: str) -> None:
    if os.path.exists(path):
        return
    os.makedirs(os.path.dirname(path), exist_ok=True)
    print(f"Downloading MediaPipe hand model → {path}")
    urllib.request.urlretrieve(HAND_MODEL_URL, path)


def init_hand_tracker() -> mp.tasks.vision.HandLandmarker:
    ensure_hand_model(HAND_MODEL_PATH)
    options = mp.tasks.vision.HandLandmarkerOptions(
        base_options=mp.tasks.BaseOptions(model_asset_path=HAND_MODEL_PATH),
        running_mode=mp.tasks.vision.RunningMode.IMAGE,
        num_hands=1,
    )
    return mp.tasks.vision.HandLandmarker.create_from_options(options)


def distance(p1: tuple, p2: tuple) -> float:
    return math.sqrt((p1[0] - p2[0]) ** 2 + (p1[1] - p2[1]) ** 2)


# Globals populated at startup
yolo_model: YOLO | None = None
hand_tracker: mp.tasks.vision.HandLandmarker | None = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    global yolo_model, hand_tracker
    print("Loading YOLO model…")
    yolo_model = YOLO(YOLO_MODEL_PATH)
    print("Loading MediaPipe hand tracker…")
    hand_tracker = init_hand_tracker()
    print("Models ready.")
    yield
    if hasattr(hand_tracker, "close"):
        hand_tracker.close()
    print("Server shut down.")


# ---------------------------------------------------------------------------
# App
# ---------------------------------------------------------------------------
app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# WebSocket endpoint
# ---------------------------------------------------------------------------
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    print("Client connected")

    cap = cv2.VideoCapture(0)
    if not cap.isOpened():
        await websocket.send_text(json.dumps({"type": "error", "message": "Camera not available"}))
        await websocket.close()
        return

    last_spoken_time = 0.0
    frame_interval = 1.0 / TARGET_FPS

    try:
        while True:
            loop_start = time.time()

            ret, frame = cap.read()
            if not ret:
                break

            # ---- YOLO detection ----------------------------------------
            results = yolo_model(frame, conf=CONF_THRESHOLD, verbose=False)[0]

            # ---- MediaPipe hand detection --------------------------------
            rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb)
            hand_results = hand_tracker.detect(mp_image)

            hand_point = None
            h, w, _ = frame.shape

            if hand_results.hand_landmarks:
                landmarks = hand_results.hand_landmarks[0]
                hx = int(landmarks[8].x * w)
                hy = int(landmarks[8].y * h)
                hand_point = (hx, hy)
                cv2.circle(frame, hand_point, 12, (0, 255, 0), -1)

            # ---- Process detections + proximity -------------------------
            detections = []
            proximity_label = None

            for box in results.boxes:
                x1, y1, x2, y2 = map(int, box.xyxy[0])
                cls = int(box.cls[0])
                conf = float(box.conf[0])
                label = yolo_model.names[cls]

                cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 120, 255), 2)
                cv2.putText(
                    frame, f"{label} {conf:.2f}",
                    (x1, max(y1 - 10, 10)),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.55, (0, 120, 255), 2,
                )

                tool_center = ((x1 + x2) // 2, (y1 + y2) // 2)
                near = False

                if hand_point:
                    dist = distance(hand_point, tool_center)
                    if dist < PROXIMITY_THRESHOLD:
                        near = True
                        current_time = time.time()
                        if current_time - last_spoken_time > SPEAK_COOLDOWN:
                            proximity_label = label
                            last_spoken_time = current_time
                            print(f"Hand near → {label}")

                detections.append({
                    "label": label,
                    "conf": round(conf, 3),
                    "box": [x1, y1, x2, y2],
                    "near": near,
                })

            # ---- Send annotated frame as binary JPEG --------------------
            encode_params = [cv2.IMWRITE_JPEG_QUALITY, JPEG_QUALITY]
            _, buffer = cv2.imencode(".jpg", frame, encode_params)
            await websocket.send_bytes(buffer.tobytes())

            # ---- Send detection + proximity JSON ------------------------
            payload = {
                "type": "detections",
                "detections": detections,
                "hand": list(hand_point) if hand_point else None,
            }
            if proximity_label:
                payload["proximity"] = proximity_label

            await websocket.send_text(json.dumps(payload))

            # ---- Throttle to TARGET_FPS ---------------------------------
            elapsed = time.time() - loop_start
            sleep_time = frame_interval - elapsed
            if sleep_time > 0:
                await asyncio.sleep(sleep_time)

    except WebSocketDisconnect:
        print("Client disconnected")
    finally:
        cap.release()
