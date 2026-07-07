import type { AgentStep } from "../types";

interface Props {
  steps: AgentStep[];
}

function icon(status: AgentStep["status"]) {
  if (status === "completed") return "✓";
  if (status === "running") return "";
  return "";
}

export default function AgentTimeline({ steps }: Props) {
  return (
    <section className="card">
      <div className="card__header">
        <h2 className="card__title">
          <span aria-hidden></span> エージェント作業ログ
        </h2>
      </div>

      <ol className="timeline">
        {steps.map((step, i) => (
          <li
            key={i}
            className={`timeline__item timeline__item--${step.status}`}
          >
            <span className="timeline__marker" aria-hidden>
              {step.status === "running" ? (
                <span className="spinner spinner--sm" />
              ) : (
                icon(step.status)
              )}
            </span>
            <span className="timeline__label">{step.label}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}
