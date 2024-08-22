import json
import httpx
from channels.generic.websocket import AsyncWebsocketConsumer
from django.contrib.auth.models import AnonymousUser
from .status_codes import StatusCode

users = {};

class UserActivityConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        print("Connecting")
        await self.accept()
        user = self.scope['user']
        if isinstance(user, AnonymousUser) or user.get('id') == None:
            return await self.close(StatusCode.UNAUTHENTICATED.value)
        user_id = user['id']
        if user_id in users:
            users[user_id] += 1
        else:
            users[user_id] = 1
            await self.updateState("true")
        
    
    async def disconnect(self, close_code):
        print("Disconnecting")
        if close_code == StatusCode.UNAUTHENTICATED.value:
            return
        user = self.scope['user']
        user_id = user['id']
        if user_id in users:
            users[user_id] -= 1
            if users[user_id] == 0:
                await self.updateState("false")
                del users[user_id]


    async def updateState(self, state):
        graphql_url = 'http://users:8000/graphql'

        token = self.scope['token']
        mutation = f"""
            mutation {{
                updateProfile(token: "{token}", isActive: {state}) {{
                    message,
                    success
                }}
            }}
        """
        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(graphql_url, json={'query': mutation})
                response_data = response.json()
                success = response_data.get('data', {}).get('updateProfile', {}).get('success', False)
                return success
            except Exception as e:
                print(f"Error saving scores via GraphQL: {e}")
                return False
