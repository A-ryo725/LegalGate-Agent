import { randomUUID } from "crypto";
import { MOCK_RESULTS } from "../data/mockResults";
import type { AnalysisResult, RiskLevel } from "../types";

/**
 * 開発用の予備解析（Gemini API の利用制限・通信障害に備えたフォールバック）。
 *
 * 注意: MVP の主処理では使用しない。本番デモの基本動作は Gemini API 解析とする。
 * ファイル本文の簡易キーワード判定でリスクレベルを推定し、
 * 事前定義のモック結果を返す。
 */
export function analyzeWithMock(
  fileText: string,
  fileName: string
): AnalysisResult {
  const level = estimateRiskLevel(fileText);
  const base = MOCK_RESULTS[level];

  return {
    id: randomUUID(),
    documentId: randomUUID(),
    createdAt: new Date().toISOString(),
    documentType: base.documentType || fileName,
    overallRisk: base.overallRisk,
    summary: base.summary,
    riskItems: base.riskItems,
    revisionSuggestions: base.revisionSuggestions,
    approvalFlow: base.approvalFlow,
    referencedRules: base.referencedRules
  };
}

function estimateRiskLevel(text: string): RiskLevel {
  const hasNoLiabilityCap = /上限は設けない|上限を設けない/.test(text);
  const hasPenalty = /違約金/.test(text);
  const isLongPayment = /90日|120日/.test(text);
  const hasAutoRenew = /自動更新/.test(text);
  const shortTerminationNotice = /15日前|10日前/.test(text);

  if (hasNoLiabilityCap || hasPenalty || isLongPayment) {
    return "high";
  }
  if (hasAutoRenew || shortTerminationNotice) {
    return "medium";
  }
  return "low";
}
