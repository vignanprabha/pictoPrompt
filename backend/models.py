from sqlalchemy import Column, String, Enum, DateTime, Text, ForeignKey, DECIMAL, JSON, Integer, UniqueConstraint
from sqlalchemy.sql import func
import enum
from database import Base

class Level(str, enum.Enum):
    easy = "easy"
    medium = "medium"
    hard = "hard"

class State(str, enum.Enum):
    active = "active"        # playing
    completed = "completed"  # passed hard
    eliminated = "eliminated" # failed at a stage

class Stage(str, enum.Enum):
    easy = "easy"
    medium = "medium"
    hard = "hard"
    done = "done"

class User(Base):
    __tablename__ = "users"
    id = Column(String(36), primary_key=True)
    display_name = Column(String(80), unique=True, nullable=False)
    created_at = Column(DateTime, server_default=func.now())

class Image(Base):
    __tablename__ = "images"
    id = Column(String(36), primary_key=True)
    level = Column(Enum(Level), nullable=False)
    file_path = Column(String(255), nullable=False)
    original_prompt = Column(Text, nullable=False)
    negative_prompt = Column(Text)
    generator_model = Column(String(80))
    seed = Column(Integer)
    meta = Column(JSON)
    active = Column(Integer, default=1)
    created_at = Column(DateTime, server_default=func.now())

class Session(Base):
    __tablename__ = "sessions"
    id = Column(String(36), primary_key=True)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    state = Column(Enum(State), default=State.active, nullable=False)
    current_stage = Column(Enum(Stage), default=Stage.easy, nullable=False)
    total_score = Column(DECIMAL(6,2))  # only set if completed
    images_completed = Column(Integer, default=0) # count of images with scores
    eliminated_at = Column(String(20))   # "easy-1", "medium-2", "hard-1" or NULL
    created_at = Column(DateTime, server_default=func.now())
    completed_at = Column(DateTime)

class SessionImage(Base):
    __tablename__ = "session_images"
    id = Column(String(36), primary_key=True)
    session_id = Column(String(36), ForeignKey("sessions.id", ondelete="CASCADE"), nullable=False)
    image_id = Column(String(36), ForeignKey("images.id"), nullable=False)
    level = Column(Enum(Level), nullable=False)   # snapshot level
    stage_order = Column(Integer, nullable=False) # global order in game: 1..5
    stage_name = Column(Enum(Stage), nullable=False)  # easy, medium, hard at time of assignment
    user_prompt = Column(Text)
    score = Column(DECIMAL(5,2))
    created_at = Column(DateTime, server_default=func.now())
    __table_args__ = (UniqueConstraint('session_id','stage_order', name='uniq_session_stage_order'),)
