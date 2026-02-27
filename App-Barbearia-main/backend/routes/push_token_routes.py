from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from typing import List

from database import get_db
from auth import get_current_user
from models import PushToken
from schemas import PushTokenRegister, PushTokenResponse

router = APIRouter(prefix="/push-tokens", tags=["push-tokens"])

@router.post("/register", response_model=PushTokenResponse)
async def register_push_token(
    data: PushTokenRegister,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Register push token"""
    
    # Check if token already exists
    result = await db.execute(
        select(PushToken).where(PushToken.token == data.token)
    )
    existing = result.scalar_one_or_none()
    
    if existing:
        # Update existing token
        existing.user_id = current_user.user_id
        existing.platform = data.platform
        existing.is_active = True
        await db.commit()
        await db.refresh(existing)
        return existing
    
    # Create new token
    push_token = PushToken(
        user_id=current_user.user_id,
        token=data.token,
        platform=data.platform
    )
    
    db.add(push_token)
    await db.commit()
    await db.refresh(push_token)
    
    return push_token

@router.delete("/deactivate")
async def deactivate_tokens(
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Deactivate all user tokens"""
    
    result = await db.execute(
        select(PushToken).where(PushToken.user_id == current_user.user_id)
    )
    tokens = result.scalars().all()
    
    for token in tokens:
        token.is_active = False
    
    await db.commit()
    
    return {"message": f"Deactivated {len(tokens)} tokens"}

@router.get("/", response_model=List[PushTokenResponse])
async def list_push_tokens(
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """List user's push tokens"""
    
    result = await db.execute(
        select(PushToken).where(
            PushToken.user_id == current_user.user_id
        )
    )
    tokens = result.scalars().all()
    
    return tokens
