from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# Adjust to environment variables in production
DB_USER = "welcomeuser"
DB_PASS = "MyWorkPlace123"
DB_HOST = "localhost"
DB_NAME = "flight_ai_game"

# SQLAlchemy URL format dialect+driver://user:pass@host/db[7][13][19]
DATABASE_URL = f"mysql+pymysql://{DB_USER}:{DB_PASS}@{DB_HOST}/{DB_NAME}"

engine = create_engine(DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
