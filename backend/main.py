"""TailorCV backend - FastAPI application."""

import logging
import os
from io import BytesIO

from dotenv import load_dotenv

load_dotenv()

from docx import Document
from fastapi import (
    Depends,
    FastAPI,
    File,
    Form,
    HTTPException,
    UploadFile,
)
from fastapi.concurrency import run_in_threadpool
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, Response
from pydantic import ValidationError
from pypdf import PdfReader
from starlette.middleware.sessions import SessionMiddleware

from auth import get_current_user
from auth import router as auth_router
from database import Base, engine
from models import (
    ErrorResponse,
    LatexTailorResponse,
    ResumeExportRequest,
    TailorResponse,
)
from services.ai_service import AIServiceError, tailor_resume
from services.latex_service import (
    LatexError,
    build_latex,
    pdflatex_available,
    render_one_page,
)
from services.latex_tailor_service import LatexInputError, tailor_latex_resume

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
SESSION_SECRET = os.getenv("SESSION_SECRET")
if not SESSION_SECRET:
    if os.getenv("ENVIRONMENT") == "production":
        raise RuntimeError(
            "SESSION_SECRET environment variable is required in production."
        )
    SESSION_SECRET = "dev-session-secret"

app.add_middleware(
    SessionMiddleware,
    secret_key=SESSION_SECRET,
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

# Include local development origins if not already configured
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

            text = "\n".join(page.extract_text() or "" for page in pdf.pages)

        # DOCX
        elif extension == ".docx":
            document = Document(BytesIO(file_bytes))

            text = "\n".join(paragraph.text for paragraph in document.paragraphs)

            # Also extract table text
            for table in document.tables:
                for row in table.rows:
                    text += "\n" + " ".join(cell.text for cell in row.cells)

        else:
            raise HTTPException(
                status_code=400,
                detail="Please upload a PDF or DOCX resume.",
            )

        if not text.strip():
            raise HTTPException(
                status_code=400,
                detail=(
                    "No readable text found in your resume. Scanned PDFs require OCR."
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
    job_description: str = Form(...),
    resume_text: str | None = Form(None),
    resume_file: UploadFile | None = File(None),
    current_user=Depends(get_current_user),
) -> TailorResponse:
    """
    Analyze a resume against a job description.

    The resume is either pasted as text (``resume_text``) or uploaded as a
    PDF/DOCX file (``resume_file``). Pasted text takes precedence.

    User must be authenticated.
    """

    try:
        # Validate job description
        if not job_description.strip():
            raise HTTPException(
                status_code=400,
                detail="Please provide a job description.",
            )

        if resume_text and resume_text.strip():
            resume_text = resume_text.strip()

            if len(resume_text) > 50_000:
                raise HTTPException(
                    status_code=400,
                    detail="Resume text is too long (50,000 characters maximum).",
                )

        elif resume_file is not None and resume_file.filename:
            filename = resume_file.filename
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

            resume_text = extract_resume_text(filename, file_bytes)

        else:
            raise HTTPException(
                status_code=400,
                detail="Please paste your resume or upload a PDF/DOCX file.",
            )

        logger.info(
            "Resume received: %s characters",
            len(resume_text),
        )

        # Run the blocking AI call off the event loop
        result = await run_in_threadpool(
            tailor_resume,
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


# Tailor a LaTeX resume, keeping the user's own template
@app.post(
    "/api/tailor/latex",
    response_model=LatexTailorResponse,
    responses={
        400: {"model": ErrorResponse},
        401: {"model": ErrorResponse},
        502: {"model": ErrorResponse},
    },
)
async def tailor_latex(
    job_description: str = Form(...),
    latex_source: str | None = Form(None),
    latex_file: UploadFile | None = File(None),
    current_user=Depends(get_current_user),
) -> LatexTailorResponse:
    """
    Tailor a LaTeX resume to a job description.

    The LaTeX is either pasted (``latex_source``) or uploaded as a ``.tex``
    file (``latex_file``). The preamble is kept unchanged; only the body is
    edited. Returns the tailored LaTeX and its compiled PDF.

    User must be authenticated.
    """
    if not job_description.strip():
        raise HTTPException(
            status_code=400,
            detail="Please provide a job description.",
        )

    source = latex_source or ""

    if not source.strip() and latex_file is not None and latex_file.filename:
        if not latex_file.filename.lower().endswith(".tex"):
            raise HTTPException(
                status_code=400,
                detail="Please upload a .tex file.",
            )
        raw = await latex_file.read(1024 * 1024 + 1)
        if len(raw) > 1024 * 1024:
            raise HTTPException(
                status_code=400,
                detail="LaTeX file must be smaller than 1 MB.",
            )
        source = raw.decode("utf-8", errors="replace")

    if not source.strip():
        raise HTTPException(
            status_code=400,
            detail="Please paste your LaTeX resume or upload a .tex file.",
        )

    try:
        result = await run_in_threadpool(
            tailor_latex_resume,
            source,
            job_description.strip(),
        )
        return LatexTailorResponse(**result)

    except LatexInputError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    except AIServiceError as exc:
        logger.error("LaTeX tailoring failed: %s", exc)
        raise HTTPException(status_code=502, detail=str(exc)) from exc

    except LatexError as exc:
        logger.error("LaTeX compile unavailable: %s", exc)
        raise HTTPException(
            status_code=502,
            detail="PDF generation is unavailable on the server right now.",
        ) from exc

    except ValidationError as exc:
        logger.error("LaTeX tailoring response failed validation: %s", exc)
        raise HTTPException(
            status_code=502,
            detail="The AI service returned data in an unexpected format. Please try again.",
        ) from exc


# Resume export endpoints
@app.post("/api/resume/tex")
async def export_resume_tex(
    payload: ResumeExportRequest,
    current_user=Depends(get_current_user),
) -> Response:
    """Return the tailored resume as an editable LaTeX source file.

    When pdflatex is available, the source uses the same one-page layout as
    the PDF export; otherwise the default layout is returned.
    """
    blocks = [block.model_dump() for block in payload.blocks]
    source = build_latex(blocks)
    if pdflatex_available():
        try:
            source, _pdf = await run_in_threadpool(render_one_page, blocks)
        except LatexError as exc:
            logger.warning("One-page fitting failed; using default layout: %s", exc)
    return Response(
        content=source,
        media_type="application/x-tex; charset=utf-8",
        headers={
            "Content-Disposition": 'attachment; filename="TailorCV-Tailored-Resume.tex"'
        },
    )


@app.post(
    "/api/resume/pdf",
    responses={401: {"model": ErrorResponse}, 502: {"model": ErrorResponse}},
)
async def export_resume_pdf(
    payload: ResumeExportRequest,
    current_user=Depends(get_current_user),
) -> Response:
    """Compile the tailored resume to a one-page PDF."""
    blocks = [block.model_dump() for block in payload.blocks]

    try:
        _source, pdf_bytes = await run_in_threadpool(render_one_page, blocks)
    except LatexError as exc:
        logger.error("PDF generation failed: %s", exc)
        raise HTTPException(
            status_code=502,
            detail="Could not generate the PDF. Please download the .tex file instead.",
        ) from exc

    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": 'attachment; filename="TailorCV-Tailored-Resume.pdf"'
        },
    )


@app.exception_handler(404)
async def not_found_handler(_request, _exc):
    return JSONResponse(
        status_code=404,
        content={"detail": "Not found."},
    )
