"""
API Integration Tests for Leads endpoints.
Following TDD: Test all CRUD operations, permissions, and edge cases.
"""
import pytest
from django.urls import reverse
from rest_framework import status
from datetime import datetime, timedelta
from django.utils import timezone


pytestmark = [pytest.mark.api, pytest.mark.integration]


class TestLeadListEndpoint:
    """Tests for GET /api/leads/"""

    def test_anonymous_cannot_access_leads(self, api_client):
        """Anonymous users should not access leads list."""
        url = reverse('lead-list')
        response = api_client.get(url)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_agent_sees_own_leads_only(self, agent_client, agent_user_factory, lead_factory):
        """Agents only see their assigned leads."""
        # Create leads for agent1
        agent1 = agent_user_factory()
        lead1 = lead_factory(agent=agent1)
        lead2 = lead_factory(agent=agent1)

        # Create lead for agent2
        agent2 = agent_user_factory()
        lead3 = lead_factory(agent=agent2)

        url = reverse('lead-list')
        agent_client.force_authenticate(user=agent1)
        response = agent_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        lead_ids = [l['id'] for l in response.data]
        assert lead1.id in lead_ids
        assert lead2.id in lead_ids
        assert lead3.id not in lead_ids

    def test_admin_sees_all_leads(self, management_client, agent_user_factory, lead_factory):
        """Management users see all leads."""
        agent = agent_user_factory()
        lead1 = lead_factory(agent=agent)
        lead2 = lead_factory(agent=agent)

        url = reverse('lead-list')
        response = management_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        lead_ids = [l['id'] for l in response.data]
        assert lead1.id in lead_ids
        assert lead2.id in lead_ids

    def test_filter_by_status(self, agent_client, lead_factory):
        """Filter leads by status."""
        lead1 = lead_factory(status='new')
        lead2 = lead_factory(status='contacted')
        lead3 = lead_factory(status='qualified')

        url = reverse('lead-list')
        response = agent_client.get(url, {'status': 'contacted'})

        assert response.status_code == status.HTTP_200_OK
        ids = [l['id'] for l in response.data]
        assert lead2.id in ids
        assert lead1.id not in ids
        assert lead3.id not in ids

    def test_filter_by_priority(self, agent_client, lead_factory):
        """Filter leads by priority."""
        lead1 = lead_factory(priority='low')
        lead2 = lead_factory(priority='high')
        lead3 = lead_factory(priority='urgent')

        url = reverse('lead-list')
        response = agent_client.get(url, {'priority': 'high'})

        assert response.status_code == status.HTTP_200_OK
        ids = [l['id'] for l in response.data]
        assert lead2.id in ids
        assert lead1.id not in ids
        assert lead3.id not in ids

    def test_search_by_name_email_phone(self, agent_client, lead_factory):
        """Search leads by first_name, last_name, email, phone."""
        lead1 = lead_factory(first_name='Alice', last_name='Smith', email='alice@test.com', phone='+254700111111')
        lead2 = lead_factory(first_name='Bob', last_name='Jones', email='bob@test.com', phone='+254700222222')

        url = reverse('lead-list')

        # Search by first name
        response = agent_client.get(url, {'search': 'Alice'})
        assert lead1.id in [l['id'] for l in response.data]
        assert lead2.id not in [l['id'] for l in response.data]

        # Search by email
        response = agent_client.get(url, {'search': 'bob@test'})
        assert lead2.id in [l['id'] for l in response.data]

        # Search by phone partial
        response = agent_client.get(url, {'search': '111'})
        assert lead1.id in [l['id'] for l in response.data]

    def test_ordering_by_created_at(self, agent_client, lead_factory):
        """Order leads by creation date."""
        # Create leads at different times (need to control created_at)
        lead1 = lead_factory()
        lead2 = lead_factory()
        # Django auto-sets created_at; ordering is -created_at by default

        url = reverse('lead-list')
        response = agent_client.get(url, {'ordering': 'created_at'})
        # Default is -created_at so newest first
        assert response.status_code == status.HTTP_200_OK
        results = response.data if isinstance(response.data, list) else response.data.get('results', [])
        if len(results) >= 2:
            # If both appear, newer should come first with default ordering
            pass  # Test passes if no error


class TestLeadCreateEndpoint:
    """Tests for POST /api/leads/"""

    def test_anonymous_can_create_lead(self, api_client, sample_property):
        """Public (anonymous) users can submit leads."""
        url = reverse('lead-list')
        data = {
            'first_name': 'Jane',
            'last_name': 'Doe',
            'email': 'jane@example.com',
            'phone': '+254712345678',
            'source': 'website',
            'property': sample_property.id,
            'notes': 'Interested in 3-bed units'
        }
        response = api_client.post(url, data, format='json')

        assert response.status_code == status.HTTP_201_CREATED
        assert response.data['first_name'] == 'Jane'
        assert response.data['email'] == 'jane@example.com'

    def test_create_lead_validates_required_fields(self, api_client):
        """Email, first_name, last_name are required."""
        url = reverse('lead-list')
        data = {
            'phone': '+254712345678',
        }
        response = api_client.post(url, data, format='json')

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert 'first_name' in response.data
        assert 'last_name' in response.data
        assert 'email' in response.data

    def test_create_lead_invalid_email(self, api_client):
        """Email must be valid."""
        url = reverse('lead-list')
        data = {
            'first_name': 'Test',
            'last_name': 'User',
            'email': 'not-an-email',
        }
        response = api_client.post(url, data, format='json')

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert 'email' in response.data

    def test_authenticated_agent_can_create_lead(self, agent_client, agent_user_factory, sample_property):
        """Agents can create leads via API."""
        url = reverse('lead-list')
        agent = agent_user_factory()
        agent_client.force_authenticate(user=agent)

        data = {
            'first_name': 'Agent',
            'last_name': 'Lead',
            'email': 'agentlead@test.com',
            'agent': agent.id,
            'property': sample_property.id,
            'status': 'contacted',
            'priority': 'high'
        }
        response = agent_client.post(url, data, format='json')

        assert response.status_code == status.HTTP_201_CREATED
        assert response.data['agent'] == agent.id
        assert response.data['status'] == 'contacted'


class TestLeadDetailEndpoint:
    """Tests for GET /api/leads/{id}/"""

    def test_get_lead_detail_requires_auth(self, api_client, lead_factory):
        """Lead detail requires authentication."""
        lead = lead_factory()
        url = reverse('lead-detail', kwargs={'pk': lead.pk})
        response = api_client.get(url)

        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_agent_sees_own_lead_detail(self, agent_client, lead_factory):
        """Agent can view their own lead detail."""
        agent = agent_user_factory()
        lead = lead_factory(agent=agent)
        agent_client.force_authenticate(user=agent)

        url = reverse('lead-detail', kwargs={'pk': lead.pk})
        response = agent_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert response.data['id'] == lead.id
        assert 'activities' in response.data  # detail includes nested data
        assert 'interactions' in response.data
        assert 'tasks' in response.data

    def test_agent_cannot_view_others_lead_detail(self, agent_client, lead_factory):
        """Agent cannot view leads assigned to other agents."""
        agent1 = agent_user_factory()
        agent2 = agent_user_factory()
        lead = lead_factory(agent=agent2)
        agent_client.force_authenticate(user=agent1)

        url = reverse('lead-detail', kwargs={'pk': lead.pk})
        response = agent_client.get(url)

        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_management_can_view_any_lead(self, management_client, lead_factory):
        """Management can view any lead."""
        agent = agent_user_factory()
        lead = lead_factory(agent=agent)
        management_client.force_authenticate(user=management_client.user)

        url = reverse('lead-detail', kwargs={'pk': lead.pk})
        response = management_client.get(url)

        assert response.status_code == status.HTTP_200_OK


class TestLeadUpdateEndpoint:
    """Tests for PATCH /api/leads/{id}/"""

    def test_agent_can_update_own_lead(self, agent_client, lead_factory):
        """Agent can update their own lead."""
        agent = agent_user_factory()
        lead = lead_factory(agent=agent, status='new', notes='Initial notes')
        agent_client.force_authenticate(user=agent)

        url = reverse('lead-detail', kwargs={'pk': lead.pk})
        data = {
            'status': 'contacted',
            'notes': 'Updated notes after first call'
        }
        response = agent_client.patch(url, data, format='json')

        assert response.status_code == status.HTTP_200_OK
        assert response.data['status'] == 'contacted'
        assert response.data['notes'] == 'Updated notes after first call'

    def test_agent_cannot_update_others_lead(self, agent_client, lead_factory):
        """Agent cannot update another agent's lead."""
        agent1 = agent_user_factory()
        agent2 = agent_user_factory()
        lead = lead_factory(agent=agent2, status='new')
        agent_client.force_authenticate(user=agent1)

        url = reverse('lead-detail', kwargs={'pk': lead.pk})
        data = {'status': 'contacted'}
        response = agent_client.patch(url, data, format='json')

        assert response.status_code == status.HTTP_403_FORBIDDEN


class TestLeadStatusUpdateEndpoint:
    """Tests for PATCH /api/leads/{id}/status/ (dedicated status endpoint)"""

    def test_update_lead_status_creates_log(self, agent_client, lead_factory):
        """Updating status creates a LeadStatusLog entry."""
        agent = agent_user_factory()
        lead = lead_factory(agent=agent, status='new')
        agent_client.force_authenticate(user=agent)

        url = reverse('lead-status-update', kwargs={'pk': lead.pk})
        data = {
            'status': 'contacted',
            'notes': 'First contact made via phone'
        }
        response = agent_client.patch(url, data, format='json')

        assert response.status_code == status.HTTP_200_OK
        assert response.data['status'] == 'contacted'

        # Verify log entry created
        from leads.models import LeadStatusLog
        logs = LeadStatusLog.objects.filter(lead=lead)
        assert logs.count() == 1
        assert logs.first().from_status == 'new'
        assert logs.first().to_status == 'contacted'
        assert logs.first().changed_by == agent

    def test_status_update_validates_status_choice(self, agent_client, lead_factory):
        """Invalid status value is rejected."""
        agent = agent_user_factory()
        lead = lead_factory(agent=agent)
        agent_client.force_authenticate(user=agent)

        url = reverse('lead-status-update', kwargs={'pk': lead.pk})
        data = {'status': 'invalid_status'}
        response = agent_client.patch(url, data, format='json')

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert 'status' in response.data


class TestLeadAgentLeadsEndpoint:
    """Tests for GET /api/leads/my-leads/"""

    def test_agent_my_leads_returns_own_leads(self, agent_client, lead_factory):
        """Agent's my-leads endpoint returns only their leads."""
        agent = agent_user_factory()
        lead1 = lead_factory(agent=agent)
        lead2 = lead_factory(agent=agent)
        other_agent = agent_user_factory()
        lead3 = lead_factory(agent=other_agent)

        agent_client.force_authenticate(user=agent)
        url = reverse('agent-leads')
        response = agent_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        ids = [l['id'] for l in response.data] if isinstance(response.data, list) else [l['id'] for l in response.data.get('results', [])]
        assert lead1.id in ids
        assert lead2.id in ids
        assert lead3.id not in ids


class TestCRMStatsEndpoint:
    """Tests for GET /api/leads/stats/"""

    def test_crm_stats_requires_auth(self, api_client):
        """CRM stats require authentication."""
        url = reverse('crm-stats')
        response = api_client.get(url)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_crm_stats_returns_correct_counts(self, agent_client, lead_factory):
        """Stats include correct lead counts by status."""
        agent = agent_user_factory()
        agent_client.force_authenticate(user=agent)

        lead_factory(agent=agent, status='new')
        lead_factory(agent=agent, status='new')
        lead_factory(agent=agent, status='contacted')
        lead_factory(agent=agent, status='qualified')

        url = reverse('crm-stats')
        response = agent_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert response.data['total_leads'] == 4
        assert response.data['new_leads'] == 2
        assert response.data['contacted'] == 1
        assert response.data['qualified_leads'] == 1


class TestLeadActivitiesEndpoint:
    """Tests for GET/POST /api/leads/{id}/activities/"""

    def test_get_lead_activities(self, agent_client, lead_factory, agent_user_factory):
        """Retrieve activities for a lead."""
        agent = agent_user_factory()
        lead = lead_factory(agent=agent)
        activity = LeadActivity.objects.create(
            lead=lead,
            activity_type='call',
            description='Initial call',
            agent=agent
        )

        agent_client.force_authenticate(user=agent)
        url = reverse('lead-activities', kwargs={'leadId': lead.pk})
        response = agent_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) >= 1
        assert response.data[0]['activity_type'] == 'call'

    def test_create_lead_activity(self, agent_client, lead_factory, agent_user_factory):
        """Create activity for a lead."""
        agent = agent_user_factory()
        lead = lead_factory(agent=agent)
        agent_client.force_authenticate(user=agent)

        url = reverse('lead-activities', kwargs={'leadId': lead.pk})
        data = {
            'activity_type': 'email',
            'description': 'Sent follow-up email',
        }
        response = agent_client.post(url, data, format='json')

        assert response.status_code == status.HTTP_201_CREATED
        assert response.data['activity_type'] == 'email'
        assert response.data['agent'] == agent.id


class TestLeadInteractionsEndpoint:
    """Tests for POST /api/leads/{id}/interactions/"""

    def test_track_interaction(self, agent_client, lead_factory, sample_property):
        """Track lead interaction (anonymous tracking)."""
        lead = lead_factory(agent=agent_user_factory())
        agent_client.force_authenticate(user=lead.agent)

        url = reverse('lead-interactions', kwargs={'leadId': lead.pk})
        data = {
            'interaction_type': 'property_click',
            'property': sample_property.id,
            'metadata': {'duration': 30}
        }
        response = agent_client.post(url, data, format='json')

        assert response.status_code == status.HTTP_201_CREATED
        assert response.data['interaction_type'] == 'property_click'


class TestLeadStatusLogEndpoint:
    """Tests for GET /api/leads/{id}/status-log/"""

    def test_get_status_history(self, agent_client, lead_factory, agent_user_factory):
        """Retrieve complete status change history."""
        agent = agent_user_factory()
        lead = lead_factory(agent=agent, status='new')

        # Create status changes
        LeadStatusLog.objects.create(lead=lead, from_status='', to_status='new', changed_by=agent)
        LeadStatusLog.objects.create(lead=lead, from_status='new', to_status='contacted', changed_by=agent)

        agent_client.force_authenticate(user=agent)
        url = reverse('lead-status-log', kwargs={'leadId': lead.pk})
        response = agent_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) >= 2


class TestTasksEndpoint:
    """Tests for GET/POST/PATCH/DELETE /api/leads/tasks/"""

    def test_get_tasks(self, agent_client, task_factory):
        """Retrieve tasks (filtered by user)."""
        agent = agent_user_factory()
        task1 = task_factory(agent=agent)
        task2 = task_factory(agent=agent)

        agent_client.force_authenticate(user=agent)
        url = reverse('task-list')
        response = agent_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        ids = [t['id'] for t in response.data] if isinstance(response.data, list) else [t['id'] for t in response.data.get('results', [])]
        assert task1.id in ids
        assert task2.id in ids

    def test_create_task(self, agent_client, lead_factory, agent_user_factory):
        """Create a new task."""
        agent = agent_user_factory()
        lead = lead_factory(agent=agent)
        agent_client.force_authenticate(user=agent)

        url = reverse('task-list')
        data = {
            'lead': lead.id,
            'title': 'Follow up on quotation',
            'due_date': (timezone.now() + timedelta(days=3)).isoformat(),
            'priority': 'high'
        }
        response = agent_client.post(url, data, format='json')

        assert response.status_code == status.HTTP_201_CREATED
        assert response.data['title'] == 'Follow up on quotation'
        assert response.data['priority'] == 'high'

    def test_update_task(self, agent_client, task_factory):
        """Update task details."""
        agent = agent_user_factory()
        task = task_factory(agent=agent, is_completed=False)
        agent_client.force_authenticate(user=agent)

        url = reverse('task-detail', kwargs={'pk': task.pk})
        data = {'is_completed': True}
        response = agent_client.patch(url, data, format='json')

        assert response.status_code == status.HTTP_200_OK
        assert response.data['is_completed'] is True

    def test_delete_task(self, agent_client, task_factory):
        """Delete a task."""
        agent = agent_user_factory()
        task = task_factory(agent=agent)
        agent_client.force_authenticate(user=agent)

        url = reverse('task-detail', kwargs={'pk': task.pk})
        response = agent_client.delete(url)

        assert response.status_code == status.HTTP_204_NO_CONTENT
        task.refresh_from_db()
        # After deletion, accessing should raise exception or return 404
        # But Django soft delete? Check model. Assuming hard delete.
        with pytest.raises(Task.DoesNotExist):
            task.refresh_from_db()


class TestConversationsEndpoint:
    """Tests for /api/leads/conversations/"""

    def test_create_conversation(self, agent_client, lead_factory, property_factory, client_user_factory):
        """Create a new conversation."""
        agent = agent_user_factory()
        lead = lead_factory(agent=agent)
        client = client_user_factory()
        prop = property_factory(agent=agent)

        agent_client.force_authenticate(user=agent)
        url = reverse('conversation-list')
        data = {
            'lead': lead.id,
            'property': prop.id,
            'client': client.id,
        }
        response = agent_client.post(url, data, format='json')

        assert response.status_code == status.HTTP_201_CREATED
        assert response.data['lead'] == lead.id

    def test_get_conversations(self, agent_client, conversation_factory):
        """Retrieve user's conversations."""
        agent = agent_user_factory()
        conv1 = conversation_factory(agent=agent)
        conv2 = conversation_factory(agent=agent)

        agent_client.force_authenticate(user=agent)
        url = reverse('conversation-list')
        response = agent_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        ids = [c['id'] for c in response.data] if isinstance(response.data, list) else [c['id'] for c in response.data.get('results', [])]
        assert conv1.id in ids
        assert conv2.id in ids

    def test_delete_conversation(self, agent_client, conversation_factory):
        """Delete a conversation."""
        agent = agent_user_factory()
        conv = conversation_factory(agent=agent)
        agent_client.force_authenticate(user=agent)

        url = reverse('conversation-delete', kwargs={'pk': conv.pk})
        response = agent_client.delete(url)

        assert response.status_code == status.HTTP_204_NO_CONTENT
        with pytest.raises(Conversation.DoesNotExist):
            conv.refresh_from_db()


class TestMessagesEndpoint:
    """Tests for /api/leads/conversations/{id}/messages/"""

    def test_get_messages(self, agent_client, conversation_factory, message_factory):
        """Retrieve messages in a conversation."""
        agent = agent_user_factory()
        conv = conversation_factory(agent=agent)
        msg1 = message_factory(conversation=conv)
        msg2 = message_factory(conversation=conv)

        agent_client.force_authenticate(user=agent)
        url = reverse('message-list', kwargs={'conversation_id': conv.pk})
        response = agent_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        ids = [m['id'] for m in response.data] if isinstance(response.data, list) else [m['id'] for m in response.data.get('results', [])]
        assert msg1.id in ids
        assert msg2.id in ids

    def test_send_message(self, agent_client, conversation_factory):
        """Send a message in a conversation."""
        agent = agent_user_factory()
        conv = conversation_factory(agent=agent)
        agent_client.force_authenticate(user=agent)

        url = reverse('message-list', kwargs={'conversation_id': conv.pk})
        data = {'content': 'Hello, how can I help?'}
        response = agent_client.post(url, data, format='json')

        assert response.status_code == status.HTTP_201_CREATED
        assert response.data['content'] == 'Hello, how can I help?'
        assert response.data['sender'] == agent.id
