from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field, field_validator

from backend.services.ai_json_service import generate_structured_json


router = APIRouter()


class PlanRequest(BaseModel):
    goal: str = Field(..., min_length=2, max_length=200)
    days: int = Field(..., ge=1, le=60)
    hours_per_day: int = Field(..., ge=1, le=16)


class PlanDay(BaseModel):
    day: int
    tasks: str

    @field_validator("tasks")
    @classmethod
    def tasks_not_empty(cls, value: str) -> str:
        if not value.strip():
            raise ValueError("tasks cannot be empty")
        return value


class PlanResponse(BaseModel):
    plan: list[PlanDay]


def _build_plan_prompt(goal: str, days: int, hours_per_day: int) -> str:
    return f"""
You are an expert study planner.
Create a realistic day-wise study plan for the student.

Goal: {goal}
Days available: {days}
Hours per day: {hours_per_day}

Return ONLY valid JSON with this schema:
{{
  "plan": [
    {{"day": 1, "tasks": "task 1, task 2, task 3"}}
  ]
}}

Rules:
- Include exactly {days} day entries.
- Keep tasks practical and exam-oriented.
- Keep each day's tasks concise.
""".strip()


@router.post("/plan", response_model=PlanResponse)
def create_study_plan(payload: PlanRequest):
    prompt = _build_plan_prompt(payload.goal, payload.days, payload.hours_per_day)
    prompt = f"""
{prompt}
""".strip()
    try:
        data = generate_structured_json(prompt)
    except Exception as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc

    try:
        return PlanResponse.model_validate(data)
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"AI response parsing failed for plan endpoint: {exc}") from exc


@router.get("/plan")
def get_plan(query: str):
    """
    Backward-compatible GET endpoint used by existing frontend.
    Converts new planner output into the frontend's expected schema.
    """
    try:
        plan_data = create_study_plan(
            PlanRequest(goal=query, days=5, hours_per_day=3)
        ).model_dump()
    except Exception:
        plan_data = {"plan": []}

    daily_plan = []
    for idx, item in enumerate(plan_data["plan"], start=1):
        daily_plan.append(
            {
                "id": idx,
                "time": f"Day {item['day']}",
                "task": item["tasks"],
                "subject": "General",
                "completed": False,
            }
        )

    return {
        "weakTopics": [],
        "strongTopics": [],
        "focusTopics": [],
        "dailyPlan": daily_plan,
        "weekProgress": 0,
    }
