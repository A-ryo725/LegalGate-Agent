const express = require("express");
const { db } = require("../firebaseAdmin");
const { requireAuth } = require("../middleware/authMiddleware");

const router = express.Router();

function toDate(timestamp) {
  return timestamp && typeof timestamp.toDate === "function"
    ? timestamp.toDate()
    : null;
}

function toIsoString(timestamp) {
  const date = toDate(timestamp);
  return date ? date.toISOString() : null;
}

function serializeAnalysis(doc) {
  const data = doc.data();

  return {
    analysisId: doc.id,
    fileName: data.fileName || "",
    createdAt: toIsoString(data.createdAt),
    expiresAt: toIsoString(data.expiresAt),
    riskLevel: data.riskLevel || "low",
    summary: data.summary || "",
    risks: Array.isArray(data.risks) ? data.risks : [],
    status: data.status || "未確認"
  };
}

function getCreatedAtTime(doc) {
  const date = toDate(doc.data().createdAt);
  return date ? date.getTime() : 0;
}

router.get("/", requireAuth, async (req, res) => {
  try {
    console.log("Fetching analyses", {
      uid: req.user.uid
    });

    const snapshot = await db
      .collection("analyses")
      .where("uid", "==", req.user.uid)
      .get();

    const analyses = snapshot.docs
      .sort((a, b) => getCreatedAtTime(b) - getCreatedAtTime(a))
      .slice(0, 20)
      .map(serializeAnalysis);

    console.log("Fetched analyses", {
      uid: req.user.uid,
      count: analyses.length,
      analysisIds: analyses.map((analysis) => analysis.analysisId)
    });

    res.json({
      analyses
    });
  } catch (err) {
    console.error("Failed to fetch analyses", {
      message: err.message,
      code: err.code,
      details: err.details,
      stack: err.stack
    });

    res.status(500).json({
      error: "分析履歴の取得に失敗しました。"
    });
  }
});

router.patch("/:analysisId/status", requireAuth, async (req, res) => {
  const { analysisId } = req.params;

  try {
    const docRef = db.collection("analyses").doc(analysisId);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({
        error: "analysis not found"
      });
    }

    const data = doc.data();
    if (data.uid !== req.user.uid) {
      return res.status(404).json({
        error: "analysis not found"
      });
    }

    await docRef.update({
      status: "確認済"
    });

    console.log("Approved analysis", {
      uid: req.user.uid,
      analysisId
    });

    res.json({
      analysisId,
      status: "確認済"
    });
  } catch (err) {
    console.error("Failed to approve analysis", {
      message: err.message,
      code: err.code,
      details: err.details,
      stack: err.stack
    });

    res.status(500).json({
      error: "分析結果の承認に失敗しました。"
    });
  }
});

module.exports = router;
