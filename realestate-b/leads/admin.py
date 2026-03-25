from django.contrib import admin
from .models import Lead, LeadActivity, WhatsAppMessage


class LeadActivityInline(admin.TabularInline):
    model = LeadActivity
    extra = 0
    readonly_fields = ("created_at",)
    fields = (
        "activity_type",
        "description",
        "scheduled_date",
        "completed_date",
        "agent",
        "created_at",
    )


class WhatsAppMessageInline(admin.TabularInline):
    model = WhatsAppMessage
    extra = 0
    readonly_fields = ("created_at",)
    fields = ("direction", "message_text", "timestamp", "created_at")


@admin.register(Lead)
class LeadAdmin(admin.ModelAdmin):
    list_display = (
        "first_name",
        "last_name",
        "email",
        "phone",
        "source",
        "status",
        "agent",
        "property",
        "created_at",
    )
    list_filter = ("source", "status", "created_at")
    search_fields = ("first_name", "last_name", "email", "phone", "property__title")
    list_editable = ("status", "agent")
    readonly_fields = ("created_at", "updated_at")
    raw_id_fields = ("property", "agent")
    inlines = [LeadActivityInline, WhatsAppMessageInline]

    fieldsets = (
        ("Lead Information", {"fields": ("first_name", "last_name", "email", "phone")}),
        (
            "Lead Details",
            {
                "fields": (
                    "source",
                    "status",
                    "budget_min",
                    "budget_max",
                    "preferred_locations",
                    "property_types",
                )
            },
        ),
        ("Assignment", {"fields": ("property", "agent")}),
        ("Notes", {"fields": ("notes",)}),
        ("Metadata", {"fields": ("created_at", "updated_at")}),
    )


@admin.register(LeadActivity)
class LeadActivityAdmin(admin.ModelAdmin):
    list_display = (
        "lead",
        "activity_type",
        "scheduled_date",
        "completed_date",
        "agent",
        "created_at",
    )
    list_filter = ("activity_type", "scheduled_date", "completed_date")
    search_fields = ("lead__first_name", "lead__last_name", "agent__username")
    raw_id_fields = ("lead", "agent")


@admin.register(WhatsAppMessage)
class WhatsAppMessageAdmin(admin.ModelAdmin):
    list_display = ("lead", "direction", "timestamp", "created_at")
    list_filter = ("direction", "timestamp")
    search_fields = ("lead__first_name", "lead__last_name", "message_text")
    raw_id_fields = ("lead",)
