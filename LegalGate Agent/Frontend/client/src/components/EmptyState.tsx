export default function EmptyState() {
  return (
    <section className="card empty-state">
      <h2 className="empty-state__title">契約書を解析してください</h2>
      <p className="empty-state__text">
        左側からデモ契約書をダウンロードしてアップロードするか、
        サンプル解析ボタンですぐに試せます。
      </p>

      <ol className="empty-state__steps">
        <li>
          <span className="empty-state__num">1</span>
          デモ契約書をダウンロード
        </li>
        <li>
          <span className="empty-state__num">2</span>
          ファイルをアップロード
        </li>
        <li>
          <span className="empty-state__num">3</span>
          Gemini APIで契約リスクを解析
        </li>
      </ol>
    </section>
  );
}
