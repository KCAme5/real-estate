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
