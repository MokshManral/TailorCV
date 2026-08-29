# TailorCV

**Tailor your resume for every job.**

TailorCV is an AI-powered resume tailoring application that analyzes your resume against a specific job description and helps you create a more relevant, ATS-friendly version.

Paste your resume, add the job description, and get an AI-powered analysis with a **match score, keywords, improvement suggestions, and a tailored resume** — without inventing experience or qualifications.

## ✨ Features

* 🤖 AI-powered resume and job description analysis
* 📊 Resume-to-job match score
* 🔑 Matched keywords
* ⚠️ Missing keywords
* 💡 Actionable improvement suggestions
* 📄 ATS-friendly tailored resume
* 📋 One-click copy for the tailored resume
* ⚡ Clear loading and error states
* 📱 Responsive interface
* 🌙 Light and dark themes
* 🧭 Client-side routing with React Router

## 🛠️ Tech Stack

### Frontend

* React
* Vite
* Tailwind CSS
* React Router
* JavaScript / JSX

### Backend

* Python
* FastAPI
* Pydantic
* Gemini API

## 📁 Project Structure

```text
tailor-cv/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.jsx
│   │   │   ├── InputPanel.jsx
│   │   │   ├── EmptyState.jsx
│   │   │   ├── LoadingState.jsx
│   │   │   ├── ErrorState.jsx
│   │   │   └── ResultsPanel.jsx
│   │   │
│   │   ├── pages/
│   │   │   ├── Hero.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── TailorPage.jsx
│   │   │   ├── TermsPage.jsx
│   │   │   └── PrivacyPolicyPage.jsx
│   │   │
│   │   ├── App.jsx
│   │   └── main.jsx
│   │
│   ├── package.json
│   └── vite.config.js
│
├── backend/
│   ├── main.py
│   ├── models.py
│   ├── services/
│   │   └── ai_service.py
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
* A Gemini API key

### 1. Clone the repository

```bash
git clone <your-repository-url>
cd tailor-cv
```

### 2. Set up the backend

```bash
cd backend
pip install -r requirements.txt
```

Create a `.env` file inside the `backend` directory:

```env
GEMINI_API_KEY=your_api_key
GEMINI_MODEL=your_model
FRONTEND_ORIGIN=http://localhost:5173
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

### 3. Set up the frontend

Open another terminal:

```bash
cd frontend
npm install
```

Create a `.env` file inside the `frontend` directory if needed:

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

| Variable          | Required | Description                           |
| ----------------- | -------- | ------------------------------------- |
| `GEMINI_API_KEY`  | Yes      | Gemini API key used by the backend    |
| `GEMINI_MODEL`    | Yes      | Gemini model used for resume analysis |
| `FRONTEND_ORIGIN` | No       | Allowed frontend origin for CORS      |

### Frontend

| Variable       | Required | Description                     |
| -------------- | -------- | ------------------------------- |
| `VITE_API_URL` | No       | Base URL of the FastAPI backend |

> **Never commit ****`.env`**** files or API keys to GitHub.**

## 🔌 API

### `POST /api/tailor`

Analyzes a resume against a job description.

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
  "matched_keywords": [
    "React",
    "Python",
    "REST APIs"
  ],
  "missing_keywords": [
    "Docker",
    "AWS"
  ],
  "suggestions": [
    "Emphasize your experience building REST APIs.",
    "Highlight relevant backend projects."
  ],
  "tailored_resume": "..."
}
```

### `GET /api/health`

Returns the current health status of the backend.

#### Response

```json
{
  "status": "ok"
}
```

## 🔒 Security

* Gemini API credentials are kept on the backend.
* API keys are never exposed to the frontend.
* `.env` files should not be committed to GitHub.
* CORS is restricted to the configured frontend origin.
* The AI is instructed not to fabricate employers, degrees, skills, experience, or achievements.
* Resume content is sent to the backend only when the user submits a tailoring request.

## 📌 Current Status

TailorCV is currently an **MVP**.

The current version focuses on the core resume-tailoring workflow:

```text
Resume → Job Description → AI Analysis → Tailored Resume
```

Authentication and persistent user data are not currently implemented.

## 🗺️ Roadmap

* [ ] Google authentication
* [ ] User accounts
* [ ] Saved resume versions
* [ ] Resume history
* [ ] PDF and DOCX resume uploads
* [ ] PDF and DOCX export
* [ ] Usage limits and rate limiting
* [ ] Multiple AI model options
* [ ] Improved resume formatting
* [ ] Production analytics and monitoring

## 🤝 Contributing

Contributions, suggestions, and improvements are welcome.

If you find a bug or have an idea for improving TailorCV, feel free to open an issue or submit a pull request.

## 📄 License

This project is currently **not licensed for redistribution**.

All rights reserved.