"""
Background scheduler for sending WhatsApp appointment reminders.
Runs every 5 minutes, checks for confirmed appointments in the next hour,
and sends reminders via WhatsApp.
"""
import asyncio
import logging
from datetime import datetime, timedelta
from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession

from database import async_session_factory
from models import Appointment, Service, WhatsAppSettings
from routes.whatsapp_routes import send_whatsapp_message

logger = logging.getLogger(__name__)

REMINDER_INTERVAL_SECONDS = 300  # 5 minutes
REMINDER_WINDOW_MINUTES = 60     # 1 hour before


async def send_appointment_reminders():
    """Check for upcoming appointments and send WhatsApp reminders"""
    try:
        async with async_session_factory() as db:
            # Get active WhatsApp settings
            settings_result = await db.execute(
                select(WhatsAppSettings).where(WhatsAppSettings.is_active == True)
            )
            settings = settings_result.scalar_one_or_none()
            
            if not settings or not settings.access_token or not settings.phone_number_id:
                return  # No WhatsApp configured, skip silently
            
            now = datetime.utcnow()
            window_start = now + timedelta(minutes=REMINDER_WINDOW_MINUTES - 10)  # 50min from now
            window_end = now + timedelta(minutes=REMINDER_WINDOW_MINUTES + 10)    # 70min from now
            
            # Find confirmed appointments in the reminder window that haven't been notified
            result = await db.execute(
                select(Appointment, Service.name).join(
                    Service, Appointment.service_id == Service.id
                ).where(and_(
                    Appointment.status.in_(["confirmed", "pending"]),
                    Appointment.notification_sent == False,
                    Appointment.scheduled_time >= window_start,
                    Appointment.scheduled_time <= window_end,
                    Appointment.client_phone != None,
                    Appointment.client_phone != "",
                ))
            )
            rows = result.all()
            
            if not rows:
                return
            
            logger.info(f"[Reminder] Encontrados {len(rows)} agendamento(s) para lembrete")
            
            for appointment, service_name in rows:
                client_name = appointment.client_name or "Cliente"
                scheduled = appointment.scheduled_time.strftime("%H:%M")
                scheduled_date = appointment.scheduled_time.strftime("%d/%m/%Y")
                
                message = (
                    f"Olá {client_name}! Lembrete: seu agendamento de "
                    f"{service_name} é hoje ({scheduled_date}) às {scheduled}. "
                    f"Te esperamos!"
                )
                
                success = await send_whatsapp_message(
                    settings.phone_number_id,
                    settings.access_token,
                    appointment.client_phone,
                    message,
                )
                
                # Mark as notified regardless of send success to avoid spam
                appointment.notification_sent = True
                logger.info(
                    f"[Reminder] {'Enviado' if success else 'Falha ao enviar'} para "
                    f"{appointment.client_phone} - {service_name} às {scheduled}"
                )
            
            await db.commit()
            
    except Exception as e:
        logger.error(f"[Reminder] Erro no scheduler: {e}")


async def reminder_scheduler_loop():
    """Main loop that runs send_appointment_reminders periodically"""
    logger.info("[Reminder] Scheduler de lembretes iniciado (a cada 5 min)")
    while True:
        await send_appointment_reminders()
        await asyncio.sleep(REMINDER_INTERVAL_SECONDS)
