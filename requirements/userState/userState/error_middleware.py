from channels.middleware import BaseMiddleware
from channels.exceptions import DenyConnection

class ErrorHandlingMiddleware(BaseMiddleware):
    async def __call__(self, scope, receive, send):
        try:
            # Proceed with the connection
            print("error middleware");
            return await super().__call__(scope, receive, send)
        except DenyConnection as e:
            # Handle DenyConnection exceptions raised by previous middleware or consumers
            print("Handle DenyConnection exceptions raised by previous middleware or consumers")
            await send({
                "type": "websocket.close",
                "code": 4800,
                "reason": str(e),
            })
        except Exception as e:
            # Handle any other exceptions that weren't handled before
            print("Handle any other exceptions that weren't handled before")
            await send({
                "type": "websocket.close",
                "code": 4801,
                "reason": "Internal Server Error.",
            })
