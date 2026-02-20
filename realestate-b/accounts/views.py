# auth/views.py
from django.conf import settings
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.password_validation import validate_password
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import get_user_model
from django.db import IntegrityError

from .models import CustomUser, UserProfile, UserPreferences
from leads.models import Lead, Conversation
from bookings.models import Booking
from notifications.models import Notification
from django.utils import timezone
from datetime import timedelta
from properties.models import Property
from .serializers import (
    UserSerializer,
    UserRegistrationSerializer,
    UserProfileSerializer,
    UserPreferencesSerializer,
)


# auth/views.py - Update register_user function
@api_view(["POST"])
@permission_classes([permissions.AllowAny])
def register_user(request):
    """
    Register a new user
    """
    # Handle case where password2 might not be sent
    data = request.data.copy()

    # If password2 is not provided but password is, copy password to password2
    if "password" in data and "password2" not in data:
        data["password2"] = data["password"]

    # Get the serializer
    serializer = UserRegistrationSerializer(data=data)

    # Validate serializer
    is_valid = serializer.is_valid()

    if not is_valid:
        # Format error response for frontend
        error_details = {}
        for field, errors in serializer.errors.items():
            error_details[field] = errors

        return Response(
            {
                "success": False,
                "errors": error_details,
                "message": "Registration failed. Please check the errors below.",
                "formatted_message": format_errors_for_display(serializer.errors),
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        # Save the user
        user = serializer.save()

        # Generate tokens
        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)

        # Create response
        response_data = {
            "success": True,
            "user": UserSerializer(user).data,
            "access": access_token,
            "message": "Registration successful! Welcome to KenyaPrime Properties.",
        }

        response = Response(response_data, status=status.HTTP_201_CREATED)

        # Set refresh token in httpOnly cookie
        response.set_cookie(
            key="refresh",
            value=str(refresh),
            httponly=True,
            samesite="None",
            secure=True,
            max_age=7 * 24 * 60 * 60,
            path="/",
        )

        return response

    except IntegrityError:
        return Response(
            {
                "success": False,
                "error": "User with this email or username already exists",
                "message": "An account with this email or username already exists.",
            },
            status=status.HTTP_400_BAD_REQUEST,
        )
    except Exception:
        return Response(
            {
                "success": False,
                "error": "Registration failed",
                "message": "An unexpected error occurred during registration.",
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


# Add this helper function to format errors for display
def format_errors_for_display(errors):
    """Format Django REST Framework errors for user-friendly display"""
    if isinstance(errors, dict):
        error_messages = []
        for field, field_errors in errors.items():
            field_name = field.replace("_", " ").title()
            if isinstance(field_errors, list):
                for error in field_errors:
                    error_messages.append(f"{field_name}: {error}")
            else:
                error_messages.append(f"{field_name}: {field_errors}")
        return " • " + " • ".join(error_messages)
    elif isinstance(errors, list):
        return " • " + " • ".join([str(error) for error in errors])
    else:
        return str(errors)


@api_view(["POST"])
@permission_classes([permissions.AllowAny])
def login_user(request):
    """
    Login user
    """
    # Get credentials from request
    username_or_email = request.data.get("username") or request.data.get("email")
    password = request.data.get("password")

    # Validate input
    if not username_or_email or not password:
        return Response(
            {
                "success": False,
                "error": "Please provide both username/email and password",
                "message": "Username/email and password are required.",
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        # First, try to find user by email or username
        User = get_user_model()

        # Try email first (since frontend sends email as username)
        user = None

        # Check if input looks like an email
        if "@" in username_or_email:
            try:
                user = User.objects.get(email=username_or_email)
            except User.DoesNotExist:
                pass

        # If not found by email, try by username
        if not user:
            try:
                user = User.objects.get(username=username_or_email)
            except User.DoesNotExist:
                pass

        # If still no user found
        if not user:
            return Response(
                {
                    "success": False,
                    "error": "Invalid credentials",
                    "message": "No user found with these credentials.",
                },
                status=status.HTTP_401_UNAUTHORIZED,
            )

        # Check if user is active
        if not user.is_active:
            return Response(
                {
                    "success": False,
                    "error": "Account disabled",
                    "message": "Your account has been disabled.",
                },
                status=status.HTTP_401_UNAUTHORIZED,
            )

        # Verify password
        if not user.check_password(password):
            return Response(
                {
                    "success": False,
                    "error": "Invalid credentials",
                    "message": "Invalid password.",
                },
                status=status.HTTP_401_UNAUTHORIZED,
            )

        # Generate tokens
        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)

        # Create response
        response_data = {
            "success": True,
            "user": UserSerializer(user).data,
            "access": access_token,
            "refresh": str(refresh),
            "message": "Login successful!",
        }

        response = Response(response_data)

        # Set refresh token in httpOnly cookie
        response.set_cookie(
            key="refresh",
            value=str(refresh),
            httponly=True,
            samesite="None",
            secure=True,
            max_age=7 * 24 * 60 * 60,
            path="/",
        )

        return response

    except Exception:
        return Response(
            {
                "success": False,
                "error": "Login failed",
                "message": "An unexpected error occurred during login.",
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(["POST"])
@permission_classes([permissions.AllowAny])
def refresh_token(request):
    """
    Refresh access token using refresh token from cookie
    """
    # Try to get refresh token from multiple sources
    refresh_token = None

    # 1. Check cookies first (preferred)
    if "refresh" in request.COOKIES:
        refresh_token = request.COOKIES.get("refresh")
    elif "refresh_token" in request.COOKIES:
        refresh_token = request.COOKIES.get("refresh_token")

    # 2. Check request body (fallback for debugging)
    if not refresh_token and request.data.get("refresh"):
        refresh_token = request.data.get("refresh")

    if not refresh_token:
        return Response(
            {
                "success": False,
                "error": "No refresh token found",
                "message": "Refresh token not found. Please login again.",
            },
            status=status.HTTP_401_UNAUTHORIZED,
        )

    try:
        refresh = RefreshToken(refresh_token)

        # Get the user from the refresh token
        user_id = refresh.payload.get("user_id")

        if user_id:
            try:
                User = get_user_model()
                user = User.objects.get(id=user_id)

                # Generate new tokens
                new_refresh = RefreshToken.for_user(user)
                new_access = str(new_refresh.access_token)

                response_data = {
                    "success": True,
                    "access": new_access,
                    "refresh": str(new_refresh),
                    "message": "Token refreshed successfully",
                }

                response = Response(response_data)

                # Update the refresh token cookie
                response.set_cookie(
                    key="refresh",
                    value=str(new_refresh),
                    httponly=True,
                    samesite="None",
                    secure=True,
                    max_age=7 * 24 * 60 * 60,
                    path="/",
                )

                return response

            except User.DoesNotExist:
                return Response(
                    {
                        "success": False,
                        "error": "User not found",
                        "message": "User account no longer exists.",
                    },
                    status=status.HTTP_401_UNAUTHORIZED,
                )
        else:
            return Response(
                {
                    "success": False,
                    "error": "Invalid token",
                    "message": "Invalid refresh token structure.",
                },
                status=status.HTTP_401_UNAUTHORIZED,
            )

    except Exception:
        return Response(
            {
                "success": False,
                "error": "Invalid refresh token",
                "message": "Refresh token is invalid or expired. Please login again.",
            },
            status=status.HTTP_401_UNAUTHORIZED,
        )


@api_view(["POST"])
@permission_classes([permissions.AllowAny])
def logout_user(request):
    """
    Logout user by clearing the refresh cookie
    """
    try:
        # Create response
        response = Response({"success": True, "message": "Logged out successfully"})

        # Clear all possible auth cookies
        cookies_to_clear = [
            "refresh",
            "refresh_token",
            "access_token",
            "debug_refresh_set",
            "debug_login_success",
        ]

        for cookie_name in cookies_to_clear:
            if cookie_name in request.COOKIES:
                response.set_cookie(
                    key=cookie_name,
                    value="",
                    max_age=0,
                    expires="Thu, 01 Jan 1970 00:00:00 GMT",
                    path="/",
                    samesite="None",
                    httponly=(
                        True
                        if cookie_name in ["refresh", "refresh_token", "access_token"]
                        else False
                    ),
                    secure=True,
                )

        return response

    except Exception:
        # Even if there's an error, return success to clear frontend state
        response = Response(
            {
                "success": True,
                "message": "Logged out successfully (some cleanup may have failed)",
            }
        )
        return response


# ===== DEBUG ENDPOINTS =====


@api_view(["GET"])
@permission_classes([permissions.AllowAny])
def debug_auth_status(request):
    """
    Debug endpoint to check authentication status
    """
    User = get_user_model()

    data = {
        "request": {
            "method": request.method,
            "path": request.path,
            "content_type": request.content_type,
            "user": str(request.user) if request.user else "Anonymous",
            "is_authenticated": (
                request.user.is_authenticated if request.user else False
            ),
            "user_type": (
                getattr(request.user, "user_type", None) if request.user else None
            ),
        },
        "cookies": dict(request.COOKIES),
        "headers": {
            "authorization": request.headers.get("Authorization"),
            "origin": request.headers.get("Origin"),
            "referer": request.headers.get("Referer"),
        },
        "database": {
            "total_users": User.objects.count(),
            "active_users": User.objects.filter(is_active=True).count(),
            "sample_users": list(
                User.objects.all().values("id", "email", "username", "is_active")[:5]
            ),
        },
        "auth_system": {
            "auth_user_model": settings.AUTH_USER_MODEL,
            "auth_backends": settings.AUTHENTICATION_BACKENDS,
        },
    }

    return Response(data)


@api_view(["POST"])
@permission_classes([permissions.AllowAny])
def debug_create_test_user(request):
    """
    Create a test user for debugging (only in development!)
    """
    if not settings.DEBUG:
        return Response({"error": "Only available in debug mode"}, status=403)

    import random

    User = get_user_model()

    test_num = random.randint(1000, 9999)
    user_data = {
        "username": f"testuser{test_num}",
        "email": f"test{test_num}@example.com",
        "password": "testpassword123",
        "first_name": "Test",
        "last_name": f"User{test_num}",
        "user_type": "client",
    }

    try:
        # Check if user already exists
        if User.objects.filter(email=user_data["email"]).exists():
            return Response({"error": "Test user already exists"}, status=400)

        # Create user
        user = User.objects.create_user(
            username=user_data["username"],
            email=user_data["email"],
            password=user_data["password"],
            first_name=user_data["first_name"],
            last_name=user_data["last_name"],
            user_type=user_data["user_type"],
        )

        return Response(
            {
                "success": True,
                "message": "Test user created",
                "user": {
                    "id": user.id,
                    "username": user.username,
                    "email": user.email,
                    "password": user_data["password"],
                },
            }
        )

    except Exception as e:
        return Response({"error": str(e)}, status=400)


@api_view(["GET"])
@permission_classes([permissions.AllowAny])
def debug_validate_cors(request):
    """
    Check CORS configuration
    """
    return Response(
        {
            "cors_allowed_origins": getattr(settings, "CORS_ALLOWED_ORIGINS", []),
            "cors_allow_credentials": getattr(
                settings, "CORS_ALLOW_CREDENTIALS", False
            ),
            "request_origin": request.headers.get("Origin"),
            "cookies_present": bool(request.COOKIES),
            "cookie_names": list(request.COOKIES.keys()),
        }
    )


# ===== MAIN ENDPOINTS =====


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
        last_week = timezone.now() - timedelta(days=7)

        stats = {
            "total_properties": Property.objects.filter(agent=user).count(),
            "active_leads": Lead.objects.filter(
                agent=user, status__in=["new", "contacted", "qualified"]
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
            "properties_views": 0,
        }

    else:
        stats = {}

    return Response(stats)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def change_password(request):
    user = request.user
    data = request.data

    # Validate current password
    if not user.check_password(data.get("current_password")):
        return Response(
            {"error": "Current password is incorrect"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    # Validate new password
    new_password = data.get("new_password")
    try:
        validate_password(new_password, user)
    except Exception as e:
        return Response({"error": list(e.messages)}, status=status.HTTP_400_BAD_REQUEST)

    # Set new password
    user.set_password(new_password)
    user.save()

    return Response({"message": "Password updated successfully"})


@api_view(["POST"])
@permission_classes([permissions.AllowAny])
def password_reset_request(request):
    email = request.data.get("email")

    try:
        user = CustomUser.objects.get(email=email)
        # Generate token and send email (implement this)
        # For now, just return success
        return Response({"message": "Password reset email sent"})
    except CustomUser.DoesNotExist:
        # Don't reveal whether email exists
        return Response({"message": "Password reset email sent"})


@api_view(["POST"])
@permission_classes([permissions.AllowAny])
def password_reset_confirm(request):
    token = request.data.get("token")
    new_password = request.data.get("new_password")

    # Implement token validation and password reset
    return Response({"message": "Password reset successful"})


class UserPreferencesView(generics.RetrieveUpdateAPIView):
    serializer_class = UserPreferencesSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        preferences, created = UserPreferences.objects.get_or_create(
            user=self.request.user
        )
        return preferences
        return preferences


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
