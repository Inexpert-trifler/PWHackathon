from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from services.ai_json_service import generate_structured_json

router = APIRouter()


# ─────────────────────────────────────────
# GENERATE MCQ TEST
# ─────────────────────────────────────────
class TestGenerateRequest(BaseModel):
    topic: str = Field(..., min_length=2, max_length=200)
    num_questions: int = Field(default=20, ge=5, le=20)
    difficulty: str = Field(default="medium")


class MCQOption(BaseModel):
    key: str
    value: str


class MCQQuestion(BaseModel):
    id: int
    question: str
    options: list[MCQOption]
    correct: str
    topic: str


class TestGenerateResponse(BaseModel):
    topic: str
    questions: list[MCQQuestion]


@router.post("/generate", response_model=TestGenerateResponse)
def generate_test(payload: TestGenerateRequest):
    prompt = f"""
You are an expert exam question generator.
Generate exactly {payload.num_questions} multiple choice questions on the topic: "{payload.topic}".
Difficulty level: {payload.difficulty.upper()}.

Return ONLY valid JSON with this exact schema:
{{
  "topic": "{payload.topic}",
  "questions": [
    {{
      "id": 1,
      "question": "Question text here?",
      "options": [
        {{"key": "A", "value": "Option A text"}},
        {{"key": "B", "value": "Option B text"}},
        {{"key": "C", "value": "Option C text"}},
        {{"key": "D", "value": "Option D text"}}
      ],
      "correct": "A",
      "topic": "Sub-topic name"
    }}
  ]
}}

Rules:
- Generate exactly {payload.num_questions} questions.
- Each question must have exactly 4 options (A, B, C, D).
- "correct" must be the key of the correct option (A, B, C, or D).
- "topic" is the specific sub-topic this question belongs to.
- Difficulty guide:
  * BEGINNER: Basic definitions, simple recall questions.
  * EASY: Straightforward application of concepts.
  * MEDIUM: Mix of application and some reasoning.
  * HARD: Multi-step problems requiring deep understanding.
  * EXPERT: JEE Advanced level, tricky and complex problems.
- All questions must match the {payload.difficulty.upper()} difficulty level.
- Return ONLY the JSON. No explanation. No markdown.
""".strip()

    try:
        data = generate_structured_json(prompt)
    except Exception as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc

    try:
        return TestGenerateResponse.model_validate(data)
    except Exception as exc:
        raise HTTPException(
            status_code=502,
            detail=f"AI response parsing failed: {exc}"
        ) from exc


# ─────────────────────────────────────────
# ANALYZE TEST RESULTS
# ─────────────────────────────────────────
class UserAnswer(BaseModel):
    question_id: int
    question: str
    topic: str
    correct: str
    user_answer: str


class TestAnalyzeRequest(BaseModel):
    topic: str
    total_questions: int
    time_taken_seconds: int
    answers: list[UserAnswer]


class TopicScore(BaseModel):
    topic: str
    correct: int
    total: int
    percentage: float


class TestAnalyzeResponse(BaseModel):
    total_score: int
    total_questions: int
    percentage: float
    time_taken_seconds: int
    topic_scores: list[TopicScore]
    weak_topics: list[str]
    strong_topics: list[str]
    ai_feedback: str
    grade: str


@router.post("/analyze", response_model=TestAnalyzeResponse)
def analyze_test(payload: TestAnalyzeRequest):
    correct_count = sum(
        1 for a in payload.answers if a.user_answer == a.correct
    )
    percentage = (correct_count / payload.total_questions) * 100

    topic_map = {}
    for a in payload.answers:
        if a.topic not in topic_map:
            topic_map[a.topic] = {"correct": 0, "total": 0}
        topic_map[a.topic]["total"] += 1
        if a.user_answer == a.correct:
            topic_map[a.topic]["correct"] += 1

    topic_scores = [
        TopicScore(
            topic=t,
            correct=v["correct"],
            total=v["total"],
            percentage=round((v["correct"] / v["total"]) * 100, 1)
        )
        for t, v in topic_map.items()
    ]

    weak_topics = [t.topic for t in topic_scores if t.percentage < 50]
    strong_topics = [t.topic for t in topic_scores if t.percentage >= 75]

    if percentage >= 90:
        grade = "A+"
    elif percentage >= 75:
        grade = "A"
    elif percentage >= 60:
        grade = "B"
    elif percentage >= 45:
        grade = "C"
    else:
        grade = "D"

    prompt = f"""
You are an expert academic coach.
A student just completed a {payload.total_questions}-question MCQ test on "{payload.topic}".

Results:
- Score: {correct_count}/{payload.total_questions} ({percentage:.1f}%)
- Grade: {grade}
- Time taken: {payload.time_taken_seconds // 60} minutes {payload.time_taken_seconds % 60} seconds
- Weak topics: {', '.join(weak_topics) if weak_topics else 'None'}
- Strong topics: {', '.join(strong_topics) if strong_topics else 'None'}

Write a personalized, motivating feedback message (3-4 sentences) that:
1. Acknowledges their performance
2. Highlights what they did well
3. Gives specific advice on weak topics
4. Encourages them to improve

Return ONLY valid JSON:
{{
  "feedback": "Your personalized feedback here."
}}
""".strip()

    try:
        ai_data = generate_structured_json(prompt)
        ai_feedback = ai_data.get("feedback", "Keep practicing to improve your score!")
    except Exception:
        ai_feedback = "Great effort! Focus on your weak topics and keep practicing."

    return TestAnalyzeResponse(
        total_score=correct_count,
        total_questions=payload.total_questions,
        percentage=round(percentage, 1),
        time_taken_seconds=payload.time_taken_seconds,
        topic_scores=topic_scores,
        weak_topics=weak_topics,
        strong_topics=strong_topics,
        ai_feedback=ai_feedback,
        grade=grade
    )