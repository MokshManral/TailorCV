
"""TailorCV backend - FastAPI application."""

import logging
import os
from io import BytesIO

from dotenv import load_dotenv

load_dotenv()

from fastapi import (
    FastAPI,
    HTTPException,
    Depends,
    UploadFile,
    File,
    Form,
)
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import ValidationError
from starlette.middleware.sessions import SessionMiddleware

from pypdf import PdfReader
from docx import Document

from database import Base, engine
from models import ErrorResponse, TailorResponse
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


# Session middleware
app.add_middleware(
    SessionMiddleware,
    secret_key=os.environ["SESSION_SECRET"],
    same_site="none" if os.getenv("ENVIRONMENT") == "production" else "lax",
    https_only=os.getenv("ENVIRONMENT") == "production",
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

# Include local development origins
for origin in [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]:
    if origin not in FRONTEND_ORIGINS:
        FRONTEND_ORIGINS.append(origin)


# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=FRONTEND_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Extract resume text
def extract_resume_text(filename: str, file_bytes: bytes) -> str:
    extension = os.path.splitext(filename)[1].lower()

    try:
        # PDF
        if extension == ".pdf":
            pdf = PdfReader(BytesIO(file_bytes))

            text = "\n".join(
                page.extract_text() or ""
                for page in pdf.pages
            )

        # DOCX
        elif extension == ".docx":
            document = Document(BytesIO(file_bytes))

            text = "\n".join(
                paragraph.text
                for paragraph in document.paragraphs
            )

            # Also extract table text
            for table in document.tables:
                for row in table.rows:
                    text += "\n" + " ".join(
                        cell.text for cell in row.cells
                    )

        else:
            raise HTTPException(
                status_code=400,
                detail="Please upload a PDF or DOCX resume.",
            )

        if not text.strip():
            raise HTTPException(
                status_code=400,
                detail=(
                    "No readable text found in your resume. "
                    "Scanned PDFs require OCR."
                ),
            )

        return text.strip()

    except HTTPException:
        raise

    except Exception as exc:
        logger.exception("Resume extraction failed")

        raise HTTPException(
            status_code=400,
            detail="Unable to read this resume file. Please try another file.",
        ) from exc


@app.api_route("/api/health", methods=["GET", "HEAD"])
def health_check() -> dict:
    return {"status": "ok"}


# Resume tailoring endpoint
@app.post(
    "/api/tailor",
    response_model=TailorResponse,
    responses={
        400: {"model": ErrorResponse},
        401: {"model": ErrorResponse},
        502: {"model": ErrorResponse},
    },
)
async def tailor(
    resume_file: UploadFile = File(...),
    job_description: str = Form(...),
    current_user=Depends(get_current_user),
) -> TailorResponse:
    """
    Upload a PDF or DOCX resume and analyze it
    against a job description.

    User must be authenticated.
    """

    try:
        # Validate filename
        filename = resume_file.filename or ""

        extension = os.path.splitext(filename)[1].lower()

        if extension not in [".pdf", ".docx"]:
            raise HTTPException(
                status_code=400,
                detail="Only PDF and DOCX files are supported.",
            )

        # Read uploaded file (10 MB maximum)
        file_bytes = await resume_file.read(10 * 1024 * 1024 + 1)

        if not file_bytes:
            raise HTTPException(
                status_code=400,
                detail="Uploaded resume is empty.",
            )

        if len(file_bytes) > 10 * 1024 * 1024:
            raise HTTPException(
                status_code=400,
                detail="Resume file must be smaller than 10 MB.",
            )

        # Validate job description
        if not job_description.strip():
            raise HTTPException(
                status_code=400,
                detail="Please provide a job description.",
            )

        # Extract resume text
        resume_text = extract_resume_text(
            filename,
            file_bytes,
        )

        logger.info(
            "Resume extracted successfully: %s characters",
            len(resume_text),
        )

        # Existing AI service
        result = tailor_resume(
            resume_text,
            job_description,
        )

        # Validate AI response
        return TailorResponse(**result)

    except HTTPException:
        raise

    except AIServiceError as exc:
        logger.error("AI service failure: %s", exc)

        raise HTTPException(
            status_code=502,
            detail=str(exc),
        ) from exc

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

    except Exception as exc:
        logger.exception("Unexpected tailoring error")

        raise HTTPException(
            status_code=500,
            detail="Resume analysis failed. Please try again.",
        ) from exc


@app.exception_handler(404)
async def not_found_handler(_request, _exc):
    return JSONResponse(
        status_code=404,
        content={"detail": "Not found."},
    )
