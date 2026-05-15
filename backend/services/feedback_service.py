"""
AI Feedback Service
Uses Anthropic Claude to generate personalized behavioral feedback and coaching.
"""

import logging
from typing import Dict, Any, List, Optional
import anthropic

from utils.config import settings

logger = logging.getLogger(__name__)
client = anthropic.Anthropic(api_key=settings.ANTHROPIC_API_KEY)


# ── Live Feedback (rule-based, no API call for low latency) ───────────────────
FEEDBACK_RULES = [
    # (condition_fn, message)
    (lambda r: r.get("eye_contact_score", 1) < 0.4,        "👁️ Maintain eye contact with the camera"),
    (lambda r: r.get("eye_contact_score", 0) > 0.85,       "✅ Excellent eye contact — keep it up!"),
    (lambda r: r.get("posture_score", 1) < 0.5,             "🧘 Sit upright — posture signals confidence"),
    (lambda r: r.get("speech_rate", 120) > 200,             "🐇 Slow down — you're speaking too fast"),
    (lambda r: r.get("speech_rate", 120) < 80,              "🐢 Speak a bit faster to maintain engagement"),
    (lambda r: r.get("filler_count", 0) >= 2,               "⚠️ Reduce filler words — take a breath instead"),
    (lambda r: r.get("silence_ratio", 0) > 0.5,             "🎙️ Avoid long silences — keep speaking"),
    (lambda r: r.get("voice_energy", 1) < 0.2,             "📣 Speak louder — your energy seems low"),
    (lambda r: r.get("emotion_confidence", 0) > 0.8 and r.get("emotion") == "Confident", "💪 You look confident — great presence!"),
    (lambda r: r.get("emotion") in ("Sad", "Fear", "Angry"), "😊 Relax and smile — stay composed"),
    (lambda r: r.get("attention_score", 1) < 0.4,          "📵 Focus on the interviewer — avoid distractions"),
    (lambda r: r.get("clarity_score", 0) > 0.85,           "🎤 Your speech clarity is excellent!"),
]


def generate_live_feedback(analysis: Dict[str, Any]) -> Optional[str]:
    """Generate a single live feedback message based on current analysis."""
    import random
    triggered = [msg for cond, msg in FEEDBACK_RULES if cond(analysis)]
    if triggered:
        return random.choice(triggered)
    return None


# ── AI-Generated Report Summary ───────────────────────────────────────────────
async def generate_ai_report_summary(
    scores: Dict[str, float],
    emotion_timeline: List[Dict],
    filler_count: int,
    interview_type: str,
    target_role: str,
) -> str:
    """Generate a detailed AI performance summary using Claude."""
    try:
        emotion_summary = ", ".join(
            f"{e['emotion']} at {e['time']}" for e in emotion_timeline[:6]
        )

        prompt = f"""You are an expert AI interview behavioral analyst. Provide a concise, professional, encouraging analysis (250 words max) based on these metrics:

Interview: {interview_type} for {target_role}
- Overall Score: {scores.get('overall_score', 0)}/100
- Confidence: {scores.get('confidence_score', 0)}%
- Eye Contact: {scores.get('eye_contact_score', 0)}% 
- Voice Clarity: {scores.get('voice_score', 0)}%
- Body Posture: {scores.get('posture_score', 0)}%
- Filler Words Detected: {filler_count}
- Emotional Journey: {emotion_summary}

Write a warm, specific, data-driven summary covering:
1. Top 2 strengths with concrete observations
2. Top 2 specific areas to improve
3. One actionable coaching tip to implement immediately

Use professional SaaS report language. Be encouraging but honest."""

        response = client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=500,
            messages=[{"role": "user", "content": prompt}],
        )
        return response.content[0].text
    except Exception as e:
        logger.error(f"AI report generation failed: {e}")
        return _fallback_summary(scores)


def _fallback_summary(scores: Dict[str, float]) -> str:
    overall = scores.get("overall_score", 0)
    confidence = scores.get("confidence_score", 0)
    eye = scores.get("eye_contact_score", 0)

    rating = "strong" if overall >= 75 else "developing" if overall >= 60 else "early-stage"
    return (
        f"Your interview performance shows {rating} behavioral indicators with an overall score of "
        f"{overall}/100. Your confidence level of {confidence}% demonstrates good self-assurance "
        f"during responses. Eye contact at {eye}% {'meets' if eye >= 75 else 'is below'} the "
        f"recommended 75% threshold for effective video interviews. Focus on maintaining consistent "
        f"camera eye contact and reducing filler words to elevate your professional presence."
    )


# ── AI Coaching Chat ──────────────────────────────────────────────────────────
async def get_coaching_response(
    user_message: str,
    scores: Dict[str, float],
    candidate_name: str,
    target_role: str,
    conversation_history: List[Dict] = None,
) -> str:
    """Generate personalized coaching response using Claude."""
    try:
        system_prompt = f"""You are an expert AI interview coach for {candidate_name}, preparing for a {target_role} role.

Their latest performance scores:
- Overall: {scores.get('overall_score', 78)}/100
- Confidence: {scores.get('confidence_score', 82)}%
- Eye Contact: {scores.get('eye_contact_score', 71)}% (needs improvement)  
- Voice Clarity: {scores.get('voice_score', 88)}%
- Body Posture: {scores.get('posture_score', 65)}%

Be concise (max 150 words), warm, specific, and actionable. Use emojis sparingly. 
Give concrete techniques, not generic advice. Reference their specific scores when relevant."""

        messages = conversation_history or []
        messages.append({"role": "user", "content": user_message})

        response = client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=400,
            system=system_prompt,
            messages=messages,
        )
        return response.content[0].text
    except Exception as e:
        logger.error(f"Coaching response failed: {e}")
        return "I'm here to help! Based on your profile, focus on maintaining camera eye contact and reducing filler words for the biggest impact on your score."


# ── AI Question Generation ────────────────────────────────────────────────────
async def generate_interview_questions(
    interview_type: str,
    difficulty: str,
    role: str,
    count: int = 5,
) -> List[Dict[str, str]]:
    """Generate contextual interview questions using Claude."""
    try:
        prompt = f"""Generate {count} interview questions for a {difficulty} level {interview_type} interview for a {role} position.

Return ONLY a JSON array with this exact structure:
[
  {{
    "text": "Question text here",
    "type": "behavioral|technical|situational",
    "category": "Leadership|Problem Solving|Communication|Technical|etc",
    "follow_up": "Optional follow-up question"
  }}
]

Mix question types. Make them realistic and specific to {role}. No preamble, just JSON."""

        response = client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=800,
            messages=[{"role": "user", "content": prompt}],
        )

        import json
        text = response.content[0].text.strip()
        # Strip markdown fences if present
        if text.startswith("```"):
            text = text.split("```")[1]
            if text.startswith("json"):
                text = text[4:]
        return json.loads(text.strip())
    except Exception as e:
        logger.error(f"Question generation failed: {e}")
        return _default_questions(interview_type, difficulty)


def _default_questions(interview_type: str, difficulty: str) -> List[Dict]:
    return [
        {"text": "Tell me about yourself and your professional background.", "type": "behavioral", "category": "Introduction", "follow_up": None},
        {"text": "Describe a challenging project and how you overcame obstacles.", "type": "behavioral", "category": "Problem Solving", "follow_up": "What would you do differently?"},
        {"text": "How do you handle disagreements with teammates or management?", "type": "situational", "category": "Communication", "follow_up": None},
        {"text": "Where do you see yourself in 5 years?", "type": "behavioral", "category": "Career Goals", "follow_up": None},
        {"text": "What is your greatest professional achievement?", "type": "behavioral", "category": "Achievement", "follow_up": "What was your specific role?"},
    ]


# ── Strengths & Weaknesses Analysis ──────────────────────────────────────────
def analyze_strengths_weaknesses(scores: Dict[str, float], filler_count: int) -> Dict:
    strengths = []
    weaknesses = []
    recommendations = []

    thresholds = {
        "confidence_score": (75, "Strong confidence presence", "Work on projecting more confidence", "Practice power poses before interviews"),
        "eye_contact_score": (75, "Excellent eye contact maintained", "Eye contact needs improvement (aim for 75%+)", "Place a small dot sticker next to your webcam as a focal point"),
        "voice_score": (80, "Clear and articulate speech", "Work on speech clarity and diction", "Read aloud for 10 min daily to improve articulation"),
        "posture_score": (70, "Good professional posture throughout", "Posture could be more upright and stable", "Sit on the edge of your chair to naturally straighten posture"),
    }

    for key, (threshold, strength_msg, weakness_msg, rec) in thresholds.items():
        val = scores.get(key, 0)
        if val >= threshold:
            strengths.append(strength_msg)
        else:
            weaknesses.append(f"{weakness_msg} (current: {val}%)")
            recommendations.append(rec)

    if filler_count == 0:
        strengths.append("No filler words detected — very polished speech")
    elif filler_count <= 2:
        weaknesses.append(f"Minor use of filler words ({filler_count} detected)")
        recommendations.append("Replace 'um/uh' with deliberate 1-second pauses")
    else:
        weaknesses.append(f"Frequent filler words detected ({filler_count} total)")
        recommendations.append("Record yourself answering questions and count fillers — awareness is the first step")

    if scores.get("overall_score", 0) >= 80:
        strengths.append("Overall interview performance is above average")
    
    recommendations.append("Practice 2-minute timed answers using the STAR format (Situation, Task, Action, Result)")
    recommendations.append("Do mock interviews on video weekly to build camera comfort")

    return {
        "strengths": strengths,
        "weaknesses": weaknesses,
        "recommendations": recommendations[:6],
    }
