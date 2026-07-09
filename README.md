# LegalGate Agent-契約書リスク分析AIエージェント

Gemini APIを使って契約書ファイルを解析し、リスク一覧・修正案・承認フローを表示するWebアプリです。  
分析結果はFirebase匿名認証のuidごとにCloud Firestoreへ保存され、過去の分析履歴として確認できます。

---
## 主な機能

- txt / csv / json ファイルのアップロード
- Gemini 2.5 Flash による契約書リスク分析
- リスクレベル判定（高 / 中 / 低）
- リスク一覧・修正案の表示
- 承認フローと確認済みステータス更新
- Firebase匿名ログイン
- uidごとの分析履歴保存
- Cloud Firestoreへの保存
- Cloud Runでの単一Webサーバー構成

---
## 技術構成

### Frontend

- React
- Vite
- Firebase Authentication

### Backend

- Node.js
- Express
- Multer
- Gemini API
- Firebase Admin SDK
- Cloud Firestore

### Deploy

- Google Cloud Run
- Secret Manager

---
## ディレクトリ構成
```
Google-Hackathon/
├── Backend/
│   └── backend/
│       ├── src/
│       ├── public/
│       ├── uploads/
│       ├── Dockerfile
│       └── package.json
└── Frontend/
    └── client/
        ├── src/
        ├── public/
        └── package.json
```
環境変数
```
Backend
Backend/backend/.env
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-2.5-flash
PORT=8080
Frontend
Frontend/client/.env
VITE_FIREBASE_API_KEY=your_firebase_web_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_APP_ID=your_firebase_app_id
```
Gemini APIキーはフロントエンドには置かず、バックエンド側でのみ使用します。

---
ローカル起動
1. Backend
```
cd Backend/backend
npm install
npm run dev
```

3. Frontend
```
cd Frontend/client
npm install
npm run dev
```

ViteのURLをブラウザで開きます。
```
http://localhost:5173
Cloud Run向けビルド
Cloud RunではExpressがAPIとReactの静的ファイルを同じサーバーで配信します。
cd Backend/backend
npm run build:web
npm start
```

ローカル確認: http://localhost:8080

Firestore保存形式
```
{
  "uid": "firebase_auth_uid",
  "fileName": "contract.txt",
  "createdAt": "serverTimestamp",
  "expiresAt": "timestamp_30_days_after_creation",
  "riskLevel": "low | medium | high",
  "summary": "analysis summary",
  "risks": [],
  "status": "未確認"
}
```

---
## 注意事項

- .env はGitHubにpushしないでください
- Firebase秘密鍵JSONはリポジトリに置かないでください
- Gemini APIキーはフロントエンドに含めないでください
- Cloud RunではSecret Manager経由でGemini APIキーを渡します
