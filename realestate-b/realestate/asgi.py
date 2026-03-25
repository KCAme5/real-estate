"""
ASGI config for realestate project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.2/howto/deployment/asgi/
"""

import os
from urllib.parse import parse_qs

from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "realestate.settings")

# Initialize Django ASGI application early to ensure AppRegistry is populated
django_asgi_app = get_asgi_application()

# Import WebSocket routing after Django is initialized
from leads.routing import websocket_urlpatterns


class JWTAuthMiddleware:
    """
    Custom middleware to authenticate WebSocket connections using JWT tokens
    """

    def __init__(self, inner):
        self.inner = inner

    async def __call__(self, scope, receive, send):
        # Only process WebSocket connections
        if scope["type"] != "websocket":
            await self.inner(scope, receive, send)
            return

        # Try to get JWT token from query string or headers
        user = await self.get_user_from_token(scope)
        scope["user"] = user
        await self.inner(scope, receive, send)

    async def get_user_from_token(self, scope):
        """Authenticate user from JWT token in query params or headers"""
        from django.contrib.auth import get_user_model
        from django.contrib.auth.models import AnonymousUser
        from rest_framework_simplejwt.tokens import AccessToken
        from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
        from asgiref.sync import sync_to_async

        User = get_user_model()

        # Try to get token from query string first
        query_string = scope.get("query_string", b"").decode()
        token = None

        if query_string:
            try:
                query_params = parse_qs(query_string)
                token = query_params.get("token", [None])[0]
            except Exception:
                pass

        # If not in query string, try headers
        if not token:
            headers = dict(scope.get("headers", []))
            auth_header = headers.get(b"authorization", b"").decode()
            if auth_header.startswith("Bearer "):
                token = auth_header[7:]

        # Validate token and get user
        if token:
            try:
                decoded = AccessToken(token)
                user_id = decoded.get("user_id")
                user = await sync_to_async(User.objects.get)(id=user_id)
                return user
            except (InvalidToken, TokenError, User.DoesNotExist):
                pass

        return AnonymousUser()


application = ProtocolTypeRouter(
    {
        "http": django_asgi_app,
        "websocket": JWTAuthMiddleware(URLRouter(websocket_urlpatterns)),
    }
)
