import { useState } from "react";

import axios from "axios";
function UploadVideo({ fetchData }) {
  const [video, setvideo] = useState(null);
  const [result, setresult] = useState(null);

  const handleUpload = async () => {
    if (!video) {
      alert("Please select a video");
      return;
    }

    const formData = new FormData();
    formData.append("video", video);

    const res = await axios.post(
      "http://localhost:5000/video-analyze",
      formData,
    );
    fetchData();
    setresult(res.data);
  };

  return (
    <div>
      <h2>Upload Interviw Video</h2>

      <input type="file" onChange={(e) => setvideo(e.target.files[0])} />

      <br></br>
      <button onClick={handleUpload}>Analyze Interview</button>
      {result && (
        <div>
          <h3>Dominant Emotion:{result.dominantEmotion}</h3>
        </div>
      )}
    </div>
  );
}
export default UploadVideo;
