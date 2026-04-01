from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Literal
from backend.services.ai_json_service import generate_structured_json

router = APIRouter()

class RoadmapRequest(BaseModel):
    topic: str

class Subtopic(BaseModel):
    name: str
    importance: Literal["high", "medium", "low"]
    study_hours: int
    description: str
    resources: List[str]

class RoadmapResponse(BaseModel):
    topic: str
    overview: str
    total_study_hours: int
    subtopics: List[Subtopic]
    study_order: List[str]
    key_concepts: List[str]
    prerequisites: List[str]

@router.post("/generate", response_model=RoadmapResponse)
async def generate_roadmap(request: RoadmapRequest):
    try:
        prompt = f"""
        Generate a comprehensive study roadmap for the topic: "{request.topic}"
        
        Return a JSON object with this exact structure:
        {{
            "topic": "{request.topic}",
            "overview": "2-3 sentence summary of what this topic covers and why it's important",
            "total_study_hours": <estimated total hours to master this topic>,
            "subtopics": [
                {{
                    "name": "specific subtopic name",
                    "importance": "high|medium|low",
                    "study_hours": <estimated hours for this subtopic>,
                    "description": "brief description of what this subtopic covers",
                    "resources": ["resource1", "resource2", "resource3"]
                }}
            ],
            "study_order": ["subtopic1", "subtopic2", "subtopic3"],
            "key_concepts": ["concept1", "concept2", "concept3"],
            "prerequisites": ["prereq1", "prereq2", "prereq3"]
        }}
        
        Requirements:
        - Include 5-8 subtopics
        - Make study_order logical for learning progression
        - Provide practical, specific resources
        - Estimate realistic study hours
        - Ensure all subtopics in study_order exist in the subtopics array
        - Make prerequisites specific and actionable
        """
        
        result = generate_structured_json(prompt)
        
        if not result:
            raise HTTPException(status_code=500, detail="Failed to generate roadmap")
            
        return RoadmapResponse(**result)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating roadmap: {str(e)}")
