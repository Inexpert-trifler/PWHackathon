from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes.doubt import router as doubt_router
from routes.lecture import router as lecture_router
from routes.plan import router as plan_router
from routes.performance import router as performance_router
from routes.search import router as search_router
from routes.test import router as test_router
from routes.roadmap import router as roadmap_router

app = FastAPI(title="AI Learning Platform API")

app.add_middleware(
    CORSMiddleware,
allow_origins=[
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://pwhackathon-production.up.railway.app",
    "https://pw-hackathon-eosin.vercel.app",
],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "AI Learning Platform API is running"}

API_PREFIX = "/api"

app.include_router(doubt_router, prefix=API_PREFIX, tags=["doubt"])
app.include_router(plan_router, prefix=API_PREFIX, tags=["plan"])
app.include_router(performance_router, prefix=API_PREFIX, tags=["performance"])
app.include_router(lecture_router, prefix=API_PREFIX + "/lecture", tags=["lecture"])
app.include_router(search_router, prefix=API_PREFIX, tags=["search"])
app.include_router(test_router, prefix=API_PREFIX + "/test", tags=["test"])
app.include_router(roadmap_router, prefix=API_PREFIX + "/roadmap", tags=["roadmap"])