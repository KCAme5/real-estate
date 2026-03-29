from django.urls import path
from . import views

urlpatterns = [
    path("dashboard/", views.dashboard_analytics, name="dashboard-analytics"),
    path("property/<int:property_id>/", views.property_analytics, name="property-analytics"),
    path("agent-performance/", views.agent_performance, name="agent-performance"),
    path("management/", views.management_analytics, name="management-analytics"),
    # New endpoints for real data
    path("lead-score-distribution/", views.lead_score_distribution, name="lead-score-distribution"),
    path("lead-trends/", views.lead_trends_agent, name="lead-trends"),
    path("lead-source-distribution/", views.lead_source_distribution, name="lead-source-distribution"),
    path("management-metrics/", views.management_metrics, name="management-metrics"),
    # Property views endpoint
    path("property-views/", views.property_views, name="property-views"),
    path("property-views/summary/", views.property_views_summary, name="property-views-summary"),
    # Search analytics endpoint
    path("search-analytics/", views.search_analytics, name="search-analytics"),
]
