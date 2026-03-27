"""
Pytest configuration and shared fixtures for Django project.
Following TDD principles: fixtures create test data factories.
"""
import pytest
from django.contrib.auth import get_user_model
from django.conf import settings
from rest_framework.test import APIClient
from properties.models import Location, Property, PropertyImage
from leads.models import (
    Lead,
    LeadActivity,
    LeadInteraction,
    LeadStatusLog,
    Task,
    Conversation,
    Message,
    WhatsAppMessage,
)
import uuid

User = get_user_model()


# ============================================================
# MODEL FACTORIES (Manual factories to avoid external deps)
# ============================================================

@pytest.fixture
def location_factory(db):
    """Factory for Location model."""
    def create_location(
        name="Test Location",
        county="Nairobi",
        latitude=-1.2637,
        longitude=36.8036,
        **kwargs
    ):
        return Location.objects.create(
            name=name,
            county=county,
            latitude=latitude,
            longitude=longitude,
            **kwargs
        )
    return create_location


@pytest.fixture
def agent_user_factory(db):
    """Factory for Agent users."""
    def create_agent(
        username=None,
        email=None,
        password="testpass123",
        **kwargs
    ):
        if username is None:
            username = f"agent_{uuid.uuid4().hex[:8]}"
        if email is None:
            email = f"{username}@test.com"
        return User.objects.create_user(
            username=username,
            email=email,
            password=password,
            user_type="agent",
            **kwargs
        )
    return create_agent


@pytest.fixture
def management_user_factory(db):
    """Factory for Management users."""
    def create_management(
        username=None,
        email=None,
        password="testpass123",
        **kwargs
    ):
        if username is None:
            username = f"admin_{uuid.uuid4().hex[:8]}"
        if email is None:
            email = f"{username}@test.com"
        return User.objects.create_user(
            username=username,
            email=email,
            password=password,
            user_type="management",
            is_staff=True,
            **kwargs
        )
    return create_management


@pytest.fixture
def client_user_factory(db):
    """Factory for Client users."""
    def create_client(
        username=None,
        email=None,
        password="testpass123",
        **kwargs
    ):
        if username is None:
            username = f"client_{uuid.uuid4().hex[:8]}"
        if email is None:
            email = f"{username}@test.com"
        return User.objects.create_user(
            username=username,
            email=email,
            password=password,
            user_type="client",
            **kwargs
        )
    return create_client


@pytest.fixture
def property_factory(db, agent_user_factory, location_factory):
    """Factory for Property model."""
    def create_property(
        title="Test Property",
        price=5000000,
        currency="KES",
        location=None,
        agent=None,
        is_verified=True,
        status="available",
        listing_type="sale",
        property_type="apartment",
        **kwargs
    ):
        if location is None:
            location = location_factory()
        if agent is None:
            agent = agent_user_factory()
        return Property.objects.create(
            title=title,
            price=price,
            currency=currency,
            location=location,
            agent=agent,
            is_verified=is_verified,
            status=status,
            listing_type=listing_type,
            property_type=property_type,
            **kwargs
        )
    return create_property


@pytest.fixture
def lead_factory(db, agent_user_factory, client_user_factory, property_factory):
    """Factory for Lead model."""
    def create_lead(
        first_name="John",
        last_name="Doe",
        email=None,
        phone="+254712345678",
        user=None,
        source="website",
        status="new",
        priority="low",
        score=0,
        property=None,
        agent=None,
        notes="",
        **kwargs
    ):
        if email is None:
            email = f"{first_name.lower()}.{last_name.lower()}@test.com"
        if user is None and first_name:
            # Optionally create a client user for the lead
            pass
        if property is None:
            property_obj = property_factory()
        else:
            property_obj = property
        if agent is None:
            agent = agent_user_factory()
        return Lead.objects.create(
            first_name=first_name,
            last_name=last_name,
            email=email,
            phone=phone,
            user=user,
            source=source,
            status=status,
            priority=priority,
            score=score,
            property=property_obj,
            agent=agent,
            notes=notes,
            **kwargs
        )
    return create_lead


@pytest.fixture
def task_factory(db, agent_user_factory, lead_factory):
    """Factory for Task model."""
    from datetime import datetime, timedelta
    def create_task(
        lead=None,
        agent=None,
        title="Test Task",
        description="",
        due_date=None,
        is_completed=False,
        priority="medium",
        **kwargs
    ):
        if lead is None:
            lead = lead_factory()
        if agent is None:
            agent = agent_user_factory()
        if due_date is None:
            due_date = datetime.now() + timedelta(days=1)
        return Task.objects.create(
            lead=lead,
            agent=agent,
            title=title,
            description=description,
            due_date=due_date,
            is_completed=is_completed,
            priority=priority,
            **kwargs
        )
    return create_task


@pytest.fixture
def conversation_factory(db, agent_user_factory, client_user_factory, lead_factory, property_factory):
    """Factory for Conversation model."""
    def create_conversation(
        lead=None,
        property_obj=None,
        client=None,
        agent=None,
        is_active=True,
        **kwargs
    ):
        if lead is None:
            lead = lead_factory()
        if client is None:
            client = client_user_factory()
        if agent is None:
            agent = agent_user_factory()
        if property_obj is None:
            property_obj = property_factory()
        return Conversation.objects.create(
            lead=lead,
            property=property_obj,
            client=client,
            agent=agent,
            is_active=is_active,
            **kwargs
        )
    return create_conversation


@pytest.fixture
def message_factory(db, conversation_factory, agent_user_factory):
    """Factory for Message model."""
    def create_message(
        conversation=None,
        sender=None,
        content="Test message",
        is_read=False,
        **kwargs
    ):
        if conversation is None:
            conversation = conversation_factory()
        if sender is None:
            sender = agent_user_factory()
        return Message.objects.create(
            conversation=conversation,
            sender=sender,
            content=content,
            is_read=is_read,
            **kwargs
        )
    return create_message


# ============================================================
# SHARED FIXTURES
# ============================================================

@pytest.fixture
def api_client():
    """Unauthenticated API client."""
    return APIClient()


@pytest.fixture
def agent_client(api_client, agent_user_factory):
    """Authenticated API client as agent."""
    user = agent_user_factory()
    api_client.force_authenticate(user=user)
    api_client.user = user
    return api_client


@pytest.fixture
def management_client(api_client, management_user_factory):
    """Authenticated API client as management."""
    user = management_user_factory()
    api_client.force_authenticate(user=user)
    api_client.user = user
    return api_client


@pytest.fixture
def client_client(api_client, client_user_factory):
    """Authenticated API client as client."""
    user = client_user_factory()
    api_client.force_authenticate(user=user)
    api_client.user = user
    return api_client


@pytest.fixture
def sample_location(location_factory):
    """A sample location for testing."""
    return location_factory(name="Westlands", county="Nairobi")


@pytest.fixture
def sample_agent(agent_user_factory):
    """A sample agent user."""
    return agent_user_factory()


@pytest.fixture
def sample_property(property_factory, sample_location, sample_agent):
    """A sample property for testing."""
    return property_factory(
        title="Sample Apartment",
        price=5000000,
        location=sample_location,
        agent=sample_agent
    )


@pytest.fixture
def sample_lead(lead_factory, sample_agent):
    """A sample lead for testing."""
    return lead_factory(
        first_name="John",
        last_name="Doe",
        email="john.doe@test.com",
        agent=sample_agent
    )
