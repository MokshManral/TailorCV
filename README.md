# TailorCV

**Tailor your resume for every job.**

TailorCV is an AI-powered resume tailoring application that analyzes your resume against a specific job description and helps you create a more relevant, ATS-friendly version.

Sign in with Google, paste (or upload) your resume, add the job description, and get an AI-powered analysis with a **match score, keywords, improvement suggestions, and a tailored resume** — without inventing experience or qualifications.

## ✨ Features

* 🔐 Google OAuth sign-in with HttpOnly JWT cookie sessions
* 🛡️ Protected tailoring route — analysis requires an authenticated user
* 📝 Paste your resume as text, or upload a PDF/DOCX file
* 🧾 Bring your own LaTeX resume: the AI tailors the wording while your template stays byte-for-byte the same
* 🤖 AI-powered resume and job description analysis (Google Gemini, with optional Groq fallback)
* 📊 Resume-to-job match score
* 🔑 Matched keywords
* ⚠️ Missing keywords
* 💡 Actionable improvement suggestions
* 📄 ATS-friendly tailored resume
* 📋 One-click copy for the tailored resume
* 📥 One-page PDF download and editable LaTeX (.tex) export
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
* Google Gemini API (`google-genai`); Groq (`groq`) as an optional fallback
* `pdflatex` (TeX Live / MacTeX) for PDF export
* `pypdf` and `python-docx` for resume file uploads

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
│   │   │   ├── LatexResult.jsx
│   │   │   ├── resumeFormatting.js
│   │   │   ├── MatchScoreTape.jsx
│   │   │   ├── KeywordBadges.jsx
│   │   │   ├── Suggestions.jsx
│   │   │   ├── EmptyState.jsx
│   │   │   └── ErrorState.jsx
│   │   │
│   │   ├── pages/
│   │   │   ├── Hero.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── TailorPage.jsx
│   │   │   ├── TermsPage.jsx
│   │   │   └── PrivacyPolicyPage.jsx
│   │   │
│   │   ├── lib/
│   │   │   └── api.js         # Backend base URL (VITE_API_URL)
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
│   │   ├── ai_service.py     # Gemini (Groq fallback) prompt + response parsing
│   │   ├── latex_service.py  # LaTeX resume template, safety checks, PDF compile
│   │   └── latex_tailor_service.py  # Tailor a user's own LaTeX resume
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
* A TeX distribution providing `pdflatex` (for PDF export), e.g. MacTeX/BasicTeX on macOS or `texlive-latex-base texlive-latex-recommended texlive-latex-extra texlive-fonts-recommended lmodern` on Debian/Ubuntu
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

# Optional fallback, used if Gemini is not configured or its request fails
GROQ_API_KEY=
GROQ_MODEL=openai/gpt-oss-20b

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
| `GEMINI_MODEL`         | No       | `gemini-3.6-flash`   | Gemini model used for resume analysis                              |
| `GROQ_API_KEY`         | No       | —                    | Optional fallback provider, used if Gemini is unset or fails       |
| `GROQ_MODEL`           | No       | `openai/gpt-oss-20b` | Groq model used for the fallback                                   |
| `PDFLATEX_PATH`        | No       | found on `PATH`      | Path to `pdflatex`, if it is not on `PATH`                         |
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
| `API_URL`      | No       | —                       | Alias for `VITE_API_URL` (exposed via `envPrefix` in `vite.config.js`) |

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

`multipart/form-data` with:

| Field             | Required | Description                                            |
| ----------------- | -------- | ------------------------------------------------------ |
| `job_description` | Yes      | The target job description text                        |
| `resume_text`     | One of   | The resume pasted as plain text (takes precedence)     |
| `resume_file`     | One of   | The resume as a PDF or DOCX file (max 10 MB)           |

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
| `400`  | Invalid request (e.g. no resume, empty job description, unsupported file) |
| `401`  | Missing, invalid, or expired authentication cookie          |
| `502`  | The AI call failed or returned an unexpected format         |

### `POST /api/resume/pdf` and `POST /api/resume/tex`

Render the tailored resume as a compiled PDF or as editable LaTeX source.
**Requires authentication.** The body holds the preview blocks produced by
`frontend/src/components/resumeFormatting.js`:

```json
{
  "blocks": [
    { "type": "name", "text": "Jane Doe" },
    { "type": "entry", "text": "Acme Corp", "right": "Jan 2023 – Present" },
    { "type": "bullet", "text": "Built REST APIs" },
    { "type": "text", "label": "Languages", "text": "Python, SQL" }
  ]
}
```

Block `type` is one of `name`, `contact`, `section`, `entry`, `subentry`,
`bullet`, `text`, `spacer`; `right` and `label` are optional. PDFs are compiled
server-side with `pdflatex` and automatically tightened to fit one page; a
`502` is returned if compilation fails.

### `POST /api/tailor/latex`

Tailors a user's own LaTeX resume. **Requires authentication.**
`multipart/form-data` with `job_description` plus either `latex_source`
(pasted text) or `latex_file` (a `.tex` upload, max 1 MB).

The preamble (everything up to `\begin{document}`) is kept unchanged; only the
body is sent to the AI. The original is compiled first, so a missing package is
reported as a `400`. The edited body is checked for unsafe commands and lost
content, then compiled; if compiling fails, the AI gets one chance to fix it.

Returns the `/api/tailor` fields plus `tailored_latex` (the full document),
`pdf_base64` (the compiled PDF), `page_count` and `original_page_count`.
Templates may not use file, shell or catcode commands such as `\input`
(except `\input{glyphtounicode}`), `\include`, `\write18`, `\catcode`,
`\csname` or `\includegraphics`.

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
  PostgreSQL database. PDF export needs `pdflatex` on the server, so use an
  image or build step that installs TeX Live (see Prerequisites).

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
* `/api/tailor` and the `/api/resume/*` export endpoints are protected — unauthenticated requests are rejected with `401`.
* PDF export only typesets escaped resume text; `pdflatex` runs with shell escape disabled, file access limited to its temp directory, and a timeout.
* User-supplied LaTeX is rejected if it uses file, shell or catcode commands, as a second layer of defense.
* Inactive accounts (`is_active = false`) cannot log in or make requests.
* AI provider credentials are kept on the backend and never exposed to the frontend.
* CORS is restricted to the configured frontend origin(s), with credentials allowed.
* `.env` files should not be committed to GitHub.
* The AI is instructed not to fabricate employers, degrees, skills, experience, or achievements.
* Resume content is sent to the backend only when the user submits a tailoring request, and is not persisted.

## 📌 Current Status

TailorCV is currently an **MVP**.

The current version covers the core workflow:

```text
Google Sign-In → Resume → Job Description → AI Analysis → Match Score → Keywords → Suggestions → Tailored Resume → Copy / Download PDF
```

Only user accounts are persisted. Resumes, job descriptions, and analysis
results are not stored.

## 🗺️ Roadmap

* [x] Google authentication
* [x] User accounts
* [ ] Saved resume versions
* [ ] Resume history
* [x] PDF and DOCX resume uploads
* [x] PDF and LaTeX (.tex) export
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