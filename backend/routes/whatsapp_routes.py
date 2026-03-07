from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from typing import Optional
from pydantic import BaseModel
import httpx

from database import get_db
from auth import get_current_barber
from models import WhatsAppSettings, User

router = APIRouter(prefix="/whatsapp", tags=["whatsapp"])

WHATSAPP_API_URL = "https://graph.facebook.com/v21.0"


class WhatsAppSettingsUpdate(BaseModel):
    phone_number_id: Optional[str] = None
    access_token: Optional[str] = None
    business_phone: Optional[str] = None
    is_active: bool = False


class WhatsAppSettingsResponse(BaseModel):
    id: int
    phone_number_id: Optional[str]
    business_phone: Optional[str]
    is_active: bool
    has_token: bool

    class Config:
        from_attributes = True


@router.get("/settings")
async def get_whatsapp_settings(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_barber)
):
    result = await db.execute(
        select(WhatsAppSettings).where(WhatsAppSettings.barber_id == current_user.user_id)
    )
    settings = result.scalar_one_or_none()
    if not settings:
        return {"id": 0, "phone_number_id": None, "business_phone": None, "is_active": False, "has_token": False}
    return {
        "id": settings.id,
        "phone_number_id": settings.phone_number_id,
        "business_phone": settings.business_phone,
        "is_active": settings.is_active,
        "has_token": bool(settings.access_token),
    }


@router.put("/settings")
async def update_whatsapp_settings(
    data: WhatsAppSettingsUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_barber)
):
    result = await db.execute(
        select(WhatsAppSettings).where(WhatsAppSettings.barber_id == current_user.user_id)
    )
    settings = result.scalar_one_or_none()
    
    if not settings:
        settings = WhatsAppSettings(barber_id=current_user.user_id)
        db.add(settings)
    
    if data.phone_number_id is not None:
        settings.phone_number_id = data.phone_number_id
    if data.access_token is not None:
        settings.access_token = data.access_token
    if data.business_phone is not None:
        settings.business_phone = data.business_phone
    settings.is_active = data.is_active
    
    await db.commit()
    await db.refresh(settings)
    
    return {
        "message": "Configurações salvas com sucesso",
        "is_active": settings.is_active,
        "has_token": bool(settings.access_token),
    }


@router.post("/test")
async def test_whatsapp(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_barber)
):
    """Send a test message to verify WhatsApp integration"""
    result = await db.execute(
        select(WhatsAppSettings).where(
            and_(WhatsAppSettings.barber_id == current_user.user_id, WhatsAppSettings.is_active == True)
        )
    )
    settings = result.scalar_one_or_none()
    if not settings or not settings.access_token:
        raise HTTPException(status_code=400, detail="WhatsApp não configurado ou desativado")
    
    if not settings.business_phone:
        raise HTTPException(status_code=400, detail="Número de telefone do negócio não configurado")
    
    success = await send_whatsapp_message(
        settings.phone_number_id,
        settings.access_token,
        settings.business_phone,
        "Teste de integração WhatsApp Business API. Sua barbearia está configurada!"
    )
    
    if success:
        return {"message": "Mensagem de teste enviada com sucesso!"}
    raise HTTPException(status_code=500, detail="Falha ao enviar mensagem de teste")


async def send_whatsapp_message(phone_number_id: str, access_token: str, to_phone: str, message: str) -> bool:
    """Send a WhatsApp message via Meta Business API"""
    try:
        url = f"{WHATSAPP_API_URL}/{phone_number_id}/messages"
        headers = {
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json",
        }
        payload = {
            "messaging_product": "whatsapp",
            "to": to_phone.replace("+", "").replace(" ", "").replace("-", "").replace("(", "").replace(")", ""),
            "type": "text",
            "text": {"body": message}
        }
        async with httpx.AsyncClient() as client:
            response = await client.post(url, json=payload, headers=headers)
            print(f"WhatsApp API response: {response.status_code} {response.text}")
            return response.status_code == 200
    except Exception as e:
        print(f"WhatsApp send error: {e}")
        return False


async def notify_appointment(db: AsyncSession, appointment_data: dict, event_type: str):
    """Send WhatsApp notification for appointment events"""
    # Get active WhatsApp settings
    result = await db.execute(
        select(WhatsAppSettings).where(WhatsAppSettings.is_active == True)
    )
    settings_list = result.scalars().all()
    
    client_phone = appointment_data.get("client_phone", "")
    client_name = appointment_data.get("client_name", "Cliente")
    service_name = appointment_data.get("service_name", "Serviço")
    scheduled_time = appointment_data.get("scheduled_time", "")
    
    messages = {
        "new_booking": f"Olá {client_name}! Seu agendamento foi recebido.\n\nServiço: {service_name}\nData/Hora: {scheduled_time}\nStatus: Pendente\n\nAguarde a confirmação do barbeiro.",
        "confirmed": f"Olá {client_name}! Seu agendamento foi CONFIRMADO!\n\nServiço: {service_name}\nData/Hora: {scheduled_time}\n\nTe esperamos!",
        "cancelled": f"Olá {client_name}, seu agendamento foi cancelado.\n\nServiço: {service_name}\nData/Hora: {scheduled_time}\n\nPara reagendar, acesse nosso site.",
        "completed": f"Olá {client_name}! Obrigado pela visita!\n\nServiço: {service_name}\n\nEsperamos vê-lo novamente!",
    }
    
    message = messages.get(event_type, "")
    if not message:
        return
    
    for settings in settings_list:
        if settings.access_token and settings.phone_number_id and client_phone:
            await send_whatsapp_message(
                settings.phone_number_id,
                settings.access_token,
                client_phone,
                message
            )


async def send_daily_summary(db: AsyncSession, barber_id: str, summary_data: dict):
    """Send daily summary via WhatsApp when cash register is closed"""
    result = await db.execute(
        select(WhatsAppSettings).where(
            and_(WhatsAppSettings.barber_id == barber_id, WhatsAppSettings.is_active == True)
        )
    )
    settings = result.scalar_one_or_none()
    if not settings or not settings.access_token or not settings.business_phone:
        print(f"[WhatsApp] Resumo diário não enviado: configuração ausente para barber {barber_id}")
        return

    total_services = summary_data.get("total_services", 0)
    total_products = summary_data.get("total_products", 0)
    total_revenue = total_services + total_products
    completed_count = summary_data.get("completed_count", 0)
    cancelled_count = summary_data.get("cancelled_count", 0)
    tomorrow_appointments = summary_data.get("tomorrow_appointments", [])

    msg = f"RESUMO DO DIA\n\n"
    msg += f"Atendimentos concluídos: {completed_count}\n"
    if cancelled_count > 0:
        msg += f"Cancelamentos: {cancelled_count}\n"
    msg += f"\n--- FATURAMENTO ---\n"
    msg += f"Serviços: R$ {total_services:.2f}\n"
    msg += f"Produtos: R$ {total_products:.2f}\n"
    msg += f"TOTAL: R$ {total_revenue:.2f}\n"

    if tomorrow_appointments:
        msg += f"\n--- AMANHÃ ({len(tomorrow_appointments)} agendamento(s)) ---\n"
        for apt in tomorrow_appointments:
            msg += f"  {apt['time']} - {apt['client']} ({apt['service']})\n"
    else:
        msg += f"\nNenhum agendamento para amanhã."

    msg += f"\nBom descanso!"

    await send_whatsapp_message(
        settings.phone_number_id,
        settings.access_token,
        settings.business_phone,
        msg
    )
