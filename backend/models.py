"""Pydantic and SQLAlchemy models for the TailorCV API."""

from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field
from sqlalchemy import Boolean, Column, DateTime, Integer, String

from database import Base

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


class LatexTailorResponse(TailorResponse):
    """Response returned by POST /api/tailor/latex."""

    tailored_latex: str = Field(
        ...,
        description="The full tailored LaTeX document (original preamble kept).",
    )

    pdf_base64: str = Field(
        ...,
        description="The compiled tailored resume PDF, base64-encoded.",
    )

    page_count: int = Field(..., description="Pages in the tailored PDF.")

    original_page_count: int = Field(
        ...,
        description="Pages in the original resume's PDF.",
    )


# -------------------------
# Error response
# -------------------------


class ErrorResponse(BaseModel):
    """Standard error payload returned to the frontend."""

    detail: str


# -------------------------
# Resume export
# -------------------------


class ResumeBlock(BaseModel):
    """One formatted line of the tailored resume preview."""

    type: Literal[
        "name", "contact", "section", "entry", "subentry", "bullet", "text", "spacer"
    ]
    text: str = Field(default="", max_length=2000)
    right: str = Field(default="", max_length=200)
    label: str = Field(default="", max_length=200)


class ResumeExportRequest(BaseModel):
    """Preview blocks to render as a LaTeX source file or PDF."""

    blocks: list[ResumeBlock] = Field(..., min_length=1, max_length=500)
