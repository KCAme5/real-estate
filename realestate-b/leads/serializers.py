from rest_framework import serializers
from .models import (
    Lead,
    LeadActivity,
    LeadInteraction,
    LeadStatusLog,
    Task,
    WhatsAppMessage,
    Conversation,
    Message,
)


# ─── Activity / Interaction / Task ──────────────────────────────────────────


class LeadActivitySerializer(serializers.ModelSerializer):
    agent_name = serializers.CharField(source="agent.get_full_name", read_only=True)

    class Meta:
        model = LeadActivity
        fields = "__all__"
        read_only_fields = ("agent", "created_at")


class LeadInteractionSerializer(serializers.ModelSerializer):
    class Meta:
        model = LeadInteraction
        fields = "__all__"


class LeadStatusLogSerializer(serializers.ModelSerializer):
    changed_by_name = serializers.CharField(
        source="changed_by.get_full_name", read_only=True
    )

    class Meta:
        model = LeadStatusLog
        fields = "__all__"
        read_only_fields = ("created_at",)


class TaskSerializer(serializers.ModelSerializer):
    agent_name = serializers.CharField(source="agent.get_full_name", read_only=True)
    is_overdue = serializers.SerializerMethodField()

    class Meta:
        model = Task
        fields = "__all__"
        read_only_fields = ("agent", "created_at")

    def get_is_overdue(self, obj):
        from django.utils import timezone

        return not obj.is_completed and obj.due_date < timezone.now()


class WhatsAppMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = WhatsAppMessage
        fields = "__all__"


# ─── Lead serializers (two tiers: list vs detail) ────────────────────────────


class LeadListSerializer(serializers.ModelSerializer):
    """
    Lightweight serializer for Kanban board and list views.
    FIX: does NOT nest activities/interactions — avoids N+1 queries on lists.
    """

    agent_name = serializers.CharField(source="agent.get_full_name", read_only=True)
    property_title = serializers.CharField(
        source="property.title", read_only=True, allow_null=True
    )
    property_image = serializers.CharField(
        source="property.main_image", read_only=True, allow_null=True
    )
    full_name = serializers.SerializerMethodField()
    is_hot = serializers.SerializerMethodField()
    days_in_stage = serializers.SerializerMethodField()

    class Meta:
        model = Lead
        fields = [
            "id",
            "full_name",
            "first_name",
            "last_name",
            "email",
            "phone",
            "source",
            "status",
            "priority",
            "score",
            "agent",
            "agent_name",
            "property",
            "property_title",
            "property_image",
            "budget_min",
            "budget_max",
            "last_contacted",
            "created_at",
            "updated_at",
            "is_hot",
            "days_in_stage",
        ]

    def get_full_name(self, obj):
        return f"{obj.first_name} {obj.last_name}".strip()

    def get_is_hot(self, obj):
        return obj.score >= 50

    def get_days_in_stage(self, obj):
        from django.utils import timezone

        delta = timezone.now() - obj.updated_at
        return delta.days


class LeadDetailSerializer(serializers.ModelSerializer):
    """
    Full serializer for lead detail page — includes nested data.
    Only use on single-object endpoints.
    """

    activities = LeadActivitySerializer(many=True, read_only=True)
    interactions = LeadInteractionSerializer(many=True, read_only=True)
    tasks = TaskSerializer(many=True, read_only=True)
    status_logs = LeadStatusLogSerializer(many=True, read_only=True)
    agent_name = serializers.CharField(source="agent.get_full_name", read_only=True)
    property_title = serializers.CharField(
        source="property.title", read_only=True, allow_null=True
    )
    property_image = serializers.CharField(
        source="property.main_image", read_only=True, allow_null=True
    )
    full_name = serializers.SerializerMethodField()
    is_hot = serializers.SerializerMethodField()
    conversation_id = serializers.SerializerMethodField()

    class Meta:
        model = Lead
        fields = "__all__"

    def get_full_name(self, obj):
        return f"{obj.first_name} {obj.last_name}".strip()

    def get_is_hot(self, obj):
        return obj.score >= 50

    def get_conversation_id(self, obj):
        """Return linked conversation ID so frontend can open the chat directly."""
        conv = obj.conversations.first()
        return conv.id if conv else None


class LeadStatusUpdateSerializer(serializers.ModelSerializer):
    """
    Minimal serializer for PATCH /leads/{id}/status/ endpoint only.
    Keeps status updates clean and intentional.
    """

    class Meta:
        model = Lead
        fields = ["status", "notes"]


class LeadWriteSerializer(serializers.ModelSerializer):
    """
    Serializer for creating and updating leads via POST/PATCH.
    Only allows writable fields — no computed/read-only fields.
    """

    class Meta:
        model = Lead
        fields = [
            "first_name",
            "last_name",
            "email",
            "phone",
            "source",
            "status",
            "priority",
            "budget_min",
            "budget_max",
            "preferred_locations",
            "property_types",
            "property",
            "agent",
            "notes",
        ]


# ─── Messages & Conversations ────────────────────────────────────────────────


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
            "is_active",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["client", "created_at", "updated_at"]

    def get_property_image(self, obj):
        if obj.property and obj.property.main_image:
            return obj.property.main_image
        return None

    def get_last_message(self, obj):
        last = obj.messages.last()
        return MessageSerializer(last).data if last else None

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
            "status": obj.lead.status,
            "inquiries_count": obj.lead.interactions.filter(
                interaction_type="inquiry"
            ).count(),
            "is_hot": obj.lead.score >= 50,
            # FIX: added status so frontend can show badge in conversation list
        }
