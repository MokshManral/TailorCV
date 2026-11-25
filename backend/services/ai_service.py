"""Handles communication with the AI provider for resume tailoring.

Google Gemini is the primary provider (GEMINI_API_KEY / GEMINI_MODEL). If
Gemini is not configured or its request fails, Groq is used as a fallback
when GROQ_API_KEY is set (GROQ_MODEL).
"""

import json
import logging
import os
import re
from concurrent.futures import ThreadPoolExecutor

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
6. Suggest 3-6 specific changes the candidate should make so their resume
   fits THIS job description (suggestions). Each suggestion must name the
   job requirement it addresses and the exact change: which section or
   bullet to edit, what to add, move, or reword (e.g. "The job asks for REST
   API design: in your TailorCV project, lead with the FastAPI endpoints you
   built."). Only point to work the resume actually shows. Never write a
   ready-made bullet or claim for work the resume does not mention (no
   invented features, metrics, or "X%" placeholders). For a requirement the
   resume does not support, either say "if you have done X, add it to Y" or
   suggest how to genuinely gain it (a course, a small project). No generic
   advice.
7. Rewrite the resume (tailored_resume) for THIS job description, following
   the TAILORING STEPS below. A tailored resume that reads almost the same as
   the original is a failed answer: two different job descriptions must
   produce visibly different resumes.


TAILORING STEPS (all required):

a. Summary: write it for this role. Lead with the candidate's skills and work
   that match the job's main requirements, using the job description's
   wording where it is true. Describe the candidate as they really are
   (e.g. "Computer Science undergraduate with backend experience in ...");
   never give them a job title they have not held, such as "Backend
   Engineer" for a student.
b. Skills: within each category, put the skills the job description asks for
   first; put the most relevant category first. Keep only real skills.
c. Projects and experience: order entries by relevance to the job
   description, most relevant first (dates still go on the right).
d. Bullets: rewrite each bullet to foreground the parts that matter for this
   job, using the job description's terminology when it describes the same
   thing (e.g. "API endpoints" -> "REST APIs" if the job says REST APIs).
   Start with a strong action verb. Within an entry, put the most relevant
   bullet first, and drop the least relevant bullets if space is needed.
e. Keep every fact intact: same projects, employers, titles, dates, scores,
   numbers, and links. Change emphasis, order, and wording, not facts.

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
- Reordering, re-emphasizing, and rephrasing are required (see TAILORING
  STEPS); inventing is not.
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
- The layout above is a template, not a checklist. Only include a section
  when the original resume has real content for it. If the candidate has no
  work experience or internships, leave out the EXPERIENCE section entirely:
  never add an empty section or one that says "N/A", "None", "Fresher", or
  "No experience". The same applies to PROJECTS, ACHIEVEMENTS, and every
  other section.
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


COMPANIES_PROMPT = """You are a career advisor. You will be given a candidate's
RESUME only.

Recommend 5 or 6 real, established companies the candidate should look into.
Base this on the resume alone: the candidate's whole profile (skills,
projects, experience) and level (e.g. internships or new-graduate roles for a
student). Cover the range of roles they fit, and prefer companies that hire in
or near the candidate's location if the resume gives one. Include a mix of
company sizes when sensible (large companies and well-known startups).

For each company give:
- name: the company name
- reason: one sentence linking what the company is publicly known for (its
  products or domain) to a specific skill or project in the resume. Do not
  state details of a company's internal tech stack.
- roles: 1-3 role titles that fit the candidate

Never claim a company has open positions or is hiring right now.

Return ONLY valid JSON:
{"recommended_companies": [{"name": "...", "reason": "...", "roles": ["..."]}]}
"""


def _parse_companies(raw_content: str) -> dict:
    raw_content = (raw_content or "").strip()
    if raw_content.startswith("```"):
        raw_content = raw_content.strip("`").removeprefix("json").strip()
    try:
        data = json.loads(raw_content)
    except json.JSONDecodeError as exc:
        raise AIServiceError("Invalid company recommendations.") from exc
    companies = _clean_companies(
        data.get("recommended_companies") if isinstance(data, dict) else None
    )
    if not companies:
        raise AIServiceError("No company recommendations returned.")
    return {"recommended_companies": companies}


def recommend_companies(resume: str) -> list[dict]:
    """Companies to look into, based on the resume only (never the job)."""
    try:
        data = _generate(
            COMPANIES_PROMPT,
            f"RESUME:\n-----\n{resume}\n-----",
            _parse_companies,
        )
        return data["recommended_companies"]
    except AIServiceError as exc:
        # Optional extra: the rest of the results still work without it.
        logger.warning("Company recommendations unavailable: %s", exc)
        return []


def run_with_companies(resume: str, main_call):
    """Run ``main_call()`` and the resume-only company request in parallel."""
    with ThreadPoolExecutor(max_workers=2) as pool:
        companies_future = pool.submit(recommend_companies, resume)
        data = main_call()
        data["recommended_companies"] = companies_future.result()
    return data


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


def _clean_companies(value) -> list[dict]:
    """Keep well-formed company recommendations; never fail the whole reply."""
    if not isinstance(value, list):
        return []
    companies = []
    for item in value:
        if not isinstance(item, dict):
            continue
        name = str(item.get("name") or "").strip()
        if not name:
            continue
        roles = item.get("roles") if isinstance(item.get("roles"), list) else []
        companies.append(
            {
                "name": name[:80],
                "reason": str(item.get("reason") or "").strip()[:300],
                "roles": [
                    str(role).strip()[:60] for role in roles if str(role).strip()
                ][:3],
            }
        )
    return companies[:6]


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

    data = run_with_companies(
        resume,
        lambda: _generate(
            SYSTEM_PROMPT,
            _build_user_prompt(resume, job_description),
            _parse_response,
        ),
    )
    data["tailored_resume"] = prioritize_for_job(
        data["tailored_resume"],
        job_description,
        data.get("matched_keywords") or [],
    )
    return data


# ---------------------------------------------------------------------------
# Relevance ordering
#
# Models (especially small ones) tend to keep the original order of skills and
# projects. These helpers reorder the tailored resume text by relevance to the
# job description. They only move existing lines, so they cannot add content.
# ---------------------------------------------------------------------------

_REORDER_ENTRY_SECTIONS = ("PROJECT",)  # experience stays in date order
_SKILL_SECTIONS = ("SKILL",)
_BULLET = re.compile(r"^\s*(?:[-*•▪◦‣]|\d+[.)])\s+")
_LABEL_LINE = re.compile(r"^([A-Za-z][A-Za-z0-9 &/+.-]{0,30}):\s+(.+)$")


def _is_heading(line: str) -> bool:
    text = line.strip().rstrip(":")
    return (
        3 <= len(text) <= 45
        and text == text.upper()
        and any(c.isalpha() for c in text)
        and " | " not in text
        and not _BULLET.match(text)
    )


_WORD = re.compile(r"[a-z][a-z0-9+#]*(?:\.[a-z0-9]+)*")
_STOPWORDS = {
    "and",
    "the",
    "with",
    "for",
    "using",
    "from",
    "into",
    "our",
    "you",
    "your",
    "are",
    "will",
    "work",
    "build",
    "built",
    "strong",
    "experience",
}


def _contains_term(text: str, term: str) -> bool:
    """Whole-word, case-insensitive match ("SQL" doesn't match "SQLAlchemy")."""
    pattern = r"(?<![a-z0-9])" + re.escape(term.lower()) + r"(?![a-z0-9])"
    return re.search(pattern, text) is not None


def _relevance(text: str, keywords: list[str], job_words: set[str]) -> int:
    """Score ``text``: matched keywords count 2, other shared words count 1."""
    lowered = text.lower()
    score = sum(
        2 for keyword in keywords if keyword and _contains_term(lowered, keyword)
    )
    words = set(_WORD.findall(lowered)) - _STOPWORDS
    score += len(words & job_words)
    return score


def _sort_by_relevance(items: list, key, keywords, job_text) -> list:
    """Stable sort, most relevant first (ties keep their original order)."""
    return sorted(items, key=lambda item: -_relevance(key(item), keywords, job_text))


def _reorder_entries(lines: list[str], keywords, job_text) -> list[str]:
    """Group a section into entries (heading lines + bullets) and reorder."""
    entries: list[list[str]] = []
    for line in lines:
        is_bullet = bool(_BULLET.match(line))
        if not line.strip():
            continue
        if not is_bullet and (not entries or _BULLET.match(entries[-1][-1])):
            entries.append([line])
        elif entries:
            entries[-1].append(line)
        else:
            entries.append([line])

    result = []
    for entry in _sort_by_relevance(entries, lambda e: " ".join(e), keywords, job_text):
        head = [line for line in entry if not _BULLET.match(line)]
        bullets = [line for line in entry if _BULLET.match(line)]
        result.extend(head)
        result.extend(_sort_by_relevance(bullets, str, keywords, job_text))
    return result


def _reorder_skills(lines: list[str], keywords, job_text) -> list[str]:
    """Reorder "Category: a, b, c" lines and the items within each line."""
    reordered = []
    for line in lines:
        match = _LABEL_LINE.match(line.strip())
        if not match:
            reordered.append(line)
            continue
        items = [item.strip() for item in match.group(2).split(",") if item.strip()]
        items = _sort_by_relevance(items, str, keywords, job_text)
        reordered.append(f"{match.group(1)}: {', '.join(items)}")
    labelled = [line for line in reordered if _LABEL_LINE.match(line.strip())]
    others = [line for line in reordered if not _LABEL_LINE.match(line.strip())]
    return _sort_by_relevance(labelled, str, keywords, job_text) + others


def prioritize_for_job(
    resume_text: str, job_description: str, keywords: list[str]
) -> str:
    """Reorder projects, bullets, and skills by relevance to the job."""
    job_text = set(_WORD.findall(job_description.lower())) - _STOPWORDS
    lines = resume_text.splitlines()
    output: list[str] = []
    index = 0

    while index < len(lines):
        line = lines[index]
        output.append(line)
        index += 1
        if not _is_heading(line):
            continue

        # Collect this section's lines up to the next heading.
        start = index
        while index < len(lines) and not _is_heading(lines[index]):
            index += 1
        section = lines[start:index]
        trailing_blank = bool(section) and not section[-1].strip()
        heading = line.strip().upper()

        if any(name in heading for name in _REORDER_ENTRY_SECTIONS):
            section = _reorder_entries(section, keywords, job_text)
        elif any(name in heading for name in _SKILL_SECTIONS):
            section = _reorder_skills(
                [entry for entry in section if entry.strip()], keywords, job_text
            )
        else:
            output.extend(section)
            continue

        output.extend(section)
        if trailing_blank:
            output.append("")

    return "\n".join(output)


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
6. Suggest 3-6 specific changes the candidate should make so their resume
   fits THIS job description (suggestions). Each suggestion must name the
   job requirement it addresses and the exact change: which section or
   bullet to edit, what to add, move, or reword (e.g. "The job asks for REST
   API design: in your TailorCV project, lead with the FastAPI endpoints you
   built."). Only point to work the resume actually shows. Never write a
   ready-made bullet or claim for work the resume does not mention (no
   invented features, metrics, or "X%" placeholders). For a requirement the
   resume does not support, either say "if you have done X, add it to Y" or
   suggest how to genuinely gain it (a course, a small project). No generic
   advice.
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
