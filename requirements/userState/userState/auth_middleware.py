import httpx
from channels.middleware import BaseMiddleware
from channels.auth import AuthMiddlewareStack
from http.cookies import SimpleCookie
from django.contrib.auth.models import AnonymousUser
from userActivity.status_codes import StatusCode


class TokenAuthMiddleware(BaseMiddleware):
    def __init__(self, app):
        self.app = app

    async def __call__(self, scope, receive, send):
        print("TokenAuth middleware")
        cookies = self.get_cookies(scope)
        cookies_dict = self.cookies_to_dict(cookies)
        token = cookies_dict.get('token')

        if token is None:
            scope['code'] = StatusCode.TOKEN_NOT_PROVIDED.value
            scope['user'] = AnonymousUser()
            print("invalid token")
            return await self.app(scope, receive, send)

        success = await self.validate_token_via_graphql(token)
        if not success:
            scope['code'] = StatusCode.INVALID_TOKEN.value
            scope['user'] = AnonymousUser()
            print("invalid token")
            return await self.app(scope, receive, send)

        user = await self.get_user(token)
        if user is None:
            scope['code'] = StatusCode.FAILED_TO_FETCH_USER.value
            scope['user'] = AnonymousUser()
            print("invalid token")
            return await self.app(scope, receive, send)

        scope['user'] = user
        scope['token'] = token
        return await self.app(scope, receive, send)

    def extract_token_from_scope(self, scope):
        try:
            return (dict((x.split('=') for x in scope['query_string'].decode().split("&")))).get('token', None)
        except ValueError:
            return None

    def cookies_to_dict(self, cookie_str):
        """
        convert cookie string to dictionary
        """
        cookie = SimpleCookie(cookie_str)
        return {key: morsel.value for key, morsel in cookie.items()}

    def get_cookies(self, scope):
        """
        Extract cookies from the scope headers
        """
        headers = dict(scope["headers"])
        cookies = headers.get(b"cookie", b"").decode()
        return cookies

    async def get_user(self, token_key):
        graphql_url = 'http://users:8000/graphql'

        query = f"""
            query {{
                userByToken(token: "{token_key}") {{
                    id,
                    username
                }}
            }}
        """
        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(graphql_url, json={'query': query})
                response_data = response.json()
                return response_data.get('data', {}).get('userByToken', {})
            except Exception as e:
                print(f"Error quering user by token via GraphQL: {e}")
                return None

    async def validate_token_via_graphql(self, token):

        graphql_url = 'http://users:8000/graphql'

        mutation = f"""
            mutation {{
                validateToken(token: "{token}") {{
                    success
                }}
            }}
        """
        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(graphql_url, json={'query': mutation})
                response_data = response.json()
                success = response_data.get('data', {}).get(
                    'validateToken', {}).get('success', False)
                return success
            except Exception as e:
                print(f"Error validating token via GraphQL: {e}")
                return False


def TokenAuthMiddlewareStack(inner): return TokenAuthMiddleware(inner)
