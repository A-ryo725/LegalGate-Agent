/**
 * 社内ルールと、Gemini API へ渡すプロンプトの定義。
 * リスク判定の基準はここに集約する。
 */

export const INTERNAL_RULES: string[] = [
  "支払サイトは60日以内であること",
  "損害賠償責任には上限金額を設定すること",
  "契約解除には30日前通知を含めること",
  "違約金条項がある場合は法務確認を必須とする",
  "自動更新条項がある場合は上長確認を必須とする",
  "検収条件が曖昧な場合は担当者確認を必須とする"
];

/**
 * 契約書本文を渡して、リスク解析用のプロンプトを生成する。
 * 出力は必ず JSON のみ（Markdown・説明文・コードブロック不要）を指示する。
 */
export function buildAnalysisPrompt(contractText: string): string {
  const rules = INTERNAL_RULES.map((r) => `- ${r}`).join("\n");

  return `あなたは契約書・稟議リスク監視エージェントです。

入力された契約書本文を読み、社内ルールと照合して、契約リスクを判定してください。

必ず以下を実行してください。

1. 文書種別を判定する
2. 契約当事者、契約期間、契約金額、支払条件を抽出する
3. 支払条件、解約条項、責任範囲、納期、違約金、自動更新条項を抽出する
4. 社内ルールと照合する
5. 各項目のリスクを low / medium / high で判定する
6. 判定理由を説明する
7. リスクのある条項について修正案を生成する
8. 最終的な承認フローを提案する

社内ルール：
${rules}

承認フロー（approvalFlow.action）は次のいずれかを使用してください。
- auto_approve … 重大なリスクがなく自動承認可能
- staff_review … 検収条件など担当者確認が必要
- manager_approval … 自動更新条項など上長承認が必要
- legal_review … 違約金・賠償上限なしなど法務確認が必要（高リスク時）

overallRisk（総合リスク）は low / medium / high のいずれかで判定してください。
- high の場合、approvalFlow.action は legal_review とし、label は「法務確認が必要」とする
- medium の場合、approvalFlow.action は manager_approval とし、label は「上長承認が必要」とする
- low の場合、approvalFlow.action は auto_approve とし、label は「自動承認可能」とする

出力は必ず次の JSON 形式のみとしてください。
Markdown、説明文、コードブロックは不要です。

{
  "documentType": "業務委託契約書",
  "overallRisk": "high",
  "summary": "総合的なリスク説明",
  "riskItems": [
    {
      "id": "risk_payment",
      "itemName": "支払条件",
      "extractedText": "契約書から抽出した該当箇所",
      "riskLevel": "high",
      "reason": "判定理由",
      "relatedRule": "関連する社内ルール",
      "recommendedAction": "推奨アクション",
      "suggestion": "修正後の文言（任意）"
    }
  ],
  "revisionSuggestions": [
    {
      "id": "rev_payment",
      "itemName": "支払条件",
      "currentText": "現状の条項",
      "suggestedText": "修正後の条項",
      "reason": "修正理由"
    }
  ],
  "approvalFlow": {
    "action": "legal_review",
    "label": "法務確認が必要",
    "reason": "承認フローの理由",
    "assignee": "法務担当者",
    "nextStep": "次に行うべきこと"
  },
  "referencedRules": [
    "照合に用いた社内ルール"
  ]
}

契約書本文：
"""
${contractText}
"""`;
}
