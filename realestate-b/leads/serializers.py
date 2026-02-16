from rest_framework import serializers
from .models import Lead, LeadActivity, WhatsAppMessage, Conversation, Message, LeadInteraction, Task


class LeadActivitySerializer(serializers.ModelSerializer):
    agent_name = serializers.CharField(source="agent.get_full_name", read_only=True)

    class Meta:
        model = LeadActivity
        fields = "__all__"
        read_only_fields = ("agent",)


class LeadInteractionSerializer(serializers.ModelSerializer):
    class Meta:
        model = LeadInteraction
        fields = "__all__"


class TaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = "__all__"


class WhatsAppMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = WhatsAppMessage
        fields = "__all__"


class LeadSerializer(serializers.ModelSerializer):
    activities = LeadActivitySerializer(many=True, read_only=True)
    interactions = LeadInteractionSerializer(many=True, read_only=True)
    tasks = TaskSerializer(many=True, read_only=True)
    agent_name = serializers.CharField(source="agent.get_full_name", read_only=True)
    property_title = serializers.CharField(
        source="property.title", read_only=True, allow_null=True
    )
    property_image = serializers.CharField(
        source="property.main_image", read_only=True, allow_null=True
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
        read_only_fields = ["sender", "conversation", "created_at"]


class ConversationSerializer(serializers.ModelSerializer):
    property_title = serializers.CharField(
        source="property.title", read_only=True, allow_null=True
    )
    property_image = serializers.SerializerMethodField()
    last_message = serializers.SerializerMethodField()
    unread_count = serializers.SerializerMethodField()
    other_user = serializers.SerializerMethodField()
    lead_details = serializers.SerializerMethodField()


    class Meta:
        model = Conversation
        fields = [
            "id",
            "property",
            "property_title",
            "property_image",
            "client",
            "agent",
            "lead",
            "lead_details",
            "last_message",
            "unread_count",
            "other_user",
            "updated_at",
        ]
        read_only_fields = ["client", "updated_at"]

    def get_property_image(self, obj):
        if obj.property and obj.property.main_image:
            return obj.property.main_image
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
            user = obj.agent if request.user == obj.client else obj.client
            return {
                "id": user.id,
                "name": user.get_full_name() or user.username,
                "type": user.user_type,
                "avatar": user.profile_picture.url if user.profile_picture else None,
            }
        return None

    def get_lead_details(self, obj):
        if not obj.lead:
            return None
        return {
            "id": obj.lead.id,
            "score": obj.lead.score,
            "priority": obj.lead.priority,
            "inquiries_count": obj.lead.interactions.filter(interaction_type="inquiry").count(),
            "is_hot": obj.lead.score > 50,
        }
