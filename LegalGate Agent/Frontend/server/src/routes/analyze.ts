import { Router, type Response } from "express";
import multer from "multer";
import { analyzeContract } from "../services/analysisService";
import { extractTextFromUpload, readDemoContract } from "../utils/file";
import type { RiskLevel } from "../types";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

const RISK_LEVELS: RiskLevel[] = ["low", "medium", "high"];

export const analyzeRouter = Router();

/** POST /api/analyze : アップロードされた契約書ファイルを解析する */
analyzeRouter.post("/analyze", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ error: "ファイルがアップロードされていません。" });
    }

    const { text, fileName } = extractTextFromUpload(req.file);
    const result = await analyzeContract(text, fileName);
    res.json(result);
  } catch (err) {
    handleError(res, err);
  }
});

/** POST /api/analyze-sample : リスクレベル別のデモ契約書を解析する */
analyzeRouter.post("/analyze-sample", async (req, res) => {
  try {
    const level = req.body?.level as RiskLevel;
    if (!RISK_LEVELS.includes(level)) {
      return res.status(400).json({
        error: "level は low / medium / high のいずれかを指定してください。"
      });
    }

    const { text, fileName } = readDemoContract(level);
    const result = await analyzeContract(text, fileName);
    res.json(result);
  } catch (err) {
    handleError(res, err);
  }
});

/** POST /api/drive-demo : Drive に高リスク契約書が追加された想定で解析する */
analyzeRouter.post("/drive-demo", async (_req, res) => {
  try {
    const { text, fileName } = readDemoContract("high");
    const result = await analyzeContract(text, fileName);
    res.json(result);
  } catch (err) {
    handleError(res, err);
  }
});

function handleError(res: Response, err: unknown): void {
  const message =
    err instanceof Error ? err.message : "予期しないエラーが発生しました。";
  console.error("[analyze] error:", message);

  const status = message.includes("GEMINI_API_KEY is not configured")
    ? 500
    : 500;

  res.status(status).json({ error: message });
}
