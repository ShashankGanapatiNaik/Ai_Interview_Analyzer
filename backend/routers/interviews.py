"""Interviews router — create, start, complete, list interview sessions."""

from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, HTTPException, Depends, Query
from bson import ObjectId

from models.schemas import InterviewCreate, InterviewOut
from utils.auth import get_current_user
from utils.database import get_db
from services.question_service import generate_questions_for_session

router = APIRouter()


def _serialize_interview(doc: dict) -> dict:
    doc["id"] = str(doc.pop("_id"))
    doc["user_id"] = str(doc["user_id"])
    return doc


@router.post("/", status_code=201)
async def create_interview(
    payload: InterviewCreate,
    current_user: dict = Depends(get_current_user),
):
    db = get_db()

    # Generate AI questions for this session
    questions = await generate_questions_for_session(
        interview_type=payload.type,
        difficulty=payload.difficulty,
        role=payload.target_role,
        count=payload.total_questions,
    )

    doc = {
        "user_id": current_user["_id"],
        "type": payload.type,
        "difficulty": payload.difficulty,
        "target_role": payload.target_role,
        "question_timer": payload.question_timer,
        "total_questions": payload.total_questions,
        "questions": questions,
        "status": "setup",
        "created_at": datetime.utcnow(),
        "overall_score": None,
        "confidence_score": None,
        "eye_contact_score": None,
        "voice_score": None,
        "posture_score": None,
        "completed_at": None,
        "duration_seconds": None,
    }
    result = await db.interviews.insert_one(doc)
    doc["_id"] = result.inserted_id
    return _serialize_interview(doc)


@router.get("/", response_model=List[dict])
async def list_interviews(
    current_user: dict = Depends(get_current_user),
    limit: int = Query(10, le=50),
    skip: int = Query(0, ge=0),
):
    db = get_db()
    cursor = db.interviews.find(
        {"user_id": current_user["_id"]},
        sort=[("created_at", -1)],
    ).skip(skip).limit(limit)
    interviews = []
    async for doc in cursor:
        interviews.append(_serialize_interview(doc))
    return interviews


@router.get("/{interview_id}")
async def get_interview(
    interview_id: str,
    current_user: dict = Depends(get_current_user),
):
    db = get_db()
    doc = await db.interviews.find_one({"_id": ObjectId(interview_id)})
    if not doc:
        raise HTTPException(status_code=404, detail="Interview not found")
    if str(doc["user_id"]) != str(current_user["_id"]) and current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Access denied")
    return _serialize_interview(doc)


@router.patch("/{interview_id}/start")
async def start_interview(
    interview_id: str,
    current_user: dict = Depends(get_current_user),
):
    db = get_db()
    doc = await db.interviews.find_one({"_id": ObjectId(interview_id)})
    if not doc:
        raise HTTPException(status_code=404, detail="Interview not found")

    await db.interviews.update_one(
        {"_id": ObjectId(interview_id)},
        {"$set": {"status": "active", "started_at": datetime.utcnow()}},
    )
    return {"message": "Interview started", "interview_id": interview_id}


@router.patch("/{interview_id}/complete")
async def complete_interview(
    interview_id: str,
    current_user: dict = Depends(get_current_user),
):
    """Trigger score aggregation and mark interview as completed."""
    db = get_db()
    from services.analysis_service import aggregate_interview_scores

    scores = await aggregate_interview_scores(interview_id)
    completed_at = datetime.utcnow()

    # Calculate duration
    doc = await db.interviews.find_one({"_id": ObjectId(interview_id)})
    duration = None
    if doc and doc.get("started_at"):
        duration = int((completed_at - doc["started_at"]).total_seconds())

    await db.interviews.update_one(
        {"_id": ObjectId(interview_id)},
        {
            "$set": {
                "status": "completed",
                "completed_at": completed_at,
                "duration_seconds": duration,
                **scores,
            }
        },
    )

    # Update user stats
    await _update_user_stats(db, current_user["_id"])

    return {"message": "Interview completed", "scores": scores}


@router.delete("/{interview_id}", status_code=204)
async def delete_interview(
    interview_id: str,
    current_user: dict = Depends(get_current_user),
):
    db = get_db()
    doc = await db.interviews.find_one({"_id": ObjectId(interview_id)})
    if not doc:
        raise HTTPException(status_code=404, detail="Not found")
    if str(doc["user_id"]) != str(current_user["_id"]) and current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Access denied")
    await db.interviews.delete_one({"_id": ObjectId(interview_id)})
    await db.analysis_frames.delete_many({"interview_id": interview_id})


async def _update_user_stats(db, user_id):
    """Recalculate and update user's aggregate stats."""
    pipeline = [
        {"$match": {"user_id": user_id, "status": "completed", "overall_score": {"$ne": None}}},
        {"$group": {"_id": None, "count": {"$sum": 1}, "avg": {"$avg": "$overall_score"}}},
    ]
    async for result in db.interviews.aggregate(pipeline):
        await db.users.update_one(
            {"_id": user_id},
            {"$set": {"total_interviews": result["count"], "avg_score": round(result["avg"], 1)}},
        )
