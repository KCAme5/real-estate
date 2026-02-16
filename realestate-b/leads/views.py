from rest_framework import generics, permissions, status, views
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from rest_framework.exceptions import PermissionDenied
from django.db.models import Count, Q
from .models import *
from .serializers import *


class LeadListView(generics.ListCreateAPIView):
    serializer_class = LeadSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        queryset = Lead.objects.all().order_by("-score", "-created_at")
        
        # Filtering for Kanban or Agent view
        if self.request.user.is_authenticated:
            if self.request.user.user_type == "agent":
                queryset = queryset.filter(agent=self.request.user)
            
            status_param = self.request.query_params.get("status")
            if status_param:
                queryset = queryset.filter(status=status_param)
                
            return queryset
            
        return Lead.objects.none()

    def perform_create(self, serializer):
        # Auto-assign logic: find agent with least leads if not provided
        agent = serializer.validated_data.get("agent")
        if not agent:
            # Simple round-robin or least-assigned logic
            available_agents = User.objects.filter(user_type="agent").annotate(
                lead_count=Count("assigned_leads")
            ).order_by("lead_count")
            if available_agents.exists():
                agent = available_agents.first()
        
        lead = serializer.save(agent=agent)
        lead.update_score()


class LeadInteractionListView(generics.ListCreateAPIView):
    serializer_class = LeadInteractionSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        return LeadInteraction.objects.filter(lead_id=self.kwargs["pk"])

    def perform_create(self, serializer):
        lead_id = self.request.data.get("lead")
        lead = get_object_or_404(Lead, id=lead_id)
        serializer.save(lead=lead)
        # Trigger score update
        lead.update_score()


class TaskListView(generics.ListCreateAPIView):
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Task.objects.filter(agent=self.request.user).order_by("due_date")

    def perform_create(self, serializer):
        serializer.save(agent=self.request.user)


class TaskDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Task.objects.filter(agent=self.request.user)


class CRMStatsView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if request.user.user_type not in ["agent", "admin"]:
            return Response({"error": "Unauthorized"}, status=403)
            
        leads = Lead.objects.filter(agent=request.user) if request.user.user_type == "agent" else Lead.objects.all()
        
        stats = {
            "total_leads": leads.count(),
            "new_leads": leads.filter(status="new").count(),
            "qualified_leads": leads.filter(status="qualified").count(),
            "closed_won": leads.filter(status="closed_won").count(),
            "avg_score": leads.aggregate(models.Avg("score"))["score__avg"] or 0,
            "status_distribution": leads.values("status").annotate(count=Count("id")),
            "recent_tasks": TaskSerializer(Task.objects.filter(agent=request.user, is_completed=False)[:5], many=True).data
        }
        return Response(stats)


class LeadDetailView(generics.RetrieveUpdateAPIView):
    serializer_class = LeadSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.user_type in ["agent", "admin"]:
            return Lead.objects.all()
        return Lead.objects.none()

    def perform_update(self, serializer):
        lead = serializer.save()
        lead.update_score()


class LeadActivityView(generics.ListCreateAPIView):
    serializer_class = LeadActivitySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return LeadActivity.objects.filter(lead_id=self.kwargs["pk"])

    def perform_create(self, serializer):
        lead = get_object_or_404(Lead, id=self.kwargs["pk"])
        serializer.save(agent=self.request.user, lead=lead)
        lead.update_score()


class AgentLeadListView(generics.ListAPIView):
    serializer_class = LeadSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Lead.objects.filter(agent=self.request.user)


class ConversationListView(generics.ListCreateAPIView):
    serializer_class = ConversationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Conversation.objects.filter(Q(client=user) | Q(agent=user))

    def create(self, request, *args, **kwargs):
        property_id = request.data.get("property")
        agent_id = request.data.get("agent")
        client = request.user

        # Check if conversation already exists
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
        # Link to lead if exists
        lead = Lead.objects.filter(user=self.request.user).first()
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


class MessageListView(generics.ListCreateAPIView):
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        conversation_id = self.kwargs["pk"]
        return Message.objects.filter(conversation_id=conversation_id)

    def perform_create(self, serializer):
        conversation = get_object_or_404(Conversation, id=self.kwargs["pk"])
        # Mark other messages as read when sending a new one
        Message.objects.filter(conversation=conversation, is_read=False).exclude(
            sender=self.request.user
        ).update(is_read=True)
        serializer.save(sender=self.request.user, conversation=conversation)


class MessageCreateView(generics.CreateAPIView):
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        conversation_id = self.request.data.get("conversation")
        conversation = get_object_or_404(Conversation, id=conversation_id)

        # Check if user is part of the conversation
        if self.request.user not in [conversation.client, conversation.agent]:
            raise PermissionDenied("You are not part of this conversation")

        serializer.save(sender=self.request.user, conversation=conversation)


class ConversationDeleteView(generics.DestroyAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Conversation.objects.filter(Q(client=user) | Q(agent=user))

    def perform_destroy(self, instance):
        # Also delete all messages in this conversation
        Message.objects.filter(conversation=instance).delete()
        super().perform_destroy(instance)


class MessageDeleteView(generics.DestroyAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        conversation_id = self.kwargs["conversation_id"]
        return Message.objects.filter(
            conversation_id=conversation_id,
            sender=self.request.user,  # Users can only delete their own messages
        )
