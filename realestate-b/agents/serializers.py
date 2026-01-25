from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import AgentProfile, AgentReview

User = get_user_model()


class AgentReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = AgentReview
        fields = "__all__"


class AgentProfileSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source="user.get_full_name", read_only=True)
    user_email = serializers.CharField(source="user.email", read_only=True)
    user_phone = serializers.CharField(source="user.phone_number", read_only=True)
    user_avatar = serializers.ImageField(source="user.profile_picture", read_only=True)
    reviews = AgentReviewSerializer(many=True, read_only=True)
    user_date_joined = serializers.DateTimeField(
        source="user.date_joined", read_only=True
    )

    active_properties = serializers.IntegerField(
        source="user.properties.count", read_only=True
    )
    properties = serializers.SerializerMethodField()

    class Meta:
        model = AgentProfile
        fields = (
            "id",
            "slug",
            "user",
            "user_name",
            "user_email",
            "user_phone",
            "user_avatar",
            "bio",
            "active_properties",
            "user_date_joined",
            "license_number",
            "years_of_experience",
            "specialties",
            "office_address",
            "whatsapp_number",
            "facebook_url",
            "twitter_url",
            "linkedin_url",
            "instagram_url",
            "reviews",
            "total_properties_sold",
            "average_rating",
            "is_verified",
            "properties",
        )

    def get_properties(self, obj):
        from properties.serializers import PropertyListSerializer

        properties = obj.user.properties.filter(is_active=True)
        return PropertyListSerializer(properties, many=True).data


class AgentListSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source="user.get_full_name", read_only=True)
    user_email = serializers.CharField(source="user.email", read_only=True)
    user_phone = serializers.CharField(source="user.phone_number", read_only=True)
    user_avatar = serializers.ImageField(source="user.profile_picture", read_only=True)
    active_properties = serializers.SerializerMethodField()

    class Meta:
        model = AgentProfile
        fields = (
            "id",
            "slug",
            "user_name",
            "user_email",
            "user_phone",
            "user_avatar",
            "bio",
            "office_address",
            "years_of_experience",
            "specialties",
            "average_rating",
            "total_properties_sold",
            "active_properties",
            "is_verified",
        )

    def get_active_properties(self, obj):
        return obj.user.properties.filter(status="available").count()


class AgentCompactSerializer(serializers.ModelSerializer):
    user_name = serializers.SerializerMethodField()
    user_avatar = serializers.SerializerMethodField()
    user_phone = serializers.SerializerMethodField()
    user_email = serializers.SerializerMethodField()

    class Meta:
        model = User  # Changed from AgentProfile to User
        fields = (
            "id",
            "username",  # Add username field
            "user_name",
            "user_avatar",
            "user_phone",
            "user_email",
        )

    def get_user_name(self, obj):
        # obj is now a User object directly
        return obj.get_full_name() or obj.username

    def get_user_avatar(self, obj):
        if hasattr(obj, "profile_picture") and obj.profile_picture:
            return obj.profile_picture.url
        return None

    def get_user_phone(self, obj):
        if hasattr(obj, "phone_number") and obj.phone_number:
            return obj.phone_number
        return None

    def get_user_email(self, obj):
        return obj.email
