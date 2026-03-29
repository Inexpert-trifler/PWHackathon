import json
from pathlib import Path

from fastapi import APIRouter
from services.ai_service import generate_answer


router = APIRouter()
DATA_PATH = Path(__file__).resolve().parent.parent / "data" / "lectures.json"


@router.get("/search")
def get_search(query: str):
    with DATA_PATH.open("r", encoding="utf-8") as f:
        lectures = json.load(f)

    query_lower = query.lower().strip()
    filtered = [
        item
        for item in lectures
        if query_lower in item.get("topic", "").lower()
        or query_lower in item.get("content", "").lower()
    ]

    results = []
    for item in filtered:
        try:
            summary = generate_answer(
                "Summarize this lecture snippet in one short sentence for a student: "
                + item.get("content", "")
            ).strip()
        except Exception:
            summary = item.get("content", "")
        results.append(
            {
                "id": item.get("id"),
                "title": item.get("topic", "Untitled lecture"),
                "subject": "Physics",
                "timestamp": item.get("timestamp", ""),
                "summary": summary,
                "thumb": "",
            }
        )
    return results
