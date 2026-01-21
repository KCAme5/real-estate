# realestate_backend/analytics/views.py
from rest_framework import generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.db.models import Count, Sum, Avg, Q
from django.utils import timezone
from datetime import timedelta
from properties.models import Property
from leads.models import Lead
from agents.models import AgentProfile
from .models import PropertyView, SearchAnalytics, AgentPerformance


@api_view(["GET"])
@permission_classes([permissions.IsAuthenticated])
def dashboard_analytics(request):
    user = request.user
    thirty_days_ago = timezone.now() - timedelta(days=30)

    if user.user_type == "agent":
        # Agent-specific analytics
        properties = Property.objects.filter(agent=user)
        leads = Lead.objects.filter(agent=user)

        data = {
            "total_properties": properties.count(),
            "active_properties": properties.filter(status="available").count(),
            "sold_properties": properties.filter(status="sold").count(),
            "total_leads": leads.count(),
            "new_leads": leads.filter(status="new").count(),
            "property_views": PropertyView.objects.filter(
                property__in=properties
            ).count(),
            "recent_leads": leads.filter(created_at__gte=thirty_days_ago).count(),
        }

    elif user.user_type == "admin":
        # Admin analytics
        data = {
            "total_properties": Property.objects.count(),
            "verified_properties": Property.objects.filter(is_verified=True).count(),
            "total_agents": AgentProfile.objects.filter(is_verified=True).count(),
            "total_leads": Lead.objects.count(),
            "new_leads_today": Lead.objects.filter(
                created_at__date=timezone.now().date()
            ).count(),
            "properties_added_this_month": Property.objects.filter(
                created_at__gte=thirty_days_ago
            ).count(),
        }

    else:
        # Client analytics (if needed)
        data = {
            "properties_viewed": PropertyView.objects.filter(user=user).count(),
            "searches_performed": SearchAnalytics.objects.filter(user=user).count(),
            "leads_submitted": Lead.objects.filter(email=user.email).count(),
        }

    return Response(data)


@api_view(["GET"])
@permission_classes([permissions.IsAuthenticated])
def property_analytics(request, property_id):
    if request.user.user_type not in ["agent", "admin"]:
        return Response({"error": "Permission denied"}, status=403)

    property = Property.objects.filter(id=property_id, agent=request.user).first()
    if not property:
        return Response({"error": "Property not found"}, status=404)

    thirty_days_ago = timezone.now() - timedelta(days=30)

    views_data = (
        PropertyView.objects.filter(property=property, viewed_at__gte=thirty_days_ago)
        .extra({"date": "date(viewed_at)"})
        .values("date")
        .annotate(views=Count("id"))
        .order_by("date")
    )

    leads_from_property = Lead.objects.filter(property=property).count()

    return Response(
        {
            "total_views": property.views,
            "recent_views": views_data,
            "leads_from_property": leads_from_property,
            "performance_metrics": {
                "conversion_rate": (
                    (leads_from_property / property.views * 100)
                    if property.views > 0
                    else 0
                ),
                "average_daily_views": property.views / 30,  # Last 30 days
            },
        }
    )


@api_view(["GET"])
@permission_classes([permissions.IsAuthenticated])
def agent_performance(request):
    if request.user.user_type != "agent":
        return Response({"error": "Agents only"}, status=403)

    performance, created = AgentPerformance.objects.get_or_create(
        agent=request.user, period=timezone.now().replace(day=1).date()
    )

    # Update metrics
    properties = Property.objects.filter(agent=request.user)
    leads = Lead.objects.filter(agent=request.user)

    performance.properties_listed = properties.count()
    performance.properties_sold = properties.filter(status="sold").count()
    performance.leads_generated = leads.count()
    performance.leads_converted = leads.filter(
        status__in=["closed_won", "qualified"]
    ).count()
    performance.conversion_rate = (
        (performance.leads_converted / performance.leads_generated * 100)
        if performance.leads_generated > 0
        else 0
    )
    performance.save()

    from .serializers import AgentPerformanceSerializer

    return Response(AgentPerformanceSerializer(performance).data)


@api_view(["GET"])
@permission_classes([permissions.IsAuthenticated])
def management_analytics(request):
    if request.user.user_type != "management":
        return Response({"error": "Management privileges required"}, status=403)

    today = timezone.now().date()
    thirty_days_ago = timezone.now() - timedelta(days=30)
    start_of_month = today.replace(day=1)

    # Overview Data
    total_properties = Property.objects.count()
    verified_properties = Property.objects.filter(is_verified=True).count()
    total_agents = AgentProfile.objects.count()
    # Assuming 'client' is a user_type in CustomUser, but we don't have User model imported here directly.
    # We can user request.user.content_type.model_class() or get_user_model().
    from django.contrib.auth import get_user_model
    User = get_user_model()
    total_clients = User.objects.filter(user_type="client").count()
    total_leads = Lead.objects.count()
    
    # Calculate revenue (sum of sold properties price)
    total_revenue = Property.objects.filter(status="sold").aggregate(
        total=Sum("price")
    )["total"] or 0

    property_status_distribution = {
        "verified": verified_properties,
        "pending": Property.objects.filter(is_verified=False).count(), # Approximation
        "rejected": 0, # We don't have a rejected status field explicitly usually
    }

    # Today's Activity
    today_start = timezone.now().replace(hour=0, minute=0, second=0, microsecond=0)
    
    today_stats = {
        "new_properties": Property.objects.filter(created_at__gte=today_start).count(),
        "new_leads": Lead.objects.filter(created_at__gte=today_start).count(),
        "property_views": PropertyView.objects.filter(viewed_at__gte=today_start).count(),
        "searches": SearchAnalytics.objects.filter(searched_at__gte=today_start).count(),
    }

    # This Month
    this_month_stats = {
        "new_agents": User.objects.filter(user_type="agent", date_joined__gte=start_of_month).count(),
        "conversion_rate": 0, # Placeholder logic
    }

    # Top Agents (by sold properties or similar)
    # We can query AgentPerformance or aggregate Property
    top_agents_qs = AgentPerformance.objects.filter(period__gte=start_of_month).order_by("-properties_sold")[:5]
    top_agents = []
    for perf in top_agents_qs:
        top_agents.append({
            "username": perf.agent.username,
            "properties_count": perf.properties_listed,
            "leads_count": perf.leads_generated,
            "sold_properties": perf.properties_sold,
        })
    
    # Fallback if no performance records
    if not top_agents:
         # simple fallback query
         pass

    # Agent Performance List (Full)
    agent_perf_list = []
    # Simplified: just getting top 20 recent perfs
    recent_perfs = AgentPerformance.objects.filter(period__gte=start_of_month).select_related('agent')[:20]
    for perf in recent_perfs:
        agent_perf_list.append({
            "id": perf.agent.id,
            "username": perf.agent.username,
            "email": perf.agent.email,
            "properties_count": perf.properties_listed,
            "properties_sold": perf.properties_sold,
            "leads_count": perf.leads_generated,
            "revenue": 0, # Need to calculate revenue per agent if needed
        })

    # Lead Trends (Last 7 days)
    lead_trends = []
    for i in range(7):
        date = today - timedelta(days=i)
        count = Lead.objects.filter(created_at__date=date).count()
        lead_trends.append({"date": date.strftime("%Y-%m-%d"), "count": count})
    lead_trends.reverse()

    data = {
        "overview": {
            "total_properties": total_properties,
            "verified_properties": verified_properties,
            "total_agents": total_agents,
            "total_clients": total_clients,
            "total_leads": total_leads,
            "total_revenue": total_revenue,
            "property_status_distribution": property_status_distribution,
        },
        "today": today_stats,
        "this_month": this_month_stats,
        "top_agents": top_agents,
        "agent_performance_list": agent_perf_list,
        "lead_trends": lead_trends,
    }

    return Response(data)
