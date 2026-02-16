# realestate_backend/leads/models.py
from django.db import models
from django.contrib.auth import get_user_model
from properties.models import Property
from django.utils import timezone

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

    PRIORITY_CHOICES = (
        ("low", "Low"),
        ("medium", "Medium"),
        ("high", "High"),
        ("urgent", "Urgent"),
    )

    # Lead Information
    first_name = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50)
    email = models.EmailField()
    phone = models.CharField(max_length=15)
    
    # User linkage (if the lead registers)
    user = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True, related_name="as_lead"
    )

    # Lead Details
    source = models.CharField(max_length=20, choices=SOURCE_CHOICES, default="website")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="new")
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default="low")
    score = models.IntegerField(default=0)
    
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
        User, on_delete=models.SET_NULL, null=True, blank=True, related_name="assigned_leads"
    )

    # Notes
    notes = models.TextField(blank=True)

    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.score})"

    def update_score(self):
        """
        Recalculate lead score based on interactions.
        Scoring Rules:
        - View Property: 5 pts
        - WhatsApp Message: 10 pts
        - Specific Inquiry: 20 pts
        - Note added by agent: 2 pts
        - Status progress: Multiplier
        """
        total = 0
        total += self.interactions.count() * 5
        total += self.whatsapp_messages.count() * 10
        total += self.activities.filter(activity_type="property_viewing").count() * 15
        
        # Add multipliers for status
        if self.status == "qualified":
            total += 50
        elif self.status == "proposal":
            total += 100
        elif self.status == "negotiation":
            total += 200
            
        self.score = total
        self.save()


class LeadInteraction(models.Model):
    INTERACTION_TYPES = (
        ("page_view", "Page View"),
        ("property_click", "Property Click"),
        ("search", "Search Performed"),
        ("inquiry", "Property Inquiry"),
        ("download", "Brochure Download"),
        ("callback", "Requested Callback"),
    )

    lead = models.ForeignKey(Lead, on_delete=models.CASCADE, related_name="interactions")
    interaction_type = models.CharField(max_length=20, choices=INTERACTION_TYPES)
    property = models.ForeignKey(Property, on_delete=models.SET_NULL, null=True, blank=True)
    metadata = models.JSONField(default=dict, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.interaction_type} by {self.lead}"


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


class Task(models.Model):
    lead = models.ForeignKey(Lead, on_delete=models.CASCADE, related_name="tasks")
    agent = models.ForeignKey(User, on_delete=models.CASCADE, related_name="crm_tasks")
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    due_date = models.DateTimeField()
    is_completed = models.BooleanField(default=False)
    priority = models.CharField(
        max_length=10, 
        choices=(("low", "Low"), ("medium", "Medium"), ("high", "High")),
        default="medium"
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Task for {self.lead.first_name}: {self.title}"


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
    lead = models.ForeignKey(
        Lead, on_delete=models.SET_NULL, null=True, blank=True, related_name="conversations"
    )
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
        title = self.property.title if self.property else "General"
        return f"Conversation about {title} with {self.client.username}"


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
