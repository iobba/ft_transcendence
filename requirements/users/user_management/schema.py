from graphene_django import DjangoObjectType
from django.contrib.auth.models import User
from .views import generate_jwt_token
from .views import validate_user_info
from .views import exchange_code
from django.conf import settings
from .models import Profile
from io import BytesIO
import requests
import graphene
import logging
import dotenv
import random
import qrcode
import base64
import pyotp
import jwt
import os

dotenv.load_dotenv()
# Configure the logger
logger = logging.getLogger(__name__)

# Types


class ProfileType(DjangoObjectType):
    class Meta:
        model = Profile
        exclude_fields = os.environ['PROFILE_EXCLUDE_FIELDS'].split(",")


class UserType(DjangoObjectType):
    class Meta:
        model = User
        fields = os.environ['USER_INCLUDE_FIELDS'].split(",")

############ CREATE PROFILE VIA SIGN-UP ############
# this for the users who decided to sign up


class CreateProfile(graphene.Mutation):
    class Arguments:
        username = graphene.String(required=True)
        password = graphene.String(required=True)
        first_name = graphene.String(required=True)
        last_name = graphene.String(required=True)
        bio = graphene.String(
            required=False, default_value="Future is loading...")
        avatar = graphene.String(required=False, default_value=None)

    success = graphene.Boolean()
    profile = graphene.Field(ProfileType)
    message = graphene.String()
    token = graphene.String()

    @classmethod
    def mutate(cls, root, info, username, password, **kwargs):
        validating_result = validate_user_info(username, password, **kwargs)
        if not validating_result["success"]:
            return CreateProfile(success=False, message=validating_result["message"])
        # Create the user object
        user = User.objects.create(username=username)
        user.set_password(password)
        user.save()
        profile = Profile.objects.create(
            user=user,
            username=username,
            first_name=kwargs.get('first_name'),
            last_name=kwargs.get('last_name'),
            total_score=0,
            bio=kwargs.get('bio'),
            is_active=False,
        )
        profile.save()
        # generate a new token for the user
        jwt_token = generate_jwt_token(user.id)
        return CreateProfile(profile=profile, success=True, token=jwt_token, message="Profile created successfully!")
############ CREATE PROFILE VIA 42 ############
# this for the users who decided to connect with 42


class CreateProfile_42(graphene.Mutation):
    class Arguments:
        code = graphene.String(required=True)

    success = graphene.Boolean()
    profile = graphene.Field(ProfileType)
    message = graphene.String()
    token = graphene.String()

    @classmethod
    def mutate(cls, root, info, code):
        response = exchange_code(code)
        if response.status_code == 200:
            access_token = response.json().get('access_token')
            # fetch the user's public data
            user_data_url = os.environ['USER_DATA_URL']
            headers = {"Authorization": f"Bearer {access_token}"}
            user_data_response = requests.get(user_data_url, headers=headers)
            if user_data_response.status_code == 200:
                user_data = user_data_response.json()
                try:
                    profile = Profile.objects.get(
                        username_42=user_data["login"])
                except Profile.DoesNotExist:
                    # Create a new user and profile
                    username = user_data["login"]
                    while User.objects.filter(username=username).exists():
                        username += str(random.randint(0, 9))
                    user = User.objects.create(username=username, password="")
                    user.save()
                    new_profile = Profile.objects.create(
                        user=user,
                        username=username,
                        username_42=user_data["login"],
                        first_name=user_data["first_name"],
                        last_name=user_data["last_name"],
                        bio=("1337 " + user_data["kind"]),
                        total_score=0,
                        via_42=True,
                        avatar=user_data["image"]["link"],
                        is_active=False,
                    )
                # generate a new token for the user
                profile = Profile.objects.get(username_42=user_data["login"])
                jwt_token = generate_jwt_token(profile.user.id)
                return CreateProfile_42(success=True, token=jwt_token, profile=profile, message="Profile created successfully!")
            return CreateProfile_42(success=False, message="Failed to fetch user data!")
        return CreateProfile_42(success=False, message="Failed to exchange authorization code for an access token!")

############ UPDATE PROFILE ############


class UpdateProfile(graphene.Mutation):
    class Arguments:
        token = graphene.String(required=True)
        username = graphene.String(required=False, default_value=None)
        first_name = graphene.String(required=False, default_value=None)
        last_name = graphene.String(required=False, default_value=None)
        bio = graphene.String(required=False, default_value=None)
        avatar = graphene.String(required=False, default_value=None)
        is_active = graphene.Boolean(required=False, default_value=None)

    success = graphene.Boolean()
    profile = graphene.Field(ProfileType)
    message = graphene.String()

    @classmethod
    def mutate(cls, root, info, token, **kwargs):
        validation_keys = ['username', 'first_name',
                           'last_name', 'bio', 'avatar']
        validation_args = {key: kwargs.get(key) for key in validation_keys}
        validating_result = validate_user_info(**validation_args)
        if not validating_result["success"]:
            return UpdateProfile(success=False, message=validating_result["message"])
        try:
            payload = jwt.decode(token, settings.SECRET_KEY,
                                 algorithms=os.environ['JWT_ALGOS'].split(","))
            profile = Profile.objects.get(
                user=User.objects.get(id=payload['user_id']))
            for attr, value in kwargs.items():
                if value is not None:
                    if attr == "username":
                        profile.user.username = value
                        profile.user.save()
                    setattr(profile, attr, value)
            profile.save()
            return UpdateProfile(profile=profile, success=True, message="Profile updated successfully!")
        except (jwt.ExpiredSignatureError, jwt.InvalidTokenError, User.DoesNotExist, Profile.DoesNotExist):
            return UpdateProfile(success=False, message="Invalid authorization token!")

############ DELETE PROFILE ############


class DeleteProfile(graphene.Mutation):
    class Arguments:
        token = graphene.String(required=True)

    success = graphene.Boolean()
    message = graphene.String()

    @classmethod
    def mutate(cls, root, info, token):
        try:
            payload = jwt.decode(token, settings.SECRET_KEY,
                                 algorithms=os.environ['JWT_ALGOS'].split(","))
            user_id = payload['user_id']
            user = User.objects.get(id=user_id)
            user.delete()
            return DeleteProfile(success=True, message="User deleted successfully!")
        except (jwt.ExpiredSignatureError, jwt.InvalidTokenError, User.DoesNotExist):
            return DeleteProfile(success=False, message="Invalid authorization token!")

############ CHANGE PASSWORD ############


class ChangePassword(graphene.Mutation):
    class Arguments:
        token = graphene.String(required=True)
        old = graphene.String(required=True)
        new1 = graphene.String(required=True)
        new2 = graphene.String(required=True)

    success = graphene.Boolean()
    message = graphene.String()

    @classmethod
    def mutate(cls, root, info, token, old, new1, new2):
        try:
            payload = jwt.decode(token, settings.SECRET_KEY,
                                 algorithms=os.environ['JWT_ALGOS'].split(","))
            user = User.objects.get(id=payload['user_id'])
            if user.password and not user.check_password(old):
                return ChangePassword(success=False, message="Old password is not correct!")
            new_validation = validate_user_info(password=new1)
            if not new_validation["success"]:
                return ChangePassword(success=False, message=new_validation["message"])
            if new1 != new2:
                return ChangePassword(success=False, message="First password doesn't match the second!")
            user.set_password(new1)
            user.save()
            return ChangePassword(success=True, message="Password changed successfully!")
        except (jwt.ExpiredSignatureError, jwt.InvalidTokenError, User.DoesNotExist):
            return ChangePassword(success=False, message="Invalid authorization token!")

############ LOGIN CHECK ############


class LoginCheck(graphene.Mutation):
    class Arguments:
        username = graphene.String(required=True)
        password = graphene.String(required=True)
        code = graphene.String(required=False, default_value=None)

    success = graphene.Boolean()
    message = graphene.String()
    token = graphene.String()

    @classmethod
    def mutate(cls, root, info, username, password, code):
        try:
            user = User.objects.get(username=username)
            if not user.check_password(password):
                return LoginCheck(success=False, message="Invalid username or password.")
            # generate a new token for the user
            if user.profile.is_2fa_enabled:
                if code:
                    totp = pyotp.TOTP(user.profile.otp_secret)
                    if totp.verify(code):
                        return LoginCheck(success=True, token=generate_jwt_token(user.id), message="2FA Logged in successfully!")
                    return LoginCheck(success=False, message="Invalid 2FA code!")
                return LoginCheck(success=True, message="Logged in successfully!")
            return LoginCheck(success=True, token=generate_jwt_token(user.id), message=f"Logged in successfully!")
        except User.DoesNotExist:
            return LoginCheck(success=False, message="Invalid username or password.")

############ ENABLE 2FA ############


class Enable2fa(graphene.Mutation):
    class Arguments:
        token = graphene.String(required=True)

    success = graphene.Boolean()
    message = graphene.String()
    qr_code = graphene.String()

    @classmethod
    def mutate(cls, root, info, token):
        try:
            payload = jwt.decode(token, settings.SECRET_KEY,
                                 algorithms=os.environ['JWT_ALGOS'].split(","))
            profile = Profile.objects.get(
                user=User.objects.get(id=payload['user_id']))
            if profile.is_2fa_enabled:
                return Enable2fa(success=False, message="2FA is already enabled!")
            # generating a Secret Key to use it in order to verify the code
            profile.otp_secret = pyotp.random_base32()
            profile.save()
            # generate opt uri
            otp_uri = pyotp.totp.TOTP(profile.otp_secret).provisioning_uri(
                name=profile.username,
                issuer_name="pong game"
            )
            # generate QR code
            qr = qrcode.QRCode(
                version=1,
                box_size=10,
                border=4,
            )
            qr.add_data(otp_uri)
            qr.make(fit=True)
            img = qr.make_image(fill_color="black", back_color="white")
            buffered = BytesIO()
            img.save(buffered, format="PNG")
            qr_code_str = base64.b64encode(buffered.getvalue()).decode()
            qr_code = f"data:image/png;base64,{qr_code_str}"
            return Enable2fa(success=True, qr_code=qr_code, message="2FA enabled successfully!")
        except (jwt.ExpiredSignatureError, jwt.InvalidTokenError, User.DoesNotExist, Profile.DoesNotExist):
            return Enable2fa(success=False, message="Invalid authorization token!")

############ VERIFY 2FA ############


class Verify2fa(graphene.Mutation):
    class Arguments:
        token = graphene.String(required=True)
        code = graphene.String(required=True)

    success = graphene.Boolean()
    message = graphene.String()

    @classmethod
    def mutate(cls, root, info, token, code):
        try:
            payload = jwt.decode(token, settings.SECRET_KEY,
                                 algorithms=os.environ['JWT_ALGOS'].split(","))
            profile = Profile.objects.get(
                user=User.objects.get(id=payload['user_id']))
            try:
                totp = pyotp.TOTP(profile.otp_secret)
                if totp.verify(code):
                    profile.is_2fa_enabled = True
                    profile.save()
                    return Verify2fa(success=True, message="2FA verified successfully!")
            except TypeError:
                return Verify2fa(success=False, message="you should enable 2fa first, looser!")
            return Verify2fa(success=False, message="Invalid 2FA code!")
        except (jwt.ExpiredSignatureError, jwt.InvalidTokenError, User.DoesNotExist, Profile.DoesNotExist):
            return Verify2fa(success=False, message="Invalid authorization token!")

############ DISABLE 2FA ############


class Disable2fa(graphene.Mutation):
    class Arguments:
        token = graphene.String(required=True)

    success = graphene.Boolean()
    message = graphene.String()

    @classmethod
    def mutate(cls, root, info, token):
        try:
            payload = jwt.decode(token, settings.SECRET_KEY,
                                 algorithms=os.environ['JWT_ALGOS'].split(","))
            profile = Profile.objects.get(
                user=User.objects.get(id=payload['user_id']))
            profile.is_2fa_enabled = False
            profile.save()
            return Disable2fa(success=True, message="2FA disabled successfully!")
        except (jwt.ExpiredSignatureError, jwt.InvalidTokenError, User.DoesNotExist, Profile.DoesNotExist):
            return Disable2fa(success=False, message="Invalid authorization token!")

############ TOKEN VALIDATION ############


class TokenValidation(graphene.Mutation):
    class Arguments:
        token = graphene.String(required=True)

    success = graphene.Boolean()

    @classmethod
    def mutate(cls, root, info, token):
        try:
            payload = jwt.decode(token, settings.SECRET_KEY,
                                 algorithms=os.environ['JWT_ALGOS'].split(","))
            user = User.objects.get(id=payload['user_id'])
            return TokenValidation(success=True)
        except (jwt.ExpiredSignatureError, jwt.InvalidTokenError, User.DoesNotExist):
            return TokenValidation(success=False)

############ TOKEN REFRESHING ############


class RefreshToken(graphene.Mutation):
    class Arguments:
        token = graphene.String(required=True)

    success = graphene.Boolean()
    message = graphene.String()
    token = graphene.String()

    @classmethod
    def mutate(cls, root, info, token):
        try:
            payload = jwt.decode(token, settings.SECRET_KEY,
                                 algorithms=os.environ['JWT_ALGOS'].split(","))
            user = User.objects.get(id=payload['user_id'])
            return RefreshToken(success=True, token=generate_jwt_token(user.id), message="Token has been refreshed successfully!")
        except (jwt.ExpiredSignatureError, jwt.InvalidTokenError, User.DoesNotExist):
            return RefreshToken(success=False, message="Invalid token!")

############ UPDATE FRIENDS ############


class UpdateFriends(graphene.Mutation):
    class Arguments:
        token = graphene.String(required=True)
        add_friend = graphene.String(required=False, default_value=None)
        delete_friend = graphene.String(required=False, default_value=None)
        block_friend = graphene.String(required=False, default_value=None)
        unblock_friend = graphene.String(required=False, default_value=None)

    success = graphene.Boolean()
    message = graphene.String()

    @classmethod
    def mutate(cls, root, info, token, add_friend, delete_friend, block_friend, unblock_friend):
        try:
            payload = jwt.decode(token, settings.SECRET_KEY,
                                 algorithms=os.environ['JWT_ALGOS'].split(","))
            profile = Profile.objects.get(
                user=User.objects.get(id=payload['user_id']))
            try:
                if add_friend:
                    friend = Profile.objects.get(username=add_friend)
                    if friend in profile.friends.all():
                        return UpdateFriends(success=True, message=f"{friend} is already your friend.")
                    if profile in friend.blocked_friends.all():
                        return UpdateFriends(success=False, message=f"you've been blocked by {friend}!")
                    if friend in profile.blocked_friends.all():
                        return UpdateFriends(success=False, message=f"you need to unblock {friend} first.")
                    profile.friends.add(friend)
                    profile.save()
                    return UpdateFriends(success=True, message=f"{friend} is a friend of you now!")
                if delete_friend:
                    friend = Profile.objects.get(username=delete_friend)
                    if friend in profile.friends.all():
                        profile.friends.remove(friend)
                        profile.save()
                        return UpdateFriends(success=True, message=f"you just unfriended {friend}.")
                    return UpdateFriends(success=False, message=f"{friend} is not even your friend.")
                if block_friend:
                    friend = Profile.objects.get(username=block_friend)
                    if friend in profile.blocked_friends.all():
                        return UpdateFriends(success=False, message=f"{friend} is already blocked.")
                    if friend in profile.friends.all():
                        profile.friends.remove(friend)
                    profile.blocked_friends.add(friend)
                    profile.save()
                    return UpdateFriends(success=True, message=f"{friend} got blocked now!")
                if unblock_friend:
                    friend = Profile.objects.get(username=unblock_friend)
                    if friend not in profile.blocked_friends.all():
                        return UpdateFriends(success=False, message=f"{friend} is not blocked.")
                    profile.blocked_friends.remove(friend)
                    profile.save()
                    return UpdateFriends(success=True, message=f"you unblocked {friend}!")
                return UpdateFriends(success=False, message="No action specified!")
            except (User.DoesNotExist, Profile.DoesNotExist):
                return UpdateFriends(success=False, message="No user with this username")
        except (jwt.ExpiredSignatureError, jwt.InvalidTokenError, User.DoesNotExist, Profile.DoesNotExist):
            return UpdateFriends(success=False, message="Invalid authorization token!")


############ PROFILE MUTATIONS ############
class Mutation(graphene.ObjectType):
    create_profile = CreateProfile.Field()
    create_profile_42 = CreateProfile_42.Field()
    update_profile = UpdateProfile.Field()
    delete_profile = DeleteProfile.Field()
    validate_token = TokenValidation.Field()
    login_check = LoginCheck.Field()
    change_password = ChangePassword.Field()
    enable_2fa = Enable2fa.Field()
    verify_2fa = Verify2fa.Field()
    update_friends = UpdateFriends.Field()
    disable_2fa = Disable2fa.Field()
    refresh_token = RefreshToken.Field()

############ PROFILE QUERIES ############


class Query(graphene.ObjectType):
    profiles = graphene.List(ProfileType)
    users = graphene.List(UserType)
    user_by_id = graphene.Field(UserType, user_id=graphene.ID())
    users_by_ids = graphene.List(
        UserType, ids=graphene.List(graphene.ID, required=True))
    user_by_username = graphene.Field(
        UserType, user_username=graphene.String())
    user_by_token = graphene.Field(UserType, token=graphene.String())

    def resolve_profiles(self, info):
        return Profile.objects.all()

    def resolve_users(self, info):
        return User.objects.all()

    def resolve_user_by_id(self, info, user_id):
        try:
            user = User.objects.get(id=user_id)
            return user
        except User.DoesNotExist:
            return None

    def resolve_users_by_ids(self, info, ids):
        return User.objects.filter(id__in=ids)

    def resolve_user_by_username(self, info, user_username):
        try:
            user = User.objects.get(username=user_username)
            return user
        except User.DoesNotExist:
            return None

    def resolve_user_by_token(self, info, token):
        try:
            payload = jwt.decode(token, settings.SECRET_KEY,
                                 algorithms=os.environ['JWT_ALGOS'].split(","))
            user = User.objects.get(id=payload['user_id'])
            return user
        except (jwt.ExpiredSignatureError, jwt.InvalidTokenError, User.DoesNotExist):
            return None


schema = graphene.Schema(query=Query, mutation=Mutation)
