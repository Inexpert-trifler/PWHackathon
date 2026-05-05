import json
import re
from fastapi import APIRouter
from services.ai_service import generate_answer

router = APIRouter()


# ✅ SAFE JSON EXTRACTION (FIXED)
def _extract_json(raw: str):
    # First, try to strip markdown code blocks
    text = raw.strip()
    if text.startswith("```"):
        # find the first '{' and last '}'
        start = text.find("{")
        end = text.rfind("}")
        if start != -1 and end != -1:
            text = text[start:end+1]
    try:
        return json.loads(text)
    except Exception:
        try:
            # Fallback: Extract JSON part from messy AI response
            match = re.search(r"\{[\s\S]*\}", text)
            if match:
                cleaned = match.group(0)
                # Only fix invalid escapes if necessary, but this often breaks LaTeX
                # Let's just try to load it first
                try:
                    return json.loads(cleaned)
                except:
                    # If it fails, try to escape backslashes that aren't already escaped
                    # This is risky for LaTeX but necessary for bad JSON
                    cleaned = cleaned.replace("\\", "\\\\")
                    # Fix double escaping that might have happened
                    cleaned = cleaned.replace("\\\\\\\\", "\\\\")
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
You are an expert JEE/NEET tutor. Answer the student's doubt clearly and correctly.

Return ONLY valid JSON with exactly these keys:
- concept: string (1-2 lines summarizing the core concept)
- formula: string (MUST be wrapped in $ tags, e.g. `$F = ma$`. If using LaTeX commands, escape them properly for JSON, e.g. `$\\frac{{1}}{{2}}$` or `$\\rightarrow$`)
- explanation: string (step-by-step clear explanation)
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