import { analyzeWithGemini } from "./geminiService";
import type { AnalysisResult } from "../types";

/**
 * 解析処理の入口。
 * ルートからはこの関数だけを呼び、実際の解析は geminiService に委譲する。
 */
export async function analyzeContract(
  fileText: string,
  fileName: string
): Promise<AnalysisResult> {
  return analyzeWithGemini(fileText, fileName);
}
