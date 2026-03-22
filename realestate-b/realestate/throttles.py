# realestate/throttles.py
# Drop this file in your realestate/ config folder (next to settings.py)
# Then import and apply to specific views as shown below.

from rest_framework.throttling import AnonRateThrottle, UserRateThrottle


class AuthRateThrottle(AnonRateThrottle):
    """
    Tight throttle for login / register / token endpoints.
    10 attempts per minute per IP — blocks brute force.
    Uses the 'auth' key from DEFAULT_THROTTLE_RATES.
    """

    scope = "auth"


class LeadCreationThrottle(UserRateThrottle):
    """
    Throttle for the lead creation endpoint.
    30 leads per minute per authenticated user — prevents spam submissions
    from the Contact Agent / Book Viewing buttons.
    Uses the 'leads' key from DEFAULT_THROTTLE_RATES.
    """

    scope = "leads"


# ─── How to apply these to your views ────────────────────────────────────────
#
# In accounts/views.py — on your login and register views:
#
#   from realestate.throttles import AuthRateThrottle
#
#   class LoginView(TokenObtainPairView):
#       throttle_classes = [AuthRateThrottle]
#
#   class RegisterView(generics.CreateAPIView):
#       throttle_classes = [AuthRateThrottle]
#
#
# In leads/views.py — on LeadListView (POST only):
#
#   from realestate.throttles import LeadCreationThrottle
#   from rest_framework.throttling import UserRateThrottle
#
#   class LeadListView(generics.ListCreateAPIView):
#       def get_throttles(self):
#           if self.request.method == "POST":
#               return [LeadCreationThrottle()]
#           return super().get_throttles()
#
# ─────────────────────────────────────────────────────────────────────────────
