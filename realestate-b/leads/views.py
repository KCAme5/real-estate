from rest_framework import generics, permissions, status
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from rest_framework.exceptions import PermissionDenied
from .models import *
from .serializers import *


class LeadListView(generics.ListCreateAPIView):
    serializer_class = LeadSerializer
    permission_classes = [permissions.AllowAny]  # Allow anyone to create a lead

    def get_queryset(self):
        if self.request.user.is_authenticated and self.request.user.user_type in [
            "agent",
            "admin",
        ]:
            return Lead.objects.all()
        return Lead.objects.none()  # Regular users can't see all leads

    def perform_create(self, serializer):
        serializer.save()


class LeadCreateView(generics.CreateAPIView):
    serializer_class = LeadSerializer
    permission_classes = [permissions.AllowAny]

    def perform_create(self, serializer):
        serializer.save()


class LeadDetailView(generics.RetrieveUpdateAPIView):
    serializer_class = LeadSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.user_type in ["agent", "admin"]:
            return Lead.objects.all()
        return Lead.objects.none()


class LeadActivityView(generics.ListCreateAPIView):
    serializer_class = LeadActivitySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return LeadActivity.objects.filter(lead_id=self.kwargs["pk"])

    def perform_create(self, serializer):
        serializer.save(agent=self.request.user)


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
        return Conversation.objects.filter(models.Q(client=user) | models.Q(agent=user))

    def create(self, request, *args, **kwargs):
        property_id = request.data.get("property")
        agent_id = request.data.get("agent")
        client = request.user
        
        # Check if conversation already exists
        if property_id:
            existing = Conversation.objects.filter(property_id=property_id, client=client).first()
        else:
            existing = Conversation.objects.filter(property__isnull=True, client=client, agent_id=agent_id).first()
            
        if existing:
            serializer = self.get_serializer(existing)
            return Response(serializer.data)
            
        return super().create(request, *args, **kwargs)

    def perform_create(self, serializer):
        serializer.save(client=self.request.user)

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["request"] = self.request
        return context


class ConversationDetailView(generics.RetrieveAPIView):
    serializer_class = ConversationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Conversation.objects.filter(models.Q(client=user) | models.Q(agent=user))

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
