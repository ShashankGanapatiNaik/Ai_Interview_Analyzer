import { useState } from "react";

import axios from "axios";
function UploadVideo({ fetchData }) {
  const [video, setvideo] = useState(null);
  const [result, setresult] = useState(null);
  const [loading, setLoading] = useState(false);
  const handleUpload = async () => {
    if (!video) {
      alert("Please select a video");
      return;
    }

    const formData = new FormData();
    formData.append("video", video);
    try {
      setLoading(true);
      const res = await axios.post(
        "http://localhost:5000/video-analyze",
        formData,
      );
      fetchData();
      setresult(res.data);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
      alert("Video analysis failed");
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",

        // alignItems: "center",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
        }}
      >
        <h2>Upload Interviw Video</h2>

        <input type="file" onChange={(e) => setvideo(e.target.files[0])} />
      </div>

      <br></br>
      <button style={{ border: "2px solid white" }} onClick={handleUpload}>
        Analyze Interview
      </button>
      {loading && <p>Analyzing video... Please wait</p>}
      {result && (
        <div>
          <p>
            Result: {result.candidateName}-{result.dominantEmotion}
          </p>
          <div>
            {Object.entries(result.distribution).map(([key, value]) => (
              <p key={key}>
                {key}: {value}
              </p>
            ))}
          </div>
          <p>Total Frame:{result.totalFrames}</p>
        </div>
      )}
    </div>
  );
}
export default UploadVideo;
