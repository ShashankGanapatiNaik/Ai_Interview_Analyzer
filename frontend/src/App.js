import UploadVideo from "./components/UploadVideo";
import InterviewList from "./components/InterviewList";
import LiveInterview from "./components/LiveInterview";
import { useState } from "react";
import { useEffect } from "react";
import axios from "axios";

function App() {
  const [interviews, setinterviews] = useState([]);

  const fetchData = async () => {
    axios
      .get("http://localhost:5000/video-result")
      .then((res) => setinterviews(res.data));
  };
  useEffect(() => {
    fetchData();
  }, []);
  return (
    <div>
      <h1 style={{ textAlign: "center" }}>AI Interview Behavior Analyzer</h1>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            width: "50vw",
            border: "2px solid black",
            padding: "20px",
          }}
        >
          <LiveInterview />
          <UploadVideo fetchData={fetchData} />

          <hr />

          <InterviewList interviews={interviews} />
        </div>
      </div>
    </div>
  );
}

export default App;
