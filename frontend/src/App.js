import UploadVideo from "./components/UploadVideo";
import InterviewList from "./components/InterviewList";
import LiveInterview from "./components/LiveInterview";

import { useState, useEffect } from "react";
import axios from "axios";

import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
} from "react-router-dom";

function Buttons() {
  const navigate = useNavigate();

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-evenly",
        width: "100%",
      }}
    >
      <button
        style={{ backgroundColor: "blueviolet" }}
        onClick={() => navigate("/")}
      >
        Upload Video
      </button>
      <button
        style={{ backgroundColor: "red" }}
        onClick={() => navigate("/interviewlist")}
      >
        Interview List
      </button>
      <button
        style={{ backgroundColor: "red" }}
        onClick={() => navigate("/livevideo")}
      >
        Live Video
      </button>
    </div>
  );
}

function App() {
  const [interviews, setinterviews] = useState([]);

  const fetchData = async () => {
    const res = await axios.get("http://localhost:5000/video-result");
    setinterviews(res.data);
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <Router>
      <div>
        <h1 style={{ textAlign: "center" }}>AI Interview Analyzer</h1>
        <div>
          <Buttons />
        </div>

        <div
          style={{
            border: "1px solid white",
            padding: "20px",
            marginTop: "20px",
          }}
        >
          <Routes>
            <Route path="/" element={<UploadVideo fetchData={fetchData} />} />

            <Route
              path="/interviewlist"
              element={<InterviewList interviews={interviews} />}
            />

            <Route path="/livevideo" element={<LiveInterview />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
