from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from datetime import datetime

from database import get_db
from auth import get_current_user, get_current_barber
from models import Appointment, PushToken, User
from schemas import AppointmentCreate, AppointmentUpdate, AppointmentResponse
from notification_service import notification_service

router = APIRouter(prefix="/appointments", tags=["appointments"])

async def send_appointment_notifications(
    appointment_id: int,
    db: AsyncSession
):
    """Background task to send appointment notifications to barbers"""
    try:
        # Get all barber tokens
        result = await db.execute(
            select(PushToken, User).join(
                User, PushToken.user_id == User.user_id
            ).where(
                (User.role == "barber") &
                (PushToken.is_active == True)
            )
        )
        tokens = [row[0].token for row in result.all()]
        
        if tokens:
            # Get appointment details
            appt_result = await db.execute(
                select(Appointment).where(Appointment.id == appointment_id)
            )
            appointment = appt_result.scalar_one_or_none()
            
            if appointment:
                await notification_service.send_appointment_notification(
                    tokens=tokens,
                    appointment_data={
                        "id": appointment.id,
                        "scheduled_time": appointment.scheduled_time.strftime("%d/%m/%Y %H:%M")
                    }
                )
                
                # Mark notification as sent
                appointment.notification_sent = True
                await db.commit()
    except Exception as e:
        print(f"Error sending notifications: {e}")

@router.post("/", response_model=AppointmentResponse, status_code=status.HTTP_201_CREATED)
async def create_appointment(
    appointment_data: AppointmentCreate,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new appointment"""
    
    appointment = Appointment(
        client_id=current_user.user_id,
        service_id=appointment_data.service_id,
        scheduled_time=appointment_data.scheduled_time,
        notes=appointment_data.notes,
        status="pending"
    )
    
    db.add(appointment)
    await db.commit()
    await db.refresh(appointment)
    
    # Send notification in background
    background_tasks.add_task(
        send_appointment_notifications,
        appointment.id,
        db
    )
    
    return appointment

@router.get("/", response_model=List[AppointmentResponse])
async def list_appointments(
    status_filter: str = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List appointments"""
    
    # Barbers see all appointments, clients see only their own
    query = select(Appointment)
    
    if current_user.role == "client":
        query = query.where(Appointment.client_id == current_user.user_id)
    
    if status_filter:
        query = query.where(Appointment.status == status_filter)
    
    query = query.order_by(Appointment.scheduled_time.desc())
    
    result = await db.execute(query)
    appointments = result.scalars().all()
    
    return appointments

@router.get("/{appointment_id}", response_model=AppointmentResponse)
async def get_appointment(
    appointment_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get appointment by ID"""
    
    result = await db.execute(
        select(Appointment).where(Appointment.id == appointment_id)
    )
    appointment = result.scalar_one_or_none()
    
    if not appointment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Appointment not found"
        )
    
    # Check permissions
    if current_user.role == "client" and appointment.client_id != current_user.user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this appointment"
        )
    
    return appointment

@router.put("/{appointment_id}", response_model=AppointmentResponse)
async def update_appointment(
    appointment_id: int,
    appointment_data: AppointmentUpdate,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_barber)
):
    """Update appointment (barber only)"""
    
    result = await db.execute(
        select(Appointment).where(Appointment.id == appointment_id)
    )
    appointment = result.scalar_one_or_none()
    
    if not appointment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Appointment not found"
        )
    
    # Update fields
    update_data = appointment_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(appointment, field, value)
    
    await db.commit()
    await db.refresh(appointment)
    
    return appointment

@router.post("/{appointment_id}/confirm")
async def confirm_appointment(
    appointment_id: int,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_barber)
):
    """Confirm appointment"""
    
    result = await db.execute(
        select(Appointment).where(Appointment.id == appointment_id)
    )
    appointment = result.scalar_one_or_none()
    
    if not appointment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Appointment not found"
        )
    
    appointment.status = "confirmed"
    await db.commit()
    
    return {"message": "Appointment confirmed successfully"}

@router.post("/{appointment_id}/cancel")
async def cancel_appointment(
    appointment_id: int,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_barber)
):
    """Cancel appointment"""
    
    result = await db.execute(
        select(Appointment).where(Appointment.id == appointment_id)
    )
    appointment = result.scalar_one_or_none()
    
    if not appointment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Appointment not found"
        )
    
    appointment.status = "cancelled"
    await db.commit()
    
    return {"message": "Appointment cancelled successfully"}

@router.post("/{appointment_id}/complete")
async def complete_appointment(
    appointment_id: int,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_barber)
):
    """Mark appointment as completed"""
    
    result = await db.execute(
        select(Appointment).where(Appointment.id == appointment_id)
    )
    appointment = result.scalar_one_or_none()
    
    if not appointment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Appointment not found"
        )
    
    appointment.status = "completed"
    await db.commit()
    
    return {"message": "Appointment completed successfully"}
