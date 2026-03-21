from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone
from properties.models import Property

User = get_user_model()


class Lead(models.Model):
    STATUS_CHOICES = (
        ("new", "New"),
        ("contacted", "Contacted"),
        ("viewing", "Viewing Scheduled"),
        ("qualified", "Qualified"),
        ("proposal", "Proposal Sent"),
        ("negotiation", "Negotiation"),
        ("closed_won", "Closed Won"),
        ("closed_lost", "Closed Lost"),
    )

    SOURCE_CHOICES = (
        ("website", "Website"),
        ("contact_form", "Contact Form"),
        ("book_viewing", "Book Viewing"),
        ("saved_property", "Saved Property"),
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

    # Lead contact info
    first_name = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50)
    email = models.EmailField()
    phone = models.CharField(max_length=15)

    # Linked registered user (optional — guests can be leads too)
    user = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True, related_name="as_lead"
    )

    # Lead metadata
    source = models.CharField(max_length=20, choices=SOURCE_CHOICES, default="website")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="new")
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default="low")
    score = models.IntegerField(default=0)

    # Buyer preferences
    budget_min = models.DecimalField(
        max_digits=12, decimal_places=2, null=True, blank=True
    )
    budget_max = models.DecimalField(
        max_digits=12, decimal_places=2, null=True, blank=True
    )
    preferred_locations = models.JSONField(default=list, blank=True)
    property_types = models.JSONField(default=list, blank=True)

    # Property of interest
    property = models.ForeignKey(
        Property, on_delete=models.SET_NULL, null=True, blank=True, related_name="leads"
    )

    # Assigned agent
    agent = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="assigned_leads",
    )

    # Free-text notes from agent
    notes = models.TextField(blank=True)

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    # FIX: track when agent last reached out — used in CRM staleness alerts
    last_contacted = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["-score", "-created_at"]

    def __str__(self):
        return f"{self.first_name} {self.last_name} (score: {self.score})"

    def update_score(self):
        """
        Recalculate lead score from interactions and status.
        FIX: use update_fields to avoid recursive save() loops in signals.
        """
        total = 0
        total += self.interactions.count() * 5
        total += self.whatsapp_messages.count() * 10
        total += self.activities.filter(activity_type="property_viewing").count() * 15

        # Status multipliers
        status_bonus = {
            "qualified": 50,
            "proposal": 100,
            "negotiation": 200,
        }
        total += status_bonus.get(self.status, 0)

        # FIX: update_fields prevents triggering auto_now on updated_at
        # and avoids infinite loops when called from signals
        Lead.objects.filter(pk=self.pk).update(score=total)
        self.score = total

    def mark_contacted(self):
        """Call whenever agent sends a message or logs a call."""
        Lead.objects.filter(pk=self.pk).update(
            last_contacted=timezone.now(),
            status="contacted" if self.status == "new" else self.status,
        )


class LeadStatusLog(models.Model):
    """
    NEW: immutable log of every status transition.
    Powers the activity timeline on the lead detail page.
    """

    lead = models.ForeignKey(Lead, on_delete=models.CASCADE, related_name="status_logs")
    from_status = models.CharField(max_length=20, blank=True)
    to_status = models.CharField(max_length=20)
    changed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    note = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.lead} | {self.from_status} → {self.to_status}"


class LeadInteraction(models.Model):
    INTERACTION_TYPES = (
        ("page_view", "Page View"),
        ("property_click", "Property Click"),
        ("search", "Search Performed"),
        ("inquiry", "Property Inquiry"),
        ("download", "Brochure Download"),
        ("callback", "Requested Callback"),
    )

    lead = models.ForeignKey(
        Lead, on_delete=models.CASCADE, related_name="interactions"
    )
    interaction_type = models.CharField(max_length=20, choices=INTERACTION_TYPES)
    property = models.ForeignKey(
        Property, on_delete=models.SET_NULL, null=True, blank=True
    )
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
        # NEW: status_change type for pipeline transitions
        ("status_change", "Status Change"),
    )

    lead = models.ForeignKey(Lead, on_delete=models.CASCADE, related_name="activities")
    activity_type = models.CharField(max_length=20, choices=ACTIVITY_TYPES)
    description = models.TextField()
    scheduled_date = models.DateTimeField(null=True, blank=True)
    completed_date = models.DateTimeField(null=True, blank=True)
    agent = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.activity_type} for {self.lead}"


class Task(models.Model):
    PRIORITY_CHOICES = (
        ("low", "Low"),
        ("medium", "Medium"),
        ("high", "High"),
    )

    lead = models.ForeignKey(Lead, on_delete=models.CASCADE, related_name="tasks")
    agent = models.ForeignKey(User, on_delete=models.CASCADE, related_name="crm_tasks")
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    due_date = models.DateTimeField()
    is_completed = models.BooleanField(default=False)
    priority = models.CharField(
        max_length=10, choices=PRIORITY_CHOICES, default="medium"
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["due_date"]

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
        Lead,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="conversations",
    )
    property = models.ForeignKey(
        Property,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="conversations",
    )
    client = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="client_conversations"
    )
    agent = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="agent_conversations"
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-updated_at"]
        # FIX: prevent duplicate conversations for the same client/property pair
        constraints = [
            models.UniqueConstraint(
                fields=["client", "property"],
                condition=models.Q(property__isnull=False),
                name="unique_client_property_conversation",
            )
        ]

    def __str__(self):
        title = self.property.title if self.property else "General"
        return f"Conversation: {title} — {self.client.username}"


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
