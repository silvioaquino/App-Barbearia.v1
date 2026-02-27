from fastapi import APIRouter, Depends, HTTPException, status, Response
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete

from database import get_db
from auth import exchange_session_id, create_user_session, get_current_user
from models import User, UserSession
from schemas import UserResponse

router = APIRouter(prefix="/auth", tags=["authentication"])

@router.post("/session")
async def create_session(
    session_id: str,
    response: Response,
    db: AsyncSession = Depends(get_db)
):
    """Exchange session_id for session_token"""
    
    # Get user data from Emergent Auth
    user_data = await exchange_session_id(session_id)
    
    # Create user and session
    user, session_token = await create_user_session(user_data, db)
    
    # Set cookie
    response.set_cookie(
        key="session_token",
        value=session_token,
        httponly=True,
        secure=True,
        samesite="none",
        max_age=7 * 24 * 60 * 60,  # 7 days
        path="/"
    )
    
    return {
        "user": UserResponse.model_validate(user),
        "session_token": session_token
    }

@router.get("/me", response_model=UserResponse)
async def get_me(
    current_user: User = Depends(get_current_user)
):
    """Get current user info"""
    return current_user

@router.post("/logout")
async def logout(
    response: Response,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Logout user"""
    
    # Delete all user sessions
    await db.execute(
        delete(UserSession).where(UserSession.user_id == current_user.user_id)
    )
    await db.commit()
    
    # Clear cookie
    response.delete_cookie(key="session_token", path="/")
    
    return {"message": "Logged out successfully"}

@router.post("/promote-to-barber")
async def promote_to_barber(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Promote current user to barber (for demo purposes)"""
    
    current_user.role = "barber"
    await db.commit()
    await db.refresh(current_user)
    
    return UserResponse.model_validate(current_user)
