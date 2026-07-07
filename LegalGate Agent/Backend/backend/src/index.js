const dotenvResult = require("dotenv").config();

const express = require("express");
const cors = require("cors");
const analyzeRouter = require("./routes/analyze");
const analysesRouter = require("./routes/analyses");

const app = express();
const PORT = process.env.PORT || 8080;

console.log("Environment configuration", {
  dotenvLoaded: !dotenvResult.error,
  dotenvError: dotenvResult.error ? dotenvResult.error.message : null,
  geminiApiKeyConfigured: Boolean(process.env.GEMINI_API_KEY),
  geminiApiKeyLength: process.env.GEMINI_API_KEY
    ? process.env.GEMINI_API_KEY.length
    : 0,
  geminiModel: process.env.GEMINI_MODEL || "gemini-2.5-flash",
  port: PORT
});

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({
    ok: true,
    service: "hackathon-backend",
    timestamp: new Date().toISOString()
  });
});

app.use("/api/analyze", analyzeRouter);
app.use("/api/analyses", analysesRouter);

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

