from channels.generic.websocket import AsyncWebsocketConsumer
import json
import logging

logger = logging.getLogger(__name__)

class NotificationConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        # Initialize group_name
        self.group_name = None
        self.user = self.scope["user"]
        # logger.info(f"Scope: {self.scope}")
        logger.info(f"User: {self.user}, Authenticated: {self.user.is_authenticated}")
        
        # Check if the user is authenticated
        if self.user.is_authenticated:
            # self.user_id = self.user.id  # Set user_id
            # self.group_name = f"user_{self.user_id}"  # Define the group name

            if self.user.is_staff:
                self.group_name = f"user_{self.user_id}"
            else:
                # Assuming non-staff users are dentists
                self.group_name = f"dentist_notifications_{self.user.id}"
            
            # Join the group
            await self.channel_layer.group_add(
                self.group_name,
                self.channel_name
            )

            await self.accept()  # Accept the WebSocket connection
            # logger.info(f"WebSocket connection accepted for user {self.user_id}")
        else:
            logger.warning("User is not authenticated, closing WebSocket.")
            await self.close()  # Close the connection if the user is not authenticated

    async def disconnect(self, close_code):
        # Check if group_name is set before attempting to discard
        if self.group_name is not None:
            # Leave the group when the WebSocket is disconnected
            await self.channel_layer.group_discard(
                self.group_name,
                self.channel_name
            )

    async def send_notification(self, event):
        # Send notification to WebSocket
        message = event['message']
        appointment_id = event['appointment_id']
        patient_image_url = event['patient_image_url']
        timestamp = event['timestamp'] 
        await self.send(text_data=json.dumps({
            'message': message,
            'patient_image_url': patient_image_url,
            'timestamp': timestamp,
            'appointment_id': appointment_id,
        }))
