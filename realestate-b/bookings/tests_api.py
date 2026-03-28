"""
API Integration Tests for Bookings endpoints.
"""
import pytest
from django.urls import reverse
from rest_framework import status
from datetime import timedelta
from django.utils import timezone

pytestmark = [pytest.mark.api, pytest.mark.integration]


class TestBookingListEndpoint:
    """Tests for GET /api/bookings/"""

    def test_client_sees_own_bookings(
        self,
        client_client,
        client_user_factory,
        lead_factory,
        property_factory,
        agent_user_factory,
    ):
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
            date=timezone.now() + timedelta(days=1),
            duration=30,
            status="pending",
        )
        booking2 = Booking.objects.create(
            lead=lead2,
            agent=agent,
            property=property_factory(agent=agent),
            client=client2,
            date=timezone.now() + timedelta(days=2),
            duration=30,
            status="pending",
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
            date=timezone.now() + timedelta(days=1),
            duration=30,
            status="pending",
        )
        booking2 = Booking.objects.create(
            lead=lead2, agent=agent, property=prop2, client=client2,
            date=timezone.now() + timedelta(days=2),
            duration=30,
            status="pending",
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
            'date': (timezone.now() + timedelta(days=1)).isoformat(),
            'duration': 30,
            'client_notes': 'Looking forward to viewing',
        }
        response = client_client.post(url, data, format='json')

        assert response.status_code == status.HTTP_201_CREATED

        # TDD contract: response should include assigned agent/client.
        # (Currently the API may only return the create serializer fields.)
        assert response.data.get('client') == client.id
        assert response.data.get('agent') == agent.id

    def test_create_booking_agent_auto_assigned_from_lead(self, client_client, client_user_factory, lead_factory, property_factory, agent_user_factory):
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
            'date': (timezone.now() + timedelta(days=1)).isoformat(),
            'duration': 30,
        }
        response = client_client.post(url, data, format='json')

        assert response.status_code == status.HTTP_201_CREATED
        assert response.data.get('agent') == agent.id  # Lead's agent, not property's

    def test_create_booking_agent_auto_assigned_from_property(self, client_client, client_user_factory, lead_factory, property_factory, agent_user_factory):
        """If lead has no agent, booking agent from property is used."""
        client = client_user_factory()
        agent = agent_user_factory()
        lead = lead_factory(user=client, agent=agent)
        lead.agent = None
        lead.save(update_fields=["agent"])
        prop = property_factory(agent=agent)

        client_client.force_authenticate(user=client)
        url = reverse('booking-list')
        data = {
            'lead': lead.id,
            'property': prop.id,
            'date': (timezone.now() + timedelta(days=1)).isoformat(),
            'duration': 30,
        }
        response = client_client.post(url, data, format='json')

        assert response.status_code == status.HTTP_201_CREATED
        assert response.data.get('agent') == agent.id

    def test_agent_cannot_create_booking(self, agent_client, agent_user_factory):
        """Agents cannot create bookings (clients only)."""
        agent = agent_user_factory()
        agent_client.force_authenticate(user=agent)

        url = reverse('booking-list')
        data = {}
        response = agent_client.post(url, data, format='json')

        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_create_booking_creates_lead_if_missing(self, client_client, client_user_factory, property_factory, agent_user_factory):
        """Booking from property detail should create a lead automatically."""
        client = client_user_factory()
        agent = agent_user_factory()
        prop = property_factory(agent=agent)

        client_client.force_authenticate(user=client)
        url = reverse("booking-list")
        date = (timezone.now() + timedelta(days=1)).replace(hour=10, minute=0, second=0, microsecond=0)
        data = {
            "property": prop.id,
            "date": date.isoformat(),
            "duration": 30,
            "client_notes": "I want to view this property",
        }
        response = client_client.post(url, data, format="json")

        assert response.status_code == status.HTTP_201_CREATED

        from bookings.models import Booking
        booking = Booking.objects.get(id=response.data["id"])
        assert booking.lead is not None
        assert booking.lead.user == client
        assert booking.lead.property == prop
        assert booking.lead.source == "book_viewing"

    def test_client_cannot_create_booking_when_agent_slot_conflicts(
        self, client_client, client_user_factory, agent_user_factory, lead_factory, property_factory
    ):
        """Agent availability: prevent overlapping bookings for same agent."""
        client = client_user_factory()
        other_client = client_user_factory()
        agent = agent_user_factory()

        prop = property_factory(agent=agent)

        lead_for_existing = lead_factory(user=other_client, agent=agent, property=prop)
        lead_for_new = lead_factory(user=client, agent=agent, property=prop)

        from bookings.models import Booking
        start = (timezone.now() + timedelta(days=1)).replace(hour=10, minute=0, second=0, microsecond=0)
        Booking.objects.create(
            property=prop,
            client=other_client,
            agent=agent,
            lead=lead_for_existing,
            date=start,
            duration=60,
            status="confirmed",
        )

        client_client.force_authenticate(user=client)
        url = reverse("booking-list")
        data = {
            "lead": lead_for_new.id,
            "property": prop.id,
            "date": (start + timedelta(minutes=30)).isoformat(),
            "duration": 30,
        }
        response = client_client.post(url, data, format="json")

        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_client_can_create_booking_when_non_overlapping(
        self, client_client, client_user_factory, agent_user_factory, lead_factory, property_factory
    ):
        """Non-overlapping time slots should be allowed."""
        client = client_user_factory()
        other_client = client_user_factory()
        agent = agent_user_factory()

        prop = property_factory(agent=agent)

        lead_for_existing = lead_factory(user=other_client, agent=agent, property=prop)
        lead_for_new = lead_factory(user=client, agent=agent, property=prop)

        from bookings.models import Booking
        start = (timezone.now() + timedelta(days=1)).replace(hour=10, minute=0, second=0, microsecond=0)
        Booking.objects.create(
            property=prop,
            client=other_client,
            agent=agent,
            lead=lead_for_existing,
            date=start,
            duration=60,
            status="confirmed",
        )

        client_client.force_authenticate(user=client)
        url = reverse("booking-list")
        data = {
            "lead": lead_for_new.id,
            "property": prop.id,
            "date": (start + timedelta(minutes=60)).isoformat(),
            "duration": 30,
        }
        response = client_client.post(url, data, format="json")

        assert response.status_code == status.HTTP_201_CREATED


class TestBookingDetailEndpoint:
    """Tests for GET/PATCH /api/bookings/{id}/"""

    def test_get_booking_detail(self, agent_client, lead_factory, property_factory, agent_user_factory, client_user_factory):
        """Retrieve booking details."""
        agent = agent_user_factory()
        client = client_user_factory()
        lead = lead_factory(agent=agent, user=client)
        prop = property_factory(agent=agent)

        from bookings.models import Booking
        booking = Booking.objects.create(
            lead=lead, agent=agent, property=prop, client=client,
            date=timezone.now() + timedelta(days=1),
            duration=30,
            status="pending",
        )

        agent_client.force_authenticate(user=agent)
        url = reverse('booking-detail', kwargs={'pk': booking.pk})
        response = agent_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert response.data['id'] == booking.id

    def test_update_booking_status(self, agent_client, lead_factory, property_factory, agent_user_factory, client_user_factory):
        """Agents can update booking status."""
        agent = agent_user_factory()
        client = client_user_factory()
        lead = lead_factory(agent=agent, user=client)
        prop = property_factory(agent=agent)

        from bookings.models import Booking
        booking = Booking.objects.create(
            lead=lead, agent=agent, property=prop, client=client,
            date=timezone.now() + timedelta(days=1),
            duration=30,
            status="pending",
        )

        agent_client.force_authenticate(user=agent)
        url = reverse('booking-detail', kwargs={'pk': booking.pk})
        data = {'status': 'confirmed'}
        response = agent_client.patch(url, data, format='json')

        assert response.status_code == status.HTTP_200_OK
        assert response.data['status'] == 'confirmed'
        booking.refresh_from_db()
        assert booking.status == 'confirmed'
