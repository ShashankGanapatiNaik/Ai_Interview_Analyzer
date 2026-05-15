"""Authentication router: register, login, refresh, logout."""

from datetime import datetime
from fastapi import APIRouter, HTTPException, status, Depends
from bson import ObjectId

from models.schemas import UserCreate, UserLogin, TokenResponse, RefreshRequest, UserOut
from utils.auth import (
    hash_password, verify_password,
    create_access_token, create_refresh_token, decode_token,
    get_current_user,
)
from utils.database import get_db

router = APIRouter()


def _serialize_user(user: dict) -> UserOut:
    return UserOut(
        id=str(user["_id"]),
        name=user["name"],
        email=user["email"],
        role=user["role"],
        created_at=user["created_at"],
        total_interviews=user.get("total_interviews", 0),
        avg_score=user.get("avg_score", 0.0),
    )


@router.post("/register", response_model=TokenResponse, status_code=201)
async def register(payload: UserCreate):
    db = get_db()

    existing = await db.users.find_one({"email": payload.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    user_doc = {
        "name": payload.name,
        "email": payload.email,
        "password_hash": hash_password(payload.password),
        "role": payload.role if payload.role in ("candidate", "admin") else "candidate",
        "created_at": datetime.utcnow(),
        "total_interviews": 0,
        "avg_score": 0.0,
        "is_active": True,
    }
    result = await db.users.insert_one(user_doc)
    user_doc["_id"] = result.inserted_id

    token_data = {"sub": str(result.inserted_id), "email": payload.email, "role": user_doc["role"]}
    return TokenResponse(
        access_token=create_access_token(token_data),
        refresh_token=create_refresh_token(token_data),
        user=_serialize_user(user_doc),
    )


@router.post("/login", response_model=TokenResponse)
async def login(payload: UserLogin):
    db = get_db()

    user = await db.users.find_one({"email": payload.email})
    if not user or not verify_password(payload.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    if not user.get("is_active", True):
        raise HTTPException(status_code=403, detail="Account disabled")

    token_data = {"sub": str(user["_id"]), "email": user["email"], "role": user["role"]}
    return TokenResponse(
        access_token=create_access_token(token_data),
        refresh_token=create_refresh_token(token_data),
        user=_serialize_user(user),
    )


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(payload: RefreshRequest):
    db = get_db()
    decoded = decode_token(payload.refresh_token)
    if decoded.get("type") != "refresh":
        raise HTTPException(status_code=401, detail="Invalid refresh token")

    user = await db.users.find_one({"_id": ObjectId(decoded["sub"])})
    if not user:
        raise HTTPException(status_code=401, detail="User not found")

    token_data = {"sub": str(user["_id"]), "email": user["email"], "role": user["role"]}
    return TokenResponse(
        access_token=create_access_token(token_data),
        refresh_token=create_refresh_token(token_data),
        user=_serialize_user(user),
    )


@router.get("/me", response_model=UserOut)
async def get_me(current_user: dict = Depends(get_current_user)):
    return _serialize_user(current_user)


@router.put("/me")
async def update_profile(
    data: dict,
    current_user: dict = Depends(get_current_user),
):
    db = get_db()
    allowed = {k: v for k, v in data.items() if k in ("name",)}
    if not allowed:
        raise HTTPException(status_code=400, detail="No valid fields to update")
    await db.users.update_one({"_id": current_user["_id"]}, {"$set": allowed})
    return {"message": "Profile updated"}
