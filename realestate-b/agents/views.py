# realestate_backend/agents/views.py
from rest_framework import generics, permissions
from .models import AgentProfile, AgentReview
from .serializers import (
    AgentProfileSerializer,
    AgentListSerializer,
    AgentReviewSerializer,
)


class AgentListView(generics.ListAPIView):
    serializer_class = AgentListSerializer
    permission_classes = [permissions.AllowAny]
    queryset = AgentProfile.objects.filter(is_verified=True)


class AgentDetailView(generics.RetrieveAPIView):
    serializer_class = AgentProfileSerializer
    permission_classes = [permissions.AllowAny]
    queryset = AgentProfile.objects.filter(is_verified=True)


class AgentProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = AgentProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user.agent_profile


class AgentReviewCreateView(generics.CreateAPIView):
    serializer_class = AgentReviewSerializer
    permission_classes = [permissions.IsAuthenticated]
