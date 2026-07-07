# Hackathon Backend

Node.js + Express backend for file upload risk analysis using Gemini API, Firebase Authentication with Identity Platform, and Cloud Firestore.

## Local Setup

Backend:

```powershell
cd Backend/backend
npm install
Copy-Item .env.example .env
```

Edit `Backend/backend/.env` and set `GEMINI_API_KEY`.

```env
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-2.5-flash
PORT=8080
```

Frontend:

```powershell
cd Frontend/client
npm install
Copy-Item .env.example .env
```

Edit `Frontend/client/.env` and set the Firebase Web App config. Do not put the Gemini API key in the frontend env file.

```env
VITE_FIREBASE_API_KEY=your_firebase_web_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_APP_ID=your_firebase_app_id
```

Start the backend:

```powershell
cd Backend/backend
npm run dev
```

Start the frontend:

```powershell
cd Frontend/client
npm run dev
```

Health check:

```powershell
curl.exe http://localhost:8080/health
```

## Firebase Auth / Identity Platform

This app assumes Firebase Authentication has been upgraded to Firebase Authentication with Identity Platform.

In Google Cloud Console or Firebase Console:

1. Open the project used by the web app and Cloud Run backend.
2. Go to Identity Platform, or Authentication > Sign-in method.
3. Enable the Anonymous provider.
4. Go to Project settings > General.
5. Create or select a Web app and copy its config values into `Frontend/client/.env`.

The React app signs in anonymously with `signInAnonymously`, gets a Firebase ID token, and sends it to the backend as:

```http
Authorization: Bearer <ID_TOKEN>
```

The frontend does not read or write Firestore directly.

## Authenticated API Behavior

`/api/analyze` and `/api/analyses` require a Firebase Auth ID token. Without it, they return `401`.

The backend verifies the token with Firebase Admin SDK `verifyIdToken`. After verification, the middleware sets:

```js
req.user.uid
```

`POST /api/analyze` saves the analysis with that `uid`.

`GET /api/analyses` returns only documents whose `uid` matches the verified user:

```js
where("uid", "==", req.user.uid)
```

## Firestore Setup

The backend saves analysis metadata to the `analyses` collection by using Firebase Admin SDK. Contract text, PDF content, and uploaded file bodies are not saved.

Saved document shape:

```json
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

The app currently sets `expiresAt` to 30 days after analysis creation.

Because the history query uses `where("uid", "==", uid)` and `orderBy("createdAt", "desc")`, Firestore may ask you to create a composite index. If it does, open the index creation link shown in the server error log and create the index.

## Firestore Automatic Cleanup

Use Firestore TTL to automatically delete old analysis documents.

Recommended setup:

1. Open Google Cloud Console.
2. Go to Firestore Database.
3. Open TTL policies.
4. Create a TTL policy for collection group `analyses`.
5. Set the TTL field to `expiresAt`.
6. Wait until the policy becomes active.

After this is enabled, Firestore will automatically delete documents after their `expiresAt` timestamp. TTL deletion is not immediate; Google Cloud may delete expired documents later.

## Local Firebase Admin Authentication

Do not put Firebase service account JSON files in this repository.

For local backend development, use Application Default Credentials:

```powershell
gcloud auth application-default login
gcloud config set project YOUR_PROJECT_ID
```

Or set `GOOGLE_APPLICATION_CREDENTIALS` to a service account JSON file stored outside this repository:

```powershell
$env:GOOGLE_APPLICATION_CREDENTIALS="C:\path\outside\repo\service-account.json"
```

The local user or service account must be allowed to verify Firebase Auth tokens and read/write Firestore. For Firestore access, grant `Cloud Datastore User` (`roles/datastore.user`).

## Authenticated API Checks

Analyze a file with a token:

```powershell
$TOKEN="paste_firebase_auth_id_token_here"
curl.exe -X POST "http://localhost:8080/api/analyze" `
  -H "Authorization: Bearer $TOKEN" `
  -F "file=@./sample.txt;type=text/plain"
```

Get the latest 20 saved analyses for the authenticated user:

```powershell
$TOKEN="paste_firebase_auth_id_token_here"
curl.exe "http://localhost:8080/api/analyses" `
  -H "Authorization: Bearer $TOKEN"
```

Supported upload extensions are `.txt`, `.csv`, and `.json`.

## Production Start

```powershell
npm start
```

The server listens on `process.env.PORT` and defaults to `8080`.

## Docker

Build:

```powershell
docker build -t hackathon-backend .
```

Run:

```powershell
docker run --rm -p 8080:8080 `
  -e PORT=8080 `
  -e GEMINI_API_KEY=your_gemini_api_key `
  -e GEMINI_MODEL=gemini-2.5-flash `
  hackathon-backend
```

## Cloud Run Deploy

From `Backend/backend`:

```powershell
gcloud run deploy hackathon-backend `
  --source . `
  --region asia-northeast1 `
  --allow-unauthenticated `
  --set-env-vars GEMINI_API_KEY=your_gemini_api_key,GEMINI_MODEL=gemini-2.5-flash
```

Cloud Run provides the `PORT` environment variable automatically. This app also defaults to `8080` for local and container execution.

For Firestore access on Cloud Run, use the Cloud Run service account and grant it Firestore access, for example:

```powershell
gcloud projects add-iam-policy-binding YOUR_PROJECT_ID `
  --member="serviceAccount:YOUR_CLOUD_RUN_SERVICE_ACCOUNT" `
  --role="roles/datastore.user"
```

`firebase-admin` uses `initializeApp()` and Application Default Credentials, so no Firebase secret key JSON is required in Cloud Run.

## Verification

1. Confirm Firebase Authentication is upgraded to Identity Platform.
2. Enable Anonymous sign-in.
3. Set `Frontend/client/.env` with `VITE_FIREBASE_*` values.
4. Start the backend with `npm run dev`.
5. Start the frontend with `npm run dev`.
6. Analyze a `.txt`, `.csv`, or `.json` file from the frontend.
7. Confirm the response shows saved state and includes `analysisId`.
8. Confirm the saved Firestore document includes `uid` and `expiresAt`.
9. Confirm `GET /api/analyses` returns only the current anonymous user's history.
