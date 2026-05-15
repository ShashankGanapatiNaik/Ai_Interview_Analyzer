"""Question service — generate and manage interview questions."""

from typing import List, Dict
from services.feedback_service import generate_interview_questions, _default_questions


async def generate_questions_for_session(
    interview_type: str,
    difficulty: str,
    role: str,
    count: int,
) -> List[Dict]:
    """Generate questions for a new session, with DB caching fallback."""
    questions = await generate_interview_questions(interview_type, difficulty, role, count)
    return questions
