import type { ApprovalFlow } from "../types";
import { approvalMeta } from "../utils/risk";

interface Props {
  approvalFlow: ApprovalFlow;
  status?: string;
  approving?: boolean;
  onApprove?: () => void;
}

export default function ApprovalFlowCard({
  approvalFlow,
  status,
  approving = false,
  onApprove
}: Props) {
  const meta = approvalMeta(approvalFlow.action);
  const isApproved = status === "確認済";

  return (
    <section className="card">
      <div className="card__header">
        <h2 className="card__title">承認フロー</h2>
        {status && <span className="card__badge">{status}</span>}
      </div>

      <div className={`approval-banner approval-${meta.className}`}>
        <span className="approval-banner__label">
          {isApproved ? "確認済" : approvalFlow.label}
        </span>
      </div>

      <dl className="approval-details">
        <div className="approval-details__row">
          <dt>担当</dt>
          <dd>{approvalFlow.assignee}</dd>
        </div>
        <div className="approval-details__row">
          <dt>理由</dt>
          <dd>{approvalFlow.reason}</dd>
        </div>
        <div className="approval-details__row">
          <dt>次のステップ</dt>
          <dd>{isApproved ? "確認済みです。" : approvalFlow.nextStep}</dd>
        </div>
      </dl>

      {onApprove && (
        <div className="approval-actions">
          <button
            type="button"
            className="btn btn-primary approval-actions__button"
            onClick={onApprove}
            disabled={approving || isApproved}
          >
            {isApproved ? "確認済" : approving ? "承認中..." : "承認する"}
          </button>
        </div>
      )}
    </section>
  );
}
