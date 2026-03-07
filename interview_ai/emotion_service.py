import cv2
from deepface import DeepFace
from collections import Counter

#FastAPI → Used to create the web application.
#UploadFile → Used to receive uploaded files (like video/image).
#File → Tells FastAPI that this parameter is a file input.
from fastapi import FastAPI, UploadFile, File

#shutil → Used for copying files (we use it to save uploaded file).
import shutil

#os → Used for operating system tasks (like deleting a file).
import os

#Used for live frame analysis
import base64
import numpy as np
from PIL import Image
from io import BytesIO


#This creates your FastAPI application.
app = FastAPI()


# ---------------- VIDEO ANALYSIS ----------------

def analyze_video(video_path):

    #cap is the object that reads frames from the video.
    cap = cv2.VideoCapture(video_path)

    #FPS = frames per second in video
    fps = cap.get(cv2.CAP_PROP_FPS)

    #Process 1 frame per second
    frame_interval = int(fps)

    frame_count = 0
    emotion_list = []

    print("Processing video")

    while True:

        ret, frame = cap.read()

        if not ret:
            break

        if frame_count % frame_interval == 0:

            try:
                result = DeepFace.analyze(
                    frame,
                    actions=["emotion"],
                    enforce_detection=False
                )

                emotion = result[0]["dominant_emotion"]

                emotion_list.append(emotion)

            except:
                pass

        frame_count += 1

    cap.release()

    #If nothing detected
    if not emotion_list:
        return {
            "dominant_emotion": None,
            "distribution": {},
            "total_frames_analyzed": 0
        }

    #Calculate emotion distribution
    emotion_counts = Counter(emotion_list)

    total = sum(emotion_counts.values())

    distribution = {
        emotion: round((count / total) * 100, 2)
        for emotion, count in emotion_counts.items()
    }

    dominant = emotion_counts.most_common(1)[0][0]

    return {
        "dominant_emotion": dominant,
        "distribution": distribution,
        "total_frames_analyzed": total
    }


@app.post("/analyze")
async def analyze_endpoint(file: UploadFile = File(...)):

    #Temporary video path
    temp_path = f"temp_{file.filename}"

    #Save uploaded file
    with open(temp_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    result = analyze_video(temp_path)

    #Delete temporary file
    os.remove(temp_path)

    return result


# ---------------- LIVE FRAME ANALYSIS ----------------

@app.post("/analyze-frame")
async def analyze_frame(data: dict):

    image_data = data.get("image")

    if not image_data:
        return {"error": "No image provided"}

    #remove base64 header
    if "," in image_data:
        image_data = image_data.split(",")[1]

    try:
        image_bytes = base64.b64decode(image_data)
    except:
        return {"error": "Base64 decode failed"}

    image = Image.open(BytesIO(image_bytes)).convert("RGB")

    frame = np.array(image)

    result = DeepFace.analyze(
        frame,
        actions=["emotion"],
        enforce_detection=False
    )

    emotion = result[0]["dominant_emotion"]

    return {"emotion": emotion}