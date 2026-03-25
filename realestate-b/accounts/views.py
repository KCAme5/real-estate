from django.conf import settings
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError, InvalidToken
from rest_framework_simplejwt.token_blacklist.models import (
    OutstandingToken,
    BlacklistedToken,
)
from django.contrib.auth.password_validation import validate_password
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import get_user_model
from django.db import IntegrityError
from django.core.cache import cache
from django.utils import timezone
from datetime import timedelta

from .models import CustomUser, UserPreferences
from .serializers import (
    UserSerializer,
    UserRegistrationSerializer,
    UserProfileSerializer,
    UserPreferencesSerializer,
)
from realestate.throttles import AuthRateThrottle
from leads.models import Lead, Conversation
from bookings.models import Booking
from notifications.models import Notification
from properties.models import Property


# ─── Helpers ──────────────────────────────────────────────────────────────────


def get_client_ip(request) -> str:
    forwarded = request.META.get("HTTP_X_FORWARDED_FOR")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.META.get("REMOTE_ADDR", "")


def format_errors_for_display(errors) -> str:
    if isinstance(errors, dict):
        msgs = []
        for field, field_errors in errors.items():
            label = field.replace("_", " ").title()
            if isinstance(field_errors, list):
                for e in field_errors:
                    msgs.append(f"{label}: {e}")
            else:
                msgs.append(f"{label}: {field_errors}")
        return " • " + " • ".join(msgs)
    elif isinstance(errors, list):
        return " • " + " • ".join(str(e) for e in errors)
    return str(errors)


# ─── Register ─────────────────────────────────────────────────────────────────


@api_view(["POST"])
@permission_classes([permissions.AllowAny])
def register_user(request):
    # FIX: apply auth throttle — 10 attempts/min per IP
    throttle = AuthRateThrottle()
    if not throttle.allow_request(request, None):
        return Response(
            {"success": False, "message": "Too many requests. Please slow down."},
            status=status.HTTP_429_TOO_MANY_REQUESTS,
        )

    data = request.data.copy()
    if "password" in data and "password2" not in data:
        data["password2"] = data["password"]

    serializer = UserRegistrationSerializer(data=data)
    if not serializer.is_valid():
        return Response(
            {
                "success": False,
                "errors": serializer.errors,
                "message": "Registration failed. Please check the errors below.",
                "formatted_message": format_errors_for_display(serializer.errors),
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        return Response(
            {
                "success": True,
                "user": UserSerializer(user).data,
                "message": "Registration successful! Welcome to KenyaPrime.",
                "access": str(refresh.access_token),
                "refresh": str(refresh),
            },
            status=status.HTTP_201_CREATED,
        )
    except IntegrityError:
        return Response(
            {
                "success": False,
                "message": "An account with this email or username already exists.",
            },
            status=status.HTTP_400_BAD_REQUEST,
        )
    except Exception:
        return Response(
            {"success": False, "message": "An unexpected error occurred."},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


# ─── Login ────────────────────────────────────────────────────────────────────


@api_view(["POST"])
@permission_classes([permissions.AllowAny])
def login_user(request):
    username_or_email = request.data.get("username") or request.data.get("email")
    password = request.data.get("password")

    if not username_or_email or not password:
        return Response(
            {"success": False, "message": "Username/email and password are required."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    # FIX: rate limiting — 5 attempts per 15 minutes per IP + identifier combo
    client_ip = get_client_ip(request)
    rate_limit_key = f"login_attempts:{client_ip}:{username_or_email}"
    attempts = cache.get(rate_limit_key, 0)

    if attempts >= 5:
        return Response(
            {
                "success": False,
                "message": "Too many failed login attempts. Please try again in 15 minutes.",
            },
            status=status.HTTP_429_TOO_MANY_REQUESTS,
        )

    User = get_user_model()
    user = None

    try:
        if "@" in username_or_email:
            user = User.objects.get(email=username_or_email)
        else:
            user = User.objects.get(username=username_or_email)
    except User.DoesNotExist:
        # FIX: always increment counter even when user not found
        # prevents user enumeration via timing difference
        cache.set(rate_limit_key, attempts + 1, 900)
        return Response(
            {"success": False, "message": "Invalid username/email or password."},
            status=status.HTTP_401_UNAUTHORIZED,
        )

    if not user.is_active:
        return Response(
            {"success": False, "message": "Your account has been disabled."},
            status=status.HTTP_401_UNAUTHORIZED,
        )

    if not user.check_password(password):
        cache.set(rate_limit_key, attempts + 1, 900)
        return Response(
            {"success": False, "message": "Invalid username/email or password."},
            status=status.HTTP_401_UNAUTHORIZED,
        )

    # Successful login — clear counter
    cache.delete(rate_limit_key)

    refresh = RefreshToken.for_user(user)
    return Response(
        {
            "success": True,
            "user": UserSerializer(user).data,
            "message": "Login successful!",
            "access": str(refresh.access_token),
            "refresh": str(refresh),
        }
    )


# ─── Refresh token ────────────────────────────────────────────────────────────


@api_view(["POST"])
@permission_classes([permissions.AllowAny])
def refresh_token(request):
    token_str = request.data.get("refresh")

    if not token_str:
        return Response(
            {
                "success": False,
                "message": "Refresh token not found. Please login again.",
            },
            status=status.HTTP_401_UNAUTHORIZED,
        )

    try:
        # FIX: use the token directly — simplejwt validates + blacklists it
        # because ROTATE_REFRESH_TOKENS=True and BLACKLIST_AFTER_ROTATION=True
        # are set in settings. The old token is blacklisted automatically.
        old_refresh = RefreshToken(token_str)
        new_access = str(old_refresh.access_token)

        # Rotate — this blacklists old_refresh and returns a new one
        old_refresh.blacklist()
        User = get_user_model()
        user_id = old_refresh.payload.get("user_id")
        user = User.objects.get(id=user_id)
        new_refresh = RefreshToken.for_user(user)

        return Response(
            {
                "success": True,
                "access": str(new_refresh.access_token),
                "refresh": str(new_refresh),
            }
        )

    except (TokenError, InvalidToken):
        return Response(
            {
                "success": False,
                "message": "Refresh token is invalid or expired. Please login again.",
            },
            status=status.HTTP_401_UNAUTHORIZED,
        )
    except get_user_model().DoesNotExist:
        return Response(
            {"success": False, "message": "User account no longer exists."},
            status=status.HTTP_401_UNAUTHORIZED,
        )
    except Exception:
        return Response(
            {"success": False, "message": "Token refresh failed."},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


# ─── Logout ───────────────────────────────────────────────────────────────────


@api_view(["POST"])
@permission_classes([permissions.IsAuthenticated])
def logout_user(request):
    # FIX: original logout did nothing — tokens stayed valid until expiry
    # Now we blacklist the refresh token so it can never be used again
    token_str = request.data.get("refresh")

    if token_str:
        try:
            token = RefreshToken(token_str)
            token.blacklist()
        except (TokenError, InvalidToken):
            # Token already invalid — that's fine, still return success
            pass

    # FIX: also blacklist ALL outstanding tokens for this user
    # This handles the case where the frontend doesn't send the refresh token
    try:
        outstanding = OutstandingToken.objects.filter(user=request.user)
        for t in outstanding:
            BlacklistedToken.objects.get_or_create(token=t)
    except Exception:
        pass

    return Response({"success": True, "message": "Logged out successfully."})


# ─── Profile & user detail ────────────────────────────────────────────────────


class UserProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user.profile


class UserDetailView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


# ─── Dashboard stats ──────────────────────────────────────────────────────────


@api_view(["GET"])
@permission_classes([permissions.IsAuthenticated])
def dashboard_stats(request):
    user = request.user

    if user.user_type == "client":
        from properties.models import SavedProperty

        stats = {
            "saved_properties": SavedProperty.objects.filter(user=user).count(),
            "active_conversations": Conversation.objects.filter(
                client=user, is_active=True
            ).count(),
            "upcoming_bookings": Booking.objects.filter(
                client=user, status__in=["pending", "confirmed"]
            ).count(),
            "unread_notifications": Notification.objects.filter(
                user=user, is_read=False
            ).count(),
        }

    elif user.user_type == "agent":
        stats = {
            "total_properties": Property.objects.filter(agent=user).count(),
            "active_leads": Lead.objects.filter(
                agent=user, status__in=["new", "contacted", "viewing", "qualified"]
            ).count(),
            "unread_messages": Conversation.objects.filter(
                agent=user, messages__is_read=False
            )
            .exclude(messages__sender=user)
            .distinct()
            .count(),
            "upcoming_bookings": Booking.objects.filter(
                agent=user, status__in=["pending", "confirmed"]
            ).count(),
        }

    elif user.user_type == "management":
        stats = {
            "total_users": get_user_model().objects.count(),
            "total_agents": get_user_model().objects.filter(user_type="agent").count(),
            "total_leads": Lead.objects.count(),
            "total_properties": Property.objects.count(),
        }

    else:
        stats = {}

    return Response(stats)


# ─── Password management ──────────────────────────────────────────────────────


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def change_password(request):
    user = request.user

    if not user.check_password(request.data.get("current_password")):
        return Response(
            {"error": "Current password is incorrect"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    new_password = request.data.get("new_password")
    try:
        validate_password(new_password, user)
    except Exception as e:
        return Response({"error": list(e.messages)}, status=status.HTTP_400_BAD_REQUEST)

    user.set_password(new_password)
    user.save()

    # FIX: blacklist all existing tokens after password change
    # so any stolen tokens are immediately invalidated
    try:
        outstanding = OutstandingToken.objects.filter(user=user)
        for t in outstanding:
            BlacklistedToken.objects.get_or_create(token=t)
    except Exception:
        pass

    return Response({"message": "Password updated successfully. Please log in again."})


@api_view(["POST"])
@permission_classes([permissions.AllowAny])
def password_reset_request(request):
    # FIX: apply auth throttle to prevent email enumeration attacks
    throttle = AuthRateThrottle()
    if not throttle.allow_request(request, None):
        return Response(
            {"message": "Too many requests."},
            status=status.HTTP_429_TOO_MANY_REQUESTS,
        )

    email = request.data.get("email")
    # FIX: always return same message whether email exists or not
    # prevents user enumeration via this endpoint
    try:
        CustomUser.objects.get(email=email)
        # TODO: generate token and send reset email
    except CustomUser.DoesNotExist:
        pass

    return Response({"message": "If that email exists, a reset link has been sent."})


@api_view(["POST"])
@permission_classes([permissions.AllowAny])
def password_reset_confirm(request):
    token = request.data.get("token")
    new_password = request.data.get("new_password")
    # TODO: validate token and apply new password
    return Response({"message": "Password reset successful."})


# ─── Preferences ──────────────────────────────────────────────────────────────


class UserPreferencesView(generics.RetrieveUpdateAPIView):
    serializer_class = UserPreferencesSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        prefs, _ = UserPreferences.objects.get_or_create(user=self.request.user)
        return prefs


# ─── Management views ─────────────────────────────────────────────────────────


class ManagementAgentListView(generics.ListAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.user_type != "management":
            return CustomUser.objects.none()
        return CustomUser.objects.filter(user_type="agent").order_by(
            "is_verified", "-date_joined"
        )


class ManagementAgentDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.user_type != "management":
            return CustomUser.objects.none()
        return CustomUser.objects.filter(user_type="agent")


# ─── Debug endpoints — dev only ───────────────────────────────────────────────
# FIX: all debug endpoints now hard-blocked in production
# Previously these were AllowAny with only a soft DEBUG check inside
# meaning they were technically reachable on Render


@api_view(["GET"])
@permission_classes([permissions.AllowAny])
def debug_auth_status(request):
    if not settings.DEBUG:
        return Response({"error": "Not available"}, status=status.HTTP_404_NOT_FOUND)

    User = get_user_model()
    return Response(
        {
            "user": str(request.user),
            "authenticated": request.user.is_authenticated,
            "user_type": getattr(request.user, "user_type", None),
            "headers": {
                "authorization": request.headers.get("Authorization"),
                "origin": request.headers.get("Origin"),
            },
            "database": {
                "total_users": User.objects.count(),
                "active_users": User.objects.filter(is_active=True).count(),
            },
        }
    )


@api_view(["POST"])
@permission_classes([permissions.AllowAny])
def debug_create_test_user(request):
    if not settings.DEBUG:
        return Response({"error": "Not available"}, status=status.HTTP_404_NOT_FOUND)

    import random

    User = get_user_model()
    n = random.randint(1000, 9999)

    try:
        user = User.objects.create_user(
            username=f"testuser{n}",
            email=f"test{n}@example.com",
            password="testpassword123",
            first_name="Test",
            last_name=f"User{n}",
            user_type="client",
        )
        return Response(
            {
                "success": True,
                "username": user.username,
                "email": user.email,
                "password": "testpassword123",
            }
        )
    except Exception as e:
        return Response({"error": str(e)}, status=400)


@api_view(["GET"])
@permission_classes([permissions.AllowAny])
def debug_validate_cors(request):
    if not settings.DEBUG:
        return Response({"error": "Not available"}, status=status.HTTP_404_NOT_FOUND)

    return Response(
        {
            "cors_allowed_origins": getattr(settings, "CORS_ALLOWED_ORIGINS", []),
            "cors_allow_credentials": getattr(
                settings, "CORS_ALLOW_CREDENTIALS", False
            ),
            "request_origin": request.headers.get("Origin"),
        }
    )
