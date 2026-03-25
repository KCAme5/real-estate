# realestate_backend/properties/models.py
from django.db import models
from django.contrib.auth import get_user_model
from django.utils.text import slugify

User = get_user_model()


class Location(models.Model):
    name = models.CharField(max_length=100)
    county = models.CharField(max_length=50)
    slug = models.SlugField(unique=True)
    latitude = models.DecimalField(
        max_digits=9, decimal_places=6, null=True, blank=True
    )
    longitude = models.DecimalField(
        max_digits=9, decimal_places=6, null=True, blank=True
    )

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.name}, {self.county}"


class Property(models.Model):
    PROPERTY_TYPES = (
        ("townhouse", "Townhouse"),
        ("apartment", "Apartment/Flat"),
        ("maisonette", "Maisonette"),
        ("land", "Land/Plot"),
        ("commercial", "Commercial Property"),
        ("office", "Office"),
        ("duplex", "Duplex"),
        ("bungalow", "Bungalow"),
        ("villa", "Villa"),
    )

    STATUS_CHOICES = (
        ("available", "Available"),
        ("sold", "Sold"),
        ("rented", "Rented"),
        ("pending", "Pending"),
    )

    CURRENCY_CHOICES = (
        ("KES", "Kenyan Shilling"),
        ("USD", "US Dollar"),
    )

    # Basic Information
    title = models.CharField(max_length=200)
    slug = models.SlugField(unique=True)
    description = models.TextField()
    property_type = models.CharField(
        max_length=20, choices=PROPERTY_TYPES, default="apartment"
    )
    status = models.CharField(
        max_length=20, choices=STATUS_CHOICES, default="available"
    )

    LISTING_TYPES = (
        ("sale", "For Sale"),
        ("rent", "For Rent"),
    )
    listing_type = models.CharField(
        max_length=10, choices=LISTING_TYPES, default="sale"
    )

    is_development = models.BooleanField(
        default=False, help_text="Is this a development project?"
    )

    # Pricing
    price = models.DecimalField(max_digits=12, decimal_places=2)
    currency = models.CharField(max_length=3, choices=CURRENCY_CHOICES, default="KES")
    price_display = models.CharField(max_length=100, blank=True)

    # Location
    location = models.ForeignKey(
        Location,
        on_delete=models.CASCADE,
        related_name="properties",
        null=True,
        blank=True,
    )
    address = models.TextField(blank=True, null=True)
    latitude = models.DecimalField(
        max_digits=9, decimal_places=6, null=True, blank=True
    )
    longitude = models.DecimalField(
        max_digits=9, decimal_places=6, null=True, blank=True
    )

    # Property Details
    bedrooms = models.IntegerField(null=True, blank=True)
    bathrooms = models.IntegerField(null=True, blank=True)
    square_feet = models.DecimalField(
        max_digits=10, decimal_places=2, null=True, blank=True
    )
    plot_size = models.DecimalField(
        max_digits=10, decimal_places=2, null=True, blank=True
    )  # For land
    year_built = models.IntegerField(null=True, blank=True)

    # Features
    features = models.JSONField(
        default=list, blank=True
    )  # ['Swimming Pool', 'Garden', etc.]

    # Media
    main_image = models.URLField(blank=True, null=True)
    images = models.JSONField(default=list, blank=True)
    video_url = models.URLField(
        blank=True, null=True, help_text="Link to property tour video (YouTube/Vimeo)"
    )

    # Agent and Ownership
    agent = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="properties",
        limit_choices_to={"user_type": "agent"},
        blank=True,
        null=True,
    )
    owner_name = models.CharField(max_length=100, blank=True, null=True)
    owner_phone = models.CharField(max_length=15, blank=True, null=True)

    # Location as text (for free-form location input)
    location_name = models.CharField(max_length=200, blank=True, null=True)

    # Metadata
    is_featured = models.BooleanField(default=False)
    is_verified = models.BooleanField(default=False)
    is_active = models.BooleanField(
        default=True, help_text="Is this property available for bookings?"
    )
    views = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = "Properties"
        ordering = ["-created_at"]

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        # Format price display
        if self.currency == "KES":
            self.price_display = f"KES {self.price:,.0f}"
        else:
            self.price_display = f"USD {self.price:,.0f}"
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title


class PropertyImage(models.Model):
    property = models.ForeignKey(
        Property, on_delete=models.CASCADE, related_name="property_images"
    )
    image = models.URLField(blank=True, null=True)
    is_primary = models.BooleanField(default=False)
    caption = models.CharField(max_length=200, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Image for {self.property.title}"


class SavedProperty(models.Model):
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="saved_properties"
    )
    property = models.ForeignKey(
        Property, on_delete=models.CASCADE, related_name="saved_by_users"
    )
    saved_at = models.DateTimeField(auto_now_add=True)
    notes = models.TextField(blank=True)

    class Meta:
        unique_together = ["user", "property"]
        ordering = ["-saved_at"]

    def __str__(self):
        return f"{self.user.username} saved {self.property.title}"
