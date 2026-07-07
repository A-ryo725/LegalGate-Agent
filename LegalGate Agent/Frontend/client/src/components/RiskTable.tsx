import type { RiskItem } from "../types";
import RiskBadge from "./RiskBadge";

interface Props {
  items: RiskItem[];
}

export default function RiskTable({ items }: Props) {
  return (
    <section className="card">
      <div className="card__header">
        <h2 className="card__title">
          リスク一覧（項目別）
        </h2>
        <span className="card__badge">{items.length} 件</span>
      </div>

      {items.length === 0 ? (
        <p className="panel__hint">検出されたリスク項目はありません。</p>
      ) : (
        <div className="risk-table-wrap">
          <table className="risk-table">
            <colgroup>
              <col className="risk-table__col-item" />
              <col className="risk-table__col-level" />
              <col className="risk-table__col-excerpt" />
              <col className="risk-table__col-reason" />
              <col className="risk-table__col-action" />
            </colgroup>
            <thead>
              <tr>
                <th>項目</th>
                <th>リスク</th>
                <th>抽出テキスト</th>
                <th>判定理由</th>
                <th>推奨アクション</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td className="risk-table__item">{item.itemName}</td>
                  <td>
                    <RiskBadge level={item.riskLevel} size="sm" />
                  </td>
                  <td className="risk-table__quote">{item.extractedText}</td>
                  <td className="risk-table__reason">{item.reason}</td>
                  <td>{item.recommendedAction}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

