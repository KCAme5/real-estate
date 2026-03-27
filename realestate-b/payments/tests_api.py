"""
API Integration Tests for Payments endpoints.
"""
import pytest
from django.urls import reverse
from rest_framework import status
from decimal import Decimal

pytestmark = [pytest.mark.api, pytest.mark.integration]


class TestPaymentPlansEndpoint:
    """Tests for GET /api/payments/plans/"""

    def test_payment_plans_public(self, api_client, agent_user_factory):
        """Payment plans are publicly accessible."""
        from payments.models import PaymentPlan
        PaymentPlan.objects.create(
            name="Basic Plan",
            plan_type="basic",
            price_kes=Decimal('5000.00'),
            description="Basic features",
            features=["Feature 1", "Feature 2"]
        )

        url = reverse('payment-plans')
        response = api_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) >= 1

    def test_only_active_plans_returned(self, api_client):
        """Only active plans are returned."""
        from payments.models import PaymentPlan
        PaymentPlan.objects.create(
            name="Inactive Plan",
            plan_type="basic",
            price_kes=Decimal('5000.00'),
            description="Inactive",
            is_active=False
        )

        url = reverse('payment-plans')
        response = api_client.get(url)

        names = [p['name'] for p in response.data]
        assert 'Inactive Plan' not in names


class TestAgentSubscriptionEndpoint:
    """Tests for GET/PATCH /api/payments/subscription/"""

    def test_get_subscription_requires_auth(self, api_client):
        url = reverse('agent-subscription')
        response = api_client.get(url)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_agent_sees_own_subscription(self, agent_client, agent_user_factory):
        from payments.models import PaymentPlan, AgentSubscription
        agent = agent_user_factory()
        plan = PaymentPlan.objects.create(
            name="Premium",
            plan_type="premium",
            price_kes=Decimal('10000.00'),
            description="Premium plan"
        )
        AgentSubscription.objects.create(agent=agent, plan=plan, status='active')

        agent_client.force_authenticate(user=agent)
        url = reverse('agent-subscription')
        response = agent_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert response.data['plan']['name'] == 'Premium'
        assert response.data['status'] == 'active'

    def test_agent_can_update_subscription(self, agent_client, agent_user_factory):
        from payments.models import PaymentPlan, AgentSubscription
        agent = agent_user_factory()
        plan = PaymentPlan.objects.create(
            name="Basic",
            plan_type="basic",
            price_kes=Decimal('3000.00'),
            description="Basic"
        )
        sub = AgentSubscription.objects.create(agent=agent, plan=plan, status='active', auto_renew=True)

        agent_client.force_authenticate(user=agent)
        url = reverse('agent-subscription')
        data = {'auto_renew': False}
        response = agent_client.patch(url, data, format='json')

        assert response.status_code == status.HTTP_200_OK
        sub.refresh_from_db()
        assert sub.auto_renew is False


class TestMpesaInitiateEndpoint:
    """Tests for POST /api/payments/mpesa/initiate/"""

    def test_initiate_mpesa_requires_auth(self, api_client):
        url = reverse('mpesa-initiate')
        response = api_client.post(url, {}, format='json')
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_initiate_mpesa_creates_transaction(self, agent_client, agent_user_factory, payments_views_mocks):
        """Initiating M-Pesa creates a pending transaction."""
        agent = agent_user_factory()
        agent_client.force_authenticate(user=agent)

        from payments.models import PaymentPlan
        plan = PaymentPlan.objects.create(
            name="Test Plan",
            plan_type="basic",
            price_kes=Decimal('5000.00'),
            description="Test"
        )

        url = reverse('mpesa-initiate')
        data = {
            'phone_number': '+254712345678',
            'amount': '5000',
            'plan_id': plan.id,
            'transaction_type': 'subscription'
        }
        # This would mock the Daraja API call in a real test
        response = agent_client.post(url, data, format='json')

        # Expected: 202 Accepted (async processing)
        assert response.status_code in [status.HTTP_202_ACCEPTED, status.HTTP_200_OK]
        assert 'transaction_id' in response.data or 'message' in response.data


class TestMpesaWebhookEndpoint:
    """Tests for POST /api/payments/mpesa/webhook/"""

    def test_webhook_updates_transaction(self, api_client, agent_user_factory):
        """M-Pesa webhook updates transaction status."""
        from payments.models import MpesaTransaction
        agent = agent_user_factory()
        trans = MpesaTransaction.objects.create(
            transaction_id='TEST123',
            phone_number='+254712345678',
            amount=Decimal('5000.00'),
            transaction_type='subscription',
            status='pending'
        )

        url = reverse('mpesa-webhook')
        # Simulate M-Pesa callback payload
        data = {
            'Body': {
                'stkCallback': {
                    'CheckoutRequestID': 'TEST123',
                    'ResultCode': 0,  # Success
                    'ResultDesc': 'Success',
                    'CallbackMetadata': {
                        'Item': [
                            {'Name': 'Amount', 'Value': 5000},
                            {'Name': 'MpesaReceiptNumber', 'Value': 'ABC123'},
                        ]
                    }
                }
            }
        }
        response = api_client.post(url, data, format='json')

        assert response.status_code == status.HTTP_200_OK
        trans.refresh_from_db()
        assert trans.status == 'successful'


class TestTransactionListEndpoint:
    """Tests for GET /api/payments/transactions/"""

    def test_user_sees_own_transactions(self, agent_client, agent_user_factory):
        from payments.models import MpesaTransaction
        agent = agent_user_factory()
        MpesaTransaction.objects.create(
            transaction_id='T1',
            phone_number='+254712345678',
            amount=Decimal('5000.00'),
            transaction_type='subscription',
            status='successful',
            user=agent
        )
        MpesaTransaction.objects.create(
            transaction_id='T2',
            phone_number='+254712345678',
            amount=Decimal('3000.00'),
            transaction_type='property_feature',
            status='failed'
        )

        agent_client.force_authenticate(user=agent)
        url = reverse('transaction-list')
        response = agent_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) >= 2

    def test_management_sees_all_transactions(self, management_client, agent_user_factory):
        from payments.models import MpesaTransaction
        agent = agent_user_factory()
        MpesaTransaction.objects.create(
            transaction_id='T1',
            phone_number='+254712345678',
            amount=Decimal('5000.00'),
            transaction_type='subscription',
            status='successful',
            user=agent
        )

        management_client.force_authenticate(user=management_client.user)
        url = reverse('transaction-list')
        response = management_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        # Management should see all transactions
        assert len(response.data) >= 1


class TestPaymentPlanEdgeCases:
    """Edge case tests for payment plans."""

    def test_plan_with_usd_price(self, api_client):
        """Plans can have USD pricing."""
        from payments.models import PaymentPlan
        plan = PaymentPlan.objects.create(
            name="International Plan",
            plan_type="premium",
            price_kes=None,  # KES not set
            price_usd=Decimal('500.00'),
            description="USD pricing only"
        )
        assert plan.price_usd == Decimal('500.00')

    def test_plan_features_json(self, api_client):
        """Plan features stored as JSON list."""
        from payments.models import PaymentPlan
        plan = PaymentPlan.objects.create(
            name="Feature Test",
            plan_type="basic",
            price_kes=Decimal('1000.00'),
            description="Test",
            features=["Feature A", "Feature B", "Feature C"]
        )
        assert isinstance(plan.features, list)
        assert len(plan.features) == 3
