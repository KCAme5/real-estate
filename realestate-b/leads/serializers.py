from rest_framework import serializers
from .models import Lead, LeadActivity, WhatsAppMessage, Conversation, Message


class LeadActivitySerializer(serializers.ModelSerializer):
    agent_name = serializers.CharField(source="agent.get_full_name", read_only=True)

    class Meta:
        model = LeadActivity
        fields = "__all__"
        read_only_fields = ("agent",)


class WhatsAppMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = WhatsAppMessage
        fields = "__all__"


class LeadSerializer(serializers.ModelSerializer):
    activities = LeadActivitySerializer(many=True, read_only=True)
    agent_name = serializers.CharField(source="agent.get_full_name", read_only=True)
    property_title = serializers.CharField(
        source="property.title", read_only=True, allow_null=True
    )

    class Meta:
        model = Lead
        fields = "__all__"


class MessageSerializer(serializers.ModelSerializer):
    sender_name = serializers.CharField(source="sender.get_full_name", read_only=True)
    sender_type = serializers.CharField(source="sender.user_type", read_only=True)

    class Meta:
        model = Message
        fields = [
            "id",
            "conversation",
            "sender",
            "sender_name",
            "sender_type",
            "content",
            "is_read",
            "created_at",
        ]
        read_only_fields = ["sender", "created_at"]


class ConversationSerializer(serializers.ModelSerializer):
    property_title = serializers.CharField(source="property.title", read_only=True)
    property_image = serializers.SerializerMethodField()
    last_message = serializers.SerializerMethodField()
    unread_count = serializers.SerializerMethodField()
    other_user = serializers.SerializerMethodField()

    class Meta:
        model = Conversation
        fields = [
            "id",
            "property",
            "property_title",
            "property_image",
            "client",
            "agent",
            "last_message",
            "unread_count",
            "other_user",
            "updated_at",
        ]

    def get_property_image(self, obj):
        if obj.property.main_image:
            return obj.property.main_image.url
        return None

    def get_last_message(self, obj):
        last_message = obj.messages.last()
        if last_message:
            return MessageSerializer(last_message).data
        return None

    def get_unread_count(self, obj):
        request = self.context.get("request")
        if request and request.user.is_authenticated:
            return (
                obj.messages.filter(is_read=False).exclude(sender=request.user).count()
            )
        return 0

    def get_other_user(self, obj):
        request = self.context.get("request")
        if request and request.user.is_authenticated:
            if request.user == obj.client:
                return {
                    "id": obj.agent.id,
                    "name": obj.agent.get_full_name(),
                    "type": obj.agent.user_type,
                }
            else:
                return {
                    "id": obj.client.id,
                    "name": obj.client.get_full_name(),
                    "type": obj.client.user_type,
                }
        return None
