import axios from "axios";

function InterviewList({ interviews }) {
  return (
    <div>
      <h2>Interview Histroy</h2>
      {interviews.map((item) => (
        <div key={item._id}>
          <p>
            {item.candidateName}-{item.dominantEmotion}
          </p>
        </div>
      ))}
    </div>
  );
}
export default InterviewList;
