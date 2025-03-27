const express = require("express");
const cors = require("cors");
const {
  GoogleGenerativeAI,
  HarmBlockThreshold,
  HarmCategory,
} = require("@google/generative-ai");
const app = express();
require("dotenv").config();

const PORT = process.env.PORT || 8000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Gemini Image Processing
const API_KEY = process.env.GEMINI_API_KEY;

// Route to upload image and send it for analysis
app.post("/analyze", async (req, res) => {
  const { dataURL } = req.body;

  if (!dataURL) {
    return res.status(400).send({ message: "No image data provided." });
  }

  try {
    const analysisResult = await analyzeWithGemini(dataURL);
    return res
      .status(200)
      .send({ message: "Image analyzed successfully.", analysisResult });
  } catch (err) {
    console.error("Error processing image with Gemini:", err);
    return res.status(500).send({ message: "Error analyzing image." });
  }
});

// Analyze the image with Google Gemini API
async function analyzeWithGemini(imageBase64) {
  try {
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
        },
      ],
    });

    const contents = [
      {
        role: "user",
        parts: [
          {
            inline_data: {
              mime_type: "image/png",
              data: imageBase64.split(",")[1],
            },
          },
          {
            text: "You have been given an image with some mathematical expressions, equations, or graphical problems, and you need to solve them...",
          },
        ],
      },
    ];

    const result = await model.generateContentStream({ contents });
    let responseText = "";
    for await (let response of result.stream) {
      responseText += response.text();
    }
    return responseText;
  } catch (err) {
    console.error("Error analyzing with Gemini:", err);
    return "Analysis failed.";
  }
}

app.listen(PORT, () => {
  console.log("Server is listening on port 8000");
});
