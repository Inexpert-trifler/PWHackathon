import json
from pathlib import Path

import faiss
from sentence_transformers import SentenceTransformer


BASE_DIR = Path(__file__).resolve().parent.parent
LECTURES_FILE = BASE_DIR / "data" / "lectures.json"


with LECTURES_FILE.open("r", encoding="utf-8") as file:
    lectures = json.load(file)

model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")
lecture_texts = [lecture["content"] for lecture in lectures]
lecture_embeddings = model.encode(lecture_texts, convert_to_numpy=True).astype("float32")

index = faiss.IndexFlatL2(lecture_embeddings.shape[1])
index.add(lecture_embeddings)


def search_lecture(query: str) -> dict:
    query_embedding = model.encode([query], convert_to_numpy=True).astype("float32")
    _, indices = index.search(query_embedding, 1)

    lecture = lectures[indices[0][0]]
    return {
        "topic": lecture["topic"],
        "content": lecture["content"],
        "timestamp": lecture["timestamp"],
    }
