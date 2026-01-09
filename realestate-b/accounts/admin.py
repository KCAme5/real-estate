from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser, UserProfile


@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    list_display = (
        "username",
        "email",
        "first_name",
        "last_name",
        "user_type",
        "is_verified",
        "date_joined",
    )
    list_filter = ("user_type", "is_verified", "is_staff", "is_superuser")
    search_fields = ("username", "email", "first_name", "last_name")
    ordering = ("-date_joined",)

    fieldsets = UserAdmin.fieldsets + (
        (
            "Custom Fields",
            {"fields": ("user_type", "phone_number", "profile_picture", "is_verified")},
        ),
    )


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ("user", "company", "license_number", "years_of_experience")
    list_filter = ("user__user_type",)
    search_fields = ("user__username", "user__email", "company", "license_number")
    raw_id_fields = ("user",)
