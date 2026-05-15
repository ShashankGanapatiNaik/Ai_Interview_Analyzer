"""
PDF Export endpoint — appended to reports router logic.
Add this route to backend/routers/reports.py
"""

# Add this import at top of reports.py:
# from fastapi.responses import Response
# from utils.pdf_generator import generate_pdf_report

# Add this route to the reports router:

"""
@router.get("/{interview_id}/export/pdf")
async def export_pdf(
    interview_id: str,
    current_user: dict = Depends(get_current_user),
):
    db = get_db()
    interview = await db.interviews.find_one({"_id": ObjectId(interview_id)})
    if not interview:
        raise HTTPException(status_code=404, detail="Interview not found")

    scores = {
        "overall_score":    interview.get("overall_score") or 0,
        "confidence_score": interview.get("confidence_score") or 0,
        "eye_contact_score":interview.get("eye_contact_score") or 0,
        "voice_score":      interview.get("voice_score") or 0,
        "posture_score":    interview.get("posture_score") or 0,
    }

    frames = []
    async for f in db.analysis_frames.find({"interview_id": interview_id}).limit(50):
        frames.append(f)

    emotion_timeline = []
    seen = set()
    for f in frames:
        emo = f.get("emotion", "Neutral")
        if emo not in seen:
            t = f.get("timestamp", 0)
            emotion_timeline.append({
                "time": f"{int(t//60):02d}:{int(t%60):02d}",
                "emotion": emo,
            })
            seen.add(emo)

    filler_total = sum(f.get("filler_count", 0) for f in frames)
    sw = analyze_strengths_weaknesses(scores, filler_total)

    cached = await db.reports.find_one({"interview_id": interview_id})

    report_data = {
        "user_name":       current_user["name"],
        "type":            interview.get("type"),
        "difficulty":      interview.get("difficulty"),
        "target_role":     interview.get("target_role"),
        "scores":          scores,
        "emotion_timeline":emotion_timeline,
        "strengths":       sw["strengths"],
        "weaknesses":      sw["weaknesses"],
        "recommendations": sw["recommendations"],
        "ai_summary":      cached.get("ai_summary") if cached else None,
    }

    pdf_bytes = generate_pdf_report(report_data)
    filename = f"interview_report_{interview_id[:8]}.pdf"

    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )
"""
