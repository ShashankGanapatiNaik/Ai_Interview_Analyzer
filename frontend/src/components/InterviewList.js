function InterviewList({ interviews }) {
  return (
    <div>
      <h2>Interview Histroy</h2>
      {interviews.map((item) => (
        <div style={{ border: "2px solid black" }} key={item._id}>
          <p>
            {item.candidateName}-{item.dominantEmotion}
          </p>
          <div>
            {Object.entries(item.distribution).map(([key, value]) => (
              <p key={key}>
                {key}: {value}
              </p>
            ))}
          </div>
          <p>Total Frame:{item.totalFrames}</p>
        </div>
      ))}
    </div>
  );
}
export default InterviewList;
