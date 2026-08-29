"""Pydantic models for the TailorCV API."""

from pydantic import BaseModel, Field, field_validator


class TailorRequest(BaseModel):
    """Incoming request body for POST /api/tailor."""

    resume: str = Field(..., description="The candidate's raw resume text.")
    job_description: str = Field(..., description="The target job description text.")

    @field_validator("resume", "job_description")
    @classmethod
    def not_blank(cls, value: str) -> str:
        if not value or not value.strip():
            raise ValueError("This field cannot be empty.")
        return value.strip()


class TailorResponse(BaseModel):
    """Response body returned by POST /api/tailor."""

    match_score: int = Field(..., ge=0, le=100, description="Overall match score, 0-100.")
    summary: str = Field(..., description="One or two sentence summary of the match quality.")
    matched_keywords: list[str] = Field(default_factory=list, description="Skills/keywords found in both.")
    missing_keywords: list[str] = Field(default_factory=list, description="Important JD keywords missing from resume.")
    suggestions: list[str] = Field(default_factory=list, description="Actionable, realistic improvement suggestions.")
    tailored_resume: str = Field(..., description="The rewritten, tailored resume text.")


class ErrorResponse(BaseModel):
    """Standard error payload returned to the frontend."""

    detail: str
