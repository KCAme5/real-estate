from django.contrib import admin
from .models import AgentProfile, AgentReview


@admin.register(AgentProfile)
class AgentProfileAdmin(admin.ModelAdmin):
    list_display = (
        "user",
        "license_number",
        "years_of_experience",
        "is_verified",
        "total_properties_sold",
        "average_rating",
    )
    list_filter = ("is_verified", "years_of_experience")
    search_fields = (
        "user__username",
        "user__email",
        "user__first_name",
        "user__last_name",
        "license_number",
    )
    readonly_fields = ("total_properties_sold", "total_sales_value", "average_rating")
    raw_id_fields = ("user",)

    fieldsets = (
        (
            "Agent Information",
            {
                "fields": (
                    "user",
                    "bio",
                    "license_number",
                    "years_of_experience",
                    "specialties",
                )
            },
        ),
        ("Contact Information", {"fields": ("office_address", "whatsapp_number")}),
        (
            "Social Media",
            {
                "fields": (
                    "facebook_url",
                    "twitter_url",
                    "linkedin_url",
                    "instagram_url",
                )
            },
        ),
        (
            "Performance Metrics",
            {
                "fields": (
                    "total_properties_sold",
                    "total_sales_value",
                    "average_rating",
                )
            },
        ),
        ("Verification", {"fields": ("is_verified", "verification_documents")}),
    )


@admin.register(AgentReview)
class AgentReviewAdmin(admin.ModelAdmin):
    list_display = ("agent", "client_name", "rating", "is_approved", "created_at")
    list_filter = ("rating", "is_approved", "created_at")
    search_fields = ("agent__user__username", "client_name", "client_email")
    list_editable = ("is_approved",)
    raw_id_fields = ("agent",)
