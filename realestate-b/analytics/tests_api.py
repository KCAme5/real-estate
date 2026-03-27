"""
API Integration Tests for Analytics endpoints.
"""
import pytest
from django.urls import reverse
from rest_framework import status

pytestmark = [pytest.mark.api, pytest.mark.integration]


class TestDashboardAnalyticsEndpoint:
    """Tests for GET /api/analytics/dashboard/"""

    def test_dashboard_requires_auth(self, api_client):
        """Dashboard analytics require authentication."""
        url = reverse('dashboard-analytics')
        response = api_client.get(url)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_management_sees_dashboard(self, management_client, agent_user_factory, property_factory, lead_factory):
        """Management sees platform-wide analytics."""
        management_client.force_authenticate(user=management_client.user)
        # Create some data
        agent = agent_user_factory()
        prop = property_factory(agent=agent, is_verified=True)
        lead = lead_factory(agent=agent)

        url = reverse('dashboard-analytics')
        response = management_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert 'overview' in response.data
        assert 'today' in response.data
        assert 'this_month' in response.data
        assert 'top_agents' in response.data


class TestAgentPerformanceEndpoint:
    """Tests for GET /api/analytics/agent-performance/"""

    def test_agent_performance_requires_auth(self, api_client):
        url = reverse('agent-performance')
        response = api_client.get(url)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_agent_sees_own_performance(self, agent_client, agent_user_factory, property_factory, lead_factory):
        """Agent sees their own performance metrics."""
        agent = agent_user_factory()
        property_factory(agent=agent)
        lead_factory(agent=agent)

        agent_client.force_authenticate(user=agent)
        url = reverse('agent-performance')
        response = agent_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert 'agent' in response.data
        assert 'properties_count' in response.data


class TestManagementAnalyticsEndpoint:
    """Tests for GET /api/analytics/management/"""

    def test_management_analytics_requires_auth(self, api_client):
        url = reverse('management-analytics')
        response = api_client.get(url)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_management_sees_comprehensive_analytics(self, management_client, agent_user_factory, property_factory):
        """Management sees platform-wide analytics."""
        management_client.force_authenticate(user=management_client.user)

        # Create test data
        agent = agent_user_factory()
        property_factory(agent=agent, is_verified=True)
        property_factory(agent=agent, is_verified=False)

        url = reverse('management-analytics')
        response = management_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert 'total_properties' in response.data
        assert 'verified_properties' in response.data
        assert 'total_agents' in response.data
        assert 'total_leads' in response.data


class TestPropertyAnalyticsEndpoint:
    """Tests for GET /api/analytics/property/{id}/"""

    def test_property_analytics_requires_auth(self, api_client, property_factory):
        prop = property_factory()
        url = reverse('property-analytics', kwargs={'property_id': prop.pk})
        response = api_client.get(url)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_agent_sees_own_property_analytics(self, agent_client, property_factory, agent_user_factory):
        agent = agent_user_factory()
        prop = property_factory(agent=agent)
        agent_client.force_authenticate(user=agent)

        url = reverse('property-analytics', kwargs={'property_id': prop.pk})
        response = agent_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert 'total_views' in response.data
        assert 'recent_views' in response.data
        assert 'leads_from_property' in response.data


class TestPropertyViewsEndpoint:
    """Tests for GET /api/analytics/property-views/"""

    def test_property_views_requires_auth(self, api_client):
        url = reverse('property-views')
        response = api_client.get(url)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_property_views_filterable(self, agent_client, agent_user_factory, property_factory):
        agent = agent_user_factory()
        prop1 = property_factory(agent=agent)
        prop2 = property_factory(agent=agent)

        from analytics.models import PropertyView
        PropertyView.objects.create(property=prop1, ip_address='127.0.0.1', user_email='viewer1@test.com')
        PropertyView.objects.create(property=prop2, ip_address='127.0.0.2', user_email='viewer2@test.com')

        agent_client.force_authenticate(user=agent)
        url = reverse('property-views')
        response = agent_client.get(url, {'property': prop1.pk})

        assert response.status_code == status.HTTP_200_OK
        # Should filter by property
        for view in response.data:
            assert view['property'] == prop1.id


class TestSearchAnalyticsEndpoint:
    """Tests for GET /api/analytics/search-analytics/"""

    def test_search_analytics_requires_auth(self, api_client):
        url = reverse('search-analytics')
        response = api_client.get(url)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_search_analytics_returns_data(self, management_client):
        from analytics.models import SearchQuery
        SearchQuery.objects.create(query='3 bedroom', results_count=5, user=None)

        management_client.force_authenticate(user=management_client.user)
        url = reverse('search-analytics')
        response = management_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) >= 1
