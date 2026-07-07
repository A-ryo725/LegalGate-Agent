import { useRef, useState } from "react";
import { formatFileSize } from "../utils/format";

interface Props {
  onAnalyze: (file: File) => void;
  disabled: boolean;
}

export default function FileUploader({ onAnalyze, disabled }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const pickFile = (selected: File | null) => {
    if (selected) setFile(selected);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    if (disabled) return;
    pickFile(e.dataTransfer.files?.[0] ?? null);
  };

  const handleSubmit = () => {
    if (!file || disabled) return;
    onAnalyze(file);
  };

  return (
    <div className="panel">
      <h2 className="panel__title">ファイルアップロード</h2>

      <div
        className={`dropzone${dragOver ? " dropzone--over" : ""}${
          disabled ? " dropzone--disabled" : ""
        }`}
        onClick={() => !disabled && inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if ((e.key === "Enter" || e.key === " ") && !disabled) {
            inputRef.current?.click();
          }
        }}
      >
        <div className="dropzone__icon" aria-hidden>
          Upload
        </div>
        {file ? (
          <div className="dropzone__file">
            <span className="dropzone__filename">{file.name}</span>
            <span className="dropzone__filesize">
              {formatFileSize(file.size)}
            </span>
          </div>
        ) : (
          <div className="dropzone__prompt">
            <strong>Click</strong> or drag and drop a file
            <br />
            Supported: .txt / .csv / .json
          </div>
        )}

        <input
          ref={inputRef}
          type="file"
          accept=".txt,.csv,.json"
          hidden
          disabled={disabled}
          onChange={(e) => pickFile(e.target.files?.[0] ?? null)}
        />
      </div>

      <p className="uploader-note">ファイルを選択し、バックエンドAPIに送信します。</p>

      <button
        type="button"
        className="btn btn-primary btn-block"
        onClick={handleSubmit}
        disabled={disabled || !file}
      >
        {disabled ? "Loading..." : "ファイル解析"}
      </button>
    </div>
  );
}
