interface Props {
  onDriveDemo: () => void;
  disabled: boolean;
}

export default function DriveDetectionDemo({ onDriveDemo, disabled }: Props) {
  return (
    <div className="panel">
      <h2 className="panel__title">Drive 検知デモ</h2>
      <p className="panel__hint">
        Google Driveに高リスク契約書が追加された想定で、デモファイルを自動解析します。
      </p>

      <button
        type="button"
        className="btn btn-drive btn-block"
        onClick={onDriveDemo}
        disabled={disabled}
      >
        Driveの新規契約書を検知して解析
      </button>
    </div>
  );
}
