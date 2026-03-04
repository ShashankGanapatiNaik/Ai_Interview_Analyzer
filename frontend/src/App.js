import UploadVideo from "./components/UploadVideo";
import InterviewList from "./components/InterviewList";
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
    <div style={{ textAlign: "center" }}>
      <h1>AI Interview Behavior Analyzer</h1>

      <UploadVideo fetchData={fetchData} />

      <hr />

      <InterviewList interviews={interviews} />
    </div>
  );
}

export default App;
