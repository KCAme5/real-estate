from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from .models import CustomUser, UserProfile, UserPreferences


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = "__all__"
        read_only_fields = ("user",)


class UserSerializer(serializers.ModelSerializer):
    profile = UserProfileSerializer(read_only=True)

    class Meta:
        model = CustomUser
        fields = (
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "user_type",
            "phone_number",
            "profile_picture",
            "is_verified",
            "date_joined",
            "profile",
        )
        read_only_fields = ("id", "date_joined", "is_verified")


class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True, required=True, validators=[validate_password]
    )
    password2 = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = CustomUser
        fields = (
            "username",
            "email",
            "password",
            "password2",
            "first_name",
            "last_name",
            "phone_number",
            "user_type",
        )

    def validate(self, attrs):
        # Check if passwords match
        if attrs["password"] != attrs["password2"]:
            raise serializers.ValidationError(
                {"password": "Password fields didn't match."}
            )

        # Check if email already exists
        if CustomUser.objects.filter(email=attrs["email"]).exists():
            raise serializers.ValidationError(
                {"email": "A user with this email already exists."}
            )

        # Check if username already exists
        if CustomUser.objects.filter(username=attrs["username"]).exists():
            raise serializers.ValidationError(
                {"username": "A user with this username already exists."}
            )

        return attrs

    def create(self, validated_data):
        validated_data.pop("password2")
        user_type = validated_data.get("user_type", "client")
        user = CustomUser.objects.create_user(**validated_data)
        
        # Create user profile
        UserProfile.objects.create(user=user)
        
        # Create agent profile if user is an agent
        if user_type == "agent":
            from agents.models import AgentProfile
            AgentProfile.objects.create(
                user=user,
                bio=f"Professional agent {user.get_full_name() or user.username}",
                license_number=f"PENDING-{user.id}"
            )
            
        return user


class UserPreferencesSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserPreferences
        fields = "__all__"
        read_only_fields = ("user",)
