
#FastAPI → Used to create the web application.
#UploadFile → Used to receive uploaded files (like video/image).
#File → Tells FastAPI that this parameter is a file input.
from fastapi import FastAPI,UploadFile,File
from video_analyze import analyze_video
#shutil → Used for copying files (we use it to save uploaded file).
import shutil
import os    #os → Used for operating system tasks (like deleting a file).
from collections import Counter
import base64
import numpy as np
import cv2
from deepface import DeepFace
#This creates your FastAPI application. app is the main object that runs your backend server.
app=FastAPI()

@app.post("/analyze")
async def analyze_endpoint(file:UploadFile=File(...)):
    #The uploaded file will be stored in file.
    #“The incoming data must be a file, and I want it as an UploadFile object.”
    #This parameter should come from form-data as a file upload.”  The ... means: This field is REQUIRED.
    temp_path=f"temp_{file.filename}"
    #temp_video.mp4
    #"wb" → Write Binary mode (important for video/image).
    # buffer → Temporary variable name.
    with open(temp_path,"wb") as buffer:
        shutil.copyfileobj(file.file,buffer)
    
    """
    source      = file.file
    destination = buffer
    It copies all bytes from uploaded file into your new file on disk.
    """
    
    result=analyze_video(temp_path)
    
    os.remove(temp_path)
    return result




# import base64
# import numpy as np
# import cv2
# from deepface import DeepFace
emotion_history = []
@app.post("/analyze-frame")
async def analyze_frame(data: dict):

    image_data = data.get("image")

    if not image_data:
        return {"error": "No image provided"}

    # remove base64 header
    if "," in image_data:
        image_data = image_data.split(",")[1]

    # fix base64 padding
    missing_padding = len(image_data) % 4
    if missing_padding:
        image_data += "=" * (4 - missing_padding)

    # convert base64 → bytes
    try:
        image_bytes = base64.b64decode(image_data)
    except Exception:
        return {"error": "Base64 decode failed"}

    # convert bytes → numpy array
    nparr = np.frombuffer(image_bytes, np.uint8)

    # decode image using OpenCV
    frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    if frame is None:
        return {"error": "Image decoding failed"}
    result = DeepFace.analyze(
        frame,
        actions=["emotion"],
        enforce_detection=False
        )
    if isinstance(result, list):
        result = result[0]
    
    emotion_scores = result["emotion"]
    # store emotion scores
    emotion_history.append(emotion_scores)
    
    # keep last 20 frames only
    if len(emotion_history) > 20:
        emotion_history.pop(0)
    # average emotions
    avg_emotions = {}
    for emotion in emotion_scores.keys():
        avg_emotions[emotion] = round(
            sum(frame[emotion] for frame in emotion_history) / len(emotion_history),2)
    dominant = max(avg_emotions, key=avg_emotions.get)
    emotion_chart = []
    for emotion, value in avg_emotions.items():
        bar_length = int(value / 5)   # each block ≈5%
        bar = "█" * bar_length
        emotion_chart.append(f"{emotion.capitalize():10} {bar} {value}%")
    return {
        "dominant_emotion": dominant,
        # "distribution": avg_emotions,
        "emotion_chart": emotion_chart
        }