"""Questions router — manage and generate interview questions."""

from typing import List
from fastapi import APIRouter, Depends, Query
from utils.auth import get_current_user, require_admin
from services.feedback_service import generate_interview_questions

router = APIRouter()


@router.get("/generate")
async def generate_questions(
    interview_type: str = Query("Technical + Behavioral"),
    difficulty: str = Query("Intermediate"),
    role: str = Query("Software Engineer"),
    count: int = Query(5, le=10),
    current_user: dict = Depends(get_current_user),
):
    """Generate AI interview questions on-demand."""
    questions = await generate_interview_questions(interview_type, difficulty, role, count)
    return {"questions": questions, "count": len(questions)}


@router.get("/bank")
async def question_bank(
    interview_type: str = Query(None),
    difficulty: str = Query(None),
    current_user: dict = Depends(require_admin),
):
    """Admin: fetch stored question bank."""
    from utils.database import get_db
    db = get_db()
    query = {}
    if interview_type:
        query["type"] = interview_type
    if difficulty:
        query["difficulty"] = difficulty

    questions = []
    async for q in db.questions.find(query).limit(50):
        q["id"] = str(q.pop("_id"))
        questions.append(q)
    return {"questions": questions}
