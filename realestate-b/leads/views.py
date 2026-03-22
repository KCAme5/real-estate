from rest_framework import generics, permissions, status, views
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied, ValidationError
from django.shortcuts import get_object_or_404
from django.db.models import Count, Avg, Q
from django.utils import timezone
import logging

logger = logging.getLogger(__name__)

from .models import (
    Lead,
    LeadActivity,
    LeadInteraction,
    LeadStatusLog,
    Task,
    Conversation,
    Message,
)
from .serializers import (
    LeadListSerializer,
    LeadDetailSerializer,
    LeadWriteSerializer,
    LeadStatusUpdateSerializer,
    LeadActivitySerializer,
    LeadInteractionSerializer,
    LeadStatusLogSerializer,
    TaskSerializer,
    ConversationSerializer,
    MessageSerializer,
)


# ─── Permission helpers ──────────────────────────────────────────────────────


class IsAgentOrAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.user_type in (
            "agent",
            "admin",
        )


class IsLeadAgent(permissions.BasePermission):
    """Only the assigned agent (or admin) may update a lead."""

    def has_object_permission(self, request, view, obj):
        return request.user.user_type == "admin" or obj.agent == request.user


# ─── Lead views ──────────────────────────────────────────────────────────────


class LeadListView(generics.ListCreateAPIView):
    """
    GET  /leads/         — agents see own leads, admins see all
    POST /leads/         — anyone (AllowAny) can submit a lead from the site
    FIX: split read vs write permissions properly
    """

    def get_permissions(self):
        if self.request.method == "POST":
            return [permissions.AllowAny()]
        return [IsAgentOrAdmin()]

    def get_serializer_class(self):
        # Use lightweight serializer for list — no nested queries
        if self.request.method == "POST":
            return LeadWriteSerializer
        return LeadListSerializer

    def get_queryset(self):
        user = self.request.user
        qs = Lead.objects.select_related("property", "agent")

        if user.user_type == "agent":
            qs = qs.filter(agent=user)
        # admin sees all

        # Filters
        status_param = self.request.query_params.get("status")
        priority_param = self.request.query_params.get("priority")
        source_param = self.request.query_params.get("source")
        search_param = self.request.query_params.get("search")

        if status_param:
            qs = qs.filter(status=status_param)
        if priority_param:
            qs = qs.filter(priority=priority_param)
        if source_param:
            qs = qs.filter(source=source_param)
        if search_param:
            qs = qs.filter(
                Q(first_name__icontains=search_param)
                | Q(last_name__icontains=search_param)
                | Q(email__icontains=search_param)
                | Q(phone__icontains=search_param)
            )

        return qs.order_by("-score", "-created_at")

    def perform_create(self, serializer):
        """
        Auto-assign to property's agent first, then least-busy agent.
        Logs creation for debugging.
        """
        from django.contrib.auth import get_user_model

        User = get_user_model()

        try:
            agent = serializer.validated_data.get("agent")
            prop = serializer.validated_data.get("property")

            if not agent:
                if prop and hasattr(prop, "agent") and prop.agent:
                    agent = getattr(prop.agent, "user", prop.agent)
                else:
                    least_busy = (
                        User.objects.filter(user_type="agent")
                        .annotate(lead_count=Count("assigned_leads"))
                        .order_by("lead_count")
                        .first()
                    )
                    agent = least_busy

            lead = serializer.save(agent=agent)
            lead.update_score()

            logger.info(
                f"Lead created: {lead.id} - {lead.first_name} {lead.last_name} ({lead.source})"
            )

        except Exception as e:
            logger.error(f"Error creating lead: {str(e)}", exc_info=True)
            raise

    def create(self, request, *args, **kwargs):
        """Override to provide better error messages in response."""
        try:
            return super().create(request, *args, **kwargs)
        except ValidationError as e:
            logger.warning(f"Validation error on lead creation: {e.detail}")
            return Response(
                {"success": False, "message": "Validation failed", "errors": e.detail},
                status=status.HTTP_400_BAD_REQUEST,
            )
        except Exception as e:
            logger.error(f"Unexpected error on lead creation: {str(e)}", exc_info=True)
            return Response(
                {
                    "success": False,
                    "message": "Failed to create lead. Please try again.",
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class LeadDetailView(generics.RetrieveUpdateAPIView):
    """
    GET   /leads/{id}/  — full detail with nested data
    PATCH /leads/{id}/  — full update (agents can edit their own leads)
    FIX: use LeadDetailSerializer only here
    """

    serializer_class = LeadDetailSerializer
    permission_classes = [IsAgentOrAdmin]

    def get_queryset(self):
        user = self.request.user
        qs = Lead.objects.prefetch_related(
            "activities", "interactions", "tasks", "status_logs"
        ).select_related("property", "agent")
        if user.user_type == "agent":
            return qs.filter(agent=user)
        return qs

    def perform_update(self, serializer):
        # Attach who made the change for the status log signal
        serializer.instance._changed_by = self.request.user
        lead = serializer.save()
        lead.update_score()


class LeadStatusUpdateView(generics.UpdateAPIView):
    """
    PATCH /leads/{id}/status/
    FIX: dedicated endpoint for Kanban drag-and-drop status changes.
    Keeps it clean — only updates status + optional note.
    """

    serializer_class = LeadStatusUpdateSerializer
    permission_classes = [IsAgentOrAdmin, IsLeadAgent]
    http_method_names = ["patch"]

    def get_queryset(self):
        user = self.request.user
        if user.user_type == "agent":
            return Lead.objects.filter(agent=user)
        return Lead.objects.all()

    def perform_update(self, serializer):
        serializer.instance._changed_by = self.request.user
        serializer.save()


class LeadActivityView(generics.ListCreateAPIView):
    serializer_class = LeadActivitySerializer
    permission_classes = [IsAgentOrAdmin]

    def get_queryset(self):
        return LeadActivity.objects.filter(lead_id=self.kwargs["pk"])

    def perform_create(self, serializer):
        lead = get_object_or_404(Lead, pk=self.kwargs["pk"])
        serializer.save(agent=self.request.user, lead=lead)
        lead.update_score()
        # Mark lead as contacted when agent logs a call or message
        if serializer.validated_data.get("activity_type") in (
            "call",
            "whatsapp",
            "email",
        ):
            lead.mark_contacted()


class LeadInteractionListView(generics.ListCreateAPIView):
    serializer_class = LeadInteractionSerializer
    permission_classes = [permissions.AllowAny]  # frontend tracking can fire this

    def get_queryset(self):
        return LeadInteraction.objects.filter(lead_id=self.kwargs["pk"])

    def perform_create(self, serializer):
        lead = get_object_or_404(Lead, pk=self.kwargs["pk"])
        serializer.save(lead=lead)
        lead.update_score()


class LeadStatusLogView(generics.ListAPIView):
    """GET /leads/{id}/status-log/ — full pipeline history for timeline UI"""

    serializer_class = LeadStatusLogSerializer
    permission_classes = [IsAgentOrAdmin]

    def get_queryset(self):
        return LeadStatusLog.objects.filter(lead_id=self.kwargs["pk"])


class AgentLeadListView(generics.ListAPIView):
    """GET /leads/my-leads/ — convenience shortcut for agent dashboard"""

    serializer_class = LeadListSerializer
    permission_classes = [IsAgentOrAdmin]

    def get_queryset(self):
        return Lead.objects.filter(agent=self.request.user).select_related("property")


class CRMStatsView(views.APIView):
    """
    GET /leads/stats/
    FIX: admins see platform-wide stats, agents see only their own.
    """

    permission_classes = [IsAgentOrAdmin]

    def get(self, request):
        user = request.user
        qs = (
            Lead.objects.filter(agent=user)
            if user.user_type == "agent"
            else Lead.objects.all()
        )

        overdue_tasks = Task.objects.filter(
            agent=user,
            is_completed=False,
            due_date__lt=timezone.now(),
        ).count()

        stats = {
            "total_leads": qs.count(),
            "new_leads": qs.filter(status="new").count(),
            "contacted": qs.filter(status="contacted").count(),
            "viewing": qs.filter(status="viewing").count(),
            "qualified_leads": qs.filter(status="qualified").count(),
            "proposal": qs.filter(status="proposal").count(),
            "negotiation": qs.filter(status="negotiation").count(),
            "closed_won": qs.filter(status="closed_won").count(),
            "closed_lost": qs.filter(status="closed_lost").count(),
            "avg_score": round(qs.aggregate(Avg("score"))["score__avg"] or 0, 1),
            "hot_leads": qs.filter(score__gte=50).count(),
            "overdue_tasks": overdue_tasks,
            "status_distribution": list(
                qs.values("status").annotate(count=Count("id"))
            ),
            "recent_tasks": TaskSerializer(
                Task.objects.filter(agent=user, is_completed=False).order_by(
                    "due_date"
                )[:5],
                many=True,
            ).data,
        }
        return Response(stats)


# ─── Task views ──────────────────────────────────────────────────────────────


class TaskListView(generics.ListCreateAPIView):
    serializer_class = TaskSerializer
    permission_classes = [IsAgentOrAdmin]

    def get_queryset(self):
        qs = Task.objects.filter(agent=self.request.user)
        if self.request.query_params.get("pending"):
            qs = qs.filter(is_completed=False)
        return qs

    def perform_create(self, serializer):
        serializer.save(agent=self.request.user)


class TaskDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = TaskSerializer
    permission_classes = [IsAgentOrAdmin]

    def get_queryset(self):
        return Task.objects.filter(agent=self.request.user)


# ─── Conversation & Message views ────────────────────────────────────────────


class ConversationListView(generics.ListCreateAPIView):
    serializer_class = ConversationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Conversation.objects.filter(
            Q(client=user) | Q(agent=user)
        ).select_related("property", "client", "agent", "lead")

    def create(self, request, *args, **kwargs):
        property_id = request.data.get("property")
        agent_id = request.data.get("agent")
        client = request.user

        # FIX: check for existing conversation by property OR by agent pair
        if property_id:
            existing = Conversation.objects.filter(
                property_id=property_id, client=client
            ).first()
        else:
            existing = Conversation.objects.filter(
                property__isnull=True, client=client, agent_id=agent_id
            ).first()

        if existing:
            serializer = self.get_serializer(existing)
            return Response(serializer.data)

        return super().create(request, *args, **kwargs)

    def perform_create(self, serializer):
        # FIX: link to the lead that is specific to this property, not just any lead
        property_id = self.request.data.get("property")
        lead = None
        if property_id:
            lead = Lead.objects.filter(
                user=self.request.user, property_id=property_id
            ).first()
        serializer.save(client=self.request.user, lead=lead)

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["request"] = self.request
        return context


class ConversationDetailView(generics.RetrieveAPIView):
    serializer_class = ConversationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Conversation.objects.filter(Q(client=user) | Q(agent=user))

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["request"] = self.request
        return context


class ConversationDeleteView(generics.DestroyAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Conversation.objects.filter(Q(client=user) | Q(agent=user))

    def perform_destroy(self, instance):
        Message.objects.filter(conversation=instance).delete()
        instance.delete()


class MessageListView(generics.ListCreateAPIView):
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Message.objects.filter(conversation_id=self.kwargs["pk"])

    def perform_create(self, serializer):
        conversation = get_object_or_404(Conversation, pk=self.kwargs["pk"])

        # FIX: verify the user belongs to this conversation before allowing message
        if self.request.user not in (conversation.client, conversation.agent):
            raise PermissionDenied("You are not part of this conversation.")

        # Mark incoming messages as read
        Message.objects.filter(conversation=conversation, is_read=False).exclude(
            sender=self.request.user
        ).update(is_read=True)

        serializer.save(sender=self.request.user, conversation=conversation)

        # Update lead last_contacted if agent is sending
        if self.request.user == conversation.agent and conversation.lead:
            conversation.lead.mark_contacted()


class MessageCreateView(generics.CreateAPIView):
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        conversation_id = self.request.data.get("conversation")
        conversation = get_object_or_404(Conversation, pk=conversation_id)

        if self.request.user not in (conversation.client, conversation.agent):
            raise PermissionDenied("You are not part of this conversation.")

        serializer.save(sender=self.request.user, conversation=conversation)


class MessageDeleteView(generics.DestroyAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Message.objects.filter(
            conversation_id=self.kwargs["conversation_id"],
            sender=self.request.user,
        )
