from fastapi import APIRouter, HTTPException, UploadFile, File
from pydantic import BaseModel, Field

from backend.services.ai_json_service import generate_structured_json
from backend.services.lecture_service import process_lecture_video

router = APIRouter()


# ─────────────────────────────────────────
# EXISTING MODELS (unchanged)
# ─────────────────────────────────────────
class LectureAnalyzeRequest(BaseModel):
    topic: str = Field(..., min_length=2, max_length=120)
    transcript: str = Field(..., min_length=20)


class LectureTimestamp(BaseModel):
    start: str
    end: str
    summary: str


class LectureAnalyzeResponse(BaseModel):
    topic: str
    timestamps: list[LectureTimestamp]


# ─────────────────────────────────────────
# EXISTING ENDPOINT (unchanged)
# ─────────────────────────────────────────
@router.post("/analyze-lecture", response_model=LectureAnalyzeResponse)
def analyze_lecture(payload: LectureAnalyzeRequest):
    prompt = f"""
You are a lecture analyzer.
Find the most relevant timestamp ranges in this transcript for the requested topic.

Topic: {payload.topic}
Transcript:
{payload.transcript}

Return ONLY valid JSON with this schema:
{{
  "topic": "{payload.topic}",
  "timestamps": [
    {{
      "start": "10",
      "end": "50",
      "summary": "Short explanation of what is covered in this segment"
    }}
  ]
}}

Rules:
- Keep 1-5 timestamp entries.
- start and end should be concise time markers from transcript context.
- summaries should be short and factual.
""".strip()

    try:
        data = generate_structured_json(prompt)
    except Exception as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc

    try:
        return LectureAnalyzeResponse.model_validate(data)
    except Exception as exc:
        raise HTTPException(
            status_code=502,
            detail=f"AI response parsing failed for lecture analyzer: {exc}",
        ) from exc


# ─────────────────────────────────────────
# NEW ENDPOINT — Video Upload + Full Pipeline
# ─────────────────────────────────────────
class TopicTimestamp(BaseModel):
    title: str
    start: str
    end: str
    summary: str


class LectureUploadResponse(BaseModel):
    filename: str
    transcript: str
    topics: list[TopicTimestamp]


@router.post("/upload", response_model=LectureUploadResponse)
async def upload_lecture(file: UploadFile = File(...)):
    # Validate file type
    allowed_types = ["video/mp4", "video/mkv", "video/webm", "video/avi", "video/mov"]
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type '{file.content_type}'. Allowed: mp4, mkv, webm, avi, mov"
        )

    try:
        file_bytes = await file.read()
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"Failed to read file: {exc}") from exc

    try:
        result = process_lecture_video(file_bytes, file.filename)
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Unexpected error: {exc}") from exc

    return LectureUploadResponse(
        filename=file.filename,
        transcript=result["transcript"],
        topics=result["topics"]
    )