from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import List
from database import get_db
import schema as s
import models as m
import crud
from scoring_service import score_prompt

app = FastAPI(title="Flight with AI — Progressive Prompt Game")

# NOTE: This path assumes you run `uvicorn main:app --reload` from inside the backend/ folder.
# If you run from project root with `uvicorn backend.main:app --reload`, change to directory="backend/static".
app.mount("/static", StaticFiles(directory="static"), name="static")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def url_for_path(fp: str) -> str:
    return f"/static/{fp}"

# Game configuration
EASY_COUNT = 1
MEDIUM_COUNT = 2
HARD_COUNT = 2
EASY_PASS = 70.0
MEDIUM_PASS = 75.0
HARD_PASS = 85.0

# Points per image (max total = 200)
WEIGHT_EASY = 20   # 1 image
WEIGHT_MED  = 40   # per image (2 images)
WEIGHT_HARD = 50   # per image (2 images)

def img_points(level: m.Level, score_pct: float) -> int:
    if level == m.Level.easy:
        return int(score_pct * (WEIGHT_EASY / 100.0))
    if level == m.Level.medium:
        return int(score_pct * (WEIGHT_MED / 100.0))
    return int(score_pct * (WEIGHT_HARD / 100.0))

@app.post("/api/start", response_model=s.StartResponse)
def start(req: s.StartRequest, db: Session = Depends(get_db)):
    name = req.display_name.strip()
    if not name:
        raise HTTPException(400, "Display name required.")

    # Get or create user by unique display_name
    user = crud.upsert_user(db, name)

    # Prevent reattempts if any prior session is completed or eliminated
    if crud.has_any_finished_or_eliminated(db, user.id):
        raise HTTPException(
            status_code=403,
            detail="No reruns, ace! You've already flown this mission. Leaderboard’s that way."
        )

    # If there’s an active session, resume it
    active = crud.has_active_session(db, user.id)
    if active:
        sess = active
        rows = crud.get_stage_items(db, sess.id, sess.current_stage)
        images = [{
            "session_image_id": r["session_image_id"],
            "image_id": r["image_id"],
            "image_url": url_for_path(r["file_path"]),
            "level": r["level"],
            "stage_order": int(r["stage_order"]),
            "stage_name": r["stage_name"]
        } for r in rows]
        return {"session_id": sess.id, "current_stage": sess.current_stage.value, "images": images}

    # Create a fresh session
    sess = crud.create_session(db, user.id)

    # Assign all images upfront (locks randomness for the session)
    crud.assign_stage_images(db, sess.id, m.Stage.easy, m.Level.easy, EASY_COUNT, start_order=1)
    crud.assign_stage_images(db, sess.id, m.Stage.medium, m.Level.medium, MEDIUM_COUNT, start_order=EASY_COUNT + 1)
    crud.assign_stage_images(db, sess.id, m.Stage.hard, m.Level.hard, HARD_COUNT, start_order=EASY_COUNT + MEDIUM_COUNT + 1)

    rows = crud.get_stage_items(db, sess.id, m.Stage.easy)
    images = [{
        "session_image_id": r["session_image_id"],
        "image_id": r["image_id"],
        "image_url": url_for_path(r["file_path"]),
        "level": str(m.Level.easy.value),
        "stage_order": int(r["stage_order"]),
        "stage_name": m.Stage.easy.value
    } for r in rows]
    return {"session_id": sess.id, "current_stage": m.Stage.easy.value, "images": images}

@app.get("/api/session/{session_id}/next_stage", response_model=s.StartResponse)
def next_stage(session_id: str, db: Session = Depends(get_db)):
    sess = crud.get_session(db, session_id)
    if not sess:
        raise HTTPException(404, "Session not found.")
    if sess.state != m.State.active:
        raise HTTPException(400, "Session not active.")

    if sess.current_stage == m.Stage.easy:
        stage = m.Stage.easy
    elif sess.current_stage == m.Stage.medium:
        stage = m.Stage.medium
    elif sess.current_stage == m.Stage.hard:
        stage = m.Stage.hard
    else:
        raise HTTPException(400, "No active stage.")

    rows = crud.get_stage_items(db, session_id, stage)
    images = [{
        "session_image_id": r["session_image_id"],
        "image_id": r["image_id"],
        "image_url": url_for_path(r["file_path"]),
        "level": r["level"],
        "stage_order": int(r["stage_order"]),
        "stage_name": r["stage_name"]
    } for r in rows]

    return {"session_id": sess.id, "current_stage": stage.value, "images": images}

@app.post("/api/session/{session_id}/submit_stage", response_model=s.StageResult)
def submit_stage(session_id: str, req: s.SubmitStageRequest, db: Session = Depends(get_db)):
    sess = crud.get_session(db, session_id)
    if not sess:
        raise HTTPException(404, "Session not found.")
    if sess.state != m.State.active:
        raise HTTPException(400, f"Session not active (state={sess.state.value}).")

    stage = sess.current_stage
    if stage not in (m.Stage.easy, m.Stage.medium, m.Stage.hard):
        raise HTTPException(400, "No active stage to submit.")

    rows = crud.get_stage_items(db, session_id, stage)
    stage_map = {r["session_image_id"]: r for r in rows}
    expected = 1 if stage == m.Stage.easy else (2 if stage == m.Stage.medium else 2)
    if len(req.items) != expected:
        raise HTTPException(400, f"Expected {expected} prompts for stage {stage.value}, got {len(req.items)}.")

    for item in req.items:
        sid = item.get("session_image_id")
        up = (item.get("user_prompt") or "").strip()
        if not sid or not up:
            raise HTTPException(400, "Each item must include session_image_id and non-empty user_prompt.")
        if sid not in stage_map:
            raise HTTPException(400, f"session_image_id {sid} not part of current stage.")
        original = stage_map[sid]["original_prompt"]
        level = m.Level(stage_map[sid]["level"])
        score_pct = score_prompt(up, original)
        points = img_points(level, score_pct)
        crud.update_prompt_score_points(db, sid, up, score_pct, points)

    db.commit()

    completed = crud.count_completed_images(db, session_id)
    crud.set_images_completed(db, session_id, completed)
    db.commit()

    if stage == m.Stage.easy:
        details = crud.get_failing_details_for_stage(db, session_id, stage, 70.0)
        if details and "eliminated_at" in details:
            eliminated_at = details["eliminated_at"]
            total_pts_now = crud.sum_points(db, session_id)
            crud.set_eliminated_with_score(db, session_id, eliminated_at, completed, m.Stage.easy, details["image_order"], total_pts_now)
            db.commit()
            return {
                "next_stage": m.Stage.done.value,
                "eliminated_at": eliminated_at,
                "passed": False,
                "images_completed": completed,
                "eliminated_prompt": details["eliminated_prompt"],
                "eliminated_image_url": url_for_path(details["eliminated_image_url"]),
                "matches": details["matches"]
            }
        crud.set_stage(db, session_id, m.Stage.medium)
        db.commit()
        matches = crud.get_stage_matches(db, session_id, m.Stage.easy)
        completed_now = crud.count_completed_images(db, session_id)
        return {
            "next_stage": m.Stage.medium.value,
            "passed": True,
            "images_completed": completed_now,
            "matches": matches
        }

    if stage == m.Stage.medium:
        details = crud.get_failing_details_for_stage(db, session_id, stage, 75.0)
        if details and "eliminated_at" in details:
            eliminated_at = details["eliminated_at"]
            total_pts_now = crud.sum_points(db, session_id)
            crud.set_eliminated_with_score(db, session_id, eliminated_at, completed, m.Stage.medium, details["image_order"], total_pts_now)
            db.commit()
            return {
                "next_stage": m.Stage.done.value,
                "eliminated_at": eliminated_at,
                "passed": False,
                "images_completed": completed,
                "eliminated_prompt": details["eliminated_prompt"],
                "eliminated_image_url": url_for_path(details["eliminated_image_url"]),
                "matches": details["matches"]
            }
        crud.set_stage(db, session_id, m.Stage.hard)
        db.commit()
        matches = crud.get_stage_matches(db, session_id, m.Stage.medium)
        completed_now = crud.count_completed_images(db, session_id)
        return {
            "next_stage": m.Stage.hard.value,
            "passed": True,
            "images_completed": completed_now,
            "matches": matches
        }

    if stage == m.Stage.hard:
        details = crud.get_failing_details_for_stage(db, session_id, stage, 85.0)
        if details and "eliminated_at" in details:
            eliminated_at = details["eliminated_at"]
            total_pts_now = crud.sum_points(db, session_id)
            crud.set_eliminated_with_score(db, session_id, eliminated_at, completed, m.Stage.hard, details["image_order"], total_pts_now)
            db.commit()
            return {
                "next_stage": m.Stage.done.value,
                "eliminated_at": eliminated_at,
                "passed": False,
                "images_completed": completed,
                "eliminated_prompt": details["eliminated_prompt"],
                "eliminated_image_url": url_for_path(details["eliminated_image_url"]),
                "matches": details["matches"]
            }
        total_pts = crud.sum_points(db, session_id)
        crud.set_completed(db, session_id, total_score=total_pts, images_completed=completed)
        db.commit()
        matches = crud.get_stage_matches(db, session_id, m.Stage.hard)
        completed_now = crud.count_completed_images(db, session_id)
        return {
            "next_stage": m.Stage.done.value,
            "passed": True,
            "images_completed": completed_now,
            "matches": matches
        }

    raise HTTPException(400, "Invalid stage logic.")

@app.get("/api/session/{session_id}/status")
def status(session_id: str, db: Session = Depends(get_db)):
    sess = crud.get_session(db, session_id)
    if not sess:
        raise HTTPException(404, "Session not found.")

    # Fetch all per-image results for dashboard (ordered by stage_order)
    rows = crud.get_all_session_items_for_results(db, session_id)
    images = [{
        "session_image_id": r["session_image_id"],
        "stage_order": int(r["stage_order"]),
        "stage_name": r["stage_name"],
        "level": r["level"],
        "score": float(r["score"]) if r["score"] is not None else None,
        "image_id": r["image_id"],
        "image_url": url_for_path(r["file_path"]),
        "user_prompt": r["user_prompt"]
    } for r in rows]

    return {
        "state": sess.state.value,
        "current_stage": sess.current_stage.value,
        "total_score": float(sess.total_score) if sess.total_score is not None else None,
        "images_completed": int(sess.images_completed or 0),
        "eliminated_at": sess.eliminated_at,
        "images": images
    }

@app.get("/api/leaderboard", response_model=List[s.LeaderboardRow])
def leaderboard(db: Session = Depends(get_db), limit: int = 50):
    rows = db.execute(
        text("""
        SELECT u.display_name, s.total_score, s.state, s.eliminated_at, s.created_at
        FROM sessions s
        JOIN users u ON u.id = s.user_id
        WHERE s.total_score IS NOT NULL OR s.state = 'eliminated'
        ORDER BY 
          (s.total_score IS NOT NULL) DESC,  -- completed first
          s.total_score DESC,
          s.created_at ASC
        LIMIT :lim
        """),
        {"lim": limit}
    ).mappings().all()
    return [{
        "display_name": r["display_name"],
        "total_score": float(r["total_score"] or 0),
        "state": r["state"],
        "eliminated_at": r["eliminated_at"],
        "created_at": str(r["created_at"])
    } for r in rows]
