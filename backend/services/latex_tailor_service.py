"""Tailor a user's own LaTeX resume to a job description.

The user's preamble (everything up to \\begin{document}) is kept byte for byte;
only the body is sent to the AI for editing. The result is compiled before it
is returned, and the AI gets one chance to fix a compile error.
"""

import base64
import logging
import re

from services.ai_service import (
    AIServiceError,
    run_with_companies,
    tailor_latex_body,
)
from services.latex_service import (
    MAX_LATEX_SOURCE_CHARS,
    LatexError,
    check_latex_safe,
    compile_pdf,
    latex_error_summary,
    split_latex,
)

logger = logging.getLogger("resume_tailor.latex_tailor")

MAX_ATTEMPTS = 2


class LatexInputError(Exception):
    """The user's LaTeX cannot be used (unsafe, incomplete, or won't compile)."""


def _extract_body(text: str) -> str:
    """Return just the body, in case the AI sent back a whole document."""
    try:
        _preamble, body, _ending = split_latex(text)
        return body
    except LatexError:
        return text


def _visible_length(latex: str) -> int:
    """Rough length of the text a LaTeX body would show (comments removed)."""
    text = re.sub(r"(?<!\\)%.*", "", latex)
    text = re.sub(r"\\[A-Za-z]+\*?", " ", text)
    return len(re.sub(r"[\s{}\[\]]+", "", text))


def _check_content_kept(original: str, tailored: str) -> None:
    """Fail if the edit lost most of the content (e.g. commented it all out)."""
    before, after = _visible_length(original), _visible_length(tailored)
    if before and after < before * 0.5:
        raise LatexError(
            "! The edited body lost most of the resume's content "
            f"({after} of {before} visible characters). Return the full body, "
            "with every line on its own line and no stray % comments."
        )


def tailor_latex_resume(source: str, job_description: str) -> dict:
    """Tailor ``source`` (a full LaTeX document) to ``job_description``."""
    if len(source) > MAX_LATEX_SOURCE_CHARS:
        raise LatexInputError(
            "Your LaTeX file is too large (100,000 characters maximum)."
        )

    try:
        check_latex_safe(source)
        preamble, body, ending = split_latex(source)
    except LatexError as exc:
        raise LatexInputError(str(exc)) from exc

    # Make sure the original compiles here first, so a missing package is
    # reported as such rather than blamed on the AI's edits.
    try:
        _pdf, original_pages = compile_pdf(source)
    except LatexError as exc:
        raise LatexInputError(
            "Your LaTeX doesn't compile on our server (it may use a package "
            "we don't have installed):\n" + latex_error_summary(exc)
        ) from exc

    result = run_with_companies(body, lambda: tailor_latex_body(body, job_description))
    companies = result.get("recommended_companies", [])

    for attempt in range(1, MAX_ATTEMPTS + 1):
        new_body = _extract_body(result["tailored_latex"]).strip("\n")
        document = f"{preamble}\n{new_body}\n{ending}"

        try:
            check_latex_safe(new_body)
            _check_content_kept(body, new_body)
            pdf, pages = compile_pdf(document)
        except LatexError as exc:
            error = latex_error_summary(exc)
            logger.warning("Tailored LaTeX failed (attempt %d): %s", attempt, error)
            if attempt == MAX_ATTEMPTS:
                raise AIServiceError(
                    "The AI couldn't produce a valid tailored LaTeX resume. Please try again."
                ) from exc
            result = tailor_latex_body(
                body,
                job_description,
                previous_attempt=new_body,
                compile_error=error,
            )
            continue

        return {
            "match_score": result["match_score"],
            "summary": result["summary"],
            "matched_keywords": result["matched_keywords"],
            "missing_keywords": result["missing_keywords"],
            "suggestions": result["suggestions"],
            "recommended_companies": companies,
            "tailored_resume": document,
            "tailored_latex": document,
            "pdf_base64": base64.b64encode(pdf).decode("ascii"),
            "page_count": pages,
            "original_page_count": original_pages,
        }

    raise AIServiceError("The AI couldn't produce LaTeX that compiles.")
