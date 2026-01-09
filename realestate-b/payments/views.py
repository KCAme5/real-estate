# realestate_backend/payments/views.py
from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.conf import settings
from django.utils.timezone import now, timedelta
import requests
import json
from .models import PaymentPlan, AgentSubscription, MpesaTransaction, PaymentWebhook
from .serializers import (
    PaymentPlanSerializer,
    AgentSubscriptionSerializer,
    MpesaTransactionSerializer,
    MpesaPaymentRequestSerializer,
)


class PaymentPlanListView(generics.ListAPIView):
    serializer_class = PaymentPlanSerializer
    permission_classes = [permissions.AllowAny]
    queryset = PaymentPlan.objects.filter(is_active=True)


class AgentSubscriptionView(generics.RetrieveAPIView):
    serializer_class = AgentSubscriptionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        subscription, created = AgentSubscription.objects.get_or_create(
            agent=self.request.user,
            status="active",
            defaults={
                "plan": PaymentPlan.objects.filter(plan_type="basic").first(),
                "end_date": now() + timedelta(days=30),
            },
        )
        return subscription


class MpesaTransactionListView(generics.ListAPIView):
    serializer_class = MpesaTransactionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return MpesaTransaction.objects.filter(user=self.request.user)


@api_view(["POST"])
@permission_classes([permissions.IsAuthenticated])
def initiate_mpesa_payment(request):
    serializer = MpesaPaymentRequestSerializer(data=request.data)
    if serializer.is_valid():
        # Here you would integrate with M-Pesa API
        transaction = MpesaTransaction.objects.create(
            user=request.user,
            transaction_type=serializer.validated_data["transaction_type"],
            amount=serializer.validated_data["amount"],
            description=serializer.validated_data["description"],
            phone_number=serializer.validated_data["phone_number"],
            account_reference=serializer.validated_data["account_reference"],
            status="pending",
        )

        # Simulate M-Pesa API call (replace with actual implementation)
        try:
            # This is where actual M-Pesa API is called
            # For now, we'll simulate a successful response
            transaction.merchant_request_id = f"SIM_{transaction.id}"
            transaction.checkout_request_id = f"CHK_{transaction.id}"
            transaction.status = "successful"
            transaction.mpesa_receipt_number = f"REC_{transaction.id}"
            transaction.save()

            # If this is a subscription payment, create/update subscription
            if serializer.validated_data["transaction_type"] == "subscription":
                plan = PaymentPlan.objects.filter(
                    price_kes=serializer.validated_data["amount"]
                ).first()
                if plan:
                    subscription, created = AgentSubscription.objects.get_or_create(
                        agent=request.user,
                        defaults={
                            "plan": plan,
                            "end_date": now() + timedelta(days=plan.validity_days),
                        },
                    )
                    if not created:
                        subscription.plan = plan
                        subscription.end_date = now() + timedelta(
                            days=plan.validity_days
                        )
                        subscription.status = "active"
                        subscription.save()

                    transaction.subscription = subscription
                    transaction.save()

            return Response(
                {
                    "success": True,
                    "message": "Payment initiated successfully",
                    "transaction": MpesaTransactionSerializer(transaction).data,
                }
            )

        except Exception as e:
            transaction.status = "failed"
            transaction.status_message = str(e)
            transaction.save()

            return Response(
                {"success": False, "message": f"Payment failed: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST,
            )

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["POST"])
@permission_classes([permissions.AllowAny])
def mpesa_webhook(request):
    """
    Endpoint for M-Pesa to send payment confirmation webhooks
    """
    payload = request.data
    webhook = PaymentWebhook.objects.create(payload=payload)

    try:
        # Process the webhook payload
        # This is where the M-Pesa callback is validated and processed
        # For security, verify the callback comeing from M-Pesa

        result_code = payload.get("Body", {}).get("stkCallback", {}).get("ResultCode")
        result_desc = payload.get("Body", {}).get("stkCallback", {}).get("ResultDesc")
        checkout_request_id = (
            payload.get("Body", {}).get("stkCallback", {}).get("CheckoutRequestID")
        )

        if result_code == 0:
            # Successful payment
            transaction = MpesaTransaction.objects.filter(
                checkout_request_id=checkout_request_id
            ).first()
            if transaction:
                transaction.status = "successful"
                transaction.mpesa_receipt_number = (
                    payload.get("Body", {})
                    .get("stkCallback", {})
                    .get("CallbackMetadata", {})
                    .get("Item", [{}])[1]
                    .get("Value")
                )
                transaction.phone_number = (
                    payload.get("Body", {})
                    .get("stkCallback", {})
                    .get("CallbackMetadata", {})
                    .get("Item", [{}])[4]
                    .get("Value")
                )
                transaction.transaction_date = now()
                transaction.save()

        webhook.processed = True
        webhook.processing_notes = f"Processed: {result_desc}"
        webhook.save()

        return Response({"ResultCode": 0, "ResultDesc": "Success"})

    except Exception as e:
        webhook.processing_notes = f"Error: {str(e)}"
        webhook.save()
        return Response({"ResultCode": 1, "ResultDesc": "Failed"}, status=400)
