"""
ASGI config for gameBack project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/4.2/howto/deployment/asgi/
"""


import os
from channels.auth import AuthMiddlewareStack
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.security.websocket import AllowedHostsOriginValidator
from channels.routing import ProtocolTypeRouter
from django.core.asgi import get_asgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'gameBack.settings')

application = get_asgi_application()

import game.routing
from .auth_middleware import TokenAuthMiddlewareStack
from .error_middleware import ErrorHandlingMiddleware

# application = ProtocolTypeRouter(
#     {
#         "http": get_asgi_application(),
#         "websocket": AllowedHostsOriginValidator(
#             TokenAuthMiddlewareStack(URLRouter(game.routing.websocket_urlpatterns))
#         ),
#     }
# )

application = ProtocolTypeRouter(
    {
        "http": get_asgi_application(),
        "websocket": AllowedHostsOriginValidator(
            ErrorHandlingMiddleware(  # Wrap the stack with ErrorHandlingMiddleware
                TokenAuthMiddlewareStack(
                    URLRouter(game.routing.websocket_urlpatterns)
                )
            )
        ),
    }
)