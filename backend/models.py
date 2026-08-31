"""Pydantic and SQLAlchemy models for the TailorCV API."""

from datetime import datetime

from pydantic import BaseModel, Field, field_validator
from sqlalchemy import Boolean, Column, DateTime, Integer, String

from database import Base


# -------------------------
# Pydantic user model
# -------------------------

class User(BaseModel):
    """User data returned by the API."""

    id: int | None = None
    username: str | None = None
    email: str
    password_hash: str | None = None
    google_id: str | None = None
    profile_picture: str | None = None
    is_active: bool = True
    created_at: datetime | None = None


# -------------------------
# SQLAlchemy user model
# -------------------------

class UserDB(Base):
    """Database model for users."""

    __tablename__ = "users"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    username = Column(
        String,
        nullable=True,
    )

    email = Column(
        String,
        unique=True,
        nullable=False,
        index=True,
    )

    password_hash = Column(
        String,
        nullable=True,
    )

    google_id = Column(
        String,
        unique=True,
        nullable=True,
    )

    profile_picture = Column(
        String,
        nullable=True,
    )

    is_active = Column(
        Boolean,
        default=True,
        nullable=False,
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
    )


# -------------------------
# Tailor request
# -------------------------

class TailorRequest(BaseModel):
    """Incoming request body for POST /api/tailor."""

    resume: str = Field(
        ...,
        description="The candidate's raw resume text.",
    )

    job_description: str = Field(
        ...,
        description="The target job description text.",
    )

    @field_validator("resume", "job_description")
    @classmethod
    def not_blank(cls, value: str) -> str:
        if not value or not value.strip():
            raise ValueError(
                "This field cannot be empty."
            )

        return value.strip()


# -------------------------
# Tailor response
# -------------------------

class TailorResponse(BaseModel):
    """Response returned by POST /api/tailor."""

    match_score: int = Field(
        ...,
        ge=0,
        le=100,
        description="Overall match score, 0-100.",
    )

    summary: str = Field(
        ...,
        description="One or two sentence summary of the match quality.",
    )

    matched_keywords: list[str] = Field(
        default_factory=list,
        description="Skills/keywords found in both.",
    )

    missing_keywords: list[str] = Field(
        default_factory=list,
        description="Important JD keywords missing from resume.",
    )

    suggestions: list[str] = Field(
        default_factory=list,
        description="Actionable, realistic improvement suggestions.",
    )

    tailored_resume: str = Field(
        ...,
        description="The rewritten, tailored resume text.",
    )


# -------------------------
# Error response
# -------------------------

class ErrorResponse(BaseModel):
    """Standard error payload returned to the frontend."""

    detail: str
