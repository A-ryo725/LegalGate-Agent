# LegalGate Agent

契約書・稟議リスク監視エージェントのハッカソン MVP です。

## 概要

Cloud Run 上で動作する React + Express 構成の Web アプリです。

デモ契約書をダウンロードし、そのファイルをアップロードすることで、Gemini API が契約書を解析し、リスク判定、修正案、承認フローを表示します。

```
Browser
  ↓
Cloud Run Service
  ├─ Express Server（React 静的配信 / /demo-files 配信 / /api）
  └─ Gemini Analysis Service（契約書本文を Gemini API で解析）
```

## ディレクトリ構成

```
legalgate-agent/
  Dockerfile
  demo-files/            デモ契約書（低・中・高リスク）
  client/                React + TypeScript + Vite
  server/                Node.js + Express + TypeScript
```

## ローカル開発（Docker を使わない場合）

2 つのターミナルを開きます。

```bash
# 1) バックエンド
cd server
npm install
# Gemini API キーを設定
export GEMINI_API_KEY=YOUR_API_KEY   # Windows PowerShell: $env:GEMINI_API_KEY="YOUR_API_KEY"
npm run dev                          # http://localhost:8080

# 2) フロントエンド
cd client
npm install
npm run dev                          # http://localhost:5173（/api と /demo-files は 8080 にプロキシ）
```

## ローカル実行（Docker）

```bash
docker build -t legalgate-agent .

docker run -p 8080:8080 \
  -e PORT=8080 \
  -e GEMINI_API_KEY=YOUR_API_KEY \
  legalgate-agent
```

ブラウザで開く。

```
http://localhost:8080
```

ヘルスチェック。

```
http://localhost:8080/api/health
```

デモファイル。

```
http://localhost:8080/demo-files/high-risk-contract.txt
http://localhost:8080/demo-files/medium-risk-contract.txt
http://localhost:8080/demo-files/low-risk-contract.txt
```

## Cloud Run デプロイ

```bash
gcloud config set project YOUR_PROJECT_ID
gcloud services enable run.googleapis.com
gcloud services enable cloudbuild.googleapis.com

gcloud run deploy legalgate-agent \
  --source . \
  --region asia-northeast1 \
  --allow-unauthenticated \
  --set-env-vars GEMINI_API_KEY=YOUR_API_KEY
```

モデル名も指定する場合。

```bash
gcloud run deploy legalgate-agent \
  --source . \
  --region asia-northeast1 \
  --allow-unauthenticated \
  --set-env-vars GEMINI_API_KEY=YOUR_API_KEY,GEMINI_MODEL=gemini-1.5-flash
```

## 環境変数

| 変数 | 必須 | 説明 |
| --- | --- | --- |
| `GEMINI_API_KEY` | 必須 | Gemini API キー。未設定時は解析 API が明確なエラーを返す。 |
| `GEMINI_MODEL` | 任意 | 使用モデル。未設定時は `gemini-1.5-flash`。 |
| `PORT` | 任意 | 待ち受けポート。未設定時は `8080`（Cloud Run が自動設定）。 |

## 注意

本アプリはハッカソン用 MVP です。
AI による判定は一次チェックであり、法的助言ではありません。
最終判断は法務担当者または承認者が行ってください。
