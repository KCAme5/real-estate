# realestate_backend/payments/models.py
from django.db import models
from django.contrib.auth import get_user_model
from properties.models import Property

User = get_user_model()


class PaymentPlan(models.Model):
    PLAN_TYPES = (
        ("basic", "Basic"),
        ("premium", "Premium"),
        ("enterprise", "Enterprise"),
    )

    name = models.CharField(max_length=50)
    plan_type = models.CharField(max_length=20, choices=PLAN_TYPES)
    price_kes = models.DecimalField(max_digits=10, decimal_places=2)
    price_usd = models.DecimalField(
        max_digits=10, decimal_places=2, null=True, blank=True
    )
    description = models.TextField()
    features = models.JSONField(default=list)  # List of features
    property_listings = models.IntegerField(
        default=1
    )  # Number of included property listings
    featured_days = models.IntegerField(
        default=0
    )  # Number of days properties are featured
    validity_days = models.IntegerField(default=30)  # Plan validity period

    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} - KES {self.price_kes}"


class AgentSubscription(models.Model):
    STATUS_CHOICES = (
        ("active", "Active"),
        ("expired", "Expired"),
        ("cancelled", "Cancelled"),
    )

    agent = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="subscriptions"
    )
    plan = models.ForeignKey(PaymentPlan, on_delete=models.CASCADE)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="active")
    start_date = models.DateTimeField(auto_now_add=True)
    end_date = models.DateTimeField()
    auto_renew = models.BooleanField(default=True)

    # Usage tracking
    properties_listed = models.IntegerField(default=0)
    properties_featured = models.IntegerField(default=0)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.agent.username} - {self.plan.name}"


class MpesaTransaction(models.Model):
    TRANSACTION_TYPES = (
        ("subscription", "Subscription Payment"),
        ("property_feature", "Property Feature"),
        ("premium_listing", "Premium Listing"),
    )

    STATUS_CHOICES = (
        ("pending", "Pending"),
        ("successful", "Successful"),
        ("failed", "Failed"),
        ("cancelled", "Cancelled"),
    )

    # Transaction details
    transaction_type = models.CharField(max_length=20, choices=TRANSACTION_TYPES)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=3, default="KES")
    description = models.TextField()

    # M-Pesa response fields
    merchant_request_id = models.CharField(max_length=100, blank=True)
    checkout_request_id = models.CharField(max_length=100, blank=True)
    mpesa_receipt_number = models.CharField(max_length=50, blank=True)
    phone_number = models.CharField(max_length=15, blank=True)
    account_reference = models.CharField(max_length=100, blank=True)
    transaction_date = models.DateTimeField(null=True, blank=True)

    # Status
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
    status_message = models.TextField(blank=True)

    # Relationships
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="mpesa_transactions"
    )
    subscription = models.ForeignKey(
        AgentSubscription, on_delete=models.SET_NULL, null=True, blank=True
    )
    property = models.ForeignKey(
        Property, on_delete=models.SET_NULL, null=True, blank=True
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"MPesa {self.transaction_type} - {self.amount} - {self.status}"


class PaymentWebhook(models.Model):
    payload = models.JSONField()
    received_at = models.DateTimeField(auto_now_add=True)
    processed = models.BooleanField(default=False)
    processing_notes = models.TextField(blank=True)

    def __str__(self):
        return f"Webhook - {self.received_at}"
