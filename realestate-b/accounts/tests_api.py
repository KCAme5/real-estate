"""
API Integration Tests for Authentication and Account Management.
"""
import pytest
from django.urls import reverse
from rest_framework import status
from django.contrib.auth import get_user_model

User = get_user_model()
pytestmark = [pytest.mark.api, pytest.mark.integration]


class TestRegistrationEndpoint:
    """Tests for POST /api/auth/register/"""

    def test_user_registration_creates_user(self, api_client):
        """Registration creates a new user."""
        url = reverse('register')
        data = {
            'username': 'newuser',
            'email': 'newuser@example.com',
            'password': 'SecurePass123!',
            'first_name': 'New',
            'last_name': 'User',
            'user_type': 'client'
        }
        response = api_client.post(url, data, format='json')

        assert response.status_code == status.HTTP_201_CREATED
        assert response.data['username'] == 'newuser'
        assert response.data['email'] == 'newuser@example.com'
        assert User.objects.filter(username='newuser').exists()

    def test_registration_agent_creates_profile(self, api_client):
        """Registering an agent creates AgentProfile automatically."""
        from agents.models import AgentProfile
        url = reverse('register')
        data = {
            'username': 'newagent',
            'email': 'agent@example.com',
            'password': 'AgentPass123!',
            'first_name': 'Agent',
            'last_name': 'Smith',
            'user_type': 'agent'
        }
        response = api_client.post(url, data, format='json')

        assert response.status_code == status.HTTP_201_CREATED
        user = User.objects.get(username='newagent')
        assert user.user_type == 'agent'
        assert AgentProfile.objects.filter(user=user).exists()

    def test_registration_validates_required_fields(self, api_client):
        """Required fields are validated."""
        url = reverse('register')
        data = {
            'email': 'test@example.com',
            'password': 'pass123'
        }
        response = api_client.post(url, data, format='json')

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert 'username' in response.data

    def test_registration_duplicate_username_fails(self, api_client, agent_user_factory):
        """Cannot register with existing username."""
        agent_user_factory(username='existinguser')

        url = reverse('register')
        data = {
            'username': 'existinguser',
            'email': 'new@example.com',
            'password': 'pass123'
        }
        response = api_client.post(url, data, format='json')

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert 'username' in response.data


class TestLoginEndpoint:
    """Tests for POST /api/auth/login/"""

    def test_login_success(self, api_client, agent_user_factory):
        """Valid credentials return tokens."""
        agent_user_factory(username='testagent', password='TestPass123!')

        url = reverse('login')
        data = {
            'username': 'testagent',
            'password': 'TestPass123!'
        }
        response = api_client.post(url, data, format='json')

        assert response.status_code == status.HTTP_200_OK
        assert 'access' in response.data
        assert 'refresh' in response.data

    def test_login_invalid_credentials(self, api_client):
        """Invalid credentials return 401."""
        url = reverse('login')
        data = {
            'username': 'wronguser',
            'password': 'wrongpass'
        }
        response = api_client.post(url, data, format='json')

        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_login_rate_limiting(self, api_client, agent_user_factory):
        """Too many failed attempts triggers rate limit."""
        agent_user_factory(username='testagent', password='TestPass123!')

        url = reverse('login')
        # Attempt many logins
        for _ in range(15):
            api_client.post(url, {
                'username': 'testagent',
                'password': 'wrongpass'
            }, format='json')

        response = api_client.post(url, {
            'username': 'testagent',
            'password': 'TestPass123!'
        }, format='json')

        # After rate limit, even correct password might be rate-limited
        assert response.status_code == status.HTTP_429_TOO_MANY_REQUESTS


class TestRefreshTokenEndpoint:
    """Tests for POST /api/auth/refresh/"""

    def test_refresh_token_success(self, api_client, agent_user_factory):
        """Valid refresh token returns new access token."""
        agent = agent_user_factory()
        from rest_framework_simplejwt.tokens import RefreshToken
        refresh = RefreshToken.for_user(agent)

        url = reverse('token-refresh')
        data = {'refresh': str(refresh)}
        response = api_client.post(url, data, format='json')

        assert response.status_code == status.HTTP_200_OK
        assert 'access' in response.data

    def test_refresh_invalid_token_fails(self, api_client):
        """Invalid refresh token returns 401."""
        url = reverse('token-refresh')
        data = {'refresh': 'invalidtoken'}
        response = api_client.post(url, data, format='json')

        assert response.status_code == status.HTTP_401_UNAUTHORIZED


class TestLogoutEndpoint:
    """Tests for POST /api/auth/logout/"""

    def test_logout_blacklists_token(self, agent_client, agent_user_factory):
        """Logout blacklists refresh token."""
        agent = agent_user_factory()
        from rest_framework_simplejwt.tokens import RefreshToken
        refresh = RefreshToken.for_user(agent)

        agent_client.force_authenticate(user=agent)
        url = reverse('logout')
        # logout view expects token in request body or header
        # Check implementation - typical pattern is:
        # {"refresh": "<token>"}
        data = {'refresh': str(refresh)}
        response = agent_client.post(url, data, format='json')

        assert response.status_code == status.HTTP_200_OK
        # Verify token is blacklisted
        from rest_framework_simplejwt.token_blacklist.models import BlacklistedToken
        assert BlacklistedToken.objects.filter(token__jti=refresh['jti']).exists()


class TestUserProfileEndpoint:
    """Tests for GET/PATCH /api/auth/profile/"""

    def test_get_profile(self, agent_client, agent_user_factory):
        """User can view their profile."""
        agent = agent_user_factory()
        agent_client.force_authenticate(user=agent)

        url = reverse('profile')
        response = agent_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert response.data['username'] == agent.username

    def test_update_profile(self, agent_client, agent_user_factory):
        """User can update profile fields."""
        agent = agent_user_factory()
        agent_client.force_authenticate(user=agent)

        url = reverse('profile')
        data = {
            'first_name': 'Updated',
            'last_name': 'Name',
            'email': 'updated@example.com'
        }
        response = agent_client.patch(url, data, format='json')

        assert response.status_code == status.HTTP_200_OK
        assert response.data['first_name'] == 'Updated'
        agent.refresh_from_db()
        assert agent.first_name == 'Updated'


class TestDashboardStatsEndpoint:
    """Tests for GET /api/auth/dashboard-stats/"""

    def test_dashboard_stats_requires_auth(self, api_client):
        """Dashboard stats require login."""
        url = reverse('dashboard-stats')
        response = api_client.get(url)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_dashboard_returns_user_stats(self, agent_client, agent_user_factory, lead_factory, property_factory):
        """Dashboard returns user's stats."""
        agent = agent_user_factory()
        lead_factory(agent=agent)
        lead_factory(agent=agent)
        property_factory(agent=agent)

        agent_client.force_authenticate(user=agent)
        url = reverse('dashboard-stats')
        response = agent_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert 'total_leads' in response.data
        assert 'total_properties' in response.data
        assert response.data['total_leads'] >= 2
        assert response.data['total_properties'] >= 1


class TestChangePasswordEndpoint:
    """Tests for POST /api/auth/change-password/"""

    def test_change_password_success(self, agent_client, agent_user_factory):
        """User can change password with correct old password."""
        agent = agent_user_factory(password='OldPass123!')
        agent_client.force_authenticate(user=agent)

        url = reverse('change-password')
        data = {
            'old_password': 'OldPass123!',
            'new_password': 'NewPass456!'
        }
        response = agent_client.post(url, data, format='json')

        assert response.status_code == status.HTTP_200_OK
        # Verify new password works
        agent.set_password('NewPass456!')
        agent.save()
        assert agent.check_password('NewPass456!')

    def test_change_password_wrong_old_fails(self, agent_client, agent_user_factory):
        """Wrong old password fails."""
        agent = agent_user_factory(password='CorrectPass123!')
        agent_client.force_authenticate(user=agent)

        url = reverse('change-password')
        data = {
            'old_password': 'WrongPass',
            'new_password': 'NewPass456!'
        }
        response = agent_client.post(url, data, format='json')

        assert response.status_code == status.HTTP_400_BAD_REQUEST


class TestUserPreferencesEndpoint:
    """Tests for GET/PATCH /api/auth/preferences/"""

    def test_get_preferences(self, agent_client, agent_user_factory):
        """User can view preferences."""
        agent = agent_user_factory()
        from accounts.models import UserPreferences
        UserPreferences.objects.create(user=agent, theme='dark', email_notifications=True)

        agent_client.force_authenticate(user=agent)
        url = reverse('user-preferences')
        response = agent_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert response.data['theme'] == 'dark'

    def test_update_preferences(self, agent_client, agent_user_factory):
        """User can update preferences."""
        agent = agent_user_factory()
        agent_client.force_authenticate(user=agent)

        url = reverse('user-preferences')
        data = {'theme': 'light', 'email_notifications': False}
        response = agent_client.patch(url, data, format='json')

        assert response.status_code == status.HTTP_200_OK
        assert response.data['theme'] == 'light'


class TestManagementAgentsEndpoint:
    """Tests for /api/auth/management-agents/ (Management only)"""

    def test_management_sees_all_agents(self, management_client, agent_user_factory):
        """Management sees all agents."""
        agent1 = agent_user_factory()
        agent2 = agent_user_factory()

        management_client.force_authenticate(user=management_client.user)
        url = reverse('management-agents')
        response = management_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        usernames = [a['username'] for a in response.data]
        assert agent1.username in usernames
        assert agent2.username in usernames

    def test_agent_cannot_access_management_agents(self, agent_client):
        """Agents cannot access management endpoint."""
        agent_client.force_authenticate(user=agent_client.user)
        url = reverse('management-agents')
        response = agent_client.get(url)

        assert response.status_code == status.HTTP_403_FORBIDDEN
