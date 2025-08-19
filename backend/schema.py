from pydantic import BaseModel, Field
from typing import List, Dict, Optional
from enum import Enum

class Stage(str, Enum):
    easy = "easy"
    medium = "medium"
    hard = "hard"
    done = "done"

class StartRequest(BaseModel):
    display_name: str = Field(min_length=1, max_length=80)

class ImageOut(BaseModel):
    session_image_id: str
    image_id: str
    image_url: str
    level: str
    stage_order: int
    stage_name: Stage

class StartResponse(BaseModel):
    session_id: str
    current_stage: Stage
    images: List[ImageOut]  # images for the current stage to answer

class SubmitStageRequest(BaseModel):
    items: List[Dict[str, str]]  # {session_image_id, user_prompt}

class StageResult(BaseModel):
    next_stage: Stage
    eliminated_at: Optional[str] = None
    passed: bool
    images_completed: int
    eliminated_prompt: Optional[str] = None
    eliminated_image_url: Optional[str] = None
    matches: Optional[List[Dict]] = None  # [{stage_order, level, score, points}]

class FinalResult(BaseModel):
    total_score: float
    images_completed: int
    state: str  # completed

class LeaderboardRow(BaseModel):
    display_name: str
    total_score: float
    state: str
    eliminated_at: Optional[str] = None
    created_at: str

class ResultsImage(BaseModel):
    session_image_id: str
    stage_order: int
    stage_name: Stage
    level: str
    score: float | None = None
    image_id: str
    image_url: str
    user_prompt: str | None = None

class StatusResponse(BaseModel):
    state: str
    current_stage: Stage
    total_score: float | None = None
    images_completed: int
    eliminated_at: str | None = None
    images: List[ResultsImage] = []
