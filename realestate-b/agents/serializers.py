from rest_framework import serializers
from .models import AgentProfile, AgentReview


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

    class Meta:
        model = AgentProfile
        fields = "__all__"


class AgentListSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source="user.get_full_name", read_only=True)
    user_email = serializers.CharField(source="user.email", read_only=True)
    user_avatar = serializers.ImageField(source="user.profile_picture", read_only=True)
    active_properties = serializers.SerializerMethodField()

    class Meta:
        model = AgentProfile
        fields = (
            "id",
            "user_name",
            "user_email",
            "user_avatar",
            "years_of_experience",
            "specialties",
            "average_rating",
            "total_properties_sold",
            "active_properties",
            "is_verified",
        )

    def get_active_properties(self, obj):
        return obj.user.properties.filter(status="available").count()
