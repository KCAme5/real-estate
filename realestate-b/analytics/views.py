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
            "active_properties": properties.filter(
                status="available", is_verified=True
            ).count(),
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
    total_revenue = (
        Property.objects.filter(status="sold").aggregate(total=Sum("price"))["total"]
        or 0
    )

    property_status_distribution = {
        "verified": verified_properties,
        "pending": Property.objects.filter(is_verified=False).count(),  # Approximation
        "rejected": 0,  # We don't have a rejected status field explicitly usually
    }

    # Today's Activity
    today_start = timezone.now().replace(hour=0, minute=0, second=0, microsecond=0)

    today_stats = {
        "new_properties": Property.objects.filter(created_at__gte=today_start).count(),
        "new_leads": Lead.objects.filter(created_at__gte=today_start).count(),
        "property_views": PropertyView.objects.filter(
            viewed_at__gte=today_start
        ).count(),
        "searches": SearchAnalytics.objects.filter(
            searched_at__gte=today_start
        ).count(),
    }

    # This Month
    this_month_stats = {
        "new_agents": User.objects.filter(
            user_type="agent", date_joined__gte=start_of_month
        ).count(),
        "conversion_rate": 0,  # Placeholder logic
    }

    # Top Agents (by sold properties or similar)
    # We can query AgentPerformance or aggregate Property
    top_agents_qs = AgentPerformance.objects.filter(
        period__gte=start_of_month
    ).order_by("-properties_sold")[:5]
    top_agents = []
    for perf in top_agents_qs:
        top_agents.append(
            {
                "username": perf.agent.username,
                "properties_count": perf.properties_listed,
                "leads_count": perf.leads_generated,
                "sold_properties": perf.properties_sold,
            }
        )

    # Fallback if no performance records
    if not top_agents:
        # simple fallback query - calculate from actual Property data
        top_agents_qs = (
            Property.objects.filter(agent__isnull=False)
            .values("agent__username")
            .annotate(
                properties_count=Count("id"),
                sold_properties=Count("id", filter=Q(status="sold")),
                leads_count=Count("leads", filter=Q(leads__isnull=False)),
            )
            .order_by("-properties_count")[:5]
        )

        for agent_data in top_agents_qs:
            top_agents.append(
                {
                    "username": agent_data["agent__username"],
                    "properties_count": agent_data["properties_count"],
                    "leads_count": agent_data["leads_count"],
                    "sold_properties": agent_data["sold_properties"],
                }
            )

    # Agent Performance List (Full)
    agent_perf_list = []
    # Simplified: just getting top 20 recent perfs
    recent_perfs = AgentPerformance.objects.filter(
        period__gte=start_of_month
    ).select_related("agent")[:20]
    for perf in recent_perfs:
        agent_perf_list.append(
            {
                "id": perf.agent.id,
                "username": perf.agent.username,
                "email": perf.agent.email,
                "properties_count": perf.properties_listed,
                "properties_sold": perf.properties_sold,
                "leads_count": perf.leads_generated,
                "revenue": 0,  # Need to calculate revenue per agent if needed
            }
        )

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


@api_view(["GET"])
@permission_classes([permissions.IsAuthenticated])
def lead_score_distribution(request):
    """
    Returns lead score distribution for charts.
    For agents: their own leads.
    For management/admin: all leads.
    """
    user = request.user
    
    if user.user_type == "agent":
        leads = Lead.objects.filter(agent=user)
    elif user.user_type in ["management", "admin"]:
        leads = Lead.objects.all()
    else:
        return Response({"error": "Permission denied"}, status=403)
    
    # Define score ranges: Cold (0-25), Warm (26-50), Hot (51-75), Very Hot (76-100)
    distribution = {
        "cold": leads.filter(score__lte=25).count(),
        "warm": leads.filter(score__gt=25, score__lte=50).count(),
        "hot": leads.filter(score__gt=50, score__lte=75).count(),
        "very_hot": leads.filter(score__gt=75).count(),
    }
    
    # For histogram: buckets of 10 points each
    histogram = []
    for i in range(0, 100, 10):
        bucket_count = leads.filter(score__gt=i, score__lte=i+10).count()
        histogram.append({
            "range": f"{i+1}-{i+10}",
            "count": bucket_count,
            "min": i + 1,
            "max": i + 10,
        })
    
    return Response({
        "distribution": distribution,
        "histogram": histogram,
        "average_score": leads.aggregate(avg=Avg("score"))["avg"] or 0,
        "total_leads": leads.count(),
    })


@api_view(["GET"])
@permission_classes([permissions.IsAuthenticated])
def lead_trends_agent(request):
    """
    Returns weekly lead trends for agent dashboard.
    Supports days parameter (default 28 = 4 weeks).
    """
    user = request.user
    if user.user_type != "agent":
        return Response({"error": "Agents only"}, status=403)
    
    days = int(request.GET.get("days", 28))
    today = timezone.now().date()
    start_date = today - timedelta(days=days-1)
    
    leads = Lead.objects.filter(agent=user, created_at__date__gte=start_date)
    
    # Group by date
    trends = []
    for i in range(days):
        date = start_date + timedelta(days=i)
        count = leads.filter(created_at__date=date).count()
        
        # Also get source breakdown for each day
        day_leads = leads.filter(created_at__date=date)
        sources = {}
        for src, _ in Lead.SOURCE_CHOICES:
            src_count = day_leads.filter(source=src).count()
            if src_count > 0:
                sources[src] = src_count
        
        trends.append({
            "date": date.strftime("%Y-%m-%d"),
            "count": count,
            "sources": sources,
        })
    
    return Response({
        "trends": trends,
        "period_days": days,
        "total_leads": sum(t["count"] for t in trends),
    })


@api_view(["GET"])
@permission_classes([permissions.IsAuthenticated])
def lead_source_distribution(request):
    """
    Returns lead source distribution.
    For agents: their own leads.
    For management: all leads.
    """
    user = request.user
    
    if user.user_type == "agent":
        leads = Lead.objects.filter(agent=user)
    elif user.user_type in ["management", "admin"]:
        leads = Lead.objects.all()
    else:
        return Response({"error": "Permission denied"}, status=403)
    
    distribution = []
    total = leads.count()
    
    for src, label in Lead.SOURCE_CHOICES:
        count = leads.filter(source=src).count()
        if count > 0:
            distribution.append({
                "source": src,
                "label": label,
                "count": count,
                "percentage": round((count / total * 100) if total > 0 else 0, 1),
            })
    
    return Response({
        "distribution": distribution,
        "total": total,
    })


@api_view(["GET"])
@permission_classes([permissions.IsAuthenticated])
def management_metrics(request):
    """
    Returns calculated management metrics including real conversion rate.
    """
    if request.user.user_type != "management":
        return Response({"error": "Management privileges required"}, status=403)
    
    from django.contrib.auth import get_user_model
    User = get_user_model()
    
    start_of_month = timezone.now().replace(day=1).date()
    
    # Calculate conversion rate: closed_won / (closed_won + closed_lost)
    won_leads = Lead.objects.filter(
        status="closed_won",
        updated_at__date__gte=start_of_month
    ).count()
    lost_leads = Lead.objects.filter(
        status="closed_lost",
        updated_at__date__gte=start_of_month
    ).count()
    
    total_closed = won_leads + lost_leads
    conversion_rate = round((won_leads / total_closed * 100) if total_closed > 0 else 0, 2)
    
    # Lead source performance
    source_performance = []
    for src, label in Lead.SOURCE_CHOICES:
        total = Lead.objects.filter(source=src, created_at__date__gte=start_of_month).count()
        converted = Lead.objects.filter(
            source=src, status="closed_won", updated_at__date__gte=start_of_month
        ).count()
        if total > 0:
            source_performance.append({
                "source": src,
                "label": label,
                "total_leads": total,
                "conversions": converted,
                "rate": round((converted / total * 100), 2),
            })
    
    return Response({
        "this_month": {
            "new_agents": User.objects.filter(
                user_type="agent", date_joined__gte=start_of_month
            ).count(),
            "conversion_rate": conversion_rate,
            "won_leads": won_leads,
            "lost_leads": lost_leads,
        },
        "source_performance": source_performance,
    })


@api_view(["GET"])
@permission_classes([permissions.IsAuthenticated])
def property_views(request):
    """Returns list of property views with optional filtering."""
    user = request.user
    property_id = request.GET.get('property')
    
    # Build query
    views_qs = PropertyView.objects.all()
    
    if user.user_type == "agent":
        # Agents only see views of their own properties
        views_qs = views_qs.filter(property__agent=user)
    
    if property_id:
        views_qs = views_qs.filter(property_id=property_id)
    
    # Order by most recent
    views_qs = views_qs.select_related('property').order_by('-viewed_at')[:100]
    
    data = []
    for view in views_qs:
        data.append({
            "id": view.id,
            "property": view.property_id,
            "property_title": view.property.title if view.property else None,
            "user": view.user_id,
            "ip_address": view.ip_address,
            "viewed_at": view.viewed_at.isoformat(),
        })
    
    return Response(data)


@api_view(["GET"])
@permission_classes([permissions.IsAuthenticated])
def property_views_summary(request):
    """Returns summary of property views."""
    user = request.user
    
    if user.user_type == "agent":
        properties = Property.objects.filter(agent=user)
        total_views = PropertyView.objects.filter(property__in=properties).count()
        unique_visitors = PropertyView.objects.filter(
            property__in=properties
        ).values('ip_address').distinct().count()
    else:
        total_views = PropertyView.objects.count()
        unique_visitors = PropertyView.objects.values('ip_address').distinct().count()
    
    return Response({
        "total_views": total_views,
        "unique_visitors": unique_visitors,
    })


@api_view(["GET"])
@permission_classes([permissions.IsAuthenticated])
def search_analytics(request):
    """Returns search analytics data."""
    user = request.user
    
    if user.user_type not in ["management", "admin"]:
        return Response({"error": "Management privileges required"}, status=403)
    
    # Get recent searches
    searches = SearchAnalytics.objects.all().order_by('-searched_at')[:50]
    
    # Group by query for popularity
    query_counts = (
        SearchAnalytics.objects.values('search_query')
        .annotate(count=Count('id'))
        .order_by('-count')[:20]
    )
    
    return Response([
        {
            "query": item['search_query'],
            "count": item['count'],
        }
        for item in query_counts
    ])
