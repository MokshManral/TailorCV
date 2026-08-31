# TailorCV

**Tailor your resume for every job.**

TailorCV is an AI-powered resume tailoring application that analyzes your resume against a specific job description and helps you create a more relevant, ATS-friendly version.

Sign in with Google, paste your resume, add the job description, and get an AI-powered analysis with a **match score, keywords, improvement suggestions, and a tailored resume** — without inventing experience or qualifications.

## ✨ Features

* 🔐 Google OAuth sign-in with HttpOnly JWT cookie sessions
* 🛡️ Protected tailoring route — analysis requires an authenticated user
* 🤖 AI-powered resume and job description analysis (Google Gemini)
* 📊 Resume-to-job match score
* 🔑 Matched keywords
* ⚠️ Missing keywords
* 💡 Actionable improvement suggestions
* 📄 ATS-friendly tailored resume
* 📋 One-click copy for the tailored resume
* ⚡ Clear loading and error states
* 📱 Responsive interface
* 🌙 Light and dark themes (persisted in `localStorage`)
* 🧭 Client-side routing with React Router

## 🛠️ Tech Stack

### Frontend

* React 18
* Vite 5
* Tailwind CSS 3
* React Router 7
* JavaScript / JSX

### Backend

* Python 3.10+
* FastAPI
* Pydantic v2
* SQLAlchemy + PostgreSQL (`psycopg`)
* Authlib (Google OAuth) + Starlette `SessionMiddleware`
* python-jose (JWT)
* Google Gemini API (`google-genai`)

## 📁 Project Structure

```text
resume-tailor/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.jsx
│   │   │   ├── InputPanel.jsx
│   │   │   ├── ResultsPanel.jsx
│   │   │   ├── TailoredResume.jsx
│   │   │   ├── MatchScoreTape.jsx
│   │   │   ├── KeywordBadges.jsx
│   │   │   ├── Suggestions.jsx
│   │   │   ├── EmptyState.jsx
│   │   │   ├── LoadingState.jsx
│   │   │   └── ErrorState.jsx
│   │   │
│   │   ├── pages/
│   │   │   ├── Hero.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── TailorPage.jsx
│   │   │   ├── TermsPage.jsx
│   │   │   └── PrivacyPolicyPage.jsx
│   │   │
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   │
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── vercel.json
│
├── backend/
│   ├── main.py            # FastAPI app, CORS, /api/tailor, /api/health
│   ├── auth.py            # Google OAuth, JWT cookie, /auth/* routes
│   ├── models.py          # Pydantic schemas + SQLAlchemy UserDB
│   ├── database.py        # Engine, session, Base, get_db
│   ├── services/
│   │   └── ai_service.py  # Gemini prompt + response parsing
│   └── requirements.txt
│
└── README.md
```

## 🚀 Getting Started

### Prerequisites

Make sure you have the following installed:

* Node.js 18+
* npm
* Python 3.10+
* PostgreSQL (local instance or a hosted database)
* A Gemini API key
* Google OAuth credentials (client ID and secret)

### 1. Clone the repository

```bash
git clone <your-repository-url>
cd resume-tailor
```

### 2. Create Google OAuth credentials

In the [Google Cloud Console](https://console.cloud.google.com/apis/credentials):

1. Create an **OAuth 2.0 Client ID** of type *Web application*.
2. Add an **Authorized redirect URI**:
   `http://localhost:8000/auth/google/callback`
3. Copy the **Client ID** and **Client Secret** into your backend `.env`.

### 3. Set up the backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate      # Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

Create a `.env` file inside the `backend` directory (see `backend/.env.example`):

```env
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-3.6-flash

FRONTEND_URL=http://localhost:5173

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:8000/auth/google/callback

JWT_SECRET=a_long_random_secret
JWT_ALGORITHM=HS256
JWT_EXPIRE_MINUTES=60

SESSION_SECRET=another_long_random_secret

ENVIRONMENT=development

DATABASE_URL=postgresql+psycopg://username:password@localhost:5432/tailorcv
```

Generate the secrets with:

```bash
python -c "import secrets; print(secrets.token_urlsafe(48))"
```

Create the database (tables are created automatically on startup):

```bash
createdb tailorcv
```

Start the backend:

```bash
uvicorn main:app --reload
```

The API will be available at:

```text
http://localhost:8000
```

FastAPI documentation:

```text
http://localhost:8000/docs
```

### 4. Set up the frontend

Open another terminal:

```bash
cd frontend
npm install
```

Create a `.env` file inside the `frontend` directory:

```env
VITE_API_URL=http://localhost:8000
```

Start the frontend:

```bash
npm run dev
```

The application will be available at:

```text
http://localhost:5173
```

## 🔐 Environment Variables

### Backend

| Variable               | Required | Default              | Description                                                        |
| ---------------------- | -------- | -------------------- | ------------------------------------------------------------------ |
| `GEMINI_API_KEY`       | Yes      | —                    | Gemini API key used by the backend                                 |
| `GEMINI_MODEL`         | Yes      | —                    | Gemini model used for resume analysis                              |
| `DATABASE_URL`         | Yes      | —                    | SQLAlchemy PostgreSQL URL; the app fails to start without it       |
| `GOOGLE_CLIENT_ID`     | Yes      | —                    | Google OAuth client ID                                             |
| `GOOGLE_CLIENT_SECRET` | Yes      | —                    | Google OAuth client secret                                         |
| `GOOGLE_REDIRECT_URI`  | Yes      | —                    | OAuth callback URL, must match the Google Console entry            |
| `JWT_SECRET`           | Yes      | —                    | Secret used to sign session JWTs                                   |
| `SESSION_SECRET`       | Yes      | —                    | Secret for the OAuth session middleware                            |
| `FRONTEND_URL`         | No       | `http://localhost:5173` | Allowed CORS origin(s) and post-login redirect target; comma-separated for multiple origins |
| `JWT_ALGORITHM`        | No       | `HS256`              | JWT signing algorithm                                              |
| `JWT_EXPIRE_MINUTES`   | No       | `60`                 | Token and cookie lifetime in minutes                               |
| `ENVIRONMENT`          | No       | `development`        | Set to `production` to issue `Secure`, `SameSite=None` cookies     |

> Note: `FRONTEND_URL` is split on commas for CORS, but the post-login redirect
> uses the raw value. If you list more than one origin, the redirect target will
> be the whole comma-separated string, so keep it to a single URL unless you also
> change the redirect in `backend/auth.py`.

### Frontend

| Variable       | Required | Default                 | Description                     |
| -------------- | -------- | ----------------------- | ------------------------------- |
| `VITE_API_URL` | No       | `http://localhost:8000` | Base URL of the FastAPI backend |

> **Never commit `.env` files or API keys to GitHub.**

## 🔌 API

### `GET /auth/google`

Starts the Google OAuth login flow and redirects to Google's consent screen.

### `GET /auth/google/callback`

Handles the OAuth callback. Creates the user if they don't exist, issues a JWT
in an HttpOnly `access_token` cookie, and redirects to `<FRONTEND_URL>/tailor`.

### `GET /auth/me`

Returns the currently authenticated user. Requires the auth cookie.

```json
{
  "id": 1,
  "email": "user@example.com",
  "name": "Jane Doe",
  "profile_picture": "https://lh3.googleusercontent.com/..."
}
```

### `POST /auth/logout`

Clears the authentication cookie.

```json
{
  "message": "Logged out successfully"
}
```

### `POST /api/tailor`

Analyzes a resume against a job description. **Requires authentication** —
requests without a valid `access_token` cookie return `401`.

#### Request

```json
{
  "resume": "Your resume...",
  "job_description": "Job description..."
}
```

#### Response

```json
{
  "match_score": 82,
  "summary": "Strong match with several relevant skills.",
  "matched_keywords": ["React", "Python", "REST APIs"],
  "missing_keywords": ["Docker", "AWS"],
  "suggestions": [
    "Emphasize your experience building REST APIs.",
    "Highlight relevant backend projects."
  ],
  "tailored_resume": "..."
}
```

#### Errors

| Status | Meaning                                                    |
| ------ | ---------------------------------------------------------- |
| `400`  | Invalid request body (e.g. empty resume or job description) |
| `401`  | Missing, invalid, or expired authentication cookie          |
| `502`  | Gemini call failed or returned an unexpected format         |

### `GET /api/health` (also `HEAD`)

Returns the current health status of the backend. `HEAD` is supported so
uptime monitors and platform health checks can ping it.

```json
{
  "status": "ok"
}
```

## 🚢 Deployment

The app is designed to run as two separately deployed services:

* **Frontend** — a static Vite build (e.g. Vercel). `frontend/vercel.json`
  rewrites all routes to `index.html` so client-side routing works on refresh.
  Set `VITE_API_URL` to the deployed backend URL.
* **Backend** — an ASGI service (e.g. Render) started with
  `uvicorn main:app --host 0.0.0.0 --port $PORT`, backed by a managed
  PostgreSQL database.

For production, remember to:

1. Set `ENVIRONMENT=production` so the auth cookie is issued as
   `Secure; SameSite=None` — browsers drop it otherwise, since the frontend and
   backend live on different domains.
2. Set `FRONTEND_URL` to the deployed frontend origin.
3. Set `GOOGLE_REDIRECT_URI` to the deployed callback URL and add it to the
   Authorized redirect URIs in the Google Cloud Console.

## 🔒 Security

* Google is the only sign-in method; TailorCV never handles passwords.
* Session JWTs are stored in HttpOnly cookies, so they are not readable from JavaScript.
* Cookies are `Secure` and `SameSite=None` in production, `SameSite=Lax` locally.
* `/api/tailor` is protected — unauthenticated requests are rejected with `401`.
* Inactive accounts (`is_active = false`) cannot log in or make requests.
* Gemini API credentials are kept on the backend and never exposed to the frontend.
* CORS is restricted to the configured frontend origin(s), with credentials allowed.
* `.env` files should not be committed to GitHub.
* The AI is instructed not to fabricate employers, degrees, skills, experience, or achievements.
* Resume content is sent to the backend only when the user submits a tailoring request, and is not persisted.

## 📌 Current Status

TailorCV is currently an **MVP**.

The current version covers the core workflow:

```text
Google Sign-In → Resume → Job Description → AI Analysis → Tailored Resume
```

Only user accounts are persisted. Resumes, job descriptions, and analysis
results are not stored.

## 🗺️ Roadmap

* [x] Google authentication
* [x] User accounts
* [ ] Saved resume versions
* [ ] Resume history
* [ ] PDF and DOCX resume uploads
* [ ] PDF and DOCX export
* [ ] Usage limits and rate limiting
* [ ] Refresh tokens / longer sessions
* [ ] Database migrations (Alembic)
* [ ] Multiple AI model options
* [ ] Improved resume formatting
* [ ] Production analytics and monitoring

## 🤝 Contributing

Contributions, suggestions, and improvements are welcome.

If you find a bug or have an idea for improving TailorCV, feel free to open an issue or submit a pull request.

## 📄 License

This project is currently **not licensed for redistribution**.

All rights reserved.