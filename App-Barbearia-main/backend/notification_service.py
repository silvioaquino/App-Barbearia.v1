from exponent_server_sdk import PushClient, PushMessage
from typing import List
import asyncio
from config import get_settings

settings = get_settings()

class NotificationService:
    """Service for sending push notifications"""
    
    def __init__(self):
        self.client = PushClient()
    
    async def send_notification(
        self,
        tokens: List[str],
        title: str,
        body: str,
        data: dict = None
    ) -> dict:
        """Send push notification to multiple tokens"""
        
        if not tokens:
            return {"success": False, "message": "No tokens provided"}
        
        messages = []
        for token in tokens:
            try:
                message = PushMessage(
                    to=token,
                    title=title,
                    body=body,
                    data=data or {},
                    sound="default",
                    priority="high"
                )
                messages.append(message)
            except Exception as e:
                print(f"Error creating message for token {token}: {e}")
        
        if not messages:
            return {"success": False, "message": "No valid messages created"}
        
        try:
            # Send messages in chunks of 100
            chunk_size = 100
            tickets = []
            
            for i in range(0, len(messages), chunk_size):
                chunk = messages[i:i + chunk_size]
                chunk_tickets = self.client.publish_multiple(chunk)
                tickets.extend(chunk_tickets)
            
            return {
                "success": True,
                "tickets": tickets,
                "sent_count": len(messages)
            }
        except Exception as e:
            return {
                "success": False,
                "message": f"Error sending notifications: {str(e)}"
            }
    
    async def send_appointment_notification(
        self,
        tokens: List[str],
        appointment_data: dict
    ):
        """Send appointment notification"""
        return await self.send_notification(
            tokens=tokens,
            title="Novo Agendamento",
            body=f"Novo agendamento para {appointment_data.get('scheduled_time')}",
            data={
                "type": "appointment",
                "appointment_id": str(appointment_data.get('id')),
                "screen": "appointments"
            }
        )

# Global notification service instance
notification_service = NotificationService()
