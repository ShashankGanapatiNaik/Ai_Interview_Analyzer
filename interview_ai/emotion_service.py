#FastAPI → Used to create the web application.
from fastapi import FastAPI

#DeepFace → Used for facial emotion detection
from deepface import DeepFace

#base64 → Used to decode image sent from frontend
import base64

#numpy → Used to convert image into array format
import numpy as np

#PIL → Used to read image (instead of OpenCV)
from PIL import Image

#BytesIO → Used to convert byte data into image object
from io import BytesIO


#This creates your FastAPI application.
#app is the main object that runs your backend server.
app = FastAPI()


@app.post("/analyze-frame")
async def analyze_frame(data: dict):

    #Frontend sends JSON data containing base64 image
    image_data = data.get("image")

    #If no image sent
    if not image_data:
        return {"error": "No image provided"}

    #Sometimes base64 string contains header like:
    #data:image/jpeg;base64,...
    #So we remove that part
    if "," in image_data:
        image_data = image_data.split(",")[1]

    #Convert base64 string → bytes
    try:
        image_bytes = base64.b64decode(image_data)
    except Exception:
        return {"error": "Base64 decode failed"}

    #Convert bytes → image
    image = Image.open(BytesIO(image_bytes)).convert("RGB")

    #Convert image → numpy array
    #DeepFace requires numpy array input
    frame = np.array(image)

    #Emotion detection using DeepFace
    result = DeepFace.analyze(
        frame,
        actions=["emotion"],
        enforce_detection=False
    )

    #Extract dominant emotion
    emotion = result[0]["dominant_emotion"]

    return {
        "emotion": emotion
    }