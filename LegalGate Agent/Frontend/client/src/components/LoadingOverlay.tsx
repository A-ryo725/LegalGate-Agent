interface Props {
  visible: boolean;
  message?: string;
}

export default function LoadingOverlay({ visible, message }: Props) {
  if (!visible) return null;

  return (
    <div className="loading-toast" role="status" aria-live="polite">
      <span className="spinner" />
      <span className="loading-toast__text">
        {message ?? "Gemini API が契約書を解析中..."}
      </span>
    </div>
  );
}
