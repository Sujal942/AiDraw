const express = require("express");
const cors = require("cors");
const {
  GoogleGenerativeAI,
  HarmBlockThreshold,
  HarmCategory,
} = require("@google/generative-ai");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 8000;
const API_KEY = process.env.GEMINI_API_KEY;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Route: Upload and analyze image
app.post("/analyze", async (req, res) => {
  const { dataURL } = req.body;

  if (!dataURL) {
    return res.status(400).json({ message: "No image data provided." });
  }

  try {
    const analysisResult = await analyzeWithGemini(dataURL);
    return res.status(200).json({
      message: "Image analyzed successfully.",
      result: analysisResult,
    });
  } catch (err) {
    console.error("Error processing image with Gemini:", err);
    return res.status(500).json({ message: "Error analyzing image." });
  }
});

// Function: Analyze image with Google Gemini API
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
              data: imageBase64.split(",")[1], // Extract base64 data
            },
          },
          {
            text: `Analyze the given image. Extract **all mathematical equations, symbols, and expressions** present in the image. Then, **solve** the equations and **explain** the steps in a structured format using Markdown. 
            
If the image does not contain math-related content, provide a **detailed description** of its contents.`,
          },
        ],
      },
    ];

    const result = await model.generateContentStream({ contents });
    let responseText = "";

    for await (let response of result.stream) {
      responseText += response.text();
    }

    // Format response to look clean
    return responseText.trim() || "No relevant mathematical content found.";
  } catch (err) {
    console.error("Error analyzing with Gemini:", err);
    return "Analysis failed.";
  }
}

// Start server
app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
