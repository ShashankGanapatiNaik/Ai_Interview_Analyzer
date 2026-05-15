"""
AI Interview Behavior Analyzer — FastAPI Backend
Main application entry point
"""

import asyncio
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.staticfiles import StaticFiles

from utils.config import settings
from utils.database import connect_db, disconnect_db
from routers import auth, interviews, analysis, reports, admin, websocket, questions

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown lifecycle."""
    logger.info("Starting AI Interview Behavior Analyzer API...")
    await connect_db()
    logger.info("MongoDB connected.")
    yield
    logger.info("Shutting down...")
    await disconnect_db()


app = FastAPI(
    title="AI Interview Behavior Analyzer",
    description="Real-time behavioral AI analysis for mock interviews",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# ── Middleware ────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(GZipMiddleware, minimum_size=1000)

# ── Routers ───────────────────────────────────────────────────────────────────
app.include_router(auth.router,        prefix="/api/auth",       tags=["Authentication"])
app.include_router(interviews.router,  prefix="/api/interviews",  tags=["Interviews"])
app.include_router(analysis.router,    prefix="/api/analysis",    tags=["AI Analysis"])
app.include_router(reports.router,     prefix="/api/reports",     tags=["Reports"])
app.include_router(admin.router,       prefix="/api/admin",       tags=["Admin"])
app.include_router(questions.router,   prefix="/api/questions",   tags=["Questions"])
app.include_router(websocket.router,   prefix="/ws",              tags=["WebSocket"])

# ── Static files (uploads) ────────────────────────────────────────────────────
import os
os.makedirs("uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")


@app.get("/health", tags=["Health"])
async def health_check():
    return {"status": "healthy", "service": "AI Interview Analyzer", "version": "1.0.0"}


@app.get("/", tags=["Root"])
async def root():
    return {
        "message": "AI Interview Behavior Analyzer API",
        "docs": "/docs",
        "health": "/health",
    }
