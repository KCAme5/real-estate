"""
Test suite for Lead model and CRM functionality.
"""
from django.test import TestCase
from django.contrib.auth import get_user_model
from properties.models import Property, Location
from leads.models import (
    Lead,
    LeadStatusLog,
    LeadInteraction,
    LeadActivity,
    Task,
    WhatsAppMessage,
    Conversation,
    Message,
)
from datetime import datetime, timedelta


class LeadModelTest(TestCase):
    """Test the Lead model."""

    def setUp(self):
        self.user = get_user_model().objects.create_user(
            username="agent1",
            email="agent1@test.com",
            password="testpass123",
            user_type="agent"
        )
        self.location = Location.objects.create(name="Westlands", county="Nairobi")
        self.property = Property.objects.create(
            title="Test Property",
            price=5000000,
            location=self.location,
            agent=self.user
        )

    def test_create_lead_with_minimal_data(self):
        """Test creating a lead with only required fields."""
        lead = Lead.objects.create(
            first_name="John",
            last_name="Doe",
            email="john@example.com",
        )
        self.assertEqual(lead.first_name, "John")
        self.assertEqual(lead.last_name, "Doe")
        self.assertEqual(lead.email, "john@example.com")
        self.assertEqual(lead.status, "new")  # default
        self.assertEqual(lead.priority, "low")  # default
        self.assertEqual(lead.score, 0)  # default
        self.assertIsNone(lead.agent)
        self.assertIsNone(lead.property)
        self.assertEqual(lead.preferred_locations, [])
        self.assertEqual(lead.property_types, [])

    def test_create_lead_with_all_fields(self):
        """Test creating a lead with all optional fields."""
        lead = Lead.objects.create(
            first_name="Jane",
            last_name="Smith",
            email="jane@example.com",
            phone="+254712345678",
            user=self.user,
            source="website",
            status="contacted",
            priority="high",
            budget_min=2000000,
            budget_max=5000000,
            preferred_locations=["Westlands", "Kilimani"],
            property_types=["apartment", "maisonette"],
            property=self.property,
            agent=self.user,
            notes="Interested in 3-bed units"
        )
        self.assertEqual(lead.phone, "+254712345678")
        self.assertEqual(lead.user, self.user)
        self.assertEqual(lead.source, "website")
        self.assertEqual(lead.status, "contacted")
        self.assertEqual(lead.priority, "high")
        self.assertEqual(lead.budget_min, 2000000)
        self.assertEqual(lead.budget_max, 5000000)
        self.assertEqual(lead.preferred_locations, ["Westlands", "Kilimani"])
        self.assertEqual(lead.property_types, ["apartment", "maisonette"])
        self.assertEqual(lead.property, self.property)
        self.assertEqual(lead.agent, self.user)
        self.assertEqual(lead.notes, "Interested in 3-bed units")

    def test_str_representation_with_full_name(self):
        """Test __str__ with first and last name."""
        lead = Lead.objects.create(
            first_name="Alice",
            last_name="Johnson",
            email="alice@example.com"
        )
        self.assertEqual(str(lead), "Alice Johnson (score: 0)")

    def test_str_representation_without_last_name(self):
        """Test __str__ when only first name provided."""
        lead = Lead.objects.create(
            first_name="Bob",
            email="bob@example.com"
        )
        self.assertEqual(str(lead), "Bob  (score: 0)")  # Note: last_name empty

    def test_default_ordering(self):
        """Test that leads are ordered by -score, then -created_at."""
        Lead.objects.create(
            first_name="LowScore",
            email="low@example.com"
        )
        Lead.objects.create(
            first_name="HighScore",
            email="high@example.com",
            score=100
        )
        leads = Lead.objects.all()
        self.assertEqual(leads[0].first_name, "HighScore")
        self.assertEqual(leads[1].first_name, "LowScore")

    def test_update_score_counts_interactions(self):
        """Test that update_score correctly calculates from interactions."""
        lead = Lead.objects.create(
            first_name="Test",
            email="test@example.com"
        )
        # Add interactions
        LeadInteraction.objects.create(
            lead=lead,
            interaction_type="page_view",
            metadata={}
        )
        LeadInteraction.objects.create(
            lead=lead,
            interaction_type="property_click",
            property=self.property,
            metadata={}
        )
        lead.update_score()
        lead.refresh_from_db()
        # 2 interactions * 5 = 10
        self.assertEqual(lead.score, 10)

    def test_update_score_counts_whatsapp_messages(self):
        """Test that WhatsApp messages contribute to score."""
        from django.utils import timezone
        lead = Lead.objects.create(
            first_name="WhatsApp",
            email="wa@example.com"
        )
        WhatsAppMessage.objects.create(
            lead=lead,
            message_id="msg123",
            direction="inbound",
            message_text="Hello",
            timestamp=timezone.now()  # required field
        )
        lead.update_score()
        lead.refresh_from_db()
        # 1 WhatsApp message * 10 = 10
        self.assertEqual(lead.score, 10)

    def test_update_score_counts_property_viewing_activities(self):
        """Test that property viewing activities boost score."""
        lead = Lead.objects.create(
            first_name="Viewer",
            email="viewer@example.com"
        )
        agent2 = get_user_model().objects.create_user(
            username="agent2",
            email="agent2@test.com",
            user_type="agent"
        )
        LeadActivity.objects.create(
            lead=lead,
            activity_type="property_viewing",
            description="Viewed the property",
            agent=agent2
        )
        lead.update_score()
        lead.refresh_from_db()
        # 1 viewing * 15 = 15
        self.assertEqual(lead.score, 15)

    def test_update_score_status_bonus(self):
        """Test that status multipliers add to score."""
        lead = Lead.objects.create(
            first_name="Qualified",
            email="qual@example.com",
            status="qualified"
        )
        lead.update_score()
        lead.refresh_from_db()
        # qualified status bonus = 50
        self.assertEqual(lead.score, 50)

        lead.status = "proposal"
        lead.save()
        lead.update_score()
        lead.refresh_from_db()
        # proposal status bonus = 100
        self.assertEqual(lead.score, 100)

        lead.status = "negotiation"
        lead.save()
        lead.update_score()
        lead.refresh_from_db()
        # negotiation status bonus = 200
        self.assertEqual(lead.score, 200)

    def test_update_score_combined(self):
        """Test that score combines interactions, messages, activities, and status."""
        from django.utils import timezone
        lead = Lead.objects.create(
            first_name="Multi",
            email="multi@example.com",
            status="qualified"
        )
        # 2 interactions
        LeadInteraction.objects.create(lead=lead, interaction_type="page_view", metadata={})
        LeadInteraction.objects.create(lead=lead, interaction_type="search", metadata={})
        # 1 WhatsApp
        WhatsAppMessage.objects.create(
            lead=lead,
            message_id="msg1",
            direction="outbound",
            message_text="Follow up",
            timestamp=timezone.now()
        )
        # 1 viewing activity
        LeadActivity.objects.create(
            lead=lead,
            activity_type="property_viewing",
            description="Visit",
            agent=self.user
        )
        lead.update_score()
        lead.refresh_from_db()
        # 2*5 + 1*10 + 1*15 + 50 (qualified) = 10 + 10 + 15 + 50 = 85
        self.assertEqual(lead.score, 85)

    def test_mark_contacted_updates_last_contacted_and_status(self):
        """Test that mark_contacted sets last_contacted to now and status to 'contacted' if 'new'."""
        lead = Lead.objects.create(
            first_name="New",
            email="new@example.com",
            status="new"
        )
        lead.mark_contacted()
        lead.refresh_from_db()
        self.assertEqual(lead.status, "contacted")
        self.assertIsNotNone(lead.last_contacted)

    def test_mark_contacted_preserves_non_new_status(self):
        """Test that mark_contacted doesn't change status if not 'new'."""
        lead = Lead.objects.create(
            first_name="Qualified",
            email="qual2@example.com",
            status="qualified"
        )
        lead.mark_contacted()
        lead.refresh_from_db()
        self.assertEqual(lead.status, "qualified")  # not changed
        self.assertIsNotNone(lead.last_contacted)


class LeadStatusLogModelTest(TestCase):
    """Test the LeadStatusLog model."""

    def setUp(self):
        self.user = get_user_model().objects.create_user(
            username="agent1",
            email="agent1@test.com",
            user_type="agent"
        )
        self.lead = Lead.objects.create(
            first_name="Test",
            email="test@example.com"
        )

    def test_create_status_log(self):
        """Test creating a status change log entry."""
        log = LeadStatusLog.objects.create(
            lead=self.lead,
            from_status="",
            to_status="contacted",
            changed_by=self.user,
            note="First contact"
        )
        self.assertEqual(log.lead, self.lead)
        self.assertEqual(log.from_status, "")
        self.assertEqual(log.to_status, "contacted")
        self.assertEqual(log.changed_by, self.user)
        self.assertEqual(log.note, "First contact")

    def test_ordering_by_created_at_desc(self):
        """Test that status logs are ordered by -created_at."""
        import time
        log1 = LeadStatusLog.objects.create(
            lead=self.lead,
            from_status="new",
            to_status="contacted",
            changed_by=self.user
        )
        time.sleep(0.01)  # ensure different times
        log2 = LeadStatusLog.objects.create(
            lead=self.lead,
            from_status="contacted",
            to_status="qualified",
            changed_by=self.user
        )
        logs = LeadStatusLog.objects.all()
        self.assertEqual(logs[0], log2)
        self.assertEqual(logs[1], log1)


class LeadInteractionModelTest(TestCase):
    """Test the LeadInteraction model."""

    def setUp(self):
        self.user = get_user_model().objects.create_user(
            username="agent1",
            email="agent1@test.com",
            user_type="agent"
        )
        self.lead = Lead.objects.create(
            first_name="Test",
            email="test@example.com"
        )
        self.location = Location.objects.create(name="Kilimani", county="Nairobi")
        self.property = Property.objects.create(
            title="Test Prop",
            price=1000000,
            location=self.location,
            agent=self.user
        )

    def test_create_interaction(self):
        """Test creating an interaction."""
        interaction = LeadInteraction.objects.create(
            lead=self.lead,
            interaction_type="property_click",
            property=self.property,
            metadata={"duration": 30}
        )
        self.assertEqual(interaction.lead, self.lead)
        self.assertEqual(interaction.interaction_type, "property_click")
        self.assertEqual(interaction.property, self.property)
        self.assertEqual(interaction.metadata, {"duration": 30})

    def test_interaction_without_property(self):
        """Test interaction can have null property."""
        interaction = LeadInteraction.objects.create(
            lead=self.lead,
            interaction_type="search",
            metadata={"query": "3bed"}
        )
        self.assertIsNone(interaction.property)

    def test_metadata_default_dict(self):
        """Test that metadata defaults to empty dict."""
        interaction = LeadInteraction.objects.create(
            lead=self.lead,
            interaction_type="page_view"
        )
        self.assertEqual(interaction.metadata, {})


class LeadActivityModelTest(TestCase):
    """Test the LeadActivity model."""

    def setUp(self):
        self.user = get_user_model().objects.create_user(
            username="agent1",
            email="agent1@test.com",
            user_type="agent"
        )
        self.lead = Lead.objects.create(
            first_name="Test",
            email="test@example.com"
        )

    def test_create_activity(self):
        """Test creating an activity."""
        activity = LeadActivity.objects.create(
            lead=self.lead,
            activity_type="call",
            description="Called to discuss interest",
            agent=self.user,
            scheduled_date=datetime.now() + timedelta(days=1),
            completed_date=None
        )
        self.assertEqual(activity.lead, self.lead)
        self.assertEqual(activity.activity_type, "call")
        self.assertEqual(activity.agent, self.user)
        self.assertIsNotNone(activity.scheduled_date)
        self.assertIsNone(activity.completed_date)

    def test_activity_ordering(self):
        """Test activities ordered by -created_at."""
        activity1 = LeadActivity.objects.create(
            lead=self.lead,
            activity_type="email",
            description="First email",
            agent=self.user
        )
        activity2 = LeadActivity.objects.create(
            lead=self.lead,
            activity_type="call",
            description="First call",
            agent=self.user
        )
        activities = LeadActivity.objects.all()
        self.assertEqual(activities[0], activity2)
        self.assertEqual(activities[1], activity1)


class TaskModelTest(TestCase):
    """Test the Task model."""

    def setUp(self):
        self.user = get_user_model().objects.create_user(
            username="agent1",
            email="agent1@test.com",
            user_type="agent"
        )
        self.lead = Lead.objects.create(
            first_name="Test",
            email="test@example.com"
        )

    def test_create_task(self):
        """Test creating a task."""
        task = Task.objects.create(
            lead=self.lead,
            agent=self.user,
            title="Follow up on quotation",
            description="Call client about pricing",
            due_date=datetime.now() + timedelta(days=3),
            priority="high"
        )
        self.assertEqual(task.lead, self.lead)
        self.assertEqual(task.agent, self.user)
        self.assertEqual(task.title, "Follow up on quotation")
        self.assertEqual(task.priority, "high")
        self.assertFalse(task.is_completed)

    def test_mark_task_complete(self):
        """Test marking a task as complete."""
        task = Task.objects.create(
            lead=self.lead,
            agent=self.user,
            title="Complete paperwork",
            due_date=datetime.now() + timedelta(days=1)
        )
        task.is_completed = True
        task.save()
        task.refresh_from_db()
        self.assertTrue(task.is_completed)

    def test_task_ordering_by_due_date(self):
        """Test tasks ordered by due_date."""
        due1 = datetime.now() + timedelta(days=5)
        due2 = datetime.now() + timedelta(days=2)
        Task.objects.create(
            lead=self.lead,
            agent=self.user,
            title="Later task",
            due_date=due1
        )
        Task.objects.create(
            lead=self.lead,
            agent=self.user,
            title="Earlier task",
            due_date=due2
        )
        tasks = Task.objects.all()
        self.assertEqual(tasks[0].title, "Earlier task")
        self.assertEqual(tasks[1].title, "Later task")


class WhatsAppMessageModelTest(TestCase):
    """Test the WhatsAppMessage model."""

    def setUp(self):
        self.user = get_user_model().objects.create_user(
            username="agent1",
            email="agent1@test.com",
            user_type="agent"
        )
        self.lead = Lead.objects.create(
            first_name="Test",
            email="test@example.com"
        )

    def test_create_whatsapp_message_inbound(self):
        """Test creating an inbound WhatsApp message."""
        from django.utils import timezone
        msg = WhatsAppMessage.objects.create(
            lead=self.lead,
            message_id="abc123",
            direction="inbound",
            message_text="Hi, I'm interested in the property",
            timestamp=timezone.now()  # required field, must provide
        )
        self.assertEqual(msg.lead, self.lead)
        self.assertEqual(msg.message_id, "abc123")
        self.assertEqual(msg.direction, "inbound")
        self.assertEqual(msg.message_text, "Hi, I'm interested in the property")

    def test_create_whatsapp_message_outbound(self):
        """Test creating an outbound WhatsApp message."""
        from django.utils import timezone
        msg = WhatsAppMessage.objects.create(
            lead=self.lead,
            message_id="def456",
            direction="outbound",
            message_text="Thanks for reaching out! Let me send you details.",
            timestamp=timezone.now()  # required field
        )
        self.assertEqual(msg.direction, "outbound")


class ConversationModelTest(TestCase):
    """Test the Conversation model."""

    def setUp(self):
        self.user = get_user_model().objects.create_user(
            username="agent1",
            email="agent1@test.com",
            user_type="agent"
        )
        self.agent2 = get_user_model().objects.create_user(
            username="agent2",
            email="agent2@test.com",
            user_type="agent"
        )
        # Create a client user for the lead (required for conversation.client)
        self.client_user = get_user_model().objects.create_user(
            username="client1",
            email="client1@test.com",
            user_type="client"
        )
        self.lead = Lead.objects.create(
            first_name="Test",
            email="test@example.com",
            user=self.client_user  # Link lead to a user (the client)
        )
        self.location = Location.objects.create(name="Kilimani", county="Nairobi")
        self.property = Property.objects.create(
            title="Test Prop",
            price=1000000,
            location=self.location,
            agent=self.user
        )

    def test_create_conversation_with_property(self):
        """Test creating a conversation linked to a property."""
        conv = Conversation.objects.create(
            lead=self.lead,
            property=self.property,
            client=self.client_user,  # client user is required
            agent=self.agent2
        )
        self.assertEqual(conv.lead, self.lead)
        self.assertEqual(conv.property, self.property)
        self.assertEqual(conv.agent, self.agent2)
        self.assertTrue(conv.is_active)

    def test_create_conversation_without_property(self):
        """Test creating a general conversation (no property)."""
        conv = Conversation.objects.create(
            lead=self.lead,
            property=None,
            client=self.client_user,  # client user is required
            agent=self.agent2
        )
        self.assertIsNone(conv.property)
        self.assertTrue(conv.is_active)

    def test_unique_conversation_constraint_per_client_property(self):
        """Test that UniqueConstraint allows multiple convos per client for different properties but not same property."""
        conv1 = Conversation.objects.create(
            lead=self.lead,
            property=self.property,
            client=self.client_user,
            agent=self.agent2
        )
        # Same client+property should fail
        with self.assertRaises(Exception):
            Conversation.objects.create(
                lead=self.lead,
                property=self.property,
                client=self.client_user,
                agent=self.agent2
            )
        # Different property should be fine
        prop2 = Property.objects.create(
            title="Prop 2",
            price=2000000,
            location=self.location,
            agent=self.user
        )
        conv2 = Conversation.objects.create(
            lead=self.lead,
            property=prop2,
            client=self.client_user,
            agent=self.agent2
        )
        self.assertIsNotNone(conv2)


class MessageModelTest(TestCase):
    """Test the Message model."""

    def setUp(self):
        self.user = get_user_model().objects.create_user(
            username="agent1",
            email="agent1@test.com",
            user_type="agent"
        )
        # Create client user for lead
        self.client_user = get_user_model().objects.create_user(
            username="client1",
            email="client1@test.com",
            user_type="client"
        )
        self.lead = Lead.objects.create(
            first_name="Test",
            email="test@example.com",
            user=self.client_user
        )
        self.location = Location.objects.create(name="Kilimani", county="Nairobi")
        self.property = Property.objects.create(
            title="Test Prop",
            price=1000000,
            location=self.location,
            agent=self.user
        )
        self.conversation = Conversation.objects.create(
            lead=self.lead,
            property=self.property,
            client=self.client_user,  # client is required
            agent=self.user
        )

    def test_create_message(self):
        """Test creating a message."""
        msg = Message.objects.create(
            conversation=self.conversation,
            sender=self.user,
            content="Hello, how can I help?"
        )
        self.assertEqual(msg.conversation, self.conversation)
        self.assertEqual(msg.sender, self.user)
        self.assertEqual(msg.content, "Hello, how can I help?")
        self.assertFalse(msg.is_read)

    def test_mark_message_read(self):
        """Test marking a message as read."""
        msg = Message.objects.create(
            conversation=self.conversation,
            sender=self.user,
            content="Read me"
        )
        msg.is_read = True
        msg.save()
        msg.refresh_from_db()
        self.assertTrue(msg.is_read)

    def test_message_ordering_by_created_at(self):
        """Test messages ordered by created_at."""
        msg1 = Message.objects.create(
            conversation=self.conversation,
            sender=self.user,
            content="First"
        )
        msg2 = Message.objects.create(
            conversation=self.conversation,
            sender=self.user,
            content="Second"
        )
        messages = Message.objects.all()
        self.assertEqual(messages[0].content, "Second")
        self.assertEqual(messages[1].content, "First")


class LeadScoringEdgeCasesTest(TestCase):
    """Test edge cases in lead scoring."""

    def setUp(self):
        self.user = get_user_model().objects.create_user(
            username="agent1",
            email="agent1@test.com",
            user_type="agent"
        )
        self.lead = Lead.objects.create(
            first_name="Edge",
            email="edge@example.com"
        )

    def test_score_zero_for_new_lead(self):
        """Test that a new lead with no activity has score 0."""
        self.assertEqual(self.lead.score, 0)

    def test_status_bonus_only_one_applied(self):
        """Test only one status bonus is applied."""
        # Lead has qualified (50) then moves to proposal (100) should be 100, not 50+100
        self.lead.status = "qualified"
        self.lead.save()
        self.lead.update_score()
        self.lead.refresh_from_db()
        self.assertEqual(self.lead.score, 50)

        # Status change to proposal should replace, not add
        self.lead.status = "proposal"
        self.lead.save()
        self.lead.update_score()
        self.lead.refresh_from_db()
        self.assertEqual(self.lead.score, 100)

    def test_update_score_with_no_related_objects(self):
        """Test update_score works when no related objects exist."""
        self.lead.update_score()
        self.lead.refresh_from_db()
        self.assertEqual(self.lead.score, 0)
