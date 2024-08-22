"""
ASGI config for userState project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.1/howto/deployment/asgi/
"""

import os
from channels.auth import AuthMiddlewareStack
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.security.websocket import AllowedHostsOriginValidator
from channels.routing import ProtocolTypeRouter
from django.core.asgi import get_asgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'userState.settings')

application = get_asgi_application()

import userActivity.routing
from .auth_middleware import TokenAuthMiddlewareStack
from .error_middleware import ErrorHandlingMiddleware

# application = ProtocolTypeRouter(
#     {
#         "http": get_asgi_application(),
#         "websocket": AllowedHostsOriginValidator(
#             TokenAuthMiddlewareStack(URLRouter(userActivity.routing.websocket_urlpatterns))
#         ),
#     }
# )

application = ProtocolTypeRouter(
    {
        "http": get_asgi_application(),
        "websocket": AllowedHostsOriginValidator(
            ErrorHandlingMiddleware(  # Wrap the stack with ErrorHandlingMiddleware
                TokenAuthMiddlewareStack(
                    URLRouter(userActivity.routing.websocket_urlpatterns)
                )
            )
        ),
    }
)
