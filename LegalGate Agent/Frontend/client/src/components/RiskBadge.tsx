import type { RiskLevel } from "../types";
import { riskMeta } from "../utils/risk";

interface Props {
  level: RiskLevel;
  size?: "sm" | "md" | "lg";
  showText?: boolean;
}

export default function RiskBadge({
  level,
  size = "md",
  showText = true
}: Props) {
  const meta = riskMeta(level);
  return (
    <span className={`risk-badge risk-${meta.className} risk-${size}`}>
      <span className="risk-dot" aria-hidden />
      {showText ? meta.label : null}
    </span>
  );
}
