from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, func
from typing import List
from datetime import datetime, timedelta

from database import get_db
from auth import get_current_barber, get_current_user
from models import ServiceHistory, CashRegister, User, Service
from schemas import ServiceHistoryCreate, ServiceHistoryResponse, FinancialReport

router = APIRouter(prefix="/service-history", tags=["service-history"])

@router.post("/", response_model=ServiceHistoryResponse, status_code=status.HTTP_201_CREATED)
async def create_service_history(
    data: ServiceHistoryCreate,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_barber)
):
    """Create service history entry"""
    
    # Get current open cash register
    cash_result = await db.execute(
        select(CashRegister).where(
            and_(
                CashRegister.barber_id == current_user.user_id,
                CashRegister.status == "open"
            )
        )
    )
    cash_register = cash_result.scalar_one_or_none()
    
    history = ServiceHistory(
        client_id=data.client_id,
        barber_id=current_user.user_id,
        service_id=data.service_id,
        appointment_id=data.appointment_id,
        cash_register_id=cash_register.id if cash_register else None,
        price_paid=data.price_paid,
        photos=data.photos,
        notes=data.notes
    )
    
    db.add(history)
    await db.commit()
    await db.refresh(history)
    
    return history

@router.get("/client/{client_id}", response_model=List[ServiceHistoryResponse])
async def get_client_history(
    client_id: str,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Get service history for a client"""
    
    # Clients can only see their own history
    if current_user.role == "client" and current_user.user_id != client_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this history"
        )
    
    result = await db.execute(
        select(ServiceHistory)
        .where(ServiceHistory.client_id == client_id)
        .order_by(ServiceHistory.completed_at.desc())
    )
    history = result.scalars().all()
    
    return history

@router.get("/", response_model=List[ServiceHistoryResponse])
async def list_service_history(
    limit: int = 50,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_barber)
):
    """List all service history (barber only)"""
    
    result = await db.execute(
        select(ServiceHistory)
        .where(ServiceHistory.barber_id == current_user.user_id)
        .order_by(ServiceHistory.completed_at.desc())
        .limit(limit)
    )
    history = result.scalars().all()
    
    return history

@router.get("/reports/financial", response_model=FinancialReport)
async def get_financial_report(
    period: str = "daily",  # daily, weekly, monthly
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_barber)
):
    """Get financial report"""
    
    now = datetime.utcnow()
    
    if period == "daily":
        start_date = now.replace(hour=0, minute=0, second=0, microsecond=0)
        end_date = now
    elif period == "weekly":
        start_date = now - timedelta(days=7)
        end_date = now
    elif period == "monthly":
        start_date = now - timedelta(days=30)
        end_date = now
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid period. Use: daily, weekly, or monthly"
        )
    
    # Get service history in period
    result = await db.execute(
        select(ServiceHistory).where(
            and_(
                ServiceHistory.barber_id == current_user.user_id,
                ServiceHistory.completed_at >= start_date,
                ServiceHistory.completed_at <= end_date
            )
        )
    )
    services = result.scalars().all()
    
    total_services = sum(service.price_paid for service in services)
    services_count = len(services)
    
    # Get appointments count in period
    from models import Appointment
    appt_result = await db.execute(
        select(func.count(Appointment.id)).where(
            and_(
                Appointment.scheduled_time >= start_date,
                Appointment.scheduled_time <= end_date
            )
        )
    )
    appointments_count = appt_result.scalar() or 0
    
    return FinancialReport(
        period=period,
        start_date=start_date,
        end_date=end_date,
        total_services=total_services,
        total_products=0.0,  # TODO: Add products tracking
        total_revenue=total_services,
        services_count=services_count,
        appointments_count=appointments_count
    )
