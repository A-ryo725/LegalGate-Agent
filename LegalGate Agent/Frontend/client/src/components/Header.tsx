import type { AnalysisStatus, RiskLevel } from "../types";

interface Props {
  status: AnalysisStatus;
  overallRisk?: RiskLevel;
}

interface StatusMeta {
  label: string;
  className: string;
}

function resolveStatus(
  status: AnalysisStatus,
  overallRisk?: RiskLevel
): StatusMeta {
  switch (status) {
    case "uploading":
    case "analyzing":
      return { label: "解析中", className: "analyzing" };
    case "completed":
      if (overallRisk === "high") {
        return { label: "高リスク検出", className: "high" };
      }
      return { label: "解析完了", className: "completed" };
    case "error":
      return { label: "エラー", className: "error" };
    case "idle":
    default:
      return { label: "未解析", className: "idle" };
  }
}

export default function Header({ status, overallRisk }: Props) {
  const meta = resolveStatus(status, overallRisk);

  return (
    <header className="app-header">
      <div className="app-header__brand">
        <div className="app-header__titles">
          <h1 className="app-header__title">LegalGate Agent</h1>
          <p className="app-header__subtitle">
            契約書・稟議リスク監視エージェント
          </p>
        </div>
      </div>

      <div className={`status-pill status-${meta.className}`}>
        <span className="status-pill__dot" aria-hidden />
        {meta.label}
      </div>
    </header>
  );
}
