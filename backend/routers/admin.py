"""Admin router — platform analytics, candidate management."""

from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, Query
from bson import ObjectId

from utils.auth import require_admin
from utils.database import get_db

router = APIRouter()


@router.get("/stats")
async def platform_stats(admin=Depends(require_admin)):
    db = get_db()
    today = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)

    total_candidates = await db.users.count_documents({"role": "candidate"})
    total_interviews = await db.interviews.count_documents({})
    interviews_today = await db.interviews.count_documents({"created_at": {"$gte": today}})
    active_sessions = await db.interviews.count_documents({"status": "active"})
    ai_analyses = await db.analysis_frames.count_documents({})

    # Average score across completed interviews
    pipeline = [
        {"$match": {"status": "completed", "overall_score": {"$ne": None}}},
        {"$group": {"_id": None, "avg": {"$avg": "$overall_score"}}},
    ]
    avg_score = 0.0
    async for r in db.interviews.aggregate(pipeline):
        avg_score = round(r["avg"], 1)

    return {
        "total_candidates": total_candidates,
        "total_interviews": total_interviews,
        "interviews_today": interviews_today,
        "active_sessions": active_sessions,
        "ai_analyses_total": ai_analyses,
        "avg_score": avg_score,
    }


@router.get("/candidates")
async def list_candidates(
    admin=Depends(require_admin),
    limit: int = Query(20, le=100),
    skip: int = Query(0, ge=0),
    search: str = Query(None),
):
    db = get_db()
    query = {"role": "candidate"}
    if search:
        query["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"email": {"$regex": search, "$options": "i"}},
        ]

    candidates = []
    cursor = db.users.find(query).skip(skip).limit(limit).sort("created_at", -1)
    async for user in cursor:
        candidates.append({
            "id": str(user["_id"]),
            "name": user["name"],
            "email": user["email"],
            "total_interviews": user.get("total_interviews", 0),
            "avg_score": user.get("avg_score", 0.0),
            "created_at": user["created_at"],
            "is_active": user.get("is_active", True),
        })
    return candidates


@router.get("/candidates/{user_id}/interviews")
async def candidate_interviews(user_id: str, admin=Depends(require_admin)):
    db = get_db()
    interviews = []
    async for doc in db.interviews.find(
        {"user_id": ObjectId(user_id)},
        sort=[("created_at", -1)],
    ).limit(20):
        doc["id"] = str(doc.pop("_id"))
        doc["user_id"] = str(doc["user_id"])
        interviews.append(doc)
    return interviews


@router.get("/leaderboard")
async def leaderboard(admin=Depends(require_admin), limit: int = 10):
    db = get_db()
    pipeline = [
        {"$match": {"role": "candidate", "total_interviews": {"$gt": 0}}},
        {"$sort": {"avg_score": -1}},
        {"$limit": limit},
        {"$project": {"name": 1, "email": 1, "avg_score": 1, "total_interviews": 1}},
    ]
    result = []
    async for user in db.users.aggregate(pipeline):
        user["id"] = str(user.pop("_id"))
        result.append(user)
    return result


@router.patch("/candidates/{user_id}/toggle")
async def toggle_candidate(user_id: str, admin=Depends(require_admin)):
    db = get_db()
    user = await db.users.find_one({"_id": ObjectId(user_id)})
    if not user:
        return {"error": "Not found"}
    new_status = not user.get("is_active", True)
    await db.users.update_one({"_id": ObjectId(user_id)}, {"$set": {"is_active": new_status}})
    return {"is_active": new_status}


@router.delete("/interviews/{interview_id}")
async def admin_delete_interview(interview_id: str, admin=Depends(require_admin)):
    db = get_db()
    await db.interviews.delete_one({"_id": ObjectId(interview_id)})
    await db.analysis_frames.delete_many({"interview_id": interview_id})
    return {"deleted": True}
