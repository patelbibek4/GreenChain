from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base


# =========================================================
# DATABASE CONFIGURATION
# =========================================================

DATABASE_URL = "postgresql://postgres:2059@localhost:5432/greenchain"



# =========================================================
# DATABASE ENGINE
# =========================================================

engine = create_engine(
    DATABASE_URL
)


# =========================================================
# DATABASE SESSION
# =========================================================

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)


# =========================================================
# BASE MODEL
# =========================================================

Base = declarative_base()


# =========================================================
# DATABASE DEPENDENCY
# =========================================================

def get_db():
    """
    Create a database session for each request
    and close it after the request is finished.
    """

    db = SessionLocal()

    try:
        yield db

    finally:
        db.close()