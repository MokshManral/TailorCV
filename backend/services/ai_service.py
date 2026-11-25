"""Handles communication with the AI provider for resume tailoring.

Google Gemini is the primary provider (GEMINI_API_KEY / GEMINI_MODEL). If
Gemini is not configured or its request fails, Groq is used as a fallback
when GROQ_API_KEY is set (GROQ_MODEL).
"""

import json
import logging
import os
import re

logger = logging.getLogger("resume_tailor.ai_service")

DEFAULT_GEMINI_MODEL = "gemini-3.6-flash"
DEFAULT_GROQ_MODEL = "openai/gpt-oss-20b"

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
- Do not attach a skill or tool to an experience or project unless the
  original resume says it was used there (e.g. a skill listed only under
  Skills must not be claimed in a project bullet or the summary as
  something the candidate did).

TAILORED RESUME FORMAT (plain text, one item per line; it is rendered into a
one-page LaTeX resume, so follow this layout exactly):

Full Name
email@example.com | github.com/username | linkedin.com/in/username | leetcode.com/u/username
City, State - PIN, Country

PROFESSIONAL SUMMARY
Two or three sentences summarizing the candidate for this role.

EDUCATION
University Name | City, State, Country
Degree and Major | YYYY – YYYY (or "YYYY – Present")
School Name | City, State, Country
Class XII | Score% | YYYY

TECHNICAL SKILLS
Programming Languages: Java, Python
Backend Development: FastAPI, RESTful APIs
Developer Tools: Git, Docker

EXPERIENCE
Company Name | Mon YYYY – Mon YYYY
Job Title | City, Country
- Achievement-focused bullet starting with a strong verb

PROJECTS
Project Name – Short Description | https://project-link
Technology, Technology, Technology
- What was built and its impact

ACHIEVEMENTS
- Achievement bullet

Layout rules:
- Line 1 is the full name. The following lines, up to the first section
  heading, are the header: contact items separated by " | " (use full
  profile/project URLs exactly as given in the resume), then the location.
- Section headings are on their own line in ALL CAPS.
- An entry line is "Left side | right side": the right side holds the
  location, dates, score, or project link. Use " | " only on entry lines,
  in the header, and to separate a score from a year.
- The line directly under a project heading is its tech stack, without " | ".
- Bullets start with "- ".
- Skills are grouped as "Category: item, item".
- Include only sections and links the original resume supports; omit any
  missing details instead of inventing them. If an entry has no date, link,
  or location, write just the left side with no " | " — never write "N/A",
  "None", or a placeholder.
- The resume MUST fit on ONE page: keep the summary to at most 3 lines,
  use at most 4 bullets per role or project, keep each bullet under about
  25 words, and drop the least relevant items first.

Return ONLY valid JSON matching this exact structure:

{
  "match_score": 82,
  "summary": "Strong match with several relevant skills.",
  "matched_keywords": ["React", "Python"],
  "missing_keywords": ["Docker", "AWS"],
  "suggestions": [
    "Emphasize your Python backend experience."
  ],
  "tailored_resume": "Full tailored resume as plain text in the format above."
}

Do not return markdown.
Do not wrap the JSON in code fences.
Do not add commentary outside the JSON.
"""


class AIServiceError(Exception):
    """Raised when the AI service fails to produce a usable result."""


def _call_gemini(system_prompt: str, user_prompt: str, json_mode: bool = True) -> str:
    from google import genai
    from google.genai import types

    client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
    model = os.getenv("GEMINI_MODEL") or DEFAULT_GEMINI_MODEL

    response = client.models.generate_content(
        model=model,
        contents=user_prompt,
        config=types.GenerateContentConfig(
            system_instruction=system_prompt,
            temperature=0.3,
            max_output_tokens=12000,
            response_mime_type="application/json" if json_mode else "text/plain",
        ),
    )
    logger.info("Resume tailored using Gemini model: %s", model)
    return response.text or ""


def _call_groq(system_prompt: str, user_prompt: str, json_mode: bool = True) -> str:
    from groq import Groq

    client = Groq(
        api_key=os.getenv("GROQ_API_KEY"),
        timeout=120.0,
        max_retries=2,
    )
    model = os.getenv("GROQ_MODEL") or DEFAULT_GROQ_MODEL

    response = client.chat.completions.create(
        model=model,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        temperature=0.3,
        max_completion_tokens=12000,
        response_format={"type": "json_object"} if json_mode else None,
        reasoning_effort="low",
        reasoning_format="hidden",
    )
    logger.info("Resume tailored using Groq model: %s", model)
    return response.choices[0].message.content or ""


def _get_providers():
    """Return the configured providers in order: Gemini first, Groq fallback."""
    providers = []
    if os.getenv("GEMINI_API_KEY"):
        providers.append(("Gemini", _call_gemini))
    if os.getenv("GROQ_API_KEY"):
        providers.append(("Groq", _call_groq))
    if not providers:
        raise AIServiceError(
            "No AI provider is configured. Set GEMINI_API_KEY on the server."
        )
    return providers


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


def _parse_response(raw_content: str, resume_key: str = "tailored_resume") -> dict:
    """Parse and validate the model's JSON reply; raise AIServiceError if unusable."""
    if not raw_content:
        raise AIServiceError("The AI service returned an empty response.")

    # Tolerate a response wrapped in ```json fences.
    raw_content = raw_content.strip()
    if raw_content.startswith("```"):
        raw_content = raw_content.strip("`").removeprefix("json").strip()

    try:
        data = json.loads(raw_content)

    except json.JSONDecodeError as exc:
        logger.error(
            "Failed to parse AI JSON response: %s",
            raw_content[:500],
        )

        raise AIServiceError("The AI service returned an invalid response.") from exc

    if not isinstance(data, dict):
        raise AIServiceError("The AI service returned an invalid JSON object.")

    required_keys = {
        "match_score",
        "summary",
        "matched_keywords",
        "missing_keywords",
        "suggestions",
        resume_key,
    }

    missing_keys = required_keys - data.keys()

    if missing_keys:
        logger.error(
            "AI response missing keys: %s",
            missing_keys,
        )

        raise AIServiceError("The AI service returned incomplete data.")

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

    if not isinstance(data[resume_key], str) or not data[resume_key].strip():
        raise AIServiceError("Invalid tailored resume.")

    return data


def _generate(
    system_prompt: str, user_prompt: str, parse, json_mode: bool = True
) -> dict:
    """Call the providers in order and return the first valid parsed reply.

    ``parse`` turns the raw reply into a dict or raises AIServiceError.
    """
    last_error = None

    # Try Gemini first, then Groq. Each provider gets a second attempt if its
    # reply is malformed (e.g. a missing field); an API error moves straight
    # on to the next provider.
    for provider, call_model in _get_providers():
        for attempt in (1, 2):
            try:
                raw_content = call_model(system_prompt, user_prompt, json_mode)
            except Exception as exc:
                logger.warning("%s API error: %s", provider, exc)
                last_error = exc
                break

            try:
                return parse(raw_content)
            except AIServiceError as exc:
                logger.warning(
                    "%s returned an unusable response (attempt %d): %s",
                    provider,
                    attempt,
                    exc,
                )
                last_error = exc

    if isinstance(last_error, AIServiceError):
        raise last_error

    raise AIServiceError(
        "The AI service returned an error. Please try again."
    ) from last_error


def tailor_resume(
    resume: str,
    job_description: str,
) -> dict:
    """Call the AI provider and return parsed structured resume data."""

    if not resume or not resume.strip():
        raise AIServiceError("Resume content is empty.")

    if not job_description or not job_description.strip():
        raise AIServiceError("Job description is empty.")

    return _generate(
        SYSTEM_PROMPT,
        _build_user_prompt(resume, job_description),
        _parse_response,
    )


LATEX_SYSTEM_PROMPT = """You are an expert technical recruiter and resume writer
who is also fluent in LaTeX.

You will be given the BODY of a candidate's LaTeX resume (everything between
\\begin{document} and \\end{document}) and a JOB DESCRIPTION.

Your job:

1. Analyze the job description and identify important technical skills,
   soft skills, tools, responsibilities, and keywords.
2. Compare those requirements against what is actually supported by the resume.
3. Produce an overall match score from 0-100 for the resume as it is now.
4. List skills/keywords clearly supported by evidence in the resume
   (matched_keywords).
5. List important job-description keywords missing or not supported by the
   resume (missing_keywords).
6. Suggest realistic, actionable improvements (suggestions).
7. Edit the LaTeX body (tailored_latex) so it better presents the candidate's
   existing, relevant experience for this job description.

HOW TO EDIT THE LATEX:

- Change only human-readable text: rephrase bullets with strong action
  verbs, tighten the summary toward the role, reorder items within a section
  (and sections themselves) by relevance, and use job-description keywords
  where the resume supports them.
- Keep the LaTeX structure: reuse exactly the same commands, environments,
  macros, spacing commands, and formatting the body already uses. Do not
  invent new macros or packages, and do not add \\input, \\include, \\write,
  \\catcode, \\csname, or file/graphics commands.
- Keep every \\href target and contact detail unchanged.
- Escape LaTeX special characters in any text you write (\\&, \\%, \\$, \\#,
  \\_). Make sure every brace and environment is balanced.
- Keep roughly the same length so the document stays the same number of
  pages; you may shorten or drop the least relevant bullets.
- Return only the body: no \\documentclass, no preamble, and no
  \\begin{document} or \\end{document}.

STRICT RULES:

- NEVER invent jobs, companies, degrees, certifications, projects,
  technologies, achievements, metrics, or responsibilities.
- Do not add a skill merely because it appears in the job description.
- Do not attach a skill or tool to an experience or project unless the
  original resume says it was used there.
- Preserve important factual information: employers, titles, dates, degrees,
  scores, projects, and links.
- If the resume does not support a requirement, put it in missing_keywords.

Reply in exactly this format and nothing else:

<analysis>
{
  "match_score": 82,
  "summary": "Strong match with several relevant skills.",
  "matched_keywords": ["React", "Python"],
  "missing_keywords": ["Docker", "AWS"],
  "suggestions": ["Emphasize your Python backend experience."]
}
</analysis>
<latex>
...the complete edited LaTeX body, written as plain LaTeX with real line
breaks (not JSON-escaped)...
</latex>
"""


def tailor_latex_body(
    latex_body: str,
    job_description: str,
    previous_attempt: str | None = None,
    compile_error: str | None = None,
) -> dict:
    """Ask the AI to tailor a LaTeX resume body to a job description.

    When ``previous_attempt`` and ``compile_error`` are given, the AI is asked
    to fix the LaTeX error in its previous attempt.
    """
    if not latex_body or not latex_body.strip():
        raise AIServiceError("LaTeX resume content is empty.")

    if not job_description or not job_description.strip():
        raise AIServiceError("Job description is empty.")

    user_prompt = (
        "LATEX RESUME BODY:\n"
        "-----\n"
        f"{latex_body}\n"
        "-----\n\n"
        "JOB DESCRIPTION:\n"
        "-----\n"
        f"{job_description}\n"
        "-----\n\n"
    )

    if previous_attempt and compile_error:
        user_prompt += (
            "Your previous tailored_latex failed to compile with this error:\n"
            "-----\n"
            f"{compile_error}\n"
            "-----\n\n"
            "Previous tailored_latex:\n"
            "-----\n"
            f"{previous_attempt}\n"
            "-----\n\n"
            "Return the JSON object again with the LaTeX error fixed.\n"
        )
    else:
        user_prompt += (
            "Analyze the match and return the JSON object described in your "
            "instructions.\n"
        )

    return _generate(
        LATEX_SYSTEM_PROMPT,
        user_prompt,
        _parse_latex_response,
        json_mode=False,
    )


def _parse_latex_response(raw_content: str) -> dict:
    """Parse "<analysis>{json}</analysis> <latex>body</latex>" replies.

    The LaTeX is kept outside the JSON so models don't have to escape every
    backslash and newline (a frequent source of corrupted output).
    """
    raw_content = raw_content or ""
    analysis = re.search(r"<analysis>(.*?)</analysis>", raw_content, re.S)
    latex = re.search(r"<latex>(.*)</latex>", raw_content, re.S)

    if not analysis or not latex:
        logger.error("LaTeX reply missing blocks: %s", raw_content[:500])
        raise AIServiceError("The AI service returned an incomplete response.")

    try:
        data = json.loads(analysis.group(1).strip().strip("`").removeprefix("json"))
    except json.JSONDecodeError as exc:
        raise AIServiceError("The AI service returned invalid analysis JSON.") from exc

    if not isinstance(data, dict):
        raise AIServiceError("The AI service returned an invalid JSON object.")

    body = latex.group(1).strip("\n")
    # Drop a code fence if the model wrapped the LaTeX in one.
    body = re.sub(r"^\s*```(?:latex|tex)?\s*\n", "", body)
    body = re.sub(r"\n\s*```\s*$", "", body)
    data["tailored_latex"] = body

    return _parse_response(json.dumps(data), "tailored_latex")
