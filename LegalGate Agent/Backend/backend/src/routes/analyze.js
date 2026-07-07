const express = require("express");
const multer = require("multer");
const path = require("path");
const {
  readUploadedFile,
  UnsupportedFileTypeError
} = require("../services/fileService");
const {
  analyzeFileContent,
  GeminiServiceError
} = require("../services/geminiService");
const { db, FieldValue } = require("../firebaseAdmin");
const { requireAuth } = require("../middleware/authMiddleware");

const router = express.Router();
const uploadDir = path.join(__dirname, "../../uploads");
const ANALYSIS_RETENTION_DAYS = 30;

function getOverallRisk(risks) {
  if (risks.some((risk) => risk.level === "high")) return "high";
  if (risks.some((risk) => risk.level === "medium")) return "medium";
  return "low";
}

function getExpiresAt() {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + ANALYSIS_RETENTION_DAYS);
  return expiresAt;
}

function sanitizeRisks(risks) {
  if (!Array.isArray(risks)) return [];

  return risks.map((risk) => ({
    level: risk.level,
    title: risk.title,
    description: risk.description,
    excerpt: risk.excerpt,
    suggestion: risk.suggestion
  }));
}

async function saveAnalysis({ uid, fileName, analysis }) {
  const risks = sanitizeRisks(analysis.risks);
  const riskLevel = getOverallRisk(risks);

  const docRef = await db.collection("analyses").add({
    uid,
    fileName,
    createdAt: FieldValue.serverTimestamp(),
    expiresAt: getExpiresAt(),
    riskLevel,
    summary: analysis.summary,
    risks,
    status: "未確認"
  });

  console.log("Saved analysis", {
    uid,
    analysisId: docRef.id,
    fileName,
    riskLevel
  });

  return {
    analysisId: docRef.id,
    riskLevel,
    status: "未確認"
  };
}

const upload = multer({
  dest: uploadDir,
  limits: {
    fileSize: 5 * 1024 * 1024
  }
});

router.post("/", requireAuth, upload.single("file"), async (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({
      error: "file is required"
    });
  }

  try {
    const { content } = await readUploadedFile(req.file);
    const analysis = await analyzeFileContent(content);
    const saved = await saveAnalysis({
      uid: req.user.uid,
      fileName: req.file.originalname,
      analysis
    });

    res.json({
      ...analysis,
      ...saved
    });
  } catch (err) {
    next(err);
  }
});

router.use((err, _req, res, next) => {
  if (err instanceof multer.MulterError && err.code === "LIMIT_FILE_SIZE") {
    console.error("Analyze request failed", {
      message: err.message,
      code: err.code
    });

    return res.status(400).json({
      error: "file size must be 5MB or less"
    });
  }

  if (err instanceof UnsupportedFileTypeError) {
    console.error("Analyze request failed", {
      message: err.message
    });

    return res.status(400).json({
      error: "unsupported file type",
      allowedExtensions: [".txt", ".csv", ".json"]
    });
  }

  if (err instanceof GeminiServiceError) {
    console.error("Analyze request failed", {
      message: err.message,
      statusCode: err.statusCode
    });

    return res.status(err.statusCode).json({
      error: err.message
    });
  }

  console.error("Unexpected analyze error", {
    message: err.message,
    code: err.code,
    stack: err.stack
  });

  return res.status(500).json({
    error: "internal server error"
  });
});

module.exports = router;

