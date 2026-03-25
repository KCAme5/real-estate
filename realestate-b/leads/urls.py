from django.urls import path
from . import views

urlpatterns = [
    # ── Lead CRUD ────────────────────────────────────────────────────────────
    path("", views.LeadListView.as_view(), name="lead-list"),
    path("<int:pk>/", views.LeadDetailView.as_view(), name="lead-detail"),
    # FIX: dedicated status-update endpoint for Kanban drag-and-drop
    path(
        "<int:pk>/status/",
        views.LeadStatusUpdateView.as_view(),
        name="lead-status-update",
    ),
    # ── Sub-resources ────────────────────────────────────────────────────────
    path(
        "<int:pk>/activities/", views.LeadActivityView.as_view(), name="lead-activities"
    ),
    path(
        "<int:pk>/interactions/",
        views.LeadInteractionListView.as_view(),
        name="lead-interactions",
    ),
    # FIX: new — full pipeline history for the lead timeline
    path(
        "<int:pk>/status-log/",
        views.LeadStatusLogView.as_view(),
        name="lead-status-log",
    ),
    # ── Agent shortcuts ──────────────────────────────────────────────────────
    path("my-leads/", views.AgentLeadListView.as_view(), name="agent-leads"),
    path("stats/", views.CRMStatsView.as_view(), name="crm-stats"),
    # ── Tasks ────────────────────────────────────────────────────────────────
    path("tasks/", views.TaskListView.as_view(), name="task-list"),
    path("tasks/<int:pk>/", views.TaskDetailView.as_view(), name="task-detail"),
    # ── Conversations ─────────────────────────────────────────────────────────
    path(
        "conversations/", views.ConversationListView.as_view(), name="conversation-list"
    ),
    path(
        "conversations/<int:pk>/",
        views.ConversationDetailView.as_view(),
        name="conversation-detail",
    ),
    path(
        "conversations/<int:pk>/delete/",
        views.ConversationDeleteView.as_view(),
        name="conversation-delete",
    ),
    path(
        "conversations/<int:pk>/messages/",
        views.MessageListView.as_view(),
        name="message-list",
    ),
    path(
        "conversations/<int:conversation_id>/messages/<int:pk>/delete/",
        views.MessageDeleteView.as_view(),
        name="message-delete",
    ),
    # ── Messages ──────────────────────────────────────────────────────────────
    path("messages/create/", views.MessageCreateView.as_view(), name="message-create"),
]
