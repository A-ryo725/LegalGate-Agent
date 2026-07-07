import type {
  ApprovalAction,
  ParsedAnalysis,
  RevisionSuggestion,
  RiskItem,
  RiskLevel
} from "../types";

const RISK_LEVELS: RiskLevel[] = ["low", "medium", "high"];
const APPROVAL_ACTIONS: ApprovalAction[] = [
  "auto_approve",
  "staff_review",
  "manager_approval",
  "legal_review"
];

/**
 * Gemini のテキスト応答から JSON オブジェクトを取り出す。
 * Markdown コードブロック（```json ... ```）が含まれていても除去する。
 */
export function extractJsonObject(raw: string): unknown {
  if (!raw) {
    throw new Error("Gemini response could not be parsed as JSON");
  }

  let text = raw.trim();

  // ```json ... ``` / ``` ... ``` のフェンスを除去
  if (text.startsWith("```")) {
    text = text
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/```\s*$/i, "")
      .trim();
  }

  // 最初の { から最後の } までを抽出（前後に説明文が混ざっても救済する）
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1 || end < start) {
    throw new Error("Gemini response could not be parsed as JSON");
  }

  const slice = text.slice(start, end + 1);

  try {
    return JSON.parse(slice);
  } catch {
    throw new Error("Gemini response could not be parsed as JSON");
  }
}

function normalizeRiskLevel(value: unknown): RiskLevel {
  const v = String(value ?? "").toLowerCase();
  return (RISK_LEVELS as string[]).includes(v) ? (v as RiskLevel) : "medium";
}

function normalizeApprovalAction(value: unknown): ApprovalAction {
  const v = String(value ?? "").toLowerCase();
  return (APPROVAL_ACTIONS as string[]).includes(v)
    ? (v as ApprovalAction)
    : "staff_review";
}

function normalizeRiskItem(item: any, index: number): RiskItem {
  return {
    id: String(item?.id ?? `risk_${index + 1}`),
    itemName: String(item?.itemName ?? "項目"),
    extractedText: String(item?.extractedText ?? ""),
    riskLevel: normalizeRiskLevel(item?.riskLevel),
    reason: String(item?.reason ?? ""),
    relatedRule: String(item?.relatedRule ?? ""),
    recommendedAction: String(item?.recommendedAction ?? ""),
    suggestion:
      item?.suggestion != null ? String(item.suggestion) : undefined
  };
}

function normalizeRevision(item: any, index: number): RevisionSuggestion {
  return {
    id: String(item?.id ?? `rev_${index + 1}`),
    itemName: String(item?.itemName ?? "項目"),
    currentText: String(item?.currentText ?? ""),
    suggestedText: String(item?.suggestedText ?? ""),
    reason: String(item?.reason ?? "")
  };
}

/**
 * Gemini の生応答テキストを検証・整形して ParsedAnalysis を返す。
 * 必須フィールドが欠けている場合はエラーを投げる。
 */
export function parseAnalysisResult(raw: string): ParsedAnalysis {
  const data = extractJsonObject(raw) as Record<string, any>;

  if (!data || typeof data !== "object") {
    throw new Error("Gemini response could not be parsed as JSON");
  }

  if (
    data.documentType == null ||
    data.overallRisk == null ||
    !Array.isArray(data.riskItems)
  ) {
    throw new Error("Gemini response is missing required fields");
  }

  const approval = data.approvalFlow ?? {};

  return {
    documentType: String(data.documentType),
    overallRisk: normalizeRiskLevel(data.overallRisk),
    summary: String(data.summary ?? ""),
    riskItems: (data.riskItems as any[]).map(normalizeRiskItem),
    revisionSuggestions: Array.isArray(data.revisionSuggestions)
      ? (data.revisionSuggestions as any[]).map(normalizeRevision)
      : [],
    approvalFlow: {
      action: normalizeApprovalAction(approval.action),
      label: String(approval.label ?? "確認が必要"),
      reason: String(approval.reason ?? ""),
      assignee: String(approval.assignee ?? "担当者"),
      nextStep: String(approval.nextStep ?? "")
    },
    referencedRules: Array.isArray(data.referencedRules)
      ? (data.referencedRules as any[]).map((r) => String(r))
      : []
  };
}
