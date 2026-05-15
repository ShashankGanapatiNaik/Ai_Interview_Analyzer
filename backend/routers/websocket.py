"""
WebSocket router — real-time bidirectional communication for live interview analysis.
Receives video frames + audio chunks, returns behavioral analysis results.
"""

import json
import logging
import asyncio
from datetime import datetime
from typing import Dict

from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query

from services.analysis_service import face_analyzer, body_analyzer, voice_analyzer
from services.feedback_service import generate_live_feedback
from utils.database import get_db

logger = logging.getLogger(__name__)
router = APIRouter()


class ConnectionManager:
    def __init__(self):
        self.active: Dict[str, WebSocket] = {}

    async def connect(self, interview_id: str, ws: WebSocket):
        await ws.accept()
        self.active[interview_id] = ws
        logger.info(f"WS connected: {interview_id}")

    def disconnect(self, interview_id: str):
        self.active.pop(interview_id, None)
        logger.info(f"WS disconnected: {interview_id}")

    async def send(self, interview_id: str, data: dict):
        ws = self.active.get(interview_id)
        if ws:
            try:
                await ws.send_json(data)
            except Exception as e:
                logger.warning(f"WS send error [{interview_id}]: {e}")
                self.disconnect(interview_id)


manager = ConnectionManager()


@router.websocket("/interview/{interview_id}")
async def interview_websocket(
    ws: WebSocket,
    interview_id: str,
    token: str = Query(...),
):
    """
    Real-time analysis WebSocket.
    Client sends JSON: { type, question_index, frame_b64, audio_b64, transcript }
    Server responds with full analysis result.
    """
    from utils.auth import decode_token
    try:
        payload = decode_token(token)
    except Exception:
        await ws.close(code=4001, reason="Unauthorized")
        return

    await manager.connect(interview_id, ws)
    db = get_db()
    frame_buffer = []
    last_analysis_time = 0.0
    ANALYSIS_INTERVAL = 0.5

    try:
        while True:
            raw = await ws.receive_text()
            data = json.loads(raw)
            msg_type = data.get("type", "frame")

            if msg_type == "ping":
                await ws.send_json({"type": "pong"})
                continue

            now = asyncio.get_event_loop().time()
            question_index = data.get("question_index", 0)
            result = {
                "type": "analysis",
                "timestamp": datetime.utcnow().isoformat(),
                "question_index": question_index,
            }

            frame_data = {}
            if data.get("frame_b64") and (now - last_analysis_time) >= ANALYSIS_INTERVAL:
                frame = face_analyzer.decode_frame(data["frame_b64"])
                if frame is not None:
                    face_data = face_analyzer.analyze_frame(frame)
                    body_data = body_analyzer.analyze_pose(frame)
                    frame_data.update(face_data)
                    frame_data.update(body_data)
                    last_analysis_time = now
                    if face_data.get("multiple_faces"):
                        result["alert"] = "Multiple faces detected."
                    if face_data.get("attention_score", 1.0) < 0.4:
                        result["alert"] = "Low attention detected — focus on camera."

            voice_data = {}
            if data.get("audio_b64"):
                voice_data = voice_analyzer.analyze_audio(data["audio_b64"])
                transcript = data.get("transcript", "")
                if transcript:
                    fillers = voice_analyzer.detect_filler_words(transcript)
                    voice_data["filler_words"] = fillers
                    voice_data["filler_count"] = len(fillers)
                    if fillers:
                        result["filler_alert"] = f"Filler word detected: '{fillers[0]}'"

            merged = {**frame_data, **voice_data}
            result.update({
                "emotion": merged.get("emotion", "Neutral"),
                "emotion_confidence": merged.get("emotion_confidence", 0.5),
                "eye_contact_score": merged.get("eye_contact_score", 0.5),
                "gaze_direction": merged.get("gaze_direction", "center"),
                "attention_score": merged.get("attention_score", 0.5),
                "posture_score": merged.get("posture_score", 0.7),
                "leaning": merged.get("leaning", "upright"),
                "voice_energy": merged.get("voice_energy", 0.5),
                "speech_rate": merged.get("speech_rate", 120.0),
                "clarity_score": merged.get("clarity_score", 0.8),
                "confidence_score": merged.get("confidence_score", 0.75),
                "pitch_mean": merged.get("pitch_mean", 180.0),
                "filler_count": merged.get("filler_count", 0),
                "filler_words": merged.get("filler_words", []),
                "silence_ratio": merged.get("silence_ratio", 0.1),
                "multiple_faces": merged.get("multiple_faces", False),
                "head_pose_pitch": merged.get("head_pose_pitch", 0.0),
                "head_pose_yaw": merged.get("head_pose_yaw", 0.0),
                "head_pose_roll": merged.get("head_pose_roll", 0.0),
            })

            frame_buffer.append(merged)
            if len(frame_buffer) >= 10:
                feedback = generate_live_feedback(frame_buffer[-10:])
                if feedback:
                    result["live_feedback"] = feedback
                frame_buffer = frame_buffer[-5:]

            asyncio.create_task(_save_analysis_frame(db, interview_id, question_index, result))
            await ws.send_json(result)

    except WebSocketDisconnect:
        manager.disconnect(interview_id)
    except Exception as e:
        logger.error(f"WS error [{interview_id}]: {e}")
        manager.disconnect(interview_id)


async def _save_analysis_frame(db, interview_id: str, question_index: int, data: dict):
    try:
        doc = {
            "interview_id": interview_id,
            "question_index": question_index,
            "timestamp": datetime.utcnow(),
            **{k: data.get(k) for k in [
                "emotion", "emotion_confidence", "eye_contact_score", "attention_score",
                "posture_score", "confidence_score", "clarity_score", "voice_energy",
                "speech_rate", "filler_count", "silence_ratio",
                "head_pose_pitch", "head_pose_yaw", "head_pose_roll",
            ]},
        }
        await db.analysis_frames.insert_one(doc)
    except Exception as e:
        logger.debug(f"Frame save error: {e}")
