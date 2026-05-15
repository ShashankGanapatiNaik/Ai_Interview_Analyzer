"""Reports router — generate and retrieve interview reports."""

from datetime import datetime
from fastapi import APIRouter, HTTPException, Depends
from bson import ObjectId

from utils.auth import get_current_user
from utils.database import get_db
from services.analysis_service import aggregate_interview_scores
from services.feedback_service import (
    generate_ai_report_summary,
    analyze_strengths_weaknesses,
)

router = APIRouter()


@router.get("/{interview_id}")
async def get_report(
    interview_id: str,
    current_user: dict = Depends(get_current_user),
):
    db = get_db()

    interview = await db.interviews.find_one({"_id": ObjectId(interview_id)})
    if not interview:
        raise HTTPException(status_code=404, detail="Interview not found")

    # Fetch aggregated scores (use stored or recompute)
    scores = {
        "overall_score": interview.get("overall_score") or 0,
        "confidence_score": interview.get("confidence_score") or 0,
        "eye_contact_score": interview.get("eye_contact_score") or 0,
        "voice_score": interview.get("voice_score") or 0,
        "posture_score": interview.get("posture_score") or 0,
    }

    # Emotion timeline from frames
    frames = []
    async for f in db.analysis_frames.find(
        {"interview_id": interview_id},
        sort=[("timestamp", 1)],
    ).limit(100):
        frames.append(f)

    emotion_timeline = []
    seen_emotions = set()
    for f in frames:
        emotion = f.get("emotion", "Neutral")
        if emotion not in seen_emotions or len(emotion_timeline) == 0:
            mins = int(f.get("timestamp", 0) // 60)
            secs = int(f.get("timestamp", 0) % 60)
            emotion_timeline.append({
                "time": f"{mins:02d}:{secs:02d}",
                "emotion": emotion,
                "confidence": round(f.get("emotion_confidence", 0.5) * 100, 1),
            })
            seen_emotions.add(emotion)
        if len(emotion_timeline) >= 10:
            break

    # Filler word count
    filler_total = sum(f.get("filler_count", 0) for f in frames)

    # Strengths/weaknesses
    sw = analyze_strengths_weaknesses(scores, filler_total)

    # Check for cached AI summary
    cached_report = await db.reports.find_one({"interview_id": interview_id})
    ai_summary = cached_report.get("ai_summary") if cached_report else None

    return {
        "interview_id": interview_id,
        "user_name": current_user["name"],
        "type": interview.get("type"),
        "difficulty": interview.get("difficulty"),
        "target_role": interview.get("target_role"),
        "scores": scores,
        "emotion_timeline": emotion_timeline,
        "strengths": sw["strengths"],
        "weaknesses": sw["weaknesses"],
        "recommendations": sw["recommendations"],
        "ai_summary": ai_summary,
        "filler_count": filler_total,
        "total_frames_analyzed": len(frames),
        "created_at": interview.get("created_at"),
        "duration_seconds": interview.get("duration_seconds"),
    }


@router.post("/{interview_id}/ai-summary")
async def generate_summary(
    interview_id: str,
    current_user: dict = Depends(get_current_user),
):
    """Generate and cache AI summary for a report."""
    db = get_db()

    interview = await db.interviews.find_one({"_id": ObjectId(interview_id)})
    if not interview:
        raise HTTPException(status_code=404, detail="Interview not found")

    scores = {
        "overall_score": interview.get("overall_score") or 0,
        "confidence_score": interview.get("confidence_score") or 0,
        "eye_contact_score": interview.get("eye_contact_score") or 0,
        "voice_score": interview.get("voice_score") or 0,
        "posture_score": interview.get("posture_score") or 0,
    }

    frames = []
    async for f in db.analysis_frames.find({"interview_id": interview_id}).limit(50):
        frames.append(f)

    emotion_timeline = list({f.get("emotion") for f in frames})[:6]
    filler_total = sum(f.get("filler_count", 0) for f in frames)
    et = [{"emotion": e, "time": "–"} for e in emotion_timeline]

    summary = await generate_ai_report_summary(
        scores=scores,
        emotion_timeline=et,
        filler_count=filler_total,
        interview_type=interview.get("type", "Technical"),
        target_role=interview.get("target_role", "Software Engineer"),
    )

    # Cache it
    await db.reports.update_one(
        {"interview_id": interview_id},
        {"$set": {"interview_id": interview_id, "ai_summary": summary, "generated_at": datetime.utcnow()}},
        upsert=True,
    )

    return {"ai_summary": summary}


@router.post("/coach/message")
async def coaching_chat(
    body: dict,
    current_user: dict = Depends(get_current_user),
):
    """AI coaching chat endpoint."""
    from services.feedback_service import get_coaching_response
    db = get_db()

    # Get latest interview scores for context
    latest = await db.interviews.find_one(
        {"user_id": current_user["_id"], "status": "completed"},
        sort=[("created_at", -1)],
    )
    scores = {}
    if latest:
        scores = {
            "overall_score": latest.get("overall_score", 78),
            "confidence_score": latest.get("confidence_score", 82),
            "eye_contact_score": latest.get("eye_contact_score", 71),
            "voice_score": latest.get("voice_score", 88),
            "posture_score": latest.get("posture_score", 65),
        }

    reply = await get_coaching_response(
        user_message=body.get("message", ""),
        scores=scores,
        candidate_name=current_user["name"],
        target_role=body.get("target_role", "Software Engineer"),
        conversation_history=body.get("history", []),
    )
    return {"reply": reply}
