import type { ApprovalAction, RiskLevel } from "../types";

interface RiskMeta {
  label: string; // 表示名（高 / 中 / 低）
  fullLabel: string; // 総合リスク◯ の表示
  className: string; // CSS クラスの接尾辞
}

export const RISK_META: Record<RiskLevel, RiskMeta> = {
  high: { label: "高", fullLabel: "高リスク", className: "high" },
  medium: { label: "中", fullLabel: "中リスク", className: "medium" },
  low: { label: "低", fullLabel: "低リスク", className: "low" }
};

export function riskMeta(level: RiskLevel): RiskMeta {
  return RISK_META[level] ?? RISK_META.medium;
}

interface ApprovalMeta {
  label: string;
  className: string;
}

export const APPROVAL_META: Record<ApprovalAction, ApprovalMeta> = {
  auto_approve: { label: "自動承認可能", className: "low" },
  staff_review: { label: "担当者確認が必要", className: "medium" },
  manager_approval: { label: "上長承認が必要", className: "medium" },
  legal_review: { label: "法務確認が必要", className: "high" }
};

export function approvalMeta(action: ApprovalAction): ApprovalMeta {
  return APPROVAL_META[action] ?? APPROVAL_META.staff_review;
}
