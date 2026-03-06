import React, { useRef, useState } from "react";
import Webcam from "react-webcam";
import axios from "axios";

function LiveInterview() {
  const webcamRef = useRef(null);
  const [emotion, setEmotion] = useState("");

  const capture = async () => {
    const imageSrc = webcamRef.current.getScreenshot();

    try {
      const res = await axios.post("http://localhost:5000/live-analyze", {
        image: imageSrc,
      });

      setEmotion(res.data.emotion);
    } catch (error) {
      console.error("Live analysis failed");
    }
  };

  return (
    <div style={{ textAlign: "center" }}>
      <h2>Live Interview Analyzer</h2>

      <Webcam ref={webcamRef} screenshotFormat="image/jpeg" width={400} />

      <br />
      <br />

      <button onClick={capture}>Analyze Emotion</button>

      <h3>Detected Emotion: {emotion}</h3>
    </div>
  );
}

export default LiveInterview;
