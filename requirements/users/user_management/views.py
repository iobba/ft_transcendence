from django.contrib.auth.password_validation import validate_password as validate_password_d
from django.contrib.auth.hashers import PBKDF2PasswordHasher
from django.core.exceptions import ValidationError
from datetime import datetime, timedelta
from django.conf import settings
from .models import Profile
from PIL import Image  # Pillow
from io import BytesIO
import requests
import logging
import base64
import dotenv
import jwt
import ast
import re
import os

dotenv.load_dotenv()


class UppercaseValidator:
    def validate(self, password, user=None):
        if not re.search(r'[A-Z]', password):
            raise ValidationError(
                "The password must contain at least 1 uppercase letter.")


class LowercaseValidator:
    def validate(self, password, user=None):
        if not re.search(r'[a-z]', password):
            raise ValidationError(
                "The password must contain at least 1 lowercase letter.")


class SymbolValidator:
    def validate(self, password, user=None):
        if not re.search(r'[@$!%*?&]', password):
            raise ValidationError(
                "The password must contain at least 1 special character.")

# generating new token for the user


def generate_jwt_token(user_id):
    payload = {
        'user_id': user_id,
        'exp': datetime.utcnow() + timedelta(hours=2)  # Token expiry time
    }
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=os.environ['JWT_ALGOS'])

# exchange the code for an access token


def exchange_code(code):
    token_url = os.environ['TOKEN_URL']
    # the client id and secret has be modified in case the app within 42.fr got expired
    payload = {
        "grant_type": "authorization_code",
        "client_id": os.environ['CLIENT_ID'],
        "client_secret": os.environ['CLIENT_SE'],
        "redirect_uri": os.environ['RDIRECT_URL'],
        "code": code
    }
    return requests.post(token_url, data=payload)


def validate_username(username):
    if len(username) < 6:
        return ({"success": False, "message": "Username must be at least 6 characters long."})
    if len(username) > 30:
        return ({"success": False, "message": "Username must be at most 30 characters long."})
    if not username.isalnum():
        return ({"success": False, "message": "Username must be alphanumeric."})
    if username[0].isdigit():
        return ({"success": False, "message": "Username must not start with a number."})
    if Profile.objects.filter(username=username).exists():
        return ({"success": False, "message": "This username already exists!"})


def validate_password(password):
    try:
        validate_password_d(password)
        up = UppercaseValidator()
        up.validate(password)
        lo = LowercaseValidator()
        lo.validate(password)
        sy = SymbolValidator()
        sy.validate(password)
        if len(password) > 64:
            return ({"success": False, "message": "Password must be at most 64 characters long."})
    except ValidationError as e:
        return ({"success": False, "message": ast.literal_eval(str(e))[0]})


def validate_first_name(first_name):
    if not first_name:
        return ({"success": False, "message": "First name must be 1 to 30 characters long."})
    if not first_name.isalpha():
        return ({"success": False, "message": "First name must contain only alphabetic characters."})
    if len(first_name) > 30:
        return ({"success": False, "message": "First name must be at most 30 characters long."})


def validate_last_name(last_name):
    if not last_name:
        return ({"success": False, "message": "Last name must be 1 to 30 characters long."})
    if not last_name.isalpha():
        return ({"success": False, "message": "Last name must contain only alphabetic characters."})
    if len(last_name) > 30:
        return ({"success": False, "message": "Last name must be at most 30 characters long."})


def validate_bio(bio):
    if bio and len(bio) > 160:
        return ({"success": False, "message": "Bio must be at most 160 characters long."})


def validate_avatar(avatar):
    if len(avatar) > 5000000:
        return ({"success": False, "message": "avatar too large, must be at most 5mb!"})
    try:
        # converting the base64 encoded image data into its binary representation
        image_data = base64.b64decode(
            avatar[avatar.index(',') + 1:], validate=True)
        # it checks the file headers and determines whether it's in image format (e.g., JPEG, PNG)
        image = Image.open(BytesIO(image_data))
        image.verify()  # ensures that the entire file contents conform to the expected structure of the image format
        data_url_prefix = avatar[:avatar.index(',')]
        if image.format not in ['JPEG', 'PNG', 'JPG', 'GIF'] or data_url_prefix != str("data:image/" + image.format.lower() + ";base64"):
            return ({"success": False, "message": "Only JPEG, PNG, JPG and GIF formats are supported as an avatar!"})
    except Exception as e:
        return ({"success": False, "message": "Avatar not valid!"})


def validate_user_info(username=None, password=None, first_name=None, last_name=None, bio=None, avatar=None):
    validators = []
    if username is not None:
        validators.append(validate_username(username))
    if password is not None:
        validators.append(validate_password(password))
    if first_name is not None:
        validators.append(validate_first_name(first_name))
    if last_name is not None:
        validators.append(validate_last_name(last_name))
    if bio is not None:
        validators.append(validate_bio(bio))
    if avatar is not None:
        validators.append(validate_avatar(avatar))

    for result in validators:
        if result is not None:
            return result
    return ({"success": True, "message": "Everything looks valid!"})
