import json
import asyncio
import httpx
from channels.generic.websocket import AsyncWebsocketConsumer
import uuid
from collections import deque
from .quad_game import QuadGame
from .events import GameEvent
from .events import StatusCode
from django.contrib.auth.models import AnonymousUser

players_queue = deque()
quad_games = dict()


class QuadGameConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.accept()
        user = self.scope['user']
        print(user)
        if isinstance(user, AnonymousUser) or user.get('id') == None:
            return await self.close(StatusCode.UNAUTHENTICATED.value)
        player_id = user['id']
        if self.has_already_joined(player_id):
            return await self.close(StatusCode.ALREADY_JOINED.value)
        await self.handleGameJoin()

    async def disconnect(self, close_code=4400):
        if close_code == StatusCode.UNAUTHENTICATED.value or close_code == StatusCode.ALREADY_JOINED.value:
            return
        player_id = self.scope['user']['id']
        player_token = self.scope['token']
        if self.waiting_in_queue(player_id):
            try:
                players_queue.remove({
                    "id": player_id,
                    "channel": self.scope['channel'],
                    "token": player_token,
                    "username": self.scope['user']["username"]
                })
            except ValueError:
                pass
            return
        game = self.has_runnig_game(player_id)
        if game != None:
            await self.handle_unexpected_disconnection(game)

    async def handle_unexpected_disconnection(self, game):
        player_id = self.scope['user']['id']
        group_id = game.game_id
        if not game.is_over:
            game.interrupted = True
            game.is_over = True
            await self.channel_layer.group_discard(
                group_id, self.scope["channel"])
            if any(player['id'] == player_id for player in game.team1):
                game.loser_team = game.team1
                game.winner_team = game.team2
            else:
                game.loser_team = game.team2
                game.winner_team = game.team1
            game.winner_team[0]["score"] = game.winner_team[1]["score"] = 7
            game.loser_team[0]["score"] = game.loser_team[1]["score"] = 0
            await self.handle_winner(game)
        try:
            game.task.cancel()
            await self.channel_layer.group_discard(group_id,  self.scope["channel"])
            for pad, player in game.players.items():
                if player["id"] == player_id:
                    del game.players[pad]
                    break
            if len(game.players) == 0:
                del quad_games[group_id]
        except Exception:
            pass

    async def handleGameJoin(self):
        players_queue.append(
            {"id": self.scope['user']['id'], "channel": self.channel_name,
              "token": self.scope['token'], "username": self.scope['user']['username']})
        self.scope['channel'] = self.channel_name
        if len(players_queue) >= 4:
            self.game_id = uuid.uuid4().hex
            quad_games[self.game_id] = QuadGame(self.game_id)
            players = [players_queue.popleft() for _ in range(4)]
            teams = [(players[0], players[1]), (players[2], players[3])]
            quad_games[self.game_id].set_teams(teams[0], teams[1])
            for team in teams:
                await self.channel_layer.group_add(self.game_id, team[0]["channel"])
                await self.channel_layer.group_add(self.game_id, team[1]["channel"])
            await self.channel_layer.group_send(self.game_id, {
                "type": "game.start",
                "gameId": self.game_id,
                "players": [player["username"] for player in players],
            })
            task = asyncio.create_task(self.game_loop())
            quad_games[self.game_id].task = task

    async def game_loop(self):
        game = quad_games[self.game_id]
        game.started = True
        while game.check_for_winner() == False:
            vert_wall_coll = game.check_vert_wall_coll()
            hor_wall_coll = game.check_hor_wall_coll()
            if vert_wall_coll or hor_wall_coll:
                if vert_wall_coll:
                    game.update_vert_score()
                else:
                    game.update_hor_score()
                await self.handle_collision(game)
            game.update_ball_position()
            await self.send_ball_position(game)
            await asyncio.sleep(0.06)
        game.is_over = True
        if not game.interrupted:
            await self.handle_winner(game)

    async def handle_collision(self, game):
        game.reset_ball()
        top_score = game.players["top"]["score"]
        bottom_score = game.players["bottom"]["score"]
        await self.channel_layer.group_send(game.game_id, {
            "type": "game.update_score",
            "score": {
                "top": top_score,
                "bottom": bottom_score,
            },
            "ballPos": {
                "x": game.ball["position"]["x"],
                "z": game.ball["position"]["z"],
            }
        })

    async def handle_winner(self, game):
        await self.channel_layer.group_send(game.game_id, {
            "type": "game.announce_result",
                    "winner": [
                        {"username": game.winner_team[0]["username"], "score": game.winner_team[0]["score"]},
                        {"username": game.winner_team[1]["username"], "score": game.winner_team[1]["score"]}
                        ],
                    "loser": [
                        {"username": game.loser_team[0]["username"], "score": game.loser_team[0]["score"]},
                        {"username": game.loser_team[1]["username"], "score": game.loser_team[1]["score"]}
                    ]
        })
        await self.save_game_results(game.winner_team, game.loser_team)


    async def game_announce_result(self, event):
        await self.send(text_data=json.dumps({
            "type": GameEvent.GAME_OVER.value,
            "winnerTeam": event["winner"],
            "loserTeam": event["loser"],
        }))

    async def receive(self, text_data):
        user_id = self.scope['user']['id']
        try:
            text_data = json.loads(text_data)
        except json.decoder.JSONDecodeError:
            await self.send_error(GameEvent.ERROR.value, "invalid JSON")
            return
        await self.handle_game_event(text_data, user_id)

    async def handle_game_event(self, text_data, user_id):
        game = self.get_game_by_player_id(user_id)
        if not game or not game.started or game.is_over:
            return await self.send_error(GameEvent.ERROR.value, "invalid message")
        event_type = text_data.get("type")
        pad = self.get_pad_by_player_id(user_id, game)
        if event_type == GameEvent.L_KEY_PRESSED.value and (pad == "top" or pad == "bottom"):
            game.players[pad]["pad"]["dir"] = -1
        elif event_type == GameEvent.R_KEY_PRESSED.value and (pad == "top" or pad == "bottom"):
            game.players[pad]["pad"]["dir"] = 1
        elif event_type == GameEvent.U_KEY_PRESSED.value and (pad == "left" or pad == "right"):
            game.players[pad]["pad"]["dir"] = -1
        elif event_type == GameEvent.D_KEY_PRESSED.value and (pad == "left" or pad == "right"):
            game.players[pad]["pad"]["dir"] = 1
        else:
            return await self.send_error(GameEvent.ERROR.value, "invalid message")
        game.update_pad_position(pad)
        await self.send_pads_position(game, pad)

    async def game_start(self, event):
        player_id = self.scope["user"]["id"]
        game = quad_games[event["gameId"]]
        pad = next((pad for pad, player in game.players.items() if player["id"] == player_id), None)
        await self.send(text_data=json.dumps({
            "type": GameEvent.START.value,
            "gameId": event["gameId"],
            "players": event["players"],
            "pad": pad
        }))

    async def game_update_ball_pos(self, event):
        await self.send(text_data=json.dumps({
            "type": GameEvent.BALL_UPDATE.value,
            "ballXPos": event["ballXPos"],
            "ballZPos": event["ballZPos"]
        }))

    async def game_update_pads_pos(self, event):
        await self.send(text_data=json.dumps({
            "type": GameEvent.PAD_UPDATE.value,
            "position": event["position"],
            "which": event["which"]
        }))

    async def game_update_score(self, event):
        await self.send(text_data=json.dumps({
            "type": GameEvent.SCORE_UPDATE.value,
            "score": event["score"],
            "ballPos": event["ballPos"],
        }))


    async def send_ball_position(self, game):
        await self.channel_layer.group_send(game.game_id, {
            "type": "game.update_ball_pos",
            "ballXPos": game.ball["position"]["x"],
            "ballZPos": game.ball["position"]["z"]
        })

    async def send_error(self, event_type, message):
        await self.send(text_data=json.dumps({
            "type": event_type,
            "message": message
        }))

    async def send_pads_position(self, game, pad):
        await self.channel_layer.group_send(game.game_id, {
            "type": "game.update_pads_pos",
            "position": game.players[pad]["pad"]["position"],
            "which": pad
        })

    def get_game_by_player_id(self, player_id):
        for game_id in quad_games:
            for player in quad_games[game_id].players.values():
                if player["id"] == player_id:
                    return quad_games[game_id]
        return None

    def get_pad_by_player_id(self, player_id, game):
        for pad, player in game.players.items():
            if player["id"] == player_id:
                return pad
        return None

    def has_already_joined(self, player_id):
        return self.waiting_in_queue(player_id) or self.has_runnig_game(player_id)

    def waiting_in_queue(self, player_id):
        for player in players_queue:
            if player["id"] == player_id:
                return True
        return False

    def has_runnig_game(self, player_id):
        for key in quad_games:
            for player in quad_games[key].players.values():
                if player["id"] == player_id:
                    return quad_games[key]
        return None

    def player_has_scored(self, game):
        for player in game.players.values():
            if player["score"] > 0:
                return True
        return False

    async def save_game_results(self, winner_team, loser_team):
        print("saving game results")
        graphql_url = 'http://matches:8000/graphql'

        mutation = f"""
            mutation {{
                createMatch(
                    players: ["{winner_team[0]['token']}", "{winner_team[1]['token']}",
                    "{loser_team[0]['token']}", "{loser_team[1]['token']}"],
                    scores: [{winner_team[0]['score']}, {loser_team[0]['score']}],
                    ) {{
                    success,
                    match {{
                        id
                    }}
                    }}
                }}
        """
        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(graphql_url, json={'query': mutation})
                response_data = response.json()
                print(response_data)
                success = response_data.get('data', {}).get(
                    'createMatch', {}).get('success', False)
                return success
            except Exception as e:
                print(f"Error saving scores via GraphQL: {e}")
                return False
