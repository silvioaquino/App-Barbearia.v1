from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from typing import List
from datetime import datetime

from database import get_db
from auth import get_current_barber
from models import CashRegister, ServiceHistory
from schemas import CashRegisterOpen, CashRegisterClose, CashRegisterResponse

router = APIRouter(prefix="/cash-register", tags=["cash-register"])

@router.post("/open", response_model=CashRegisterResponse)
async def open_cash_register(
    data: CashRegisterOpen,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_barber)
):
    """Open cash register"""
    
    # Check if there's already an open cash register
    result = await db.execute(
        select(CashRegister).where(
            and_(
                CashRegister.barber_id == current_user.user_id,
                CashRegister.status == "open"
            )
        )
    )
    existing = result.scalar_one_or_none()
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cash register already open"
        )
    
    cash_register = CashRegister(
        barber_id=current_user.user_id,
        opening_balance=data.opening_balance,
        status="open"
    )
    
    db.add(cash_register)
    await db.commit()
    await db.refresh(cash_register)
    
    return cash_register

@router.post("/close", response_model=CashRegisterResponse)
async def close_cash_register(
    data: CashRegisterClose,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_barber)
):
    """Close cash register"""
    
    # Find open cash register
    result = await db.execute(
        select(CashRegister).where(
            and_(
                CashRegister.barber_id == current_user.user_id,
                CashRegister.status == "open"
            )
        )
    )
    cash_register = result.scalar_one_or_none()
    
    if not cash_register:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No open cash register found"
        )
    
    # Calculate totals from service history
    history_result = await db.execute(
        select(ServiceHistory).where(
            ServiceHistory.cash_register_id == cash_register.id
        )
    )
    services = history_result.scalars().all()
    
    total_services = sum(service.price_paid for service in services)
    
    cash_register.closing_balance = data.closing_balance
    cash_register.total_services = total_services
    cash_register.closed_at = datetime.utcnow()
    cash_register.status = "closed"
    
    await db.commit()
    await db.refresh(cash_register)
    
    return cash_register

@router.get("/current", response_model=CashRegisterResponse)
async def get_current_cash_register(
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_barber)
):
    """Get current open cash register"""
    
    result = await db.execute(
        select(CashRegister).where(
            and_(
                CashRegister.barber_id == current_user.user_id,
                CashRegister.status == "open"
            )
        )
    )
    cash_register = result.scalar_one_or_none()
    
    if not cash_register:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No open cash register found"
        )
    
    return cash_register

@router.get("/history", response_model=List[CashRegisterResponse])
async def get_cash_register_history(
    limit: int = 10,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_barber)
):
    """Get cash register history"""
    
    result = await db.execute(
        select(CashRegister)
        .where(CashRegister.barber_id == current_user.user_id)
        .order_by(CashRegister.opened_at.desc())
        .limit(limit)
    )
    registers = result.scalars().all()
    
    return registers
