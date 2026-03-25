from django.contrib.auth.models import AbstractUser
from django.db import models
from django.core.validators import RegexValidator


class CustomUser(AbstractUser):
    USER_TYPE_CHOICES = (
        ("client", "Client"),
        ("agent", "Agent"),
        ("management", "Management"),
    )
    username_validator = RegexValidator(
        r"^[a-zA-Z0-9 _.-]+$",
        "Enter a valid username. Only letters, numbers, spaces, underscores, dots, and hyphens are allowed.",
    )

    username = models.CharField(
        max_length=150,
        unique=True,
        help_text="Required. 150 characters or fewer. Letters, digits, spaces, and @/./+/-/_ only.",
        validators=[username_validator],
        error_messages={
            "unique": "A user with that username already exists.",
        },
    )
    user_type = models.CharField(
        max_length=10, choices=USER_TYPE_CHOICES, default="client"
    )
    phone_number = models.CharField(max_length=15, blank=True)
    profile_picture = models.ImageField(
        upload_to="profile_pics/", null=True, blank=True
    )
    is_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class UserProfile(models.Model):
    user = models.OneToOneField(
        CustomUser, on_delete=models.CASCADE, related_name="profile"
    )
    bio = models.TextField(blank=True)
    company = models.CharField(max_length=100, blank=True)
    license_number = models.CharField(max_length=70, blank=True)  # For agents
    years_of_experience = models.IntegerField(default=0)
    specialties = models.JSONField(
        default=list, blank=True
    )  # Store as list of specialties

    # Contact information
    whatsapp_number = models.CharField(max_length=15, blank=True)
    alternative_email = models.EmailField(blank=True)

    # Social media
    facebook_url = models.URLField(blank=True)
    twitter_url = models.URLField(blank=True)
    linkedin_url = models.URLField(blank=True)
    instagram_url = models.URLField(blank=True)

    def __str__(self):
        return f"{self.user.username}'s Profile"


class UserPreferences(models.Model):
    user = models.OneToOneField(
        CustomUser, on_delete=models.CASCADE, related_name="preferences"
    )

    # Notification preferences
    email_notifications = models.BooleanField(default=True)
    push_notifications = models.BooleanField(default=True)
    sms_notifications = models.BooleanField(default=False)
    property_alerts = models.BooleanField(default=True)
    price_drop_alerts = models.BooleanField(default=True)
    new_listing_matches = models.BooleanField(default=True)

    # Appearance
    theme = models.CharField(max_length=20, default="dark")
    language = models.CharField(max_length=10, default="en")
    currency = models.CharField(max_length=10, default="KES")

    # Privacy
    profile_visibility = models.CharField(
        max_length=20,
        choices=[("public", "Public"), ("private", "Private")],
        default="public",
    )
    show_online_status = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username}'s Preferences"
