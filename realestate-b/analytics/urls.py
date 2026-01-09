from django.urls import path
from . import views

urlpatterns = [
    path("dashboard/", views.dashboard_analytics, name="dashboard-analytics"),
    path(
        "property/<int:property_id>/",
        views.property_analytics,
        name="property-analytics",
    ),
    path("agent-performance/", views.agent_performance, name="agent-performance"),
]
