import { randomUUID } from "crypto";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { buildAnalysisPrompt } from "../data/mockRules";
import { parseAnalysisResult } from "../utils/json";
import type { AnalysisResult } from "../types";

const DEFAULT_MODEL = "gemini-1.5-flash";

/**
 * 契約書本文を Gemini API に送信し、解析結果を AnalysisResult 型で返す。
 *
 * - GEMINI_API_KEY 未設定時は明確なエラーを投げる
 * - GEMINI_MODEL でモデルを切り替え可能（未設定時は gemini-1.5-flash）
 * - 応答は JSON としてパースし、失敗時はエラーを投げる
 */
export async function analyzeWithGemini(
  fileText: string,
  fileName: string
): Promise<AnalysisResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  const modelName = process.env.GEMINI_MODEL || DEFAULT_MODEL;
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: modelName,
    generationConfig: {
      temperature: 0.2,
      responseMimeType: "application/json"
    }
  });

  const prompt = buildAnalysisPrompt(fileText);

  let responseText: string;
  try {
    const result = await model.generateContent(prompt);
    responseText = result.response.text();
  } catch (err) {
    const detail = err instanceof Error ? err.message : "unknown error";
    throw new Error(
      `Gemini API で解析できませんでした。API キー、利用上限、通信状態を確認してください。(${detail})`
    );
  }

  const parsed = parseAnalysisResult(responseText);

  const now = new Date().toISOString();
  return {
    id: randomUUID(),
    documentId: randomUUID(),
    createdAt: now,
    documentType: parsed.documentType || fileName,
    overallRisk: parsed.overallRisk,
    summary: parsed.summary,
    riskItems: parsed.riskItems,
    revisionSuggestions: parsed.revisionSuggestions,
    approvalFlow: parsed.approvalFlow,
    referencedRules: parsed.referencedRules
  };
}
