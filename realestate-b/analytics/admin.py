from django.contrib import admin
from .models import PropertyView, SearchAnalytics, LeadConversion, AgentPerformance


@admin.register(PropertyView)
class PropertyViewAdmin(admin.ModelAdmin):
    list_display = ("property", "user", "ip_address", "viewed_at")
    list_filter = ("viewed_at",)
    search_fields = ("property__title", "user__username", "ip_address")
    readonly_fields = ("viewed_at",)
    raw_id_fields = ("property", "user")


@admin.register(SearchAnalytics)
class SearchAnalyticsAdmin(admin.ModelAdmin):
    list_display = ("search_query", "results_count", "user", "searched_at")
    list_filter = ("searched_at",)
    search_fields = ("search_query", "user__username", "ip_address")
    readonly_fields = ("searched_at",)
    raw_id_fields = ("user",)


@admin.register(LeadConversion)
class LeadConversionAdmin(admin.ModelAdmin):
    list_display = ("lead", "converted_at", "conversion_value", "conversion_type")
    list_filter = ("conversion_type", "converted_at")
    search_fields = ("lead__first_name", "lead__last_name")
    raw_id_fields = ("lead",)


@admin.register(AgentPerformance)
class AgentPerformanceAdmin(admin.ModelAdmin):
    list_display = (
        "agent",
        "period",
        "properties_listed",
        "properties_sold",
        "total_sales_value",
        "conversion_rate",
    )
    list_filter = ("period",)
    search_fields = ("agent__username", "agent__email")
    readonly_fields = ("created_at", "updated_at")
    raw_id_fields = ("agent",)
