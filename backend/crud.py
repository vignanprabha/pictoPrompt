import uuid
from typing import Optional
from sqlalchemy import select, func, text, desc
from sqlalchemy.orm import Session
from models import User, Image, Session as GameSession, SessionImage, State, Stage, Level

def gen_id() -> str:
    return str(uuid.uuid4())

# Strong user lookup by unique display_name
def get_user_by_name(db: Session, display_name: str) -> Optional[User]:
    return db.execute(
        select(User).where(User.display_name == display_name)
    ).scalar_one_or_none()

def upsert_user(db: Session, display_name: str) -> User:
    u = get_user_by_name(db, display_name)
    if u:
        return u
    u = User(id=gen_id(), display_name=display_name)
    db.add(u); db.commit(); db.refresh(u)
    return u

# REQUIRED: create_session (this is what main.py calls)
def create_session(db: Session, user_id: str) -> GameSession:
    s = GameSession(id=gen_id(), user_id=user_id, state=State.active, current_stage=Stage.easy)
    db.add(s); db.commit(); db.refresh(s)
    return s

def get_latest_session_for_user(db: Session, user_id: str) -> Optional[GameSession]:
    return db.execute(
        select(GameSession)
        .where(GameSession.user_id == user_id)
        .order_by(desc(GameSession.created_at))
        .limit(1)
    ).scalar_one_or_none()

def has_any_finished_or_eliminated(db: Session, user_id: str) -> bool:
    row = db.execute(
        text("""
          SELECT 1
          FROM sessions
          WHERE user_id = :uid AND state IN ('completed','eliminated')
          LIMIT 1
        """),
        {"uid": user_id}
    ).first()
    return row is not None

def has_active_session(db: Session, user_id: str) -> Optional[GameSession]:
    return db.execute(
        select(GameSession)
        .where(GameSession.user_id == user_id, GameSession.state == State.active)
        .order_by(desc(GameSession.created_at))
        .limit(1)
    ).scalar_one_or_none()

def random_images(db: Session, level: Level, limit: int):
    return db.execute(
        select(Image).where(Image.level==level, Image.active==1).order_by(func.rand()).limit(limit)
    ).scalars().all()

def assign_stage_images(db: Session, session_id: str, stage: Stage, level: Level, count: int, start_order: int) -> list[SessionImage]:
    imgs = random_images(db, level, count)
    items = []
    for i, img in enumerate(imgs, start=1):
        si = SessionImage(
            id=gen_id(),
            session_id=session_id,
            image_id=img.id,
            level=level,
            stage_order=start_order + (i - 1),
            stage_name=stage
        )
        db.add(si)
        items.append(si)
    db.commit()
    return items

def get_session(db: Session, session_id: str) -> Optional[GameSession]:
    return db.execute(select(GameSession).where(GameSession.id==session_id)).scalar_one_or_none()

def get_stage_items(db: Session, session_id: str, stage: Stage):
    return db.execute(
        text("""
        SELECT si.id as session_image_id, si.stage_order, si.stage_name, si.level, si.score, si.points,
               i.id as image_id, i.file_path, i.original_prompt
        FROM session_images si
        JOIN images i ON i.id = si.image_id
        WHERE si.session_id = :sid AND si.stage_name = :stage
        ORDER BY si.stage_order
        """),
        {"sid": session_id, "stage": stage.value}
    ).mappings().all()

def update_prompt_score_points(db: Session, session_image_id: str, prompt: str, score: float, points: int):
    db.execute(
        text("UPDATE session_images SET user_prompt = :p, score = :s, points = :pts WHERE id = :id"),
        {"p": prompt, "s": score, "pts": points, "id": session_image_id}
    )

def count_completed_images(db: Session, session_id: str) -> int:
    return db.execute(
        text("SELECT COUNT(*) FROM session_images WHERE session_id = :sid AND score IS NOT NULL"),
        {"sid": session_id}
    ).scalar_one()

def sum_points(db: Session, session_id: str) -> int:
    return int(db.execute(
        text("SELECT COALESCE(SUM(points),0) FROM session_images WHERE session_id = :sid"),
        {"sid": session_id}
    ).scalar_one())

def sum_scores(db: Session, session_id: str) -> float:
    return float(db.execute(
        text("SELECT COALESCE(SUM(score),0) FROM session_images WHERE session_id = :sid"),
        {"sid": session_id}
    ).scalar_one())

def set_eliminated_with_score(db: Session, session_id: str, eliminated_at: str, images_completed: int, stage: Stage, image_order: int, total_points: int):
    db.execute(
        text("""
            UPDATE sessions 
            SET state = 'eliminated',
                eliminated_at = :el,
                images_completed = :ic,
                eliminated_stage = :st,
                eliminated_image_order = :ord,
                total_score = :tp
            WHERE id = :sid
        """),
        {"el": eliminated_at, "ic": images_completed, "sid": session_id, "st": stage.value, "ord": image_order, "tp": total_points}
    )

def set_stage(db: Session, session_id: str, stage: Stage):
    db.execute(
        text("UPDATE sessions SET current_stage = :st WHERE id = :sid"),
        {"st": stage.value, "sid": session_id}
    )

def set_completed(db: Session, session_id: str, total_score: float, images_completed: int):
    db.execute(
        text("UPDATE sessions SET state = 'completed', current_stage = 'done', total_score = :ts, images_completed = :ic, completed_at = NOW() WHERE id = :sid"),
        {"ts": total_score, "ic": images_completed, "sid": session_id}
    )

def get_session_image_prompt(db: Session, session_image_id: str):
    return db.execute(
        text("""
        SELECT si.id as session_image_id, i.original_prompt
        FROM session_images si
        JOIN images i ON i.id = si.image_id
        WHERE si.id = :id
        """),
        {"id": session_image_id}
    ).mappings().one_or_none()

def get_failing_details_for_stage(db: Session, session_id: str, stage: Stage, threshold: float):
    rows = db.execute(
        text("""
            SELECT 
              si.id as session_image_id,
              si.stage_order,
              si.stage_name,
              si.score,
              si.points,
              i.original_prompt,
              i.file_path,
              si.level
            FROM session_images si
            JOIN images i ON i.id = si.image_id
            WHERE si.session_id = :sid AND si.stage_name = :stage
            ORDER BY si.stage_order
        """),
        {"sid": session_id, "stage": stage.value}
    ).mappings().all()

    if not rows:
        return None

    base_order = rows[0]["stage_order"]
    matches = []
    failing_row = None
    for r in rows:
        idx_within = (int(r["stage_order"]) - base_order) + 1
        matches.append({
            "stage_order": idx_within,
            "level": r["level"],
            "score": float(r["score"]) if r["score"] is not None else 0.0,
            "points": int(r["points"] or 0)
        })
        if failing_row is None:
            if r["score"] is None or float(r["score"]) < threshold:
                failing_row = (idx_within, r["original_prompt"], r["file_path"])

    if failing_row:
        idx, prompt, fp = failing_row
        return {
            "eliminated_at": f"{stage.value}-{idx}",
            "eliminated_prompt": prompt,
            "eliminated_image_url": fp,
            "matches": matches,
            "image_order": idx
        }
    # passed
    return {"matches": matches, "image_order": None}

def get_stage_matches(db: Session, session_id: str, stage: Stage):
    rows = db.execute(
        text("""
            SELECT 
              si.stage_order,
              si.level,
              si.score,
              si.points
            FROM session_images si
            WHERE si.session_id = :sid AND si.stage_name = :stage
            ORDER BY si.stage_order
        """),
        {"sid": session_id, "stage": stage.value}
    ).mappings().all()
    if not rows:
        return []
    base = rows[0]["stage_order"]
    return [
        {
            "stage_order": int(r["stage_order"] - base + 1),
            "level": r["level"],
            "score": float(r["score"] or 0.0),
            "points": int(r["points"] or 0)
        } for r in rows
    ]

def set_images_completed(db: Session, session_id: str, images_completed: int):
    db.execute(
        text("UPDATE sessions SET images_completed = :ic WHERE id = :sid"),
        {"ic": images_completed, "sid": session_id}
    )
def get_all_session_items_for_results(db: Session, session_id: str):
    """
    Return all session images with fields needed for the results dashboard.
    """
    return db.execute(
        text("""
        SELECT 
            si.id AS session_image_id,
            si.stage_order,
            si.stage_name,
            si.level,
            si.score,
            si.user_prompt,
            i.id AS image_id,
            i.file_path
        FROM session_images si
        JOIN images i ON i.id = si.image_id
        WHERE si.session_id = :sid
        ORDER BY si.stage_order
        """),
        {"sid": session_id}
    ).mappings().all()