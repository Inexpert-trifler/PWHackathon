from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from services.ai_json_service import generate_structured_json


router = APIRouter()


class PerformanceRequest(BaseModel):
    marks: float = Field(..., ge=0)
    total: float = Field(..., gt=0)
    subject: str = Field(..., min_length=2, max_length=100)


class PerformanceResponse(BaseModel):
    weak_topics: list[str]
    strengths: list[str]
    improvement_plan: str


def _build_performance_prompt(marks: float, total: float, subject: str) -> str:
    percentage = (marks / total) * 100
    return f"""
You are an academic performance analyzer.
Analyze this student profile and provide actionable insights.

Subject: {subject}
Marks: {marks}/{total}
Percentage: {percentage:.2f}%

Return ONLY valid JSON with this schema:
{{
  "weak_topics": ["topic1", "topic2"],
  "strengths": ["area1", "area2"],
  "improvement_plan": "short, actionable plan"
}}
""".strip()


@router.post("/performance", response_model=PerformanceResponse)
def analyze_performance(payload: PerformanceRequest):
    prompt = _build_performance_prompt(payload.marks, payload.total, payload.subject)
    try:
        data = generate_structured_json(prompt)
    except Exception as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc

    try:
        return PerformanceResponse.model_validate(data)
    except Exception as exc:
        raise HTTPException(
            status_code=502,
            detail=f"AI response parsing failed for performance endpoint: {exc}",
        ) from exc


@router.get("/performance")
def get_performance(query: str):
    """
    Backward-compatible GET endpoint used by existing frontend.
    Converts new analyzer output into the frontend's expected schema.
    """
    marks = 0.0
    total = 100.0
    subject = query if query else "General"

    try:
        analysis = analyze_performance(
            PerformanceRequest(marks=marks, total=total, subject=subject)
        ).model_dump()
    except Exception:
        analysis = {
            "weak_topics": [],
            "strengths": [],
            "improvement_plan": "",
        }

    return {
        "readiness": 0,
        "subjectScores": {"Physics": 0, "Chemistry": 0, "Mathematics": 0},
        "weakTopics": analysis.get("weak_topics", []),
        "trend": [],
    }
