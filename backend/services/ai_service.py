"""Handles communication with the Google Gemini API for resume tailoring."""

import json
import logging
import os

from google import genai
from google.genai import types


logger = logging.getLogger("resume_tailor.ai_service")


MODEL_NAME = os.getenv("GEMINI_MODEL")


SYSTEM_PROMPT = """You are an expert technical recruiter and resume writer.

You will be given a candidate's RESUME and a JOB DESCRIPTION.

Your job:

1. Analyze the job description and identify important technical skills,
   soft skills, tools, responsibilities, and keywords.
2. Compare those requirements against what is actually supported by the resume.
3. Produce an overall match score from 0-100 reflecting how well the resume
   currently matches the job description.
4. List skills/keywords clearly supported by evidence in the resume
   (matched_keywords).
5. List important job-description keywords missing or not supported by the
   resume (missing_keywords).
6. Suggest realistic, actionable improvements (suggestions).
7. Rewrite the resume (tailored_resume) to better emphasize the candidate's
   relevant existing experience for this job description.

STRICT RULES:

- NEVER invent jobs, companies, degrees, certifications, projects,
  technologies, achievements, metrics, or responsibilities.
- Do not add a skill to the tailored resume or matched_keywords merely because
  it appears in the job description.
- Only include skills if the original resume provides real evidence.
- If the resume does not support a requirement, put it in missing_keywords.
- Do not claim the candidate has a skill that is not supported by the resume.
- Preserve important factual information from the original resume including
  employers, titles, dates, degrees, projects, etc.
- You may reorder, re-emphasize, and rephrase information for clarity and ATS
  readability.
- Keep the resume truthful to the source material.

Return ONLY valid JSON matching this exact structure:

{
  "match_score": 82,
  "summary": "Strong match with several relevant skills.",
  "matched_keywords": ["React", "Python"],
  "missing_keywords": ["Docker", "AWS"],
  "suggestions": [
    "Emphasize your Python backend experience."
  ],
  "tailored_resume": "Full tailored resume as plain text."
}

Do not return markdown.
Do not wrap the JSON in ```json.
Do not add commentary outside the JSON.
"""


class AIServiceError(Exception):
    """Raised when the AI service fails to produce a usable result."""


def _get_client():
    api_key = os.getenv("GEMINI_API_KEY")

    if not api_key:
        raise AIServiceError(
            "GEMINI_API_KEY is not configured on the server. "
            "Set it in the server environment variables."
        )

    if not MODEL_NAME:
        raise AIServiceError(
            "GEMINI_MODEL is not configured on the server."
        )

    return genai.Client(api_key=api_key)


def _build_user_prompt(
    resume: str,
    job_description: str,
) -> str:
    return (
        "RESUME:\n"
        "-----\n"
        f"{resume}\n"
        "-----\n\n"
        "JOB DESCRIPTION:\n"
        "-----\n"
        f"{job_description}\n"
        "-----\n\n"
        "Analyze the match and return the JSON object described in your instructions."
    )


def tailor_resume(
    resume: str,
    job_description: str,
) -> dict:
    """Call Gemini and return the parsed structured result."""

    client = _get_client()

    try:
        response = client.models.generate_content(
            model=MODEL_NAME,
            contents=_build_user_prompt(
                resume,
                job_description,
            ),
            config=types.GenerateContentConfig(
                system_instruction=SYSTEM_PROMPT,
                temperature=0.3,
                response_mime_type="application/json",
            ),
        )

    except Exception as exc:
        logger.exception(
            "Gemini API error: %s",
            exc,
        )

        raise AIServiceError(
            "The AI service returned an error. Please try again."
        ) from exc

    raw_content = response.text

    if not raw_content:
        raise AIServiceError(
            "The AI service returned an empty response."
        )

    try:
        data = json.loads(raw_content)

    except json.JSONDecodeError as exc:
        logger.error(
            "Failed to parse Gemini JSON response: %s",
            raw_content[:500],
        )

        raise AIServiceError(
            "The AI service returned an invalid response."
        ) from exc

    required_keys = {
        "match_score",
        "summary",
        "matched_keywords",
        "missing_keywords",
        "suggestions",
        "tailored_resume",
    }

    missing_keys = required_keys - data.keys()

    if missing_keys:
        logger.error(
            "AI response missing keys: %s",
            missing_keys,
        )

        raise AIServiceError(
            "The AI service returned incomplete data."
        )

    return data