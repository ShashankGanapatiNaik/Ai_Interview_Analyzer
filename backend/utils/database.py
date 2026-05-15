"""MongoDB async connection via Motor."""

import logging
from motor.motor_asyncio import AsyncIOMotorClient
from utils.config import settings

logger = logging.getLogger(__name__)

client: AsyncIOMotorClient = None
db = None


async def connect_db():
    global client, db
    client = AsyncIOMotorClient(settings.MONGODB_URL)
    db = client[settings.DB_NAME]
    # Create indexes
    await _create_indexes()
    logger.info(f"Connected to MongoDB: {settings.DB_NAME}")


async def disconnect_db():
    global client
    if client:
        client.close()
        logger.info("MongoDB disconnected.")


async def _create_indexes():
    """Create necessary MongoDB indexes for performance."""
    await db.users.create_index("email", unique=True)
    await db.interviews.create_index([("user_id", 1), ("created_at", -1)])
    await db.analysis_frames.create_index([("interview_id", 1), ("timestamp", 1)])
    await db.questions.create_index([("type", 1), ("difficulty", 1)])


def get_db():
    return db
