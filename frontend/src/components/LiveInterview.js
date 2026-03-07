import React, { useRef, useState } from "react";
import Webcam from "react-webcam";
import axios from "axios";

function LiveInterview() {
  const webcamRef = useRef(null);
  const intervalRef = useRef(null);

  const [emotion, setEmotion] = useState("");
  const [running, setRunning] = useState(false);
  const [cameraOn, setCameraOn] = useState(true);

  const analyzeFrame = async () => {
    if (!webcamRef.current) return;

    const imageSrc = webcamRef.current.getScreenshot();

    try {
      const res = await axios.post("http://localhost:5000/live-analyze", {
        image: imageSrc,
      });

      setEmotion(res.data.emotion);
    } catch (error) {
      console.log("Analysis failed");
    }
  };

  const startAnalysis = () => {
    if (running) return;

    setRunning(true);
    setCameraOn(true);

    intervalRef.current = setInterval(() => {
      analyzeFrame();
    }, 2000);
  };

  const stopAnalysis = () => {
    setRunning(false);
    setEmotion("");
    clearInterval(intervalRef.current);

    // turn off camera
    setCameraOn(false);
  };

  return (
    <div style={{ textAlign: "center" }}>
      <h2>Live Interview Emotion Analyzer</h2>

      {cameraOn && (
        <Webcam ref={webcamRef} screenshotFormat="image/jpeg" width={450} />
      )}

      <br />
      <br />

      <button onClick={startAnalysis}>Start Analyze</button>

      <button onClick={stopAnalysis} style={{ marginLeft: "10px" }}>
        Stop
      </button>

      <h3>Detected Emotion: {emotion}</h3>
    </div>
  );
}

export default LiveInterview;
