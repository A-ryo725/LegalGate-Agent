const DEMO_FILES = [
  {
    href: "/demo-files/low-risk-contract.txt",
    label: "低リスク契約書をダウンロード",
    level: "low" as const
  },
  {
    href: "/demo-files/medium-risk-contract.txt",
    label: "中リスク契約書をダウンロード",
    level: "medium" as const
  },
  {
    href: "/demo-files/high-risk-contract.txt",
    label: "高リスク契約書をダウンロード",
    level: "high" as const
  }
];

export default function DemoFileDownloads() {
  return (
    <div className="panel">
      <h2 className="panel__title">デモファイル</h2>

      <ol className="steps-hint">
        <li>デモ契約書をダウンロード</li>
        <li>ダウンロードしたファイルをアップロード</li>
        <li>バックエンドAPIでリスク分析</li>
      </ol>

      <div className="download-list">
        {DEMO_FILES.map((f) => (
          <a
            key={f.href}
            className={`download-link download-${f.level}`}
            href={f.href}
            download
          >
            {f.label}
          </a>
        ))}
      </div>
    </div>
  );
}

