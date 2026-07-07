import type { RevisionSuggestion } from "../types";
import RiskBadge from "./RiskBadge";

interface Props {
  suggestions: RevisionSuggestion[];
}

export default function RevisionSuggestions({ suggestions }: Props) {
  return (
    <section className="card">
      <div className="card__header">
        <h2 className="card__title">リスク一覧・修正案</h2>
        <span className="card__badge">{suggestions.length} 件</span>
      </div>

      {suggestions.length === 0 ? (
        <p className="panel__hint">検出されたリスク項目はありません。</p>
      ) : (
        <div className="revision-list">
          {suggestions.map((s) => (
            <article key={s.id} className="revision">
              <div className="revision__heading">
                <h3 className="revision__title">{s.itemName}</h3>
                <RiskBadge level={s.riskLevel} size="sm" />
              </div>

              <p className="revision__reason revision__reason--top">
                <strong>判定理由:</strong> {s.reason}
              </p>

              <div className="revision__diff">
                <div className="revision__col revision__col--before">
                  <span className="revision__tag">現状</span>
                  <p>{s.currentText}</p>
                </div>
                <div className="revision__arrow" aria-hidden>
                  →
                </div>
                <div className="revision__col revision__col--after">
                  <span className="revision__tag">修正案</span>
                  <p>{s.suggestedText}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
