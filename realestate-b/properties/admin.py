# realestate_backend/properties/admin.py
from django.contrib import admin
from django.utils.html import format_html
from .models import Property, Location, PropertyImage, SavedProperty


class PropertyImageInline(admin.TabularInline):
    model = PropertyImage
    extra = 1
    fields = ("image", "is_primary", "caption", "image_preview")
    readonly_fields = ("image_preview",)

    def image_preview(self, obj):
        if obj.image:
            return format_html(
                '<img src="{}" style="max-height: 100px; max-width: 100px;" />',
                obj.image,
            )
        return "-"

    image_preview.short_description = "Preview"


@admin.register(Property)
class PropertyAdmin(admin.ModelAdmin):
    list_display = (
        "title",
        "property_type",
        "price_display",
        "location",
        "agent",
        "status",
        "is_featured",
        "is_verified",
        "main_image_preview",
        "created_at",
    )
    list_filter = (
        "property_type",
        "status",
        "is_featured",
        "is_verified",
        "location",
        "created_at",
    )
    search_fields = ("title", "description", "agent__username", "location__name")
    list_editable = ("status", "is_featured", "is_verified")
    readonly_fields = (
        "views",
        "created_at",
        "updated_at",
        "slug",
        "price_display",
        "main_image_preview",
    )
    raw_id_fields = ("agent", "location")
    inlines = [PropertyImageInline]

    fieldsets = (
        (
            "Basic Information",
            {"fields": ("title", "slug", "description", "property_type", "status")},
        ),
        ("Pricing", {"fields": ("price", "currency", "price_display")}),
        ("Location", {"fields": ("location", "address", "latitude", "longitude")}),
        (
            "Property Details",
            {
                "fields": (
                    "bedrooms",
                    "bathrooms",
                    "square_feet",
                    "plot_size",
                    "year_built",
                    "features",
                )
            },
        ),
        ("Media", {"fields": ("main_image", "main_image_preview")}),
        ("Ownership", {"fields": ("agent", "owner_name", "owner_phone")}),
        (
            "Metadata",
            {
                "fields": (
                    "is_featured",
                    "is_verified",
                    "views",
                    "created_at",
                    "updated_at",
                )
            },
        ),
    )

    def main_image_preview(self, obj):
        if obj.main_image:
            return format_html(
                '<img src="{}" style="max-height: 50px; max-width: 50px;" />',
                obj.main_image,
            )
        return "-"

    main_image_preview.short_description = "Main Image"


@admin.register(Location)
class LocationAdmin(admin.ModelAdmin):
    list_display = ("name", "county", "slug", "latitude", "longitude")
    list_filter = ("county",)
    search_fields = ("name", "county")
    prepopulated_fields = {"slug": ("name",)}
    readonly_fields = ("slug",)


@admin.register(PropertyImage)
class PropertyImageAdmin(admin.ModelAdmin):
    list_display = ("property", "image_preview", "is_primary", "created_at")
    list_filter = ("is_primary", "created_at")
    search_fields = ("property__title", "caption")
    raw_id_fields = ("property",)
    readonly_fields = ("image_preview",)

    def image_preview(self, obj):
        if obj.image:
            return format_html(
                '<img src="{}" style="max-height: 100px; max-width: 100px;" />',
                obj.image,
            )
        return "-"

    image_preview.short_description = "Preview"


@admin.register(SavedProperty)
class SavedPropertyAdmin(admin.ModelAdmin):
    list_display = ("user", "property", "saved_at")
    list_filter = ("saved_at",)
    search_fields = ("user__username", "property__title", "notes")
    raw_id_fields = ("user", "property")
    readonly_fields = ("saved_at",)

    fieldsets = (
        (None, {"fields": ("user", "property", "notes")}),
        ("Metadata", {"fields": ("saved_at",), "classes": ("collapse",)}),
    )
