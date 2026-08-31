"""TailorCV backend - FastAPI application."""

import logging
import os

from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import ValidationError
from starlette.middleware.sessions import SessionMiddleware

from database import Base, engine
from models import ErrorResponse, TailorRequest, TailorResponse
from services.ai_service import AIServiceError, tailor_resume
from auth import router as auth_router, get_current_user


logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("resume_tailor")


app = FastAPI(
    title="TailorCV API",
    description="AI-powered Job Description -> Resume Tailor backend.",
    version="1.0.0",
)


# Create database tables
Base.metadata.create_all(bind=engine)


# Session middleware for Google OAuth
app.add_middleware(
    SessionMiddleware,
    secret_key=os.getenv("SESSION_SECRET"),
)


# Authentication routes
app.include_router(auth_router)


# Allowed frontend origins
FRONTEND_ORIGINS = [
    origin.strip()
    for origin in os.getenv(
        "FRONTEND_URL",
        "http://localhost:5173",
    ).split(",")
    if origin.strip()
]


# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=FRONTEND_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.api_route("/api/health", methods=["GET", "HEAD"])
def health_check() -> dict:
    return {"status": "ok"}


@app.post(
    "/api/tailor",
    response_model=TailorResponse,
    responses={
        400: {"model": ErrorResponse},
        401: {"model": ErrorResponse},
        502: {"model": ErrorResponse},
    },
)
def tailor(
    request: TailorRequest,
    current_user=Depends(get_current_user),
) -> TailorResponse:
    """
    Analyze a resume against a job description.

    User must be authenticated.
    """

    try:
        result = tailor_resume(
            request.resume,
            request.job_description,
        )

    except AIServiceError as exc:
        logger.error("AI service failure: %s", exc)

        raise HTTPException(
            status_code=502,
            detail=str(exc),
        ) from exc

    try:
        return TailorResponse(**result)

    except ValidationError as exc:
        logger.error(
            "AI response failed validation: %s",
            exc,
        )

        raise HTTPException(
            status_code=502,
            detail=(
                "The AI service returned data in an "
                "unexpected format. Please try again."
            ),
        ) from exc


@app.exception_handler(404)
async def not_found_handler(_request, _exc):
    from fastapi.responses import JSONResponse

    return JSONResponse(
        status_code=404,
        content={"detail": "Not found."},
    )