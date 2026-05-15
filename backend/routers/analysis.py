"""Analysis REST endpoint (non-WebSocket) for single frame analysis."""

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import Optional

from utils.auth import get_current_user
from services.analysis_service import face_analyzer, voice_analyzer, body_analyzer

router = APIRouter()


class FrameRequest(BaseModel):
    frame_b64: Optional[str] = None
    audio_b64: Optional[str] = None
    transcript: Optional[str] = None


@router.post("/frame")
async def analyze_frame(
    payload: FrameRequest,
    current_user: dict = Depends(get_current_user),
):
    """Analyze a single frame and audio chunk (REST fallback for WebSocket)."""
    result = {}

    if payload.frame_b64:
        frame = face_analyzer.decode_frame(payload.frame_b64)
        if frame is not None:
            face_result = face_analyzer.analyze_frame(frame)
            body_result = body_analyzer.analyze_pose(frame)
            result.update(face_result)
            result.update(body_result)

    if payload.audio_b64:
        voice_result = voice_analyzer.analyze_audio(payload.audio_b64)
        result.update(voice_result)

    if payload.transcript:
        fillers = voice_analyzer.detect_filler_words(payload.transcript)
        result["filler_words"] = fillers
        result["filler_count"] = len(fillers)

    return result
