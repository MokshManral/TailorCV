"""TailorCV backend - FastAPI application."""

import logging
import os

from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import ValidationError

from models import ErrorResponse, TailorRequest, TailorResponse
from services.ai_service import AIServiceError, tailor_resume

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("resume_tailor")

app = FastAPI(
    title="TailorCV API",
    description="AI-powered Job Description -> Resume Tailor backend.",
    version="1.0.0",
)

FRONTEND_ORIGINS = os.getenv("FRONTEND_ORIGIN", "http://localhost:5173").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=FRONTEND_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
def health_check() -> dict:
    """Simple liveness check."""
    return {"status": "ok"}


@app.post(
    "/api/tailor",
    response_model=TailorResponse,
    responses={400: {"model": ErrorResponse}, 502: {"model": ErrorResponse}},
)
def tailor(request: TailorRequest) -> TailorResponse:
    """Analyze a resume against a job description and return a tailored result."""
    try:
        result = tailor_resume(request.resume, request.job_description)
    except AIServiceError as exc:
        logger.error("AI service failure: %s", exc)
        raise HTTPException(status_code=502, detail=str(exc)) from exc

    try:
        return TailorResponse(**result)
    except ValidationError as exc:
        logger.error("AI response failed validation: %s", exc)
        raise HTTPException(
            status_code=502,
            detail="The AI service returned data in an unexpected format. Please try again.",
        ) from exc


@app.exception_handler(404)
async def not_found_handler(_request, _exc):
    from fastapi.responses import JSONResponse

    return JSONResponse(status_code=404, content={"detail": "Not found."})
