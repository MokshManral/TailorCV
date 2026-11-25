import os
import re

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

load_dotenv()


DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL environment variable is not set.")

# Hosts like Render hand out "postgres://" or "postgresql://" URLs, which
# SQLAlchemy maps to psycopg2. The app installs psycopg 3, so point plain
# Postgres URLs at that driver. URLs that already name a driver are unchanged.
DATABASE_URL = re.sub(r"^postgres(?:ql)?://", "postgresql+psycopg://", DATABASE_URL)


engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
)


SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)


Base = declarative_base()


def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()
