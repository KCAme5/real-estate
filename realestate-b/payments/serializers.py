# realestate_backend/payments/serializers.py
from rest_framework import serializers
from .models import PaymentPlan, AgentSubscription, MpesaTransaction


class PaymentPlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = PaymentPlan
        fields = "__all__"


class AgentSubscriptionSerializer(serializers.ModelSerializer):
    plan_name = serializers.CharField(source="plan.name", read_only=True)
    plan_features = serializers.JSONField(source="plan.features", read_only=True)
    days_remaining = serializers.SerializerMethodField()

    class Meta:
        model = AgentSubscription
        fields = "__all__"

    def get_days_remaining(self, obj):
        from django.utils.timezone import now

        if obj.end_date > now():
            return (obj.end_date - now()).days
        return 0


class MpesaTransactionSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source="user.get_full_name", read_only=True)

    class Meta:
        model = MpesaTransaction
        fields = "__all__"


class MpesaPaymentRequestSerializer(serializers.Serializer):
    phone_number = serializers.CharField(max_length=15, required=True)
    amount = serializers.DecimalField(max_digits=10, decimal_places=2, required=True)
    transaction_type = serializers.CharField(max_length=20, required=True)
    account_reference = serializers.CharField(max_length=100, required=True)
    description = serializers.CharField(max_length=100, required=True)
