from enum import Enum

class StatusCode(Enum):
    INVALID_TOKEN = 4001
    TOKEN_NOT_PROVIDED = 4002
    FAILED_TO_FETCH_USER = 4003
    UNAUTHENTICATED = 4006