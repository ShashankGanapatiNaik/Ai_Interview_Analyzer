import UploadVideo from "./components/UploadVideo";
import InterviewList from "./components/InterviewList";

function App() {
  return (
    <div style={{ textAlign: "center" }}>
      <h1>AI Interview Behavior Analyzer</h1>

      <UploadVideo />

      <hr />

      <InterviewList />
    </div>
  );
}

export default App;
