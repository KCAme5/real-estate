"""
API Integration Tests for Notifications endpoints.
"""
import pytest
from django.urls import reverse
from rest_framework import status

pytestmark = [pytest.mark.api, pytest.mark.integration]


class TestNotificationListEndpoint:
    """Tests for GET /api/notifications/"""

    def test_user_sees_own_notifications(self, agent_client, agent_user_factory):
        """Users see only their own notifications."""
        agent1 = agent_user_factory()
        agent2 = agent_user_factory()

        from notifications.models import Notification
        notif1 = Notification.objects.create(
            user=agent1,
            title='New Lead',
            message='You have a new lead',
            notification_type='LEAD'
        )
        notif2 = Notification.objects.create(
            user=agent2,
            title='Booking Confirmed',
            message='Your booking is confirmed',
            notification_type='BOOKING'
        )

        agent_client.force_authenticate(user=agent1)
        url = reverse('notification-list')
        response = agent_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        ids = [n['id'] for n in response.data] if isinstance(response.data, list) else [n['id'] for n in response.data.get('results', [])]
        assert notif1.id in ids
        assert notif2.id not in ids

    def test_requires_authentication(self, api_client):
        """Notifications require login."""
        url = reverse('notification-list')
        response = api_client.get(url)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED


class TestMarkNotificationReadEndpoint:
    """Tests for POST /api/notifications/{id}/read/"""

    def test_mark_notification_as_read(self, agent_client, agent_user_factory):
        """Mark single notification as read."""
        agent = agent_user_factory()
        from notifications.models import Notification
        notif = Notification.objects.create(
            user=agent,
            title='Test',
            message='Test message',
            notification_type='SYSTEM',
            is_read=False
        )

        agent_client.force_authenticate(user=agent)
        url = reverse('notification-read', kwargs={'pk': notif.pk})
        response = agent_client.post(url)

        assert response.status_code == status.HTTP_200_OK
        notif.refresh_from_db()
        assert notif.is_read is True

    def test_cannot_mark_others_notification_as_read(self, agent_client, agent_user_factory):
        """Users cannot mark others' notifications as read."""
        agent1 = agent_user_factory()
        agent2 = agent_user_factory()

        from notifications.models import Notification
        notif = Notification.objects.create(
            user=agent2,
            title='Test',
            message='Test',
            notification_type='SYSTEM',
            is_read=False
        )

        agent_client.force_authenticate(user=agent1)
        url = reverse('notification-read', kwargs={'pk': notif.pk})
        response = agent_client.post(url)

        assert response.status_code == status.HTTP_404_NOT_FOUND  # or 403 depending on queryset


class TestMarkAllNotificationsReadEndpoint:
    """Tests for POST /api/notifications/mark-all-read/"""

    def test_mark_all_as_read(self, agent_client, agent_user_factory):
        """Mark all user's notifications as read."""
        agent = agent_user_factory()
        from notifications.models import Notification
        Notification.objects.create(
            user=agent, title='N1', message='M1', notification_type='SYSTEM', is_read=False
        )
        Notification.objects.create(
            user=agent, title='N2', message='M2', notification_type='LEAD', is_read=False
        )
        Notification.objects.create(
            user=agent, title='N3', message='M3', notification_type='BOOKING', is_read=True  # Already read
        )

        agent_client.force_authenticate(user=agent)
        url = reverse('mark-all-read')
        response = agent_client.post(url)

        assert response.status_code == status.HTTP_200_OK
        # Verify all are now read
        unread_count = Notification.objects.filter(user=agent, is_read=False).count()
        assert unread_count == 0
