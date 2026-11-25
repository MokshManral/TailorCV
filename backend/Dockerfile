# TailorCV backend: FastAPI + pdflatex (TeX Live) for PDF export.
FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

# TeX Live for compiling resumes:
# - latex-base/recommended: article, hyperref, xcolor, microtype, geometry
# - latex-extra: enumitem, titlesec and most packages resume templates use
# - fonts-recommended + lmodern: Latin Modern, T1 fonts, marvosym
# --no-install-recommends skips documentation, which is most of TeX Live's size.
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        texlive-latex-base \
        texlive-latex-recommended \
        texlive-latex-extra \
        texlive-fonts-recommended \
        lmodern \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

# Run as an unprivileged user.
RUN useradd --create-home --uid 1000 app && chown -R app:app /app
USER app

# Render (and most hosts) provide PORT; default to 8000 locally.
ENV PORT=8000
EXPOSE 8000

# --proxy-headers: trust X-Forwarded-* from the host's load balancer so
# request URLs use https.
CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT} --proxy-headers --forwarded-allow-ips='*'"]
