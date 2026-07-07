import type { AnalysisResult, RiskLevel } from "../types";
import DemoFileDownloads from "./DemoFileDownloads";
import FileUploader from "./FileUploader";
import SampleDocumentButtons from "./SampleDocumentButtons";
import DriveDetectionDemo from "./DriveDetectionDemo";
import RiskBadge from "./RiskBadge";
import { formatDateTime } from "../utils/format";

interface Props {
  disabled: boolean;
  history: AnalysisResult[];
  historyError?: string | null;
  activeId?: string;
  onAnalyzeFile: (file: File) => void;
  onSample: (level: RiskLevel) => void;
  onDriveDemo: () => void;
  onSelectHistory: (id: string) => void;
}

export default function Sidebar({
  disabled,
  history,
  historyError,
  activeId,
  onAnalyzeFile,
  onSample,
  onDriveDemo,
  onSelectHistory
}: Props) {
  return (
    <aside className="sidebar">
      <DemoFileDownloads />
      <FileUploader onAnalyze={onAnalyzeFile} disabled={disabled} />
      <SampleDocumentButtons onSample={onSample} disabled={disabled} />
      <DriveDetectionDemo onDriveDemo={onDriveDemo} disabled={disabled} />

      <div className="panel">
        <h2 className="panel__title">過去の分析履歴</h2>
        {historyError && <p className="panel__error">{historyError}</p>}
        {history.length === 0 ? (
          <p className="panel__hint">まだ分析履歴はありません。</p>
        ) : (
          <ul className="history-list">
            {history.map((h) => (
              <li key={h.id}>
                <button
                  type="button"
                  className={`history-item${
                    h.id === activeId ? " history-item--active" : ""
                  }`}
                  onClick={() => onSelectHistory(h.id)}
                >
                  <RiskBadge level={h.overallRisk} size="sm" />
                  <span className="history-item__body">
                    <span className="history-item__type">
                      {h.fileName || h.documentType}
                    </span>
                    <span className="history-item__time">
                      {formatDateTime(h.createdAt)}
                      {h.saveStatus ? ` / ${h.saveStatus}` : ""}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </aside>
  );
}
