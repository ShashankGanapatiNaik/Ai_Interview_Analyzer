import cv2
from deepface import DeepFace
from collections import Counter
#video_path="interview.mp4"

def analyze_video(video_path):
    #cap is the object that reads frames from the video.
    cap=cv2.VideoCapture(video_path)
    
    """FPS = how many frames are shown in 1 second.
    .get() is a method used to get properties of the video.
    "Give me the Frames Per Second value of this video"-->cv2.CAP_PROP_FPS """
    
    fps=cap.get(cv2.CAP_PROP_FPS)
    #This means: Process 1 frame per second.If FPS = 30 → frame_interval = 30. So you process every 30th frame.
    frame_interval=int(fps)
    frame_count=0
    emotion_list=[]
    print("Processing video")
    while True:
        ret,frame=cap.read()
        if not ret:
            break
        if frame_count%frame_interval==0:
            #This checks: Is this frame divisible by frame_interval? 
            """Example:
            If frame_interval = 30
            It processes frame 0, 30, 60, 90…"""
            try:
                result=DeepFace.analyze(frame,actions=["emotion"],enforce_detection=False)
                emotion=result[0]["dominant_emotion"]
                emotion_list.append(emotion)
                #print(f"Detected:{emotion}")
            except:
                pass
        frame_count+=1
    cap.release()
    #print("\nVideo processing completed")

    #If nothing detedtced
    if not emotion_list:
        return{
            "dominant_emotion": None,
            "distribution": {},
            "total_frames_analyzed": 0
        }
            
    #calulate result
    emotion_counts=Counter(emotion_list)
    """
    ["happy","happy","sad","neutral"]
    {
    "happy":2,
    "sad":1,
    "neutral":1
    }"""
    #It counts how many times each item appears in a list. ["happy", "sad", "happy"]{"happy": 2, "sad": 1}
    total=sum(emotion_counts.values())
    #2 + 1 + 1 = 4
    #print("\nEmotion Distribution")

    distribution={
        emotion:round((count/total)*100,2)
        for emotion,count in emotion_counts.items()
    }
    
    dominant=emotion_counts.most_common(1)[0][0]
    return {
        "dominant_emotion": dominant,
        "distribution": distribution,
        "total_frames_analyzed": total
    }
    
    """for emotion,count in emotion_counts.items():
        percentage=(count/total)*100
        #2 / 4 * 100 = 50%
        #print(f"{emotion}:{percentage:.2f}%")
    if emotion_counts:
        dominant=emotion_counts.most_common(1)[0][0]
        #most_common(1) → get highest count emotion
        #[("happy", 3)]-->("happy", 3)-->dominant = "happy"
        #print(f"\nDominant Emotion: {dominant}"
    else:
        print("No emotions detected.")"""



"""if __name__ == "__main__":
    video_path="interview.mp4"
    result = analyze_video("interview.mp4")
    print(result)"""

#FastAPI → Used to create the web application.
#UploadFile → Used to receive uploaded files (like video/image).
#File → Tells FastAPI that this parameter is a file input.
from fastapi import FastAPI,UploadFile,File

#shutil → Used for copying files (we use it to save uploaded file).
import shutil
import os    #os → Used for operating system tasks (like deleting a file).

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




import base64
import numpy as np
import cv2
from deepface import DeepFace

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

    # emotion detection
    result = DeepFace.analyze(
        frame,
        actions=["emotion"],
        enforce_detection=False
    )

    emotion = result[0]["dominant_emotion"]

    return {
        "emotion": emotion
    }