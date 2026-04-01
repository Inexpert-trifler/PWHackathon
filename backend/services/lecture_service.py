import os
import time
import subprocess
import requests
import json
from pathlib import Path
import imageio_ffmpeg
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")

ASSEMBLYAI_API_KEY = os.getenv("ASSEMBLYAI_API_KEY")
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"

VIDEOS_DIR = BASE_DIR / "temp" / "videos"
AUDIOS_DIR = BASE_DIR / "temp" / "audios"

VIDEOS_DIR.mkdir(parents=True, exist_ok=True)
AUDIOS_DIR.mkdir(parents=True, exist_ok=True)


# ─────────────────────────────────────────
# STEP 1: Save uploaded video to temp/videos
# ─────────────────────────────────────────
def save_video(file_bytes: bytes, filename: str) -> Path:
    video_path = VIDEOS_DIR / filename
    with open(video_path, "wb") as f:
        f.write(file_bytes)
    return video_path


# ─────────────────────────────────────────
# STEP 2: Extract audio from video via ffmpeg
# ─────────────────────────────────────────
def extract_audio(video_path: Path) -> Path:
    audio_filename = video_path.stem + ".mp3"
    audio_path = AUDIOS_DIR / audio_filename

    ffmpeg_path = imageio_ffmpeg.get_ffmpeg_exe()

    command = [
        ffmpeg_path,
        "-i", str(video_path),
        "-vn",
        "-ar", "16000",
        "-ac", "1",
        "-b:a", "64k",
        "-y",
        str(audio_path)
    ]

    result = subprocess.run(command, capture_output=True, text=True)

    if result.returncode != 0:
        raise RuntimeError(f"ffmpeg failed: {result.stderr}")

    return audio_path


# ─────────────────────────────────────────
# STEP 3: Upload audio to AssemblyAI + poll
# ─────────────────────────────────────────
def upload_to_assemblyai(audio_path: Path) -> str:
    if not ASSEMBLYAI_API_KEY:
        raise RuntimeError("ASSEMBLYAI_API_KEY is missing.")

    headers = {"authorization": ASSEMBLYAI_API_KEY}

    with open(audio_path, "rb") as f:
        upload_response = requests.post(
            "https://api.assemblyai.com/v2/upload",
            headers=headers,
            data=f,
            timeout=60
        )

    if upload_response.status_code != 200:
        raise RuntimeError(f"AssemblyAI upload failed: {upload_response.text}")

    audio_url = upload_response.json()["upload_url"]

    transcript_response = requests.post(
        "https://api.assemblyai.com/v2/transcript",
        headers=headers,
        json={
            "audio_url": audio_url,
            "speech_models": ["universal-2"]
        },
        timeout=30
    )

    if transcript_response.status_code != 200:
        raise RuntimeError(f"AssemblyAI transcript request failed: {transcript_response.text}")

    transcript_id = transcript_response.json()["id"]

    polling_url = f"https://api.assemblyai.com/v2/transcript/{transcript_id}"
    max_attempts = 60

    for attempt in range(max_attempts):
        poll_response = requests.get(polling_url, headers=headers, timeout=30)
        poll_data = poll_response.json()
        status = poll_data.get("status")

        if status == "completed":
            return poll_data["text"]
        elif status == "error":
            raise RuntimeError(f"AssemblyAI transcription error: {poll_data.get('error')}")

        time.sleep(5)

    raise RuntimeError("AssemblyAI transcription timed out after 5 minutes.")


# ─────────────────────────────────────────
# STEP 4: Send transcript to Groq AI
# ─────────────────────────────────────────
def extract_topics_with_ai(transcript: str) -> dict:
    if not GROQ_API_KEY:
        raise RuntimeError("GROQ_API_KEY is missing.")

    prompt = f"""
You are an expert lecture analyzer.
Given the following lecture transcript, extract the main topics covered and assign approximate timestamp ranges.

Transcript:
{transcript}

Return ONLY valid JSON with this exact schema:
{{
  "topics": [
    {{
      "title": "Topic name",
      "start": "00:00",
      "end": "05:30",
      "summary": "Brief summary of what is covered in this segment."
    }}
  ]
}}

Rules:
- Extract 3 to 8 meaningful topics.
- start and end should be in MM:SS format.
- Summaries should be concise and factual.
- Return ONLY the JSON. No explanation. No markdown.
""".strip()

    response = requests.post(
        GROQ_URL,
        headers={
            "Authorization": f"Bearer {GROQ_API_KEY}",
            "Content-Type": "application/json",
        },
        json={
            "model": "llama-3.3-70b-versatile",
            "messages": [{"role": "user", "content": prompt}],
            "temperature": 0.7,
        },
        timeout=45,
    )

    if response.status_code != 200:
        raise RuntimeError(f"Groq error: {response.status_code}: {response.text}")

    data = response.json()

    if "choices" not in data:
        raise RuntimeError(f"Unexpected Groq response: {data}")

    raw = data["choices"][0]["message"]["content"]

    raw = raw.strip()
    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]
    raw = raw.strip()

    return json.loads(raw)


# ─────────────────────────────────────────
# MASTER FUNCTION — called by route
# ─────────────────────────────────────────
def process_lecture_video(file_bytes: bytes, filename: str) -> dict:
    video_path = save_video(file_bytes, filename)
    audio_path = extract_audio(video_path)
    transcript = upload_to_assemblyai(audio_path)
    topics_data = extract_topics_with_ai(transcript)

    return {
        "transcript": transcript,
        "topics": topics_data.get("topics", [])
    }