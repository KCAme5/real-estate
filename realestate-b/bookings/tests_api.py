"""
API Integration Tests for Bookings endpoints.
"""
import pytest
from django.urls import reverse
from rest_framework import status
from datetime import datetime, timedelta
from django.utils import timezone

pytestmark = [pytest.mark.api, pytest.mark.integration]


class TestBookingListEndpoint:
    """Tests for GET /api/bookings/"""

    def test_client_sees_own_bookings(self, client_client, client_user_factory, lead_factory, property_factory):
        """Clients see only their own bookings."""
        client1 = client_user_factory()
        client2 = client_user_factory()
        agent = agent_user_factory()

        lead1 = lead_factory(user=client1, agent=agent)
        lead2 = lead_factory(user=client2, agent=agent)

        # Create bookings
        from bookings.models import Booking
        booking1 = Booking.objects.create(
            lead=lead1,
            agent=agent,
            property=property_factory(agent=agent),
            client=client1,
            booking_date=timezone.now().date(),
            booking_time='10:00:00',
            status='PENDING'
        )
        booking2 = Booking.objects.create(
            lead=lead2,
            agent=agent,
            property=property_factory(agent=agent),
            client=client2,
            booking_date=timezone.now().date(),
            booking_time='14:00:00',
            status='PENDING'
        )

        client_client.force_authenticate(user=client1)
        url = reverse('booking-list')
        response = client_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        ids = [b['id'] for b in response.data] if isinstance(response.data, list) else [b['id'] for b in response.data.get('results', [])]
        assert booking1.id in ids
        assert booking2.id not in ids

    def test_agent_sees_assigned_bookings(self, agent_client, agent_user_factory, client_user_factory, lead_factory, property_factory):
        """Agents see bookings where they are assigned."""
        agent = agent_user_factory()
        client1 = client_user_factory()
        client2 = client_user_factory()

        lead1 = lead_factory(user=client1, agent=agent)
        lead2 = lead_factory(user=client2, agent=agent)
        prop1 = property_factory(agent=agent)
        prop2 = property_factory(agent=agent)

        from bookings.models import Booking
        booking1 = Booking.objects.create(
            lead=lead1, agent=agent, property=prop1, client=client1,
            booking_date=timezone.now().date(), booking_time='10:00:00'
        )
        booking2 = Booking.objects.create(
            lead=lead2, agent=agent, property=prop2, client=client2,
            booking_date=timezone.now().date(), booking_time='14:00:00'
        )

        agent_client.force_authenticate(user=agent)
        url = reverse('booking-list')
        response = agent_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        ids = [b['id'] for b in response.data] if isinstance(response.data, list) else [b['id'] for b in response.data.get('results', [])]
        assert booking1.id in ids
        assert booking2.id in ids


class TestBookingCreateEndpoint:
    """Tests for POST /api/bookings/"""

    def test_client_can_create_booking(self, client_client, client_user_factory, lead_factory, property_factory, agent_user_factory):
        """Clients can create bookings."""
        client = client_user_factory()
        agent = agent_user_factory()
        lead = lead_factory(user=client, agent=agent)
        prop = property_factory(agent=agent)

        client_client.force_authenticate(user=client)
        url = reverse('booking-list')
        data = {
            'lead': lead.id,
            'property': prop.id,
            'booking_date': timezone.now().date().isoformat(),
            'booking_time': '10:00:00',
            'notes': 'Looking forward to viewing'
        }
        response = client_client.post(url, data, format='json')

        assert response.status_code == status.HTTP_201_CREATED
        assert response.data['status'] == 'PENDING'
        assert response.data['client'] == client.id
        assert response.data['agent'] == agent.id

    def test_create_booking_agent_auto_assigned_from_lead(self, client_client, client_user_factory, lead_factory, property_factory):
        """If lead has agent, booking agent is auto-assigned."""
        client = client_user_factory()
        agent = agent_user_factory()
        lead = lead_factory(user=client, agent=agent)
        prop = property_factory()  # Different agent

        client_client.force_authenticate(user=client)
        url = reverse('booking-list')
        data = {
            'lead': lead.id,
            'property': prop.id,
            'booking_date': timezone.now().date().isoformat(),
            'booking_time': '10:00:00'
        }
        response = client_client.post(url, data, format='json')

        assert response.status_code == status.HTTP_201_CREATED
        assert response.data['agent'] == agent.id  # Lead's agent, not property's

    def test_create_booking_agent_auto_assigned_from_property(self, client_client, client_user_factory, lead_factory, property_factory):
        """If lead has no agent, booking agent from property is used."""
        client = client_user_factory()
        agent = agent_user_factory()
        lead = lead_factory(user=client, agent=None)  # No agent
        prop = property_factory(agent=agent)

        client_client.force_authenticate(user=client)
        url = reverse('booking-list')
        data = {
            'lead': lead.id,
            'property': prop.id,
            'booking_date': timezone.now().date().isoformat(),
            'booking_time': '10:00:00'
        }
        response = client_client.post(url, data, format='json')

        assert response.status_code == status.HTTP_201_CREATED
        assert response.data['agent'] == agent.id

    def test_agent_cannot_create_booking(self, agent_client):
        """Agents cannot create bookings (clients only)."""
        agent = agent_user_factory()
        agent_client.force_authenticate(user=agent)

        url = reverse('booking-list')
        data = {}
        response = agent_client.post(url, data, format='json')

        assert response.status_code == status.HTTP_403_FORBIDDEN


class TestBookingDetailEndpoint:
    """Tests for GET/PATCH /api/bookings/{id}/"""

    def test_get_booking_detail(self, agent_client, lead_factory, property_factory, agent_user_factory):
        """Retrieve booking details."""
        agent = agent_user_factory()
        lead = lead_factory(agent=agent)
        prop = property_factory(agent=agent)

        from bookings.models import Booking
        booking = Booking.objects.create(
            lead=lead, agent=agent, property=prop, client=lead.user,
            booking_date=timezone.now().date(), booking_time='10:00:00'
        )

        agent_client.force_authenticate(user=agent)
        url = reverse('booking-detail', kwargs={'pk': booking.pk})
        response = agent_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert response.data['id'] == booking.id

    def test_update_booking_status(self, agent_client, lead_factory, property_factory, agent_user_factory):
        """Agents can update booking status."""
        agent = agent_user_factory()
        lead = lead_factory(agent=agent)
        prop = property_factory(agent=agent)

        from bookings.models import Booking
        booking = Booking.objects.create(
            lead=lead, agent=agent, property=prop, client=lead.user,
            booking_date=timezone.now().date(), booking_time='10:00:00',
            status='PENDING'
        )

        agent_client.force_authenticate(user=agent)
        url = reverse('booking-detail', kwargs={'pk': booking.pk})
        data = {'status': 'CONFIRMED'}
        response = agent_client.patch(url, data, format='json')

        assert response.status_code == status.HTTP_200_OK
        assert response.data['status'] == 'CONFIRMED'
        booking.refresh_from_db()
        assert booking.status == 'CONFIRMED'
