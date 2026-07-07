import type { AnalysisResult } from "../types";
import { approvalMeta, riskMeta } from "../utils/risk";
import { formatDateTime } from "../utils/format";

interface Props {
  result: AnalysisResult;
}

export default function OverallRiskCard({ result }: Props) {
  const risk = riskMeta(result.overallRisk);
  const approval = approvalMeta(result.approvalFlow.action);

  const counts = {
    high: result.riskItems.filter((r) => r.riskLevel === "high").length,
    medium: result.riskItems.filter((r) => r.riskLevel === "medium").length,
    low: result.riskItems.filter((r) => r.riskLevel === "low").length
  };

  return (
    <section className={`card overall-card overall-${risk.className}`}>
      <div className="overall-card__main">
        <div className={`overall-gauge overall-gauge--${risk.className}`}>
          <span className="overall-gauge__level">{risk.label}</span>
          <span className="overall-gauge__caption">総合リスク</span>
        </div>

        <div className="overall-card__info">
          <div className="overall-card__doctype">{result.documentType}</div>
          <p className="overall-card__summary">{result.summary}</p>

          <div className="overall-card__meta">
            <span className={`approval-chip approval-${approval.className}`}>
              {result.approvalFlow.label}
            </span>
            <span className="overall-card__time">
              解析日時: {formatDateTime(result.createdAt)}
            </span>
          </div>
        </div>
      </div>

      <div className="risk-counts">
        <div className="risk-count risk-count--high">
          <span className="risk-count__num">{counts.high}</span>
          <span className="risk-count__label">高</span>
        </div>
        <div className="risk-count risk-count--medium">
          <span className="risk-count__num">{counts.medium}</span>
          <span className="risk-count__label">中</span>
        </div>
        <div className="risk-count risk-count--low">
          <span className="risk-count__num">{counts.low}</span>
          <span className="risk-count__label">低</span>
        </div>
      </div>
    </section>
  );
}
