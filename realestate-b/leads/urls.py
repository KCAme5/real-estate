from django.urls import path
from . import views

urlpatterns = [
    path("", views.LeadListView.as_view(), name="lead-list"),
    path("create/", views.LeadCreateView.as_view(), name="lead-create"),
    path("<int:pk>/", views.LeadDetailView.as_view(), name="lead-detail"),
    path(
        "<int:pk>/activities/", views.LeadActivityView.as_view(), name="lead-activities"
    ),
    path("my-leads/", views.AgentLeadListView.as_view(), name="agent-leads"),
    path(
        "conversations/", views.ConversationListView.as_view(), name="conversation-list"
    ),
    path(
        "conversations/<int:pk>/",
        views.ConversationDetailView.as_view(),
        name="conversation-detail",
    ),
    path(
        "conversations/<int:pk>/messages/",
        views.MessageListView.as_view(),
        name="message-list",
    ),
    path("messages/create/", views.MessageCreateView.as_view(), name="message-create"),
]
