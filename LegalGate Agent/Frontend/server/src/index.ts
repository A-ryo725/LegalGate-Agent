import path from "path";
import express from "express";
import dotenv from "dotenv";
import { healthRouter } from "./routes/health";
import { analyzeRouter } from "./routes/analyze";

dotenv.config();

const app = express();

// 1. JSON ボディパーサ
app.use(express.json({ limit: "2mb" }));

// 2. API ルート
app.use("/api/health", healthRouter);
app.use("/api", analyzeRouter);

// 3. デモ契約書ファイルの静的配信
const demoFilesDir = path.join(process.cwd(), "..", "demo-files");
app.use("/demo-files", express.static(demoFilesDir));

// 4. React ビルド成果物の静的配信
const clientDistDir = path.join(process.cwd(), "..", "client", "dist");
app.use(express.static(clientDistDir));

// 5. SPA フォールバック（/api 以外はすべて index.html を返す）
app.get("*", (req, res) => {
  if (req.path.startsWith("/api")) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.sendFile(path.join(clientDistDir, "index.html"));
});

const port = process.env.PORT || 8080;

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
  if (!process.env.GEMINI_API_KEY) {
    console.warn(
      "[warn] GEMINI_API_KEY が未設定です。解析 API はエラーを返します。"
    );
  }
});
