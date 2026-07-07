import type { AnalysisResult, RiskLevel } from "../types";
import { getAuthContext } from "./authService";

const API_BASE_URL = "http://localhost:8080";
const ANALYZE_API_URL = `${API_BASE_URL}/api/analyze`;
const ANALYSES_API_URL = `${API_BASE_URL}/api/analyses`;

interface AnalyzeApiRisk {
  level: RiskLevel;
  title: string;
  description: string;
  excerpt?: string;
  suggestion: string;
}

interface AnalyzeApiResponse {
  analysisId?: string;
  fileName?: string;
  createdAt?: string | null;
  riskLevel?: RiskLevel;
  summary: string;
  risks: AnalyzeApiRisk[];
  status?: string;
}

interface AnalysesApiResponse {
  analyses: AnalyzeApiResponse[];
}

const FRIENDLY_ERRORS: Record<string, string> = {
  "authentication required": "認証が必要です。ページを再読み込みしてからもう一度お試しください。",
  "invalid authentication token": "認証トークンを確認できませんでした。ページを再読み込みしてからもう一度お試しください。",
  "GEMINI_API_KEY is not configured": "Gemini APIキーが設定されていません。",
  "Gemini API request failed": "Gemini APIの呼び出しに失敗しました。",
  "Failed to parse analysis response": "Gemini APIの解析結果をJSONとして読み取れませんでした。",
  "file is required": "ファイルを選択してください。",
  "unsupported file type": "対応していないファイル形式です。txt、csv、jsonを指定してください。",
  "file size must be 5MB or less": "ファイルサイズは5MB以下にしてください。",
  "analysis not found": "分析履歴が見つかりませんでした。"
};

function toFriendly(serverMessage: string, fallback: string): string {
  if (!serverMessage) return fallback;
  for (const [key, friendly] of Object.entries(FRIENDLY_ERRORS)) {
    if (serverMessage.includes(key)) return friendly;
  }
  return serverMessage;
}

async function buildError(response: Response, fallback: string): Promise<Error> {
  let serverMessage = "";
  try {
    const data = await response.json();
    serverMessage = typeof data?.error === "string" ? data.error : "";
  } catch {
    serverMessage = "";
  }
  return new Error(toFriendly(serverMessage, fallback));
}

async function authRequestContext(): Promise<{ headers: HeadersInit; uid: string }> {
  const { uid, token } = await getAuthContext();
  return {
    uid,
    headers: {
      Authorization: `Bearer ${token}`
    }
  };
}

function createId(prefix: string): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function getOverallRisk(risks: AnalyzeApiRisk[]): RiskLevel {
  if (risks.some((risk) => risk.level === "high")) return "high";
  if (risks.some((risk) => risk.level === "medium")) return "medium";
  return "low";
}

function toRevisionSuggestions(risks: AnalyzeApiRisk[], analysisId?: string) {
  return risks
    .filter((risk) => risk.suggestion && risk.suggestion.trim().length > 0)
    .map((risk, index) => ({
      id: `${analysisId || "revision"}-${index + 1}`,
      itemName: risk.title,
      riskLevel: risk.level,
      currentText: risk.excerpt || risk.description,
      suggestedText: risk.suggestion,
      reason: risk.description
    }));
}

function toAnalysisResult(
  data: AnalyzeApiResponse,
  fallback?: { fileName?: string; createdAt?: string }
): AnalysisResult {
  const risks = Array.isArray(data.risks) ? data.risks : [];
  const analysisId = data.analysisId;
  const createdAt = data.createdAt || fallback?.createdAt || new Date().toISOString();
  const fileName = data.fileName || fallback?.fileName || "アップロードファイル";

  return {
    id: analysisId || createId("analysis"),
    analysisId,
    documentId: analysisId || createId("document"),
    documentType: fileName,
    fileName,
    overallRisk: data.riskLevel || getOverallRisk(risks),
    summary: typeof data.summary === "string" ? data.summary : "",
    riskItems: risks.map((risk, index) => ({
      id: `${analysisId || "risk"}-${index + 1}`,
      itemName: risk.title,
      extractedText: risk.excerpt || risk.description,
      riskLevel: risk.level,
      reason: risk.description,
      relatedRule: "",
      recommendedAction: risk.suggestion,
      suggestion: risk.suggestion
    })),
    revisionSuggestions: toRevisionSuggestions(risks, analysisId),
    approvalFlow: {
      action: "staff_review",
      label: "確認が必要です",
      reason: "検出されたリスクを確認してから承認してください。",
      assignee: "確認担当者",
      nextStep: "リスク一覧と改善案を確認し、必要に応じて契約内容を修正してください。"
    },
    referencedRules: [],
    createdAt,
    saved: Boolean(analysisId),
    saveStatus: data.status
  };
}

export async function analyzeFile(file: File): Promise<AnalysisResult> {
  const formData = new FormData();
  formData.append("file", file);

  const { headers, uid } = await authRequestContext();
  console.log("[api] POST /api/analyze", { uid, fileName: file.name });

  const response = await fetch(ANALYZE_API_URL, {
    method: "POST",
    headers,
    body: formData
  });

  if (!response.ok) {
    throw await buildError(response, "分析リクエストに失敗しました。");
  }

  const data = (await response.json()) as AnalyzeApiResponse;
  return toAnalysisResult(data, { fileName: file.name });
}

export async function approveAnalysis(
  analysisId: string
): Promise<{ analysisId: string; status: string }> {
  const { headers, uid } = await authRequestContext();
  console.log("[api] PATCH /api/analyses/:analysisId/status", {
    uid,
    analysisId
  });

  const response = await fetch(`${ANALYSES_API_URL}/${analysisId}/status`, {
    method: "PATCH",
    headers
  });

  if (!response.ok) {
    throw await buildError(response, "分析結果の承認に失敗しました。");
  }

  return (await response.json()) as { analysisId: string; status: string };
}

export async function fetchAnalyses(): Promise<AnalysisResult[]> {
  const { headers, uid } = await authRequestContext();
  console.log("[api] GET /api/analyses", { uid });

  const response = await fetch(ANALYSES_API_URL, {
    headers
  });

  if (!response.ok) {
    throw await buildError(response, "過去の分析履歴を取得できませんでした。");
  }

  const data = (await response.json()) as AnalysesApiResponse;
  const analyses = Array.isArray(data.analyses) ? data.analyses : [];

  console.log("[api] GET /api/analyses response", {
    uid,
    count: analyses.length,
    analyses
  });

  return analyses.map((analysis) => toAnalysisResult(analysis));
}

async function fetchDemoFile(path: string, fileName: string): Promise<File> {
  const response = await fetch(path);

  if (!response.ok) {
    throw new Error("デモファイルを取得できませんでした。");
  }

  const blob = await response.blob();
  return new File([blob], fileName, { type: "text/plain" });
}

export async function analyzeSample(level: RiskLevel): Promise<AnalysisResult> {
  const fileName = `${level}-risk-contract.txt`;
  const file = await fetchDemoFile(`/demo-files/${fileName}`, fileName);

  return analyzeFile(file);
}

export async function analyzeDriveDemo(): Promise<AnalysisResult> {
  const fileName = "high-risk-contract.txt";
  const file = await fetchDemoFile(`/demo-files/${fileName}`, fileName);

  return analyzeFile(file);
}
