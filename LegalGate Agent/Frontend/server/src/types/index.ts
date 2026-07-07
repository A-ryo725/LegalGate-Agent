export type RiskLevel = "low" | "medium" | "high";

export type AnalysisStatus =
  | "idle"
  | "uploading"
  | "analyzing"
  | "completed"
  | "error";

export type ApprovalAction =
  | "auto_approve"
  | "staff_review"
  | "manager_approval"
  | "legal_review";

export type AgentStepStatus = "waiting" | "running" | "completed";

export interface UploadedDocument {
  id: string;
  fileName: string;
  fileSize?: number;
  documentType: string;
  uploadedAt: string;
  status: AnalysisStatus;
}

export interface RiskItem {
  id: string;
  itemName: string;
  extractedText: string;
  riskLevel: RiskLevel;
  reason: string;
  relatedRule: string;
  recommendedAction: string;
  suggestion?: string;
}

export interface RevisionSuggestion {
  id: string;
  itemName: string;
  currentText: string;
  suggestedText: string;
  reason: string;
}

export interface ApprovalFlow {
  action: ApprovalAction;
  label: string;
  reason: string;
  assignee: string;
  nextStep: string;
}

export interface AnalysisResult {
  id: string;
  documentId: string;
  documentType: string;
  overallRisk: RiskLevel;
  summary: string;
  riskItems: RiskItem[];
  revisionSuggestions: RevisionSuggestion[];
  approvalFlow: ApprovalFlow;
  referencedRules: string[];
  createdAt: string;
}

/** Gemini から受け取り、サーバー側で id / documentId / createdAt を付与する前の型 */
export type ParsedAnalysis = Omit<
  AnalysisResult,
  "id" | "documentId" | "createdAt"
>;
