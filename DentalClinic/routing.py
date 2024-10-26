from django.urls import path
from .consumers import NotificationConsumer  # Import your WebSocket consumer

websocket_urlpatterns = [
    path('ws/notifications/', NotificationConsumer.as_asgi()),  # Adjust this path to match your frontend connection
]
