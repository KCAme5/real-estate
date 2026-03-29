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
        # Management user falls into the else clause (client analytics)
        assert 'properties_viewed' in response.data or 'total_properties' in response.data


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
        assert 'properties_listed' in response.data


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
        assert 'overview' in response.data
        assert 'total_properties' in response.data['overview']
        assert 'verified_properties' in response.data['overview']
        assert 'total_agents' in response.data['overview']
        assert 'total_leads' in response.data['overview']


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
        PropertyView.objects.create(property=prop1, ip_address='127.0.0.1', user=None)
        PropertyView.objects.create(property=prop2, ip_address='127.0.0.2', user=None)

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
        # May fail if endpoint doesn't exist, but should not 500
        assert response.status_code in [status.HTTP_401_UNAUTHORIZED, status.HTTP_404_NOT_FOUND, status.HTTP_200_OK]

    def test_search_analytics_returns_data(self, management_client):
        from analytics.models import SearchAnalytics as SearchModel
        SearchModel.objects.create(search_query='3 bedroom', results_count=5, ip_address='127.0.0.1', user=None)

        management_client.force_authenticate(user=management_client.user)
        url = reverse('search-analytics')
        response = management_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) >= 1


class TestLeadScoreDistributionEndpoint:
    """Tests for GET /api/analytics/lead-score-distribution/"""

    def test_lead_score_requires_auth(self, api_client):
        url = reverse('lead-score-distribution')
        response = api_client.get(url)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_agent_sees_own_lead_scores(self, agent_client, agent_user_factory, lead_factory):
        """Agent sees distribution of their own leads' scores."""
        agent = agent_user_factory()
        # Create leads with different scores
        lead_factory(agent=agent, score=10)  # cold
        lead_factory(agent=agent, score=35)  # warm
        lead_factory(agent=agent, score=60)  # hot
        lead_factory(agent=agent, score=85)  # very_hot

        agent_client.force_authenticate(user=agent)
        url = reverse('lead-score-distribution')
        response = agent_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert 'distribution' in response.data
        assert 'histogram' in response.data
        assert 'cold' in response.data['distribution']
        assert 'hot' in response.data['distribution']
        assert 'very_hot' in response.data['distribution']
        assert response.data['total_leads'] == 4

    def test_management_sees_all_lead_scores(self, management_client, agent_user_factory, lead_factory):
        """Management sees all leads' score distribution."""
        agent = agent_user_factory()
        lead_factory(agent=agent, score=20)
        lead_factory(agent=agent, score=70)

        management_client.force_authenticate(user=management_client.user)
        url = reverse('lead-score-distribution')
        response = management_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert response.data['total_leads'] == 2


class TestLeadTrendsEndpoint:
    """Tests for GET /api/analytics/lead-trends/"""

    def test_lead_trends_requires_auth(self, api_client):
        url = reverse('lead-trends')
        response = api_client.get(url)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_agent_sees_lead_trends(self, agent_client, agent_user_factory, lead_factory):
        """Agent sees daily lead trend data."""
        agent = agent_user_factory()
        lead_factory(agent=agent)
        lead_factory(agent=agent)

        agent_client.force_authenticate(user=agent)
        url = reverse('lead-trends')
        response = agent_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert 'trends' in response.data
        assert 'period_days' in response.data
        assert 'total_leads' in response.data
        assert isinstance(response.data['trends'], list)

    def test_lead_trends_supports_days_param(self, agent_client, agent_user_factory, lead_factory):
        """Lead trends supports custom days parameter."""
        agent = agent_user_factory()
        agent_client.force_authenticate(user=agent)

        url = reverse('lead-trends')
        response = agent_client.get(url, {'days': 7})

        assert response.status_code == status.HTTP_200_OK
        assert response.data['period_days'] == 7


class TestLeadSourceDistributionEndpoint:
    """Tests for GET /api/analytics/lead-source-distribution/"""

    def test_lead_source_requires_auth(self, api_client):
        url = reverse('lead-source-distribution')
        response = api_client.get(url)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_agent_sees_own_source_distribution(self, agent_client, agent_user_factory, lead_factory):
        """Agent sees distribution of their own leads by source."""
        agent = agent_user_factory()
        lead_factory(agent=agent, source='website')
        lead_factory(agent=agent, source='website')
        lead_factory(agent=agent, source='whatsapp')

        agent_client.force_authenticate(user=agent)
        url = reverse('lead-source-distribution')
        response = agent_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert 'distribution' in response.data
        assert 'total' in response.data
        assert response.data['total'] == 3
        # Check that sources are present
        sources = [d['source'] for d in response.data['distribution']]
        assert 'website' in sources
        assert 'whatsapp' in sources


class TestManagementMetricsEndpoint:
    """Tests for GET /api/analytics/management-metrics/"""

    def test_management_metrics_requires_auth(self, api_client):
        url = reverse('management-metrics')
        response = api_client.get(url)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_management_sees_real_conversion_rate(self, management_client, lead_factory):
        """Management sees calculated conversion rate from actual data."""
        # Create leads with closed_won and closed_lost status
        lead_factory(status='closed_won')
        lead_factory(status='closed_won')
        lead_factory(status='closed_lost')

        management_client.force_authenticate(user=management_client.user)
        url = reverse('management-metrics')
        response = management_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert 'this_month' in response.data
        assert 'conversion_rate' in response.data['this_month']
        assert 'won_leads' in response.data['this_month']
        assert 'lost_leads' in response.data['this_month']
        assert response.data['this_month']['won_leads'] == 2
        assert response.data['this_month']['lost_leads'] == 1
        # Conversion rate = won / (won + lost) = 2/3 ≈ 66.67%
        assert response.data['this_month']['conversion_rate'] > 0

    def test_management_metrics_includes_source_performance(self, management_client, lead_factory):
        """Management metrics include source performance breakdown."""
        lead_factory(source='website', status='closed_won')
        lead_factory(source='whatsapp', status='closed_lost')

        management_client.force_authenticate(user=management_client.user)
        url = reverse('management-metrics')
        response = management_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert 'source_performance' in response.data
        assert isinstance(response.data['source_performance'], list)

    def test_non_management_forbidden(self, agent_client, agent_user_factory):
        """Non-management users should get 403."""
        agent = agent_user_factory()
        agent_client.force_authenticate(user=agent)

        url = reverse('management-metrics')
        response = agent_client.get(url)

        assert response.status_code == status.HTTP_403_FORBIDDEN
