const { default: mongoose, syncIndexes } = require("mongoose");
require("dotenv").config();
const cors = require("cors");
const express = require("express");

const multer = require("multer");
//Multer is used to upload files (like video, image, etc.) in Express.

const axios = require("axios");
//In your case → sending video to Python backend (http://127.0.0.1:8000/analyze)

const fs = require("fs");
//fs means File System Used to read, delete, or manage files in Node.js.

const FormData = require("form-data");

const Interview = require("./model/interviewSchema");
//Used to send files in multipart/form-data format. Required when sending files using axios

const app = express();
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
const upload = multer({ dest: "uploads/" });
/*Creates multer object.
dest: "uploads/" means:
Uploaded files will be temporarily stored inside uploads folder.*/

app.post("/video-analyze", upload.single("video"), async (req, res) => {
  /*upload.single("video") ->his is Multer middleware.It accepts one file. The input field name must be "video"*/

  try {
    const form = new FormData();
    /*Creating a new FormData object. Used to send file to another server.Like HTML multipart/form-data*/

    form.append("file", fs.createReadStream(req.file.path));
    /*Step-by-step:
    1. User uploads video
    2. Multer saves file in uploads/
    3.You read that file using stream
    4. You attach stream to FormData
    5. Axios sends it as:*/

    const response = await axios.post("http://127.0.0.1:8000/analyze", form, {
      headers: form.getHeaders(),
    });

    /*Deletes the file from uploads folder. Prevents storage from filling up*/
    fs.unlinkSync(req.file.path);

    //res.json(response.data);
    // console.log(req);
    /*const savedInterview = await Interview.create({
      candidateName: req.file.originalname,
      dominantEmotion: response.data.dominant_emotion,
      distribution: response.data.distribution,
      totalFrames: response.data.total_frames_analyzed,
    });*/
    const savedInterview = new Interview({
      candidateName: req.file.originalname,
      dominantEmotion: response.data.dominant_emotion,
      distribution: response.data.distribution,
      totalFrames: response.data.total_frames_analyzed,
    });

    await savedInterview.save();
    res.json(savedInterview);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error processing video" });
  }
});

app.get("/video-result", async (req, res) => {
  try {
    // Fetch all interview records from MongoDB and sort them by newest first.
    const interviews = await Interview.find().sort({ createdAt: -1 });
    res.json(interviews);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch interviews" });
  }
});

app.post("/live-analyze", async (req, res) => {
  try {
    // console.log("Received body:", req.body);

    const response = await axios.post(
      "http://127.0.0.1:8000/analyze-frame",
      req.body,
    );

    // console.log("Python response:", response.data);

    res.json(response.data);
  } catch (error) {
    console.log("Error calling Python:", error.message);

    res.status(500).json({
      error: "Live emotion analysis failed",
    });
  }
});

mongoose.connect(process.env.DBURL).then(() => {
  console.log("connected to mangodb");
  app.listen(process.env.PORT, () =>
    console.log(`Example app listening on port ${process.env.PORT}!`),
  );
});
