"""
Database seed script — populates initial data:
  - Admin user
  - Question bank (Technical, Behavioral, HR)

Run: python seed.py
"""

import asyncio
import os
from datetime import datetime
from motor.motor_asyncio import AsyncIOMotorClient
from passlib.context import CryptContext
from dotenv import load_dotenv

load_dotenv()

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
DB_NAME = "interviewai"

QUESTIONS = [
    # ── Technical ─────────────────────────────────────────────────────────────
    {"text": "Explain the difference between REST and GraphQL. When would you choose one over the other?", "type": "technical", "difficulty": "Intermediate", "category": "System Design", "follow_up": "How would you handle versioning in each?"},
    {"text": "Design a URL shortener system that can handle 100 million requests per day.", "type": "technical", "difficulty": "Advanced", "category": "System Design", "follow_up": "How would you ensure high availability?"},
    {"text": "What is the time and space complexity of your favourite sorting algorithm? Explain with an example.", "type": "technical", "difficulty": "Beginner", "category": "Algorithms", "follow_up": None},
    {"text": "Explain how database indexing works. What are the trade-offs?", "type": "technical", "difficulty": "Intermediate", "category": "Databases", "follow_up": "When would you avoid indexing?"},
    {"text": "Walk me through how you would debug a memory leak in a Node.js application.", "type": "technical", "difficulty": "Advanced", "category": "Debugging", "follow_up": "What tools would you use?"},
    {"text": "What is the CAP theorem? Give a real-world example.", "type": "technical", "difficulty": "Advanced", "category": "Distributed Systems", "follow_up": None},
    {"text": "How does garbage collection work in Java or Python?", "type": "technical", "difficulty": "Intermediate", "category": "Programming Concepts", "follow_up": "How can GC impact performance?"},
    {"text": "Explain Docker containers vs virtual machines.", "type": "technical", "difficulty": "Beginner", "category": "DevOps", "follow_up": "When would you use one vs the other?"},

    # ── Behavioral ────────────────────────────────────────────────────────────
    {"text": "Tell me about a time you led a project under tight deadlines. How did you prioritize?", "type": "behavioral", "difficulty": "Intermediate", "category": "Leadership", "follow_up": "What would you do differently?"},
    {"text": "Describe a situation where you had to handle a major production outage. What was your approach?", "type": "behavioral", "difficulty": "Advanced", "category": "Problem Solving", "follow_up": "How did you communicate to stakeholders?"},
    {"text": "Tell me about a time you disagreed with your manager. How did you handle it?", "type": "behavioral", "difficulty": "Intermediate", "category": "Communication", "follow_up": None},
    {"text": "Describe a situation where you had to learn a new technology quickly. What was your strategy?", "type": "behavioral", "difficulty": "Beginner", "category": "Learning & Growth", "follow_up": "What resources did you use?"},
    {"text": "Give me an example of when you went above and beyond your job responsibilities.", "type": "behavioral", "difficulty": "Beginner", "category": "Initiative", "follow_up": None},
    {"text": "Describe a time when you failed. What did you learn from it?", "type": "behavioral", "difficulty": "Intermediate", "category": "Self-Awareness", "follow_up": "How did you apply that learning?"},
    {"text": "Tell me about a time you had to collaborate with a difficult team member.", "type": "behavioral", "difficulty": "Intermediate", "category": "Teamwork", "follow_up": "What was the outcome?"},
    {"text": "Describe your most significant technical achievement in the last 2 years.", "type": "behavioral", "difficulty": "Advanced", "category": "Achievement", "follow_up": "What was your specific contribution?"},

    # ── HR / Cultural ─────────────────────────────────────────────────────────
    {"text": "Why are you interested in this role and our company?", "type": "hr", "difficulty": "Beginner", "category": "Motivation", "follow_up": None},
    {"text": "Where do you see yourself in 5 years?", "type": "hr", "difficulty": "Beginner", "category": "Career Goals", "follow_up": "How does this role fit into that plan?"},
    {"text": "What is your greatest professional strength? Give a concrete example.", "type": "hr", "difficulty": "Beginner", "category": "Self-Assessment", "follow_up": None},
    {"text": "What is an area you are actively working to improve?", "type": "hr", "difficulty": "Intermediate", "category": "Growth Mindset", "follow_up": "What steps are you taking?"},
    {"text": "How do you handle working under pressure or with ambiguous requirements?", "type": "hr", "difficulty": "Intermediate", "category": "Adaptability", "follow_up": None},
    {"text": "Describe your ideal work environment and team culture.", "type": "hr", "difficulty": "Beginner", "category": "Culture Fit", "follow_up": None},
    {"text": "What motivates you to do your best work?", "type": "hr", "difficulty": "Beginner", "category": "Motivation", "follow_up": None},
    {"text": "How do you keep up with industry trends and continue learning?", "type": "hr", "difficulty": "Intermediate", "category": "Continuous Learning", "follow_up": None},

    # ── Leadership / Management ───────────────────────────────────────────────
    {"text": "How do you set goals and measure success for your team?", "type": "leadership", "difficulty": "Advanced", "category": "Management", "follow_up": None},
    {"text": "Describe your approach to giving constructive feedback to a team member.", "type": "leadership", "difficulty": "Intermediate", "category": "Coaching", "follow_up": "How do you handle pushback?"},
    {"text": "How have you handled a situation where a team member was underperforming?", "type": "leadership", "difficulty": "Advanced", "category": "People Management", "follow_up": None},
    {"text": "Tell me about a time you had to make an important decision with incomplete information.", "type": "leadership", "difficulty": "Advanced", "category": "Decision Making", "follow_up": "What was the outcome?"},
]


async def seed():
    client = AsyncIOMotorClient(MONGODB_URL)
    db = client[DB_NAME]

    print("🌱 Seeding database...")

    # ── Admin user ─────────────────────────────────────────────────────────────
    existing_admin = await db.users.find_one({"email": "admin@interviewai.com"})
    if not existing_admin:
        await db.users.insert_one({
            "name": "Platform Admin",
            "email": "admin@interviewai.com",
            "password_hash": pwd_context.hash("Admin@123"),
            "role": "admin",
            "created_at": datetime.utcnow(),
            "total_interviews": 0,
            "avg_score": 0.0,
            "is_active": True,
        })
        print("✅ Admin user created: admin@interviewai.com / Admin@123")
    else:
        print("⏩ Admin user already exists")

    # ── Demo candidate ─────────────────────────────────────────────────────────
    existing_demo = await db.users.find_one({"email": "demo@interviewai.com"})
    if not existing_demo:
        await db.users.insert_one({
            "name": "Demo Candidate",
            "email": "demo@interviewai.com",
            "password_hash": pwd_context.hash("Demo@123"),
            "role": "candidate",
            "created_at": datetime.utcnow(),
            "total_interviews": 4,
            "avg_score": 78.0,
            "is_active": True,
        })
        print("✅ Demo candidate created: demo@interviewai.com / Demo@123")
    else:
        print("⏩ Demo candidate already exists")

    # ── Questions ──────────────────────────────────────────────────────────────
    existing_count = await db.questions.count_documents({})
    if existing_count < len(QUESTIONS):
        # Clear and re-insert
        await db.questions.delete_many({})
        docs = [{**q, "created_at": datetime.utcnow()} for q in QUESTIONS]
        result = await db.questions.insert_many(docs)
        print(f"✅ Inserted {len(result.inserted_ids)} questions")
    else:
        print(f"⏩ Questions already seeded ({existing_count} docs)")

    # ── Indexes ────────────────────────────────────────────────────────────────
    await db.users.create_index("email", unique=True)
    await db.interviews.create_index([("user_id", 1), ("created_at", -1)])
    await db.analysis_frames.create_index([("interview_id", 1), ("timestamp", 1)])
    await db.questions.create_index([("type", 1), ("difficulty", 1)])
    print("✅ Indexes created")

    client.close()
    print("\n🎉 Seed complete!")
    print("   Admin:  admin@interviewai.com  /  Admin@123")
    print("   Demo:   demo@interviewai.com   /  Demo@123")


if __name__ == "__main__":
    asyncio.run(seed())
