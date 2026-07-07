# REQUIREMENTS.md

# LegalGate Agent 要件定義書

## Cloud Run + Gemini API Webアプリ版

---

## 1. プロジェクト概要

## 1.1 アプリ名

LegalGate Agent
契約書・稟議リスク監視エージェント

---

## 1.2 目的

契約書、見積書、稟議書、発注書などの業務文書をGemini APIで解析し、社内ルールと照合して、リスク判定、修正案生成、承認フロー提案を行うWebアプリを作成する。

本アプリはハッカソン提出用MVPとして、Google Cloud Run上で動作するWebアプリとして実装する。

---

## 1.3 最重要方針

本アプリは、初期実装から **Gemini APIを使用する**。

ユーザーが契約書ファイルをアップロードすると、バックエンドがファイル本文を読み取り、Gemini APIに送信する。
Gemini APIは契約書本文を解析し、リスク項目、判定理由、修正案、承認フローをJSON形式で返す。

Gemini APIキーは必須とする。

```text
Cloud Run Webアプリ
↓
/api/analyze
↓
Express Backend
↓
Gemini API
↓
解析結果を画面表示
```

---

## 1.4 作りたいデモ体験

メインのデモ導線は以下とする。

```text
1. Cloud RunのURLを開く
2. デモ契約書ファイルをダウンロードする
3. ダウンロードした契約書ファイルをアップロードする
4. AIエージェント作業ログが進む
5. Gemini APIが契約書を解析する
6. リスク判定が表示される
7. 修正案が表示される
8. 承認フローが表示される
```

高リスク契約書を使ったデモでは、以下を見せる。

```text
高リスク契約書をダウンロード
↓
アップロード
↓
Gemini APIが契約書本文を解析
↓
支払条件90日、損害賠償上限なし、自動更新、違約金を検出
↓
総合リスク「高」
↓
法務確認が必要
↓
修正案を提示
```

---

# 2. 技術構成

## 2.1 全体構成

本アプリは、Google Cloud Run上で動作する1コンテナ構成のWebアプリとして実装する。

フロントエンドは React + TypeScript + Vite で作成する。
バックエンドは Node.js + Express + TypeScript で作成する。

Reactのビルド成果物はExpressサーバーから静的配信する。
同じExpressサーバーで `/api` を提供し、Gemini APIとの通信もバックエンド側で行う。

---

## 2.2 採用技術

### フロントエンド

```text
React
TypeScript
Vite
CSS
```

### バックエンド

```text
Node.js
Express
TypeScript
Multer
dotenv
@google/generative-ai
```

### 実行環境

```text
Google Cloud Run
Docker
Gemini API
```

### 任意拡張

```text
Cloud Storage
Firestore
Google Drive API
ADK
Firebase Authentication
Secret Manager
```

MVPではCloud Storage、Firestore、Google Drive API、ADK、Firebase Authenticationは必須ではない。

---

## 2.3 Cloud Runでの動作

Cloud Runでは、Expressサーバーが `process.env.PORT` で指定されたポートを待ち受ける。

```ts
const port = process.env.PORT || 8080;

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
```

ポート番号を固定値でハードコードしない。

---

## 2.4 Gemini APIキー

Gemini APIキーはCloud Runの環境変数で管理する。

```env
GEMINI_API_KEY=your_api_key
```

React側には絶対にAPIキーを置かない。

禁止例。

```ts
const apiKey = "AIza...";
```

正しい構成。

```text
React
↓
Express API
↓
Cloud Run環境変数のGEMINI_API_KEYを使ってGemini APIを呼ぶ
```

---

# 3. アーキテクチャ

## 3.1 MVP構成

```text
Browser
  ↓
Cloud Run Service
  ├─ Express Server
  │   ├─ React静的ファイル配信
  │   ├─ デモ契約書ファイル配信
  │   ├─ /api/health
  │   ├─ /api/analyze
  │   ├─ /api/analyze-sample
  │   └─ /api/drive-demo
  │
  └─ Gemini Analysis Service
      ├─ 契約書本文をGemini APIへ送信
      ├─ JSON形式で解析結果を受け取る
      ├─ JSONをAnalysisResult型に整形
      └─ フロントエンドへ返却
```

---

## 3.2 解析処理の流れ

```text
ファイルアップロード
↓
/api/analyze
↓
Multerでファイル受信
↓
.txtの場合は本文を読み取り
↓
.pdfの場合はMVPではファイル名判定または簡易メッセージ
↓
Gemini APIへ契約書本文を送信
↓
Gemini APIがリスク解析
↓
JSONレスポンスを整形
↓
React画面に表示
```

---

# 4. プロジェクト構成

以下の構成で実装する。

```text
legalgate-agent/
  README.md
  REQUIREMENTS.md
  Dockerfile
  .dockerignore
  .gitignore
  cloudrun.env.example

  demo-files/
    low-risk-contract.txt
    medium-risk-contract.txt
    high-risk-contract.txt

  client/
    package.json
    tsconfig.json
    vite.config.ts
    index.html
    src/
      main.tsx
      App.tsx
      styles/
        global.css
      types/
        index.ts
      services/
        apiClient.ts
      utils/
        format.ts
        risk.ts
      components/
        Header.tsx
        Sidebar.tsx
        FileUploader.tsx
        DemoFileDownloads.tsx
        SampleDocumentButtons.tsx
        DriveDetectionDemo.tsx
        AgentTimeline.tsx
        OverallRiskCard.tsx
        RiskTable.tsx
        RiskBadge.tsx
        RevisionSuggestions.tsx
        ApprovalFlowCard.tsx
        ReferencedRules.tsx
        EmptyState.tsx
        LoadingOverlay.tsx

  server/
    package.json
    tsconfig.json
    src/
      index.ts
      routes/
        health.ts
        analyze.ts
      services/
        analysisService.ts
        geminiService.ts
        mockAnalysisService.ts
      data/
        mockRules.ts
        mockResults.ts
      types/
        index.ts
      utils/
        file.ts
        json.ts
```

---

# 5. フロントエンド要件

## 5.1 基本方針

フロントエンドは、Reactによる単一ページアプリとして実装する。
React Routerは必須ではない。

Cloud Run上では、ExpressがReactのビルド成果物を静的配信する。

---

## 5.2 画面レイアウト

推奨レイアウトは以下とする。

```text
+------------------------------------------------------+
| Header                                               |
| LegalGate Agent                                      |
+----------------------+-------------------------------+
| Sidebar              | Main Content                   |
| - デモファイルDL     | - エージェント作業ログ          |
| - ファイルアップロード | - 総合リスク                    |
| - サンプル解析       | - リスク一覧                    |
| - Drive検知デモ      | - 修正案                        |
| - 解析履歴           | - 承認フロー                    |
+----------------------+-------------------------------+
```

---

## 5.3 Header

表示内容。

```text
アプリ名：LegalGate Agent
サブタイトル：契約書・稟議リスク監視エージェント
現在の解析状態
  - 未解析
  - 解析中
  - 解析完了
  - 高リスク検出
```

---

## 5.4 Sidebar

表示内容。

```text
デモ契約書ダウンロード
ファイルアップロード
サンプル解析ボタン
Drive検知デモボタン
解析履歴
```

---

## 5.5 DemoFileDownloads

`client/src/components/DemoFileDownloads.tsx` を作成する。

以下の3ファイルをダウンロードできるようにする。

```text
/demo-files/low-risk-contract.txt
/demo-files/medium-risk-contract.txt
/demo-files/high-risk-contract.txt
```

表示するリンク。

```tsx
<a href="/demo-files/low-risk-contract.txt" download>
  低リスク契約書をダウンロード
</a>

<a href="/demo-files/medium-risk-contract.txt" download>
  中リスク契約書をダウンロード
</a>

<a href="/demo-files/high-risk-contract.txt" download>
  高リスク契約書をダウンロード
</a>
```

画面には以下の説明を表示する。

```text
1. デモ契約書をダウンロード
2. ダウンロードしたファイルをアップロード
3. Gemini APIが契約書を解析
```

---

## 5.6 FileUploader

`client/src/components/FileUploader.tsx` を作成する。

対応ファイル形式。

```text
.txt
.pdf
```

MVPでは `.txt` を必須対応とする。
`.pdf` は任意対応とする。PDF本文抽出が難しい場合は、画面上に「MVPではテキストファイルを推奨」と表示してよい。

ファイルアップロード時は `/api/analyze` に `multipart/form-data` で送信する。

```ts
const formData = new FormData();
formData.append("file", file);

const response = await fetch("/api/analyze", {
  method: "POST",
  body: formData
});
```

---

## 5.7 API通信

`client/src/services/apiClient.ts` を作成する。

必要な関数。

```ts
import type { AnalysisResult, RiskLevel } from "../types";

export async function analyzeFile(file: File): Promise<AnalysisResult> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("/api/analyze", {
    method: "POST",
    body: formData
  });

  if (!response.ok) {
    throw new Error("解析に失敗しました");
  }

  return response.json();
}

export async function analyzeSample(level: RiskLevel): Promise<AnalysisResult> {
  const response = await fetch("/api/analyze-sample", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ level })
  });

  if (!response.ok) {
    throw new Error("サンプル解析に失敗しました");
  }

  return response.json();
}

export async function analyzeDriveDemo(): Promise<AnalysisResult> {
  const response = await fetch("/api/drive-demo", {
    method: "POST"
  });

  if (!response.ok) {
    throw new Error("Drive検知デモに失敗しました");
  }

  return response.json();
}
```

---

# 6. エージェント作業ログ要件

解析開始後、以下のステップを順番に表示する。

```text
1. 文書を検知しました
2. 文書種別を判定しています
3. 重要条項を抽出しています
4. 社内ルールと照合しています
5. 過去契約データと比較しています
6. リスクレベルを判定しています
7. 修正案を生成しています
8. 承認ルートを判断しています
9. 解析が完了しました
```

各ステップの状態は以下とする。

```ts
type AgentStepStatus = "waiting" | "running" | "completed";
```

`setTimeout` または `async/await` を使い、ステップが順番に進行するように見せる。

Gemini API通信中も、画面上ではAIエージェントが処理しているように表示する。

---

# 7. バックエンド要件

## 7.1 Expressサーバー

`server/src/index.ts` でExpressサーバーを作成する。

Expressサーバーは以下を行う。

```text
Reactビルド成果物の静的配信
/demo-files の静的配信
/api/health
/api/analyze
/api/analyze-sample
/api/drive-demo
Gemini APIによる契約書解析
```

---

## 7.2 ルーティング順序

Expressでは以下の順序でルーティングを定義する。

```text
1. express.json()
2. APIルート
3. /demo-files 静的配信
4. React静的ファイル配信
5. SPA fallback
```

実装イメージ。

```ts
app.use(express.json());

app.use("/api/health", healthRouter);
app.use("/api", analyzeRouter);

app.use("/demo-files", express.static(path.join(process.cwd(), "../demo-files")));

app.use(express.static(path.join(process.cwd(), "../client/dist")));

app.get("*", (_req, res) => {
  res.sendFile(path.join(process.cwd(), "../client/dist/index.html"));
});
```

パスはDocker内配置に合わせて正しく調整する。

---

## 7.3 GET /api/health

ヘルスチェック用API。

レスポンス。

```json
{
  "ok": true,
  "service": "legalgate-agent",
  "timestamp": "2026-06-25T00:00:00.000Z"
}
```

---

## 7.4 POST /api/analyze

ファイルアップロード解析用API。

### Request

```text
multipart/form-data

file: 契約書ファイル
```

### 処理内容

```text
1. Multerでファイルを受け取る
2. .txt の場合は本文を読み取る
3. .pdf の場合はMVPではエラーまたは簡易対応でよい
4. analysisService.ts に解析を依頼する
5. analysisService.ts が geminiService.ts を呼ぶ
6. geminiService.ts がGemini APIに契約書本文を送信する
7. Gemini APIのJSONレスポンスをAnalysisResult型に整形する
8. フロントエンドへ返す
```

---

## 7.5 POST /api/analyze-sample

サンプル解析用API。

### Request

```json
{
  "level": "high"
}
```

`level` は以下のいずれか。

```text
low
medium
high
```

### Response

指定されたリスクレベルのデモ契約書本文をGemini APIに渡し、その解析結果を `AnalysisResult` として返す。

---

## 7.6 POST /api/drive-demo

Drive検知デモ用API。

実際のGoogle Drive API連携はMVPでは不要。
Google Driveに新しい契約書が追加された想定で、高リスク契約書本文をGemini APIに渡し、その解析結果を返す。

---

# 8. 解析サービス要件

## 8.1 analysisService.ts

`server/src/services/analysisService.ts` を作成する。

このファイルは、解析処理の入口とする。

```ts
import { analyzeWithGemini } from "./geminiService";

export async function analyzeContract(fileText: string, fileName: string) {
  return analyzeWithGemini(fileText, fileName);
}
```

---

## 8.2 geminiService.ts

`server/src/services/geminiService.ts` を作成する。

役割。

```text
GEMINI_API_KEY を読み込む
Gemini APIクライアントを初期化する
契約書本文をGemini APIに送信する
JSON形式の解析結果を受け取る
AnalysisResult型に変換する
不正なJSONの場合はエラーを返す
```

### 必須要件

`GEMINI_API_KEY` が未設定の場合は、サーバー起動時またはAPI実行時に明確なエラーを返す。

APIレスポンス例。

```json
{
  "error": "GEMINI_API_KEY is not configured"
}
```

フロントエンドでは、APIキー未設定時に以下のようなエラーを表示する。

```text
Gemini APIキーが設定されていないため解析できません。Cloud Runの環境変数 GEMINI_API_KEY を設定してください。
```

---

## 8.3 mockAnalysisService.ts

`server/src/services/mockAnalysisService.ts` は任意とする。

ただし、MVPの主処理では使用しない。
Gemini APIの利用制限や通信障害に備え、開発用の予備として作成してもよい。

本番デモの基本動作はGemini API解析とする。

---

# 9. Gemini API要件

## 9.1 使用モデル

`geminiService.ts` では、環境変数で使用モデルを切り替えられるようにする。

```env
GEMINI_API_KEY=your_api_key
GEMINI_MODEL=gemini-1.5-flash
```

`GEMINI_MODEL` が未設定の場合は、デフォルトモデルを使用する。

```text
gemini-1.5-flash
```

---

## 9.2 Gemini APIプロンプト

Gemini APIには、契約書本文と社内ルールを渡す。

プロンプト方針。

```text
あなたは契約書・稟議リスク監視エージェントです。

入力された契約書本文を読み、社内ルールと照合して、契約リスクを判定してください。

必ず以下を実行してください。

1. 文書種別を判定する
2. 契約当事者、契約期間、契約金額、支払条件を抽出する
3. 支払条件、解約条項、責任範囲、納期、違約金、自動更新条項を抽出する
4. 社内ルールと照合する
5. 各項目のリスクを low / medium / high で判定する
6. 判定理由を説明する
7. リスクのある条項について修正案を生成する
8. 最終的な承認フローを提案する

社内ルール：
- 支払サイトは60日以内であること
- 損害賠償責任には上限金額を設定すること
- 契約解除には30日前通知を含めること
- 違約金条項がある場合は法務確認を必須とする
- 自動更新条項がある場合は上長確認を必須とする
- 検収条件が曖昧な場合は担当者確認を必須とする

出力は必ずJSONのみとしてください。
Markdown、説明文、コードブロックは不要です。
```

---

## 9.3 Gemini API出力形式

Gemini APIには、必ず以下のJSON形式で返すように指示する。

```json
{
  "documentType": "業務委託契約書",
  "overallRisk": "high",
  "summary": "支払条件、損害賠償責任、自動更新、違約金条項に高いリスクがあります。",
  "riskItems": [
    {
      "id": "risk_payment",
      "itemName": "支払条件",
      "extractedText": "検収完了日の翌月末から90日以内に支払う。",
      "riskLevel": "high",
      "reason": "社内基準の60日以内を超過しているため。",
      "relatedRule": "支払サイトは60日以内であること。",
      "recommendedAction": "支払条件の修正が必要です。",
      "suggestion": "検収完了日の翌月末から60日以内に支払う。"
    }
  ],
  "revisionSuggestions": [
    {
      "id": "rev_payment",
      "itemName": "支払条件",
      "currentText": "検収完了日の翌月末から90日以内に支払う。",
      "suggestedText": "検収完了日の翌月末から60日以内に支払う。",
      "reason": "社内規程では支払サイトを60日以内としているため。"
    }
  ],
  "approvalFlow": {
    "action": "legal_review",
    "label": "法務確認が必要",
    "reason": "高リスク条項が複数検出されたため、締結前に法務担当者の確認が必要です。",
    "assignee": "法務担当者",
    "nextStep": "契約締結前に条項修正案を確認し、取引先へ修正依頼を行ってください。"
  },
  "referencedRules": [
    "支払サイトは60日以内であること。",
    "損害賠償責任には上限金額を設定すること。"
  ]
}
```

バックエンド側では、このレスポンスに以下を付与する。

```text
id
documentId
createdAt
```

---

## 9.4 JSONパース要件

Gemini APIの応答は、必ずJSONとしてパースする。

以下の処理を行う。

```text
1. Gemini APIからテキストを受け取る
2. Markdownコードブロックが含まれている場合は除去する
3. JSON.parseする
4. 必須フィールドがあるか検証する
5. AnalysisResult型に整形する
```

JSONパースに失敗した場合は、APIエラーとして返す。

レスポンス例。

```json
{
  "error": "Gemini response could not be parsed as JSON"
}
```

---

## 9.5 エラー処理

以下のエラーを想定する。

```text
GEMINI_API_KEY が未設定
Gemini API通信失敗
Gemini APIレスポンスがJSONではない
アップロードファイルが空
未対応ファイル形式
```

エラー時は、フロントエンドにわかりやすいメッセージを返す。

---

# 10. デモ契約書ファイル

ルート直下に `demo-files` ディレクトリを作成し、以下の3ファイルを配置する。

```text
demo-files/
  low-risk-contract.txt
  medium-risk-contract.txt
  high-risk-contract.txt
```

---

## 10.1 high-risk-contract.txt

```text
業務委託契約書

甲は乙に対し、システム開発業務を委託する。

契約期間は2026年7月1日から2027年6月30日までとする。

委託料は検収完了日の翌月末から90日以内に支払う。

乙が本契約に違反した場合、乙は甲に対して発生した全ての損害を賠償するものとし、賠償額に上限は設けない。

本契約は期間満了の1か月前までに書面による申し出がない場合、同一条件で自動更新される。

納期に遅延が生じた場合、乙は違約金を支払うものとする。

契約解除に関する詳細条件は別途協議する。
```

期待結果。

```text
総合リスク：高
推奨アクション：法務確認が必要
```

---

## 10.2 medium-risk-contract.txt

```text
業務委託契約書

甲は乙に対し、Webサイト制作業務を委託する。

契約期間は2026年7月1日から2026年12月31日までとする。

委託料は検収完了日の翌月末から60日以内に支払う。

損害賠償責任は契約金額を上限とする。

本契約は15日前までに書面で通知することで解除できる。

契約期間満了後、申し出がない場合は自動更新される。

納品物の検収条件は別途協議する。
```

期待結果。

```text
総合リスク：中
推奨アクション：上長承認が必要
```

---

## 10.3 low-risk-contract.txt

```text
業務委託契約書

甲は乙に対し、保守運用業務を委託する。

契約期間は2026年7月1日から2027年6月30日までとする。

委託料は検収完了日の翌月末から60日以内に支払う。

損害賠償責任は契約金額を上限とする。

本契約は30日前までに書面で通知することで解除できる。

自動更新は行わない。

違約金条項は設けない。

秘密保持義務は契約終了後3年間継続する。
```

期待結果。

```text
総合リスク：低
推奨アクション：自動承認可能
```

---

# 11. TypeScript型定義

フロントエンドとバックエンドで同等の型を定義する。

```ts
export type RiskLevel = "low" | "medium" | "high";

export type AnalysisStatus =
  | "idle"
  | "uploading"
  | "analyzing"
  | "completed"
  | "error";

export type ApprovalAction =
  | "auto_approve"
  | "staff_review"
  | "manager_approval"
  | "legal_review";

export type AgentStepStatus = "waiting" | "running" | "completed";

export interface UploadedDocument {
  id: string;
  fileName: string;
  fileSize?: number;
  documentType: string;
  uploadedAt: string;
  status: AnalysisStatus;
}

export interface RiskItem {
  id: string;
  itemName: string;
  extractedText: string;
  riskLevel: RiskLevel;
  reason: string;
  relatedRule: string;
  recommendedAction: string;
  suggestion?: string;
}

export interface RevisionSuggestion {
  id: string;
  itemName: string;
  currentText: string;
  suggestedText: string;
  reason: string;
}

export interface ApprovalFlow {
  action: ApprovalAction;
  label: string;
  reason: string;
  assignee: string;
  nextStep: string;
}

export interface AnalysisResult {
  id: string;
  documentId: string;
  documentType: string;
  overallRisk: RiskLevel;
  summary: string;
  riskItems: RiskItem[];
  revisionSuggestions: RevisionSuggestion[];
  approvalFlow: ApprovalFlow;
  referencedRules: string[];
  createdAt: string;
}
```

---

# 12. Docker要件

## 12.1 Dockerfile

ルートに `Dockerfile` を配置する。

```dockerfile
FROM node:22-slim AS client-build
WORKDIR /app/client
COPY client/package*.json ./
RUN npm ci
COPY client ./
RUN npm run build

FROM node:22-slim AS server-build
WORKDIR /app/server
COPY server/package*.json ./
RUN npm ci
COPY server ./
RUN npm run build

FROM node:22-slim
WORKDIR /app
ENV NODE_ENV=production

COPY server/package*.json ./server/
RUN cd server && npm ci --omit=dev

COPY --from=server-build /app/server/dist ./server/dist
COPY --from=client-build /app/client/dist ./client/dist
COPY demo-files ./demo-files

WORKDIR /app/server
CMD ["node", "dist/index.js"]
```

---

## 12.2 .dockerignore

ルートに `.dockerignore` を作成する。

```dockerignore
node_modules
client/node_modules
server/node_modules
client/dist
server/dist
.git
.gitignore
*.log
.env
.env.local
.DS_Store
```

---

# 13. ローカル実行要件

## 13.1 Dockerビルド

```bash
docker build -t legalgate-agent .
```

## 13.2 Docker起動

Gemini APIキーを指定して起動する。

```bash
docker run -p 8080:8080 \
  -e PORT=8080 \
  -e GEMINI_API_KEY=YOUR_API_KEY \
  legalgate-agent
```

## 13.3 ブラウザ確認

```text
http://localhost:8080
```

## 13.4 ヘルスチェック確認

```text
http://localhost:8080/api/health
```

## 13.5 デモファイル確認

```text
http://localhost:8080/demo-files/high-risk-contract.txt
http://localhost:8080/demo-files/medium-risk-contract.txt
http://localhost:8080/demo-files/low-risk-contract.txt
```

---

# 14. Cloud Runデプロイ要件

## 14.1 Google Cloudプロジェクト設定

```bash
gcloud config set project YOUR_PROJECT_ID
```

---

## 14.2 必要APIの有効化

```bash
gcloud services enable run.googleapis.com
gcloud services enable cloudbuild.googleapis.com
```

---

## 14.3 Cloud Runへデプロイ

Gemini APIキーを環境変数として設定してデプロイする。

```bash
gcloud run deploy legalgate-agent \
  --source . \
  --region asia-northeast1 \
  --allow-unauthenticated \
  --set-env-vars GEMINI_API_KEY=YOUR_API_KEY
```

---

## 14.4 モデル名も指定する場合

```bash
gcloud run deploy legalgate-agent \
  --source . \
  --region asia-northeast1 \
  --allow-unauthenticated \
  --set-env-vars GEMINI_API_KEY=YOUR_API_KEY,GEMINI_MODEL=gemini-1.5-flash
```

---

# 15. セキュリティ要件

## 15.1 APIキー管理

Gemini APIキーはReact側に配置しない。
Cloud Runの環境変数で管理する。

本番運用ではSecret Managerを使うことが望ましい。

---

## 15.2 ファイル保存

MVPでは、アップロードされたファイルを永続保存しない。

サーバー側で一時的に読み取り、Gemini APIに送信し、解析結果を返すのみとする。

---

## 15.3 注意書き

画面上に以下の注意書きを表示する。

```text
本判定はAIによる一次チェックです。最終判断は法務担当者または承認者が行ってください。
```

---

## 15.4 本番運用時に必要な追加対策

本番運用時には以下を追加する。

```text
Firebase Authentication または Identity Platform
Cloud Storageへの文書保存
Firestoreへの解析結果保存
ユーザーごとのアクセス制御
監査ログ
Secret ManagerによるAPIキー管理
アップロードファイルのウイルスチェック
法務担当者による最終承認フロー
API利用量の制限
予算アラート
```

---

# 16. 非機能要件

## 16.1 可用性

Gemini APIの通信エラー時は、画面に明確なエラーを表示する。

例。

```text
Gemini APIで解析できませんでした。APIキー、利用上限、通信状態を確認してください。
```

---

## 16.2 パフォーマンス

```text
画面初期表示は数秒以内を目標とする
Gemini API解析は数十秒以内を目標とする
解析中は作業ログを表示する
待ち時間をAIエージェントの作業体験として見せる
```

---

## 16.3 保守性

```text
フロントエンドとバックエンドの責務を分ける
型定義を明確にする
API呼び出しは apiClient.ts に集約する
Gemini連携は geminiService.ts に分離する
解析処理の入口は analysisService.ts に集約する
JSONパース処理は json.ts に分離する
```

---

## 16.4 拡張性

将来的に以下を追加できる構成にする。

```text
Cloud Storage保存
Firestore保存
Google Drive API連携
ADKによるエージェント化
SlackまたはGmail通知
認証と権限管理
PDF本文抽出
Wordファイル対応
部署別社内ルール
過去契約との類似検索
```

---

# 17. 受け入れ条件

以下をすべて満たせばMVP完了とする。

```text
1. docker build -t legalgate-agent . が成功する
2. docker run に GEMINI_API_KEY を渡して起動できる
3. http://localhost:8080 でReact画面が表示される
4. http://localhost:8080/api/health がJSONを返す
5. デモ契約書をダウンロードできる
6. high-risk-contract.txt をアップロードできる
7. アップロード後、Gemini APIに契約書本文が送信される
8. Gemini APIの解析結果が画面に表示される
9. 高リスク契約書では総合リスク「高」が表示される
10. 中リスク契約書では総合リスク「中」が表示される
11. 低リスク契約書では総合リスク「低」が表示される
12. 項目別リスクが表示される
13. 判定理由が表示される
14. 修正案が表示される
15. 承認フローが表示される
16. 高リスクの場合は「法務確認が必要」と表示される
17. Gemini APIキー未設定時は明確なエラーを表示する
18. ReactとExpressが同じCloud Runサービスで動作する
19. /demo-files がExpressから静的配信される
20. /api がExpress APIとして動作する
21. SPA fallbackにより、画面リロード時もReactアプリが表示される
22. Cloud Runにデプロイできる
23. Cloud RunのURLからWebアプリを開ける
```

---

# 18. README要件

`README.md` には以下を記載する。

````md
# LegalGate Agent

契約書・稟議リスク監視エージェントのハッカソンMVPです。

## 概要

Cloud Run上で動作するReact + Express構成のWebアプリです。

デモ契約書をダウンロードし、そのファイルをアップロードすることで、Gemini APIが契約書を解析し、リスク判定、修正案、承認フローを表示します。

## ローカル実行

```bash
docker build -t legalgate-agent .

docker run -p 8080:8080 \
  -e PORT=8080 \
  -e GEMINI_API_KEY=YOUR_API_KEY \
  legalgate-agent
````

ブラウザで開く。

```text
http://localhost:8080
```

## Cloud Runデプロイ

```bash
gcloud run deploy legalgate-agent \
  --source . \
  --region asia-northeast1 \
  --allow-unauthenticated \
  --set-env-vars GEMINI_API_KEY=YOUR_API_KEY
```

## 注意

本アプリはハッカソン用MVPです。
AIによる判定は一次チェックであり、法的助言ではありません。

````

---

# 19. Codexへの実装指示

Codexはこの要件に従い、Cloud Runで動作する1コンテナ構成のWebアプリを実装すること。

最優先のデモ導線は以下である。

```text
Cloud RunのURLを開く
↓
高リスク契約書をダウンロードする
↓
ダウンロードした high-risk-contract.txt をアップロードする
↓
AIエージェント作業ログが進む
↓
Gemini APIが契約書を解析する
↓
リスク判定・修正案・承認フローが表示される
````

必ず以下を実装すること。

```text
デモファイルのダウンロード
ダウンロードしたファイルのアップロード
Gemini APIによる契約書本文解析
JSONレスポンスのパース
リスク判定結果の画面表示
修正案の画面表示
承認フローの画面表示
Cloud Run上での動作
Dockerによるローカル確認
Gemini APIキー未設定時の明確なエラー表示
```

初期実装からGemini APIを使うこと。
モック解析は主処理にしないこと。
