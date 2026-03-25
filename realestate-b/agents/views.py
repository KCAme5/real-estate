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


from django.http import Http404
from django.db.models import Q


class AgentDetailView(generics.RetrieveAPIView):
    serializer_class = AgentProfileSerializer
    permission_classes = [permissions.AllowAny]
    queryset = AgentProfile.objects.all()

    def get_object(self):
        lookup = self.kwargs.get("pk") or self.kwargs.get("slug")
        if not lookup:
            raise Http404

        try:
            if str(lookup).isdigit():
                obj = AgentProfile.objects.get(pk=lookup)
            else:
                obj = AgentProfile.objects.get(slug=lookup)
        except AgentProfile.DoesNotExist:
            raise Http404

        # For non-management users, only show verified agents
        user = self.request.user
        if not obj.is_verified:
            if not user.is_authenticated or (
                user.user_type != "management" and user != obj.user
            ):
                raise Http404

        return obj


class AgentProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = AgentProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user.agent_profile


class AgentReviewCreateView(generics.CreateAPIView):
    serializer_class = AgentReviewSerializer
    permission_classes = [permissions.IsAuthenticated]


class ManagementAgentListView(generics.ListAPIView):
    serializer_class = AgentListSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.user_type != 'management':
            return AgentProfile.objects.none()
        return AgentProfile.objects.all().order_by('is_verified', '-user__date_joined')
