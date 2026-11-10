"""Handles communication with Groq API for resume tailoring."""

import json
import logging
import os

from groq import Groq

logger = logging.getLogger("resume_tailor.ai_service")

MODEL_NAME = os.getenv(
    "GROQ_MODEL",
    "openai/gpt-oss-20b"
)

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
Do not wrap the JSON in code fences.
Do not add commentary outside the JSON.
"""


class AIServiceError(Exception):
    """Raised when the AI service fails to produce a usable result."""


def _get_client():
    api_key = os.getenv("GROQ_API_KEY")

    if not api_key:
        raise AIServiceError(
            "GROQ_API_KEY is not configured on the server."
        )

    return Groq(
        api_key=api_key,
        timeout=120.0,
        max_retries=2,
    )


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
        "Analyze the match and return the JSON object described "
        "in your instructions."
    )


def tailor_resume(
    resume: str,
    job_description: str,
) -> dict:
    """Call Groq and return parsed structured resume data."""

    if not resume or not resume.strip():
        raise AIServiceError("Resume content is empty.")

    if not job_description or not job_description.strip():
        raise AIServiceError("Job description is empty.")

    client = _get_client()

    try:
        response = client.chat.completions.create(
            model=MODEL_NAME,
            messages=[
                {
                    "role": "system",
                    "content": SYSTEM_PROMPT,
                },
                {
                    "role": "user",
                    "content": _build_user_prompt(
                        resume,
                        job_description,
                    ),
                },
            ],
            temperature=0.3,
            max_completion_tokens=6000,
            response_format={
                "type": "json_object"
            },
            reasoning_effort="low",
            reasoning_format="hidden",
        )

        raw_content = response.choices[0].message.content

    except Exception as exc:
        logger.exception("Groq API error: %s", exc)

        raise AIServiceError(
            "The AI service returned an error. Please try again."
        ) from exc

    if not raw_content:
        raise AIServiceError(
            "The AI service returned an empty response."
        )

    try:
        data = json.loads(raw_content)

    except json.JSONDecodeError as exc:
        logger.error(
            "Failed to parse Groq JSON response: %s",
            raw_content[:500],
        )

        raise AIServiceError(
            "The AI service returned an invalid response."
        ) from exc

    if not isinstance(data, dict):
        raise AIServiceError(
            "The AI service returned an invalid JSON object."
        )

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

    if (
        not isinstance(data["match_score"], (int, float))
        or isinstance(data["match_score"], bool)
        or not 0 <= data["match_score"] <= 100
    ):
        raise AIServiceError("Invalid match score.")

    if not isinstance(data["summary"], str):
        raise AIServiceError("Invalid summary.")

    if not isinstance(data["matched_keywords"], list):
        raise AIServiceError("Invalid matched keywords.")

    if not isinstance(data["missing_keywords"], list):
        raise AIServiceError("Invalid missing keywords.")

    if not isinstance(data["suggestions"], list):
        raise AIServiceError("Invalid suggestions.")

    if not isinstance(data["tailored_resume"], str):
        raise AIServiceError("Invalid tailored resume.")

    logger.info(
        "Resume successfully tailored using Groq model: %s",
        MODEL_NAME,
    )

    return data
