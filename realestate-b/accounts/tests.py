from django.test import TestCase, Client
import json
from .models import CustomUser


class LogoutTests(TestCase):
    def setUp(self):
        self.client = Client()
        self.user = CustomUser.objects.create_user(
            username="testuser", email="test@example.com", password="password123"
        )

    def test_logout_clears_refresh_cookie_and_disables_refresh(self):
        # Login using the login endpoint
        login_resp = self.client.post(
            "/api/auth/login/",
            {"username": "testuser", "password": "password123"},
            content_type="application/json",
        )
        self.assertEqual(login_resp.status_code, 200)
        # Should have set a refresh cookie
        self.assertIn("refresh", login_resp.cookies)

        # Now call logout (client will accept Set-Cookie)
        logout_resp = self.client.post(
            "/api/auth/logout/", json.dumps({}), content_type="application/json"
        )
        # Debug output to inspect why 400 is returned
        print("DEBUG LOGOUT RESPONSE:", logout_resp.status_code, logout_resp.content)
        self.assertEqual(logout_resp.status_code, 200)

        # Ensure the response attempted to clear the cookie
        cookie = logout_resp.cookies.get("refresh")
        self.assertIsNotNone(cookie)
        self.assertTrue(cookie.value == "" or cookie.get("max-age") == "0")

        # Confirm the client's cookie jar no longer has a valid refresh cookie
        self.assertFalse(
            "refresh" in self.client.cookies and self.client.cookies["refresh"].value
        )

        # Calling refresh endpoint should now return 401
        refresh_resp = self.client.get("/api/auth/refresh/")
        self.assertEqual(refresh_resp.status_code, 401)
