import fs from "fs";
import path from "path";
import type { RiskLevel } from "../types";

export interface ExtractedFile {
  text: string;
  fileName: string;
}

/**
 * アップロードされたファイルから契約書本文を取り出す。
 * MVP では .txt を必須対応とし、.pdf は未対応（明確なエラーを返す）。
 */
export function extractTextFromUpload(
  file: Express.Multer.File
): ExtractedFile {
  const fileName = file.originalname || "uploaded.txt";
  const ext = path.extname(fileName).toLowerCase();

  if (ext === ".pdf") {
    throw new Error(
      "MVP ではテキストファイル(.txt)を推奨しています。PDF の本文解析は現在未対応です。"
    );
  }

  // .txt およびその他のプレーンテキストは UTF-8 として読み取る
  const text = file.buffer.toString("utf-8");

  if (!text || text.trim().length === 0) {
    throw new Error("ファイルが空、または本文を読み取れませんでした。");
  }

  return { text, fileName };
}

/** デモ契約書ディレクトリ（Docker/ローカルとも server の 1 つ上に配置） */
const DEMO_DIR = path.join(process.cwd(), "..", "demo-files");

const DEMO_FILES: Record<RiskLevel, string> = {
  low: "low-risk-contract.txt",
  medium: "medium-risk-contract.txt",
  high: "high-risk-contract.txt"
};

/** サンプル解析 / Drive 検知デモ用に、リスクレベル別のデモ契約書本文を読み込む */
export function readDemoContract(level: RiskLevel): ExtractedFile {
  const fileName = DEMO_FILES[level];
  const filePath = path.join(DEMO_DIR, fileName);

  if (!fs.existsSync(filePath)) {
    throw new Error(`デモ契約書が見つかりませんでした: ${fileName}`);
  }

  const text = fs.readFileSync(filePath, "utf-8");
  return { text, fileName };
}
