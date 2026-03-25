from django.contrib import admin
from .models import PaymentPlan, AgentSubscription, MpesaTransaction, PaymentWebhook


@admin.register(PaymentPlan)
class PaymentPlanAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "plan_type",
        "price_kes",
        "price_usd",
        "property_listings",
        "featured_days",
        "is_active",
    )
    list_filter = ("plan_type", "is_active")
    list_editable = ("is_active",)

    fieldsets = (
        ("Plan Information", {"fields": ("name", "plan_type", "description")}),
        ("Pricing", {"fields": ("price_kes", "price_usd")}),
        (
            "Features",
            {
                "fields": (
                    "features",
                    "property_listings",
                    "featured_days",
                    "validity_days",
                )
            },
        ),
        ("Status", {"fields": ("is_active",)}),
    )


@admin.register(AgentSubscription)
class AgentSubscriptionAdmin(admin.ModelAdmin):
    list_display = (
        "agent",
        "plan",
        "status",
        "start_date",
        "end_date",
        "auto_renew",
        "properties_listed",
    )
    list_filter = ("status", "plan", "auto_renew", "start_date")
    search_fields = ("agent__username", "agent__email")
    readonly_fields = ("start_date", "created_at")
    raw_id_fields = ("agent", "plan")


@admin.register(MpesaTransaction)
class MpesaTransactionAdmin(admin.ModelAdmin):
    list_display = (
        "user",
        "transaction_type",
        "amount",
        "currency",
        "status",
        "phone_number",
        "created_at",
    )
    list_filter = ("transaction_type", "status", "currency", "created_at")
    search_fields = (
        "user__username",
        "phone_number",
        "mpesa_receipt_number",
        "account_reference",
    )
    readonly_fields = ("created_at", "updated_at")
    raw_id_fields = ("user", "subscription", "property")


@admin.register(PaymentWebhook)
class PaymentWebhookAdmin(admin.ModelAdmin):
    list_display = ("received_at", "processed")
    list_filter = ("processed", "received_at")
    readonly_fields = ("received_at", "payload")

    def has_add_permission(self, request):
        return False
