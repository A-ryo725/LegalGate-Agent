import type { ParsedAnalysis, RiskLevel } from "../types";

/**
 * 開発用の予備データ（mockAnalysisService からのみ使用）。
 * 本番デモの主処理では使用しない（Gemini API 解析が基本）。
 */
export const MOCK_RESULTS: Record<RiskLevel, ParsedAnalysis> = {
  high: {
    documentType: "業務委託契約書",
    overallRisk: "high",
    summary:
      "支払条件、損害賠償責任、自動更新、違約金条項に高いリスクがあります。締結前に法務確認が必要です。",
    riskItems: [
      {
        id: "risk_payment",
        itemName: "支払条件",
        extractedText: "委託料は検収完了日の翌月末から90日以内に支払う。",
        riskLevel: "high",
        reason: "社内基準の60日以内を超過しているため。",
        relatedRule: "支払サイトは60日以内であること。",
        recommendedAction: "支払条件の修正が必要です。",
        suggestion: "委託料は検収完了日の翌月末から60日以内に支払う。"
      },
      {
        id: "risk_liability",
        itemName: "損害賠償責任",
        extractedText: "賠償額に上限は設けない。",
        riskLevel: "high",
        reason: "損害賠償責任に上限金額が設定されていないため。",
        relatedRule: "損害賠償責任には上限金額を設定すること。",
        recommendedAction: "賠償上限の設定が必要です。",
        suggestion: "損害賠償責任は契約金額を上限とする。"
      },
      {
        id: "risk_auto_renew",
        itemName: "自動更新条項",
        extractedText:
          "期間満了の1か月前までに申し出がない場合、同一条件で自動更新される。",
        riskLevel: "medium",
        reason: "自動更新条項があるため上長確認が必要。",
        relatedRule: "自動更新条項がある場合は上長確認を必須とする。",
        recommendedAction: "自動更新の可否について上長確認が必要です。"
      },
      {
        id: "risk_penalty",
        itemName: "違約金条項",
        extractedText: "納期に遅延が生じた場合、乙は違約金を支払うものとする。",
        riskLevel: "high",
        reason: "違約金条項があるため法務確認が必須。",
        relatedRule: "違約金条項がある場合は法務確認を必須とする。",
        recommendedAction: "違約金の金額・条件について法務確認が必要です。"
      }
    ],
    revisionSuggestions: [
      {
        id: "rev_payment",
        itemName: "支払条件",
        currentText: "委託料は検収完了日の翌月末から90日以内に支払う。",
        suggestedText: "委託料は検収完了日の翌月末から60日以内に支払う。",
        reason: "社内規程では支払サイトを60日以内としているため。"
      },
      {
        id: "rev_liability",
        itemName: "損害賠償責任",
        currentText: "賠償額に上限は設けない。",
        suggestedText: "損害賠償責任は契約金額を上限とする。",
        reason: "損害賠償責任には上限金額を設定する必要があるため。"
      }
    ],
    approvalFlow: {
      action: "legal_review",
      label: "法務確認が必要",
      reason:
        "高リスク条項が複数検出されたため、締結前に法務担当者の確認が必要です。",
      assignee: "法務担当者",
      nextStep:
        "契約締結前に条項修正案を確認し、取引先へ修正依頼を行ってください。"
    },
    referencedRules: [
      "支払サイトは60日以内であること。",
      "損害賠償責任には上限金額を設定すること。",
      "違約金条項がある場合は法務確認を必須とする。",
      "自動更新条項がある場合は上長確認を必須とする。"
    ]
  },
  medium: {
    documentType: "業務委託契約書",
    overallRisk: "medium",
    summary:
      "解約通知期間と自動更新条項、検収条件にリスクがあります。上長承認を推奨します。",
    riskItems: [
      {
        id: "risk_termination",
        itemName: "解約条項",
        extractedText: "本契約は15日前までに書面で通知することで解除できる。",
        riskLevel: "medium",
        reason: "社内基準の30日前通知を満たしていないため。",
        relatedRule: "契約解除には30日前通知を含めること。",
        recommendedAction: "解約通知期間の見直しが必要です。",
        suggestion: "本契約は30日前までに書面で通知することで解除できる。"
      },
      {
        id: "risk_auto_renew",
        itemName: "自動更新条項",
        extractedText: "契約期間満了後、申し出がない場合は自動更新される。",
        riskLevel: "medium",
        reason: "自動更新条項があるため上長確認が必要。",
        relatedRule: "自動更新条項がある場合は上長確認を必須とする。",
        recommendedAction: "自動更新の可否について上長確認が必要です。"
      },
      {
        id: "risk_inspection",
        itemName: "検収条件",
        extractedText: "納品物の検収条件は別途協議する。",
        riskLevel: "medium",
        reason: "検収条件が曖昧なため担当者確認が必要。",
        relatedRule: "検収条件が曖昧な場合は担当者確認を必須とする。",
        recommendedAction: "検収条件を具体化してください。"
      }
    ],
    revisionSuggestions: [
      {
        id: "rev_termination",
        itemName: "解約条項",
        currentText: "本契約は15日前までに書面で通知することで解除できる。",
        suggestedText: "本契約は30日前までに書面で通知することで解除できる。",
        reason: "社内規程では契約解除に30日前通知を求めているため。"
      }
    ],
    approvalFlow: {
      action: "manager_approval",
      label: "上長承認が必要",
      reason:
        "中程度のリスク条項が検出されたため、締結前に上長の承認が必要です。",
      assignee: "上長",
      nextStep: "修正案を確認し、上長承認を取得してください。"
    },
    referencedRules: [
      "契約解除には30日前通知を含めること。",
      "自動更新条項がある場合は上長確認を必須とする。",
      "検収条件が曖昧な場合は担当者確認を必須とする。"
    ]
  },
  low: {
    documentType: "業務委託契約書",
    overallRisk: "low",
    summary:
      "支払条件・賠償上限・解約通知いずれも社内基準を満たしています。自動承認可能です。",
    riskItems: [
      {
        id: "risk_payment",
        itemName: "支払条件",
        extractedText: "委託料は検収完了日の翌月末から60日以内に支払う。",
        riskLevel: "low",
        reason: "社内基準の60日以内を満たしているため。",
        relatedRule: "支払サイトは60日以内であること。",
        recommendedAction: "問題ありません。"
      },
      {
        id: "risk_liability",
        itemName: "損害賠償責任",
        extractedText: "損害賠償責任は契約金額を上限とする。",
        riskLevel: "low",
        reason: "賠償上限が設定されているため。",
        relatedRule: "損害賠償責任には上限金額を設定すること。",
        recommendedAction: "問題ありません。"
      }
    ],
    revisionSuggestions: [],
    approvalFlow: {
      action: "auto_approve",
      label: "自動承認可能",
      reason: "重大なリスク条項が検出されなかったため、自動承認が可能です。",
      assignee: "システム",
      nextStep: "そのまま承認手続きを進めてください。"
    },
    referencedRules: [
      "支払サイトは60日以内であること。",
      "損害賠償責任には上限金額を設定すること。",
      "契約解除には30日前通知を含めること。"
    ]
  }
};
