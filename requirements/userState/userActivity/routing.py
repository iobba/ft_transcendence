from django.urls import re_path

from . import user_activity_consumer

websocket_urlpatterns = [
    re_path(r"ws/user-activity$", user_activity_consumer.UserActivityConsumer.as_asgi()),
]