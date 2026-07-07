import type { RiskLevel } from "../types";

interface Props {
  onSample: (level: RiskLevel) => void;
  disabled: boolean;
}

const SAMPLES: { level: RiskLevel; label: string }[] = [
  { level: "low", label: "低リスクのサンプルを解析" },
  { level: "medium", label: "中リスクのサンプルを解析" },
  { level: "high", label: "高リスクのサンプルを解析" }
];

export default function SampleDocumentButtons({ onSample, disabled }: Props) {
  return (
    <div className="panel">
      <h2 className="panel__title">サンプル解析</h2>
      <p className="panel__hint">
        デモ契約書を自動でアップロードし、既存のバックエンドAPIで解析します。
      </p>

      <div className="sample-buttons">
        {SAMPLES.map((s) => (
          <button
            key={s.level}
            type="button"
            className={`btn btn-outline sample-${s.level}`}
            onClick={() => onSample(s.level)}
            disabled={disabled}
          >
            {s.label}
          </button>
        ))}
      </div>
    </div>
  );
}
