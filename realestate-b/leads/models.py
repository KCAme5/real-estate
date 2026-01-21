# realestate_backend/leads/models.py
from django.db import models
from django.contrib.auth import get_user_model
from properties.models import Property

User = get_user_model()


class Lead(models.Model):
    STATUS_CHOICES = (
        ("new", "New"),
        ("contacted", "Contacted"),
        ("qualified", "Qualified"),
        ("proposal", "Proposal Sent"),
        ("negotiation", "Negotiation"),
        ("closed_won", "Closed Won"),
        ("closed_lost", "Closed Lost"),
    )

    SOURCE_CHOICES = (
        ("website", "Website"),
        ("whatsapp", "WhatsApp"),
        ("referral", "Referral"),
        ("walk_in", "Walk-in"),
        ("phone", "Phone Call"),
    )

    # Lead Information
    first_name = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50)
    email = models.EmailField()
    phone = models.CharField(max_length=15)

    # Lead Details
    source = models.CharField(max_length=20, choices=SOURCE_CHOICES, default="website")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="new")
    budget_min = models.DecimalField(
        max_digits=12, decimal_places=2, null=True, blank=True
    )
    budget_max = models.DecimalField(
        max_digits=12, decimal_places=2, null=True, blank=True
    )
    preferred_locations = models.JSONField(default=list, blank=True)
    property_types = models.JSONField(default=list, blank=True)

    # Property of interest (if any)
    property = models.ForeignKey(
        Property, on_delete=models.SET_NULL, null=True, blank=True, related_name="leads"
    )

    # Assignment
    agent = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True, related_name="leads"
    )

    # Notes
    notes = models.TextField(blank=True)

    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.first_name} {self.last_name}"


class LeadActivity(models.Model):
    ACTIVITY_TYPES = (
        ("call", "Phone Call"),
        ("email", "Email"),
        ("meeting", "Meeting"),
        ("property_viewing", "Property Viewing"),
        ("whatsapp", "WhatsApp Message"),
        ("note", "Note"),
    )

    lead = models.ForeignKey(Lead, on_delete=models.CASCADE, related_name="activities")
    activity_type = models.CharField(max_length=20, choices=ACTIVITY_TYPES)
    description = models.TextField()
    scheduled_date = models.DateTimeField(null=True, blank=True)
    completed_date = models.DateTimeField(null=True, blank=True)
    agent = models.ForeignKey(User, on_delete=models.CASCADE)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.activity_type} for {self.lead}"


class WhatsAppMessage(models.Model):
    lead = models.ForeignKey(
        Lead, on_delete=models.CASCADE, related_name="whatsapp_messages"
    )
    message_id = models.CharField(max_length=100)
    direction = models.CharField(
        max_length=10, choices=(("inbound", "Inbound"), ("outbound", "Outbound"))
    )
    message_text = models.TextField()
    timestamp = models.DateTimeField()

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"WhatsApp {self.direction} - {self.lead}"


class Conversation(models.Model):
    property = models.ForeignKey(
        Property, on_delete=models.CASCADE, related_name="conversations", null=True, blank=True
    )
    client = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="client_conversations"
    )
    agent = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="agent_conversations"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["-updated_at"]

    def __str__(self):
        return f"Conversation about {self.property.title}"


class Message(models.Model):
    conversation = models.ForeignKey(
        Conversation, on_delete=models.CASCADE, related_name="messages"
    )
    sender = models.ForeignKey(User, on_delete=models.CASCADE)
    content = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["created_at"]

    def __str__(self):
        return f"Message from {self.sender.username}"
