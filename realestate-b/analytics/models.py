# realestate_backend/analytics/models.py
from django.db import models
from django.contrib.auth import get_user_model
from properties.models import Property
from leads.models import Lead

User = get_user_model()


class PropertyView(models.Model):
    property = models.ForeignKey(
        Property, on_delete=models.CASCADE, related_name="view_analytics"
    )
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    ip_address = models.GenericIPAddressField()
    user_agent = models.TextField(blank=True)
    viewed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [
            models.Index(fields=["property", "viewed_at"]),
            models.Index(fields=["viewed_at"]),
        ]


class SearchAnalytics(models.Model):
    search_query = models.CharField(max_length=255)
    filters_used = models.JSONField(default=dict, blank=True)
    results_count = models.IntegerField(default=0)
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    ip_address = models.GenericIPAddressField()
    searched_at = models.DateTimeField(auto_now_add=True)


class LeadConversion(models.Model):
    lead = models.OneToOneField(
        Lead, on_delete=models.CASCADE, related_name="conversion"
    )
    converted_at = models.DateTimeField(null=True, blank=True)
    conversion_value = models.DecimalField(
        max_digits=12, decimal_places=2, null=True, blank=True
    )
    conversion_type = models.CharField(
        max_length=50, blank=True
    )  # 'sale', 'rental', 'consultation'

    created_at = models.DateTimeField(auto_now_add=True)


class AgentPerformance(models.Model):
    agent = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="performance_metrics"
    )
    period = models.DateField()  # Monthly performance (first day of month)

    # Metrics
    properties_listed = models.IntegerField(default=0)
    properties_sold = models.IntegerField(default=0)
    total_sales_value = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    leads_generated = models.IntegerField(default=0)
    leads_converted = models.IntegerField(default=0)
    conversion_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    average_response_time = models.DurationField(
        null=True, blank=True
    )  # Time to respond to leads

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ["agent", "period"]
