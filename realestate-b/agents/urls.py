from django.urls import path
from . import views

urlpatterns = [
    path("", views.AgentListView.as_view(), name="agent-list"),
    path("<int:pk>/", views.AgentDetailView.as_view(), name="agent-detail"),
    path("<slug:slug>/", views.AgentDetailView.as_view(), name="agent-detail-slug"),
    path("profile/", views.AgentProfileView.as_view(), name="agent-profile"),
    path(
        "reviews/create/",
        views.AgentReviewCreateView.as_view(),
        name="agent-review-create",
    ),
    path(
        "management-agents/",
        views.ManagementAgentListView.as_view(),
        name="management-agents",
    ),
]
