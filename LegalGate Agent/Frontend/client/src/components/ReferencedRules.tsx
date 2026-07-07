interface Props {
  rules: string[];
}

export default function ReferencedRules({ rules }: Props) {
  if (rules.length === 0) return null;

  return (
    <section className="card">
      <div className="card__header">
        <h2 className="card__title">
          <span aria-hidden>📚</span> 照合した社内ルール
        </h2>
      </div>

      <ul className="rules-list">
        {rules.map((rule, i) => (
          <li key={i} className="rules-list__item">
            <span className="rules-list__check" aria-hidden>
              ✓
            </span>
            {rule}
          </li>
        ))}
      </ul>
    </section>
  );
}
