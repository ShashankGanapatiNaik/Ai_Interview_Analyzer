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

