import os
import re
import numpy as np
from functools import lru_cache
from sentence_transformers import SentenceTransformer

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
LOCAL_MODEL_PATH = os.path.join(SCRIPT_DIR, "model", "all-MiniLM-L6-v2")

@lru_cache(maxsize=1)
def _load_model():
    if not os.path.isdir(LOCAL_MODEL_PATH):
        raise RuntimeError(
            f"Local model not found at: {LOCAL_MODEL_PATH}. Expected: backend/model/all-MiniLM-L6-v2"
        )
    return SentenceTransformer(LOCAL_MODEL_PATH)

def normalize(text: str) -> str:
    return re.sub(r"\s+", " ", re.sub(r"[^a-zA-Z0-9\s]", " ", text.lower())).strip()

def cosine(a: np.ndarray, b: np.ndarray) -> float:
    a = np.asarray(a).reshape(-1)
    b = np.asarray(b).reshape(-1)
    denom = (np.linalg.norm(a) * np.linalg.norm(b)) + 1e-8
    return float(np.dot(a, b) / denom)

def score_prompt(user_prompt: str, original_prompt: str) -> float:
    model = _load_model()
    u, o = normalize(user_prompt), normalize(original_prompt)
    u_emb = model.encode(u, normalize_embeddings=False)
    o_emb = model.encode(o, normalize_embeddings=False)
    score = max(0.0, min(1.0, cosine(u_emb, o_emb))) * 100.0
    return round(score, 2)
