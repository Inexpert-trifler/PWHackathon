import json
import re
from fastapi import APIRouter
from backend.services.ai_service import generate_answer

router = APIRouter()


# ✅ SAFE JSON EXTRACTION (FIXED)
def _extract_json(raw: str):
    try:
        return json.loads(raw)
    except Exception:
        try:
            # Extract JSON part from messy AI response
            match = re.search(r"\{[\s\S]*\}", raw)
            if match:
                cleaned = match.group(0)

                # Fix invalid escape characters
                cleaned = cleaned.replace("\\", "\\\\")

                return json.loads(cleaned)
        except Exception:
            return None

    return None


# ✅ FALLBACK RESPONSE (NEVER CRASH)
def _safe_doubt_response(query: str, raw: str):
    text = (raw or "").strip()

    if not text:
        text = "Unable to generate a response at the moment. Please try again."

    return {
        "concept": f"Answer for: {query}",
        "formula": "N/A",
        "explanation": text[:2000],
        "relatedTopics": []
    }


# ✅ MAIN API
@router.get("/doubt")
def get_doubt(query: str):

    prompt = f"""
You are an expert JEE/NEET tutor. Answer the student's doubt.

Return ONLY valid JSON with exactly these keys:
- concept: string (1-2 lines)
- formula: string (latex allowed)
- explanation: string (step-by-step)
- relatedTopics: array of strings (3-6 items)

Student doubt: {query}
""".strip()

    try:
        raw = generate_answer(prompt)

        # 🔥 DEBUG (VERY IMPORTANT)
        print("\n===== AI RAW RESPONSE =====\n", raw, "\n===========================\n")

    except Exception as exc:
        return _safe_doubt_response(query, str(exc))

    data = _extract_json(raw)

    # ✅ VALIDATE STRUCTURE
    if (
        isinstance(data, dict)
        and isinstance(data.get("concept"), str)
        and isinstance(data.get("formula"), str)
        and isinstance(data.get("explanation"), str)
        and isinstance(data.get("relatedTopics"), list)
    ):
        return data

    # ✅ FALLBACK IF JSON FAILS
    return _safe_doubt_response(query, raw)