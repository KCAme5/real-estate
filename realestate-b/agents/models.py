from django.db import models
from django.contrib.auth import get_user_model
from django.utils.text import slugify

User = get_user_model()


class AgentProfile(models.Model):
    user = models.OneToOneField(
        User, on_delete=models.CASCADE, related_name="agent_profile"
    )
    slug = models.SlugField(max_length=255, unique=True, blank=True, null=True)
    bio = models.TextField()
    license_number = models.CharField(max_length=50)
    years_of_experience = models.IntegerField(default=0)
    specialties = models.JSONField(default=list)

    # Contact information
    office_address = models.TextField(blank=True)
    whatsapp_number = models.CharField(max_length=15, blank=True)

    # Social media
    facebook_url = models.URLField(blank=True)
    twitter_url = models.URLField(blank=True)
    linkedin_url = models.URLField(blank=True)
    instagram_url = models.URLField(blank=True)

    # Performance metrics
    total_properties_sold = models.IntegerField(default=0)
    total_sales_value = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    average_rating = models.DecimalField(max_digits=3, decimal_places=2, default=0)

    # Verification
    is_verified = models.BooleanField(default=False)
    verification_documents = models.JSONField(default=list, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if not self.slug and self.user:
            full_name = self.user.get_full_name() or self.user.username
            base_slug = slugify(full_name)
            slug = base_slug
            counter = 1
            while AgentProfile.objects.filter(slug=slug).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1
            self.slug = slug
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Agent Profile - {self.user.get_full_name() or self.user.username}"


class AgentReview(models.Model):
    agent = models.ForeignKey(
        AgentProfile, on_delete=models.CASCADE, related_name="reviews"
    )
    client_name = models.CharField(max_length=100)
    client_email = models.EmailField()
    rating = models.IntegerField(choices=[(i, i) for i in range(1, 6)])
    review_text = models.TextField()
    is_approved = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Review for {self.agent.user.get_full_name()} by {self.client_name}"
