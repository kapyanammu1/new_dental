import os
from django.urls import path
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from DentalClinic import routing
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'DentalClinic.settings')

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": AuthMiddlewareStack(
        URLRouter(
            routing.websocket_urlpatterns  # Your WebSocket URL patterns
        )
    ),
})
