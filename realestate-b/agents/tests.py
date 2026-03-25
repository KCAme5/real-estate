from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from agents.models import AgentProfile

User = get_user_model()

class AgentRegistrationAndVerificationTests(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_agent_registration_creates_profile(self):
        """
        Test that registering an agent automatically creates an AgentProfile.
        """
        response = self.client.post(
            "/api/auth/register/",
            {
                "username": "testagent",
                "email": "agent@example.com",
                "password": "ComplexPassword123!",
                "first_name": "Test",
                "last_name": "Agent",
                "user_type": "agent"
            },
            format="json"
        )
        if response.status_code != 201:
            print(f"DEBUG: Registration failed with {response.data}")
        self.assertEqual(response.status_code, 201)
        
        user = User.objects.get(username="testagent")
        self.assertEqual(user.user_type, "agent")
        
        # Check if AgentProfile was created
        self.assertTrue(AgentProfile.objects.filter(user=user).exists())
        profile = user.agent_profile
        self.assertIn("Test Agent", profile.bio)

    def test_verification_sync(self):
        """
        Test that is_verified status is synced between CustomUser and AgentProfile.
        """
        user = User.objects.create_user(
            username="syncagent",
            email="sync@example.com",
            password="password123",
            user_type="agent"
        )
        # AgentProfile should be created by the serializer, but since we use create_user 
        # (which doesn't use the serializer), we create it manually here or check if signal does it?
        # Actually, our registration fix is in the serializer.
        # But if we create via models, we might need another signal.
        # The serializer handles it for now.
        
        profile = AgentProfile.objects.create(
            user=user,
            bio="Test bio",
            license_number="TEST-123",
            is_verified=False
        )
        
        # Sync User -> Profile
        user.is_verified = True
        user.save()
        profile.refresh_from_db()
        self.assertTrue(profile.is_verified)
        
        # Sync Profile -> User
        profile.is_verified = False
        profile.save()
        user.refresh_from_db()
        self.assertFalse(user.is_verified)
