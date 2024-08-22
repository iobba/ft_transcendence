from django.urls import re_path

from . import duo_game_consumer
from . import quad_game_consumer

websocket_urlpatterns = [
    re_path(r"ws/duo-game$", duo_game_consumer.GameConsumer.as_asgi()),
    re_path(r"ws/quad-game$", quad_game_consumer.QuadGameConsumer.as_asgi())
]
