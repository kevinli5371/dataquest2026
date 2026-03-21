from ultralytics import YOLO
import cv2
import mediapipe as mp
import pyttsx3
import time
import math
import os
import urllib.request

# Load model
model = YOLO("model/dataset/runs/detect/train/weights/best.pt")

# Init MediaPipe
HAND_MODEL_PATH = "model/hand_landmarker.task"
HAND_MODEL_URL = "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task"


def ensure_hand_model(model_path):
    if os.path.exists(model_path):
        return
    os.makedirs(os.path.dirname(model_path), exist_ok=True)
    # print(f"Downloading MediaPipe hand model to {model_path}...")
    urllib.request.urlretrieve(HAND_MODEL_URL, model_path)


def init_hand_tracker():
    ensure_hand_model(HAND_MODEL_PATH)
    base_options = mp.tasks.BaseOptions(model_asset_path=HAND_MODEL_PATH)
    options = mp.tasks.vision.HandLandmarkerOptions(
        base_options=base_options,
        running_mode=mp.tasks.vision.RunningMode.IMAGE,
        num_hands=1,
    )
    return mp.tasks.vision.HandLandmarker.create_from_options(options)


hands = init_hand_tracker()

# Speech engine
engine = pyttsx3.init()
last_spoken_time = 0
cooldown = 1.5  # seconds

# Camera
cap = cv2.VideoCapture(0)

def distance(p1, p2):
    return math.sqrt((p1[0] - p2[0])**2 + (p1[1] - p2[1])**2)

while True:
    ret, frame = cap.read()
    if not ret:
        break

    # YOLO detection
    results = model(frame, conf=0.3, verbose=False)[0]

    # MediaPipe hand detection
    rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb)
    hand_results = hands.detect(mp_image)

    hand_point = None

    if hand_results.hand_landmarks:
        h, w, _ = frame.shape
        landmarks = hand_results.hand_landmarks[0]
        x = int(landmarks[8].x * w)
        y = int(landmarks[8].y * h)
        hand_point = (x, y)
        cv2.circle(frame, hand_point, 10, (0, 255, 0), -1)

    # Process detections
    for box in results.boxes:
        x1, y1, x2, y2 = map(int, box.xyxy[0])
        cls = int(box.cls[0])
        conf = float(box.conf[0])
        label = model.names[cls]

        # draw box
        cv2.rectangle(frame, (x1, y1), (x2, y2), (255, 0, 0), 2)
        cv2.putText(frame, f"{label} {conf:.2f}", (x1, y1 - 10),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 0, 0), 2)

        # center of tool
        tool_center = ((x1 + x2) // 2, (y1 + y2) // 2)

        # check distance
        if hand_point:
            dist = distance(hand_point, tool_center)

            if dist < 100:  # threshold (tune this)
                current_time = time.time()

                if current_time - last_spoken_time > cooldown:
                    print(f"Hand near {label}")
                    engine.say(label)
                    engine.runAndWait()
                    last_spoken_time = current_time

    cv2.imshow("Tool Detection + Hand Proximity", frame)

    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
if hasattr(hands, "close"):
    hands.close()
cv2.destroyAllWindows()