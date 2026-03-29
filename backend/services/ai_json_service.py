import json
import re
from typing import Any

from services.ai_service import generate_answer


def _extract_json_block(raw: str) -> Any:
    try:
        return json.loads(raw)
    except Exception:
        pass

    match = re.search(r"\{[\s\S]*\}|\[[\s\S]*\]", raw)
    if not match:
        return None
    try:
        return json.loads(match.group(0))
    except Exception:
        return None


def generate_structured_json(prompt: str) -> Any:
    raw = generate_answer(prompt)
    return _extract_json_block(raw)

