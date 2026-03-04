let mongoose = require("mongoose");
let interviewSchema = new mongoose.Schema({
  candidateName: String,
  dominantEmotion: String,
  distribution: Object,
  totalFrames: Number,
  createAt: {
    type: Date,
    default: Date.now,
  },
});
const Interview = mongoose.model("Interview", interviewSchema);
module.exports = Interview;
