# TailorCV

An AI-powered app that tailors a resume to a specific job description. Paste
your resume and a job posting, and get back a match score, matched and
missing keywords, actionable suggestions, and a rewritten, ATS-friendly
version of your resume — without inventing anything that isn't in the
original.

## Features

- Paste a resume and job description, click one button, get a full analysis.
- **Match score (0–100)** with a "Strong / Moderate / Needs Work" verdict.
- **Matched keywords** — skills/tools the resume already supports.
- **Missing keywords** — important terms from the job description the resume
  doesn't cover.
- **Suggestions** — concrete, realistic ways to improve the resume.
- **Tailored resume** — a rewritten version emphasizing relevant experience,
  with one-click copy to clipboard.
- Clear loading and error states; the AI is instructed to never fabricate
  jobs, employers, degrees, skills, or metrics.

This is an intentionally small MVP: no login, no database, no file uploads,
no payments, no saved history. Everything happens in a single request/response
cycle.

## Tech stack

**Frontend**
- React 18 + Vite
- Tailwind CSS
- Plain JavaScript (JSX)

**Backend**
- Python 3.10+
- FastAPI
- Pydantic v2 (request/response validation)
- OpenAI API (`gpt-4o-mini` by default, via structured JSON output)

## Project structure

```
resume-tailor/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.jsx
│   │   │   ├── InputPanel.jsx
│   │   │   ├── EmptyState.jsx
│   │   │   ├── LoadingState.jsx
│   │   │   ├── ErrorState.jsx
│   │   │   ├── ResultsPanel.jsx
│   │   │   ├── MatchScoreTape.jsx
│   │   │   ├── KeywordBadges.jsx
│   │   │   ├── Suggestions.jsx
│   │   │   └── TailoredResume.jsx
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── vite.config.js
│   └── .env.example
├── backend/
│   ├── main.py
│   ├── models.py
│   ├── services/
│   │   └── ai_service.py
│   ├── requirements.txt
│   └── .env.example
└── README.md
```

## Local setup

### Prerequisites

- Node.js 18+ and npm
- Python 3.10+
- An OpenAI API key with access to a chat completions model

### 1. Clone / open the project

```bash
cd resume-tailor
```

### 2. Backend setup

```bash
cd backend
cp .env.example .env
# Edit .env and set OPENAI_API_KEY=sk-...
pip install -r requirements.txt
uvicorn main:app --reload
```

The API will start on `http://localhost:8000`. Visit
`http://localhost:8000/docs` for interactive API docs.

### 3. Frontend setup

In a separate terminal:

```bash
cd frontend
npm install
npm run dev
```

The app will start on `http://localhost:5173`.

### 4. Use it

Open `http://localhost:5173`, paste a resume and a job description, and
click **Tailor My Resume**.

## Environment variables

### Backend (`backend/.env`)

| Variable          | Required | Default                 | Description                                   |
|--------------------|----------|--------------------------|------------------------------------------------|
| `OPENAI_API_KEY`   | Yes      | —                        | Your OpenAI API key. Never exposed to the frontend. |
| `OPENAI_MODEL`     | No       | `gpt-4o-mini`            | Chat completion model used for tailoring.      |
| `FRONTEND_ORIGIN`  | No       | `http://localhost:5173` | Comma-separated list of allowed CORS origins.  |

### Frontend (`frontend/.env`, optional)

| Variable       | Required | Default                 | Description                          |
|-----------------|----------|--------------------------|----------------------------------------|
| `VITE_API_URL`  | No       | `http://localhost:8000` | Base URL of the FastAPI backend.       |

The OpenAI API key is **only** ever read on the backend (`backend/.env`). It
is never sent to the browser, and the frontend only ever talks to your own
FastAPI server.

## Running frontend

```bash
cd frontend
npm install
npm run dev
```

## Running backend

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

## API documentation

### `POST /api/tailor`

Analyzes a resume against a job description and returns a tailored result.

**Request body**

```json
{
  "resume": "string",
  "job_description": "string"
}
```

Both fields are required and cannot be blank; the API returns `422` with a
validation error if either is missing or empty.

**Success response — `200 OK`**

```json
{
  "match_score": 82,
  "summary": "Strong match with several relevant skills.",
  "matched_keywords": ["React", "Python", "REST APIs"],
  "missing_keywords": ["Docker", "AWS"],
  "suggestions": [
    "Emphasize your experience building REST APIs.",
    "Add measurable results to your backend projects."
  ],
  "tailored_resume": "..."
}
```

**Error responses**

| Status | When                                                      |
|--------|-------------------------------------------------------------|
| `422`  | `resume` or `job_description` missing/blank                |
| `502`  | OpenAI API call failed, or returned invalid/incomplete data |

Error bodies look like:

```json
{ "detail": "Something went wrong while analyzing your resume. Please try again." }
```

### `GET /api/health`

Simple liveness check, returns `{ "status": "ok" }`.

## Example request

```bash
curl -X POST http://localhost:8000/api/tailor \
  -H "Content-Type: application/json" \
  -d '{
        "resume": "Experienced Python developer with 5 years building REST APIs using FastAPI and Django.",
        "job_description": "Looking for a backend engineer with Python, Docker, and AWS experience."
      }'
```

## Security notes

- The OpenAI API key lives only in `backend/.env`, which is git-ignored.
- The frontend never holds or sends the API key; it only calls your FastAPI
  backend.
- CORS is restricted to the configured `FRONTEND_ORIGIN` (defaults to the
  Vite dev server).

## Future improvements

Out of scope for this MVP, but natural next steps:

- Resume file upload (PDF/DOCX) instead of paste-only.
- Save/compare multiple tailoring attempts (would require a database).
- User accounts and authentication.
- Export the tailored resume as a formatted PDF/DOCX.
- Streaming the AI response for faster perceived performance.
- Multiple resume "versions" tailored for different roles.
- Rate limiting / usage quotas per user.
