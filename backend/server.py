import asyncio
import json
import math
import os
import time
import urllib.request
from collections import deque
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
YOLO_MODEL_PATH = "model/dataset/runs/detect/train/weights/best.pt"
HAND_MODEL_PATH = "model/hand_landmarker.task"
HAND_MODEL_URL = (
    "https://storage.googleapis.com/mediapipe-models/"
    "hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task"
)
CONF_THRESHOLD  = 0.8
DISABLED_LABELS = {"DeBakey Dissector", 
"Curved Mayo Scissors"}
LABEL_HISTORY   = 6   # frames to smooth over
LABEL_MIN_VOTES = 4   # label must appear this many times to be accepted
NEAR_THRESHOLD = 80    # px from box edge → "hand near"
ON_THRESHOLD   = 10    # px from box edge (or inside) → "hand on"
NEAR_COOLDOWN  = 1.5   # seconds between "near" events
ON_COOLDOWN    = 0.8   # seconds between "on" events (faster feedback)
JPEG_QUALITY   = 75
TARGET_FPS     = 20

# MediaPipe fingertip landmark indices
FINGERTIP_IDS = [4, 8, 12, 16, 20]  # thumb, index, middle, ring, pinky
FINGERTIP_COLORS = [
    (255, 80,  80),   # thumb  — red
    (255, 180,  0),   # index  — orange
    (0,   220,  0),   # middle — green
    (0,   180, 255),  # ring   — blue
    (180,  0,  255),  # pinky  — purple
]


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


class LabelSmoother:
    """Majority-vote label stabiliser — kills flicker when the model oscillates."""

    def __init__(self, history: int = LABEL_HISTORY, min_votes: int = LABEL_MIN_VOTES):
        self.history   = history
        self.min_votes = min_votes
        self._tracks: list[dict] = []

    @staticmethod
    def _iou(a: tuple, b: tuple) -> float:
        ax1, ay1, ax2, ay2 = a
        bx1, by1, bx2, by2 = b
        ix1, iy1 = max(ax1, bx1), max(ay1, by1)
        ix2, iy2 = min(ax2, bx2), min(ay2, by2)
        inter = max(0, ix2 - ix1) * max(0, iy2 - iy1)
        if inter == 0:
            return 0.0
        union = (ax2 - ax1) * (ay2 - ay1) + (bx2 - bx1) * (by2 - by1) - inter
        return inter / union if union > 0 else 0.0

    def smooth(self, box: tuple, raw_label: str) -> str:
        best_idx, best_iou = -1, 0.3
        for i, t in enumerate(self._tracks):
            iou = self._iou(box, t["box"])
            if iou > best_iou:
                best_iou, best_idx = iou, i

        if best_idx == -1:
            self._tracks.append({"box": box, "labels": deque([raw_label], maxlen=self.history)})
            return raw_label

        track = self._tracks[best_idx]
        track["box"] = box
        track["labels"].append(raw_label)

        counts: dict[str, int] = {}
        for lbl in track["labels"]:
            counts[lbl] = counts.get(lbl, 0) + 1
        majority, votes = max(counts.items(), key=lambda x: x[1])
        return majority if votes >= self.min_votes else raw_label

    def expire(self, active_boxes: list[tuple]) -> None:
        self._tracks = [
            t for t in self._tracks
            if any(self._iou(t["box"], b) > 0.3 for b in active_boxes)
        ]


def preprocess_for_detection(frame: np.ndarray) -> np.ndarray:
    """Sharpen and normalize contrast so webcam frames better match training images."""
    # CLAHE on luminance channel to normalize exposure/contrast
    lab = cv2.cvtColor(frame, cv2.COLOR_BGR2LAB)
    l, a, b = cv2.split(lab)
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    l = clahe.apply(l)
    lab = cv2.merge((l, a, b))
    enhanced = cv2.cvtColor(lab, cv2.COLOR_LAB2BGR)

    # Mild unsharp mask to recover webcam softness
    blurred = cv2.GaussianBlur(enhanced, (0, 0), 3)
    sharpened = cv2.addWeighted(enhanced, 1.5, blurred, -0.5, 0)
    return sharpened


def dist_to_box(point: tuple, box: tuple) -> float:
    """Euclidean distance from point to nearest edge of box. 0 if inside."""
    px, py = point
    x1, y1, x2, y2 = box
    dx = max(x1 - px, 0, px - x2)
    dy = max(y1 - py, 0, py - y2)
    return math.sqrt(dx * dx + dy * dy)


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
# Debug viewer
# ---------------------------------------------------------------------------
from fastapi.responses import HTMLResponse

@app.get("/", response_class=HTMLResponse)
async def viewer():
    return """
<!DOCTYPE html>
<html>
<head>
  <title>SurgicalAI — Live Feed</title>
  <style>
    body { margin: 0; background: #0a0a0a; display: flex; flex-direction: column;
           align-items: center; justify-content: center; min-height: 100vh;
           font-family: monospace; color: #e0e0e0; }
    h1   { margin-bottom: 12px; font-size: 1.2rem; letter-spacing: 2px; color: #aaa; }
    img  { max-width: 95vw; border: 1px solid #333; border-radius: 6px; }
    #log { margin-top: 12px; width: 640px; max-height: 160px; overflow-y: auto;
           background: #111; border: 1px solid #333; border-radius: 4px;
           padding: 8px; font-size: 0.8rem; }
    .alert { color: #ff5555; font-weight: bold; }
  </style>
</head>
<body>
  <h1>SURGICAL AI — LIVE DETECTION</h1>
  <img id="feed" src="" alt="Waiting for stream..." />
  <div id="log"></div>
  <script>
    const img = document.getElementById('feed');
    const log = document.getElementById('log');
    const ws  = new WebSocket('ws://localhost:8000/ws');
    ws.binaryType = 'blob';

    ws.onmessage = (e) => {
      if (e.data instanceof Blob) {
        const url = URL.createObjectURL(e.data);
        const old = img.src;
        img.src = url;
        if (old) URL.revokeObjectURL(old);
      } else {
        const data = JSON.parse(e.data);
        const dets = (data.detections || [])
          .map(d => {
            const state = d.state === 'on' ? ' 🔴 ON' : d.state === 'near' ? ' 🟡 NEAR' : '';
            const fingers = d.fingers_on || d.fingers_near
              ? ` [${d.fingers_on}on / ${d.fingers_near}nr]` : '';
            return `${d.label} (${d.conf})${fingers}${state}`;
          })
          .join(' | ') || 'no detections';
        const line = document.createElement('div');
        if (data.event === 'on') {
          line.className = 'alert';
          line.textContent = `🔴 HAND ON: ${data.event_label}`;
        } else if (data.event === 'near') {
          line.className = 'alert';
          line.style.color = '#ffaa00';
          line.textContent = `🟡 HAND NEAR: ${data.event_label}`;
        } else {
          line.textContent = dets;
        }
        log.prepend(line);
        if (log.children.length > 40) log.lastChild.remove();
      }
    };

    ws.onclose = () => {
      const line = document.createElement('div');
      line.style.color = '#ff5555';
      line.textContent = '--- connection closed ---';
      log.prepend(line);
    };
  </script>
</body>
</html>
"""


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

    # Force higher resolution for better detection quality
    cap.set(cv2.CAP_PROP_FRAME_WIDTH, 1280)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 720)
    cap.set(cv2.CAP_PROP_AUTOFOCUS, 1)

    # warm-up: give the camera a moment to initialise
    await asyncio.sleep(0.5)
    for _ in range(5):
        cap.read()

    last_near_time = 0.0
    last_on_time   = 0.0
    frame_interval = 1.0 / TARGET_FPS
    smoother       = LabelSmoother()

    try:
        while True:
            loop_start = time.time()

            ret, frame = cap.read()
            if not ret:
                print("cap.read() returned no frame — camera dropped")
                break

            # ---- YOLO detection ----------------------------------------
            detection_frame = preprocess_for_detection(frame)
            results = yolo_model(detection_frame, conf=CONF_THRESHOLD, verbose=False)[0]

            # ---- MediaPipe hand detection --------------------------------
            rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb)
            hand_results = hand_tracker.detect(mp_image)

            hand_point = None
            fingertips = []   # list of (x, y) for all 5 tips
            h, w, _ = frame.shape

            if hand_results.hand_landmarks:
                landmarks = hand_results.hand_landmarks[0]
                for i, tip_id in enumerate(FINGERTIP_IDS):
                    fx = int(landmarks[tip_id].x * w)
                    fy = int(landmarks[tip_id].y * h)
                    fingertips.append((fx, fy))
                    cv2.circle(frame, (fx, fy), 8, FINGERTIP_COLORS[i], -1)
                    cv2.circle(frame, (fx, fy), 8, (255, 255, 255), 1)  # white outline

                # keep index fingertip as primary hand point for JSON
                hand_point = fingertips[1]

            # ---- Process detections + proximity -------------------------
            detections = []
            event_label = None
            event_type  = None  # "near" or "on"

            for box in results.boxes:
                x1, y1, x2, y2 = map(int, box.xyxy[0])
                cls   = int(box.cls[0])
                conf  = float(box.conf[0])
                label = yolo_model.names[cls]
                if label in DISABLED_LABELS:
                    continue
                bcoords = (x1, y1, x2, y2)
                label   = smoother.smooth(bcoords, label)
                bcoords = (x1, y1, x2, y2)

                fingers_on   = 0
                fingers_near = 0

                for tip in fingertips:
                    d = dist_to_box(tip, bcoords)
                    if d <= ON_THRESHOLD:
                        fingers_on += 1
                    elif d <= NEAR_THRESHOLD:
                        fingers_near += 1

                # derive state
                if fingers_on > 0:
                    state = "on"
                elif fingers_near > 0:
                    state = "near"
                else:
                    state = "none"

                box_colour = (0, 120, 255)          # default blue-orange
                if state == "on":
                    box_colour = (0, 0, 255)         # red
                elif state == "near":
                    box_colour = (0, 200, 255)        # yellow

                # frontend draws boxes — server only draws fingertip dots

                # fire cooldown-gated events
                current_time = time.time()
                if state == "on" and current_time - last_on_time > ON_COOLDOWN:
                    event_label = label
                    event_type  = "on"
                    last_on_time = current_time
                    print(f"Hand ON → {label}  ({fingers_on} finger(s))")
                elif state == "near" and current_time - last_near_time > NEAR_COOLDOWN:
                    if event_type != "on":   # "on" takes priority
                        event_label = label
                        event_type  = "near"
                    last_near_time = current_time
                    print(f"Hand NEAR → {label}  ({fingers_near} finger(s))")

                detections.append({
                    "label":        label,
                    "conf":         round(conf, 3),
                    "box":          [x1, y1, x2, y2],
                    "state":        state,
                    "fingers_on":   fingers_on,
                    "fingers_near": fingers_near,
                })

            # ---- Expire stale label tracks ----------------------------------
            smoother.expire([tuple(d["box"]) for d in detections])

            # ---- Send annotated frame as binary JPEG --------------------
            encode_params = [cv2.IMWRITE_JPEG_QUALITY, JPEG_QUALITY]
            _, buffer = cv2.imencode(".jpg", frame, encode_params)
            await websocket.send_bytes(buffer.tobytes())

            # ---- Send detection + proximity JSON ------------------------
            payload = {
                "type":       "detections",
                "frame_w":    w,
                "frame_h":    h,
                "detections": detections,
                "hand":       list(hand_point) if hand_point else None,
                "fingertips": [list(f) for f in fingertips],
            }
            if event_label:
                payload["event"]       = event_type   # "near" or "on"
                payload["event_label"] = event_label

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
