from django.db import models
from django.contrib.auth import get_user_model
from properties.models import Property

User = get_user_model()


class Booking(models.Model):
    STATUS_CHOICES = (
        ("pending", "Pending"),
        ("confirmed", "Confirmed"),
        ("cancelled", "Cancelled"),
        ("completed", "Completed"),
    )

    property = models.ForeignKey(
        Property, on_delete=models.CASCADE, related_name="bookings"
    )
    client = models.ForeignKey(User, on_delete=models.CASCADE, related_name="bookings")
    agent = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="agent_bookings"
    )
    date = models.DateTimeField()
    duration = models.IntegerField(default=30, help_text="Duration in minutes")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
    client_notes = models.TextField(blank=True)
    agent_notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-date"]

    def __str__(self):
        return f"Booking for {self.property.title} on {self.date}"
