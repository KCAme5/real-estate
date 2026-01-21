# accounts/urls.py
from django.urls import path
from . import views

urlpatterns = [
    path("register/", views.register_user, name="register"),
    path("login/", views.login_user, name="login"),
    path("profile/", views.UserProfileView.as_view(), name="profile"),
    path("user/", views.UserDetailView.as_view(), name="user-detail"),
    path("dashboard-stats/", views.dashboard_stats, name="dashboard-stats"),
    path("change-password/", views.change_password, name="change-password"),
    path("password-reset/", views.password_reset_request, name="password-reset"),
    path(
        "password-reset-confirm/",
        views.password_reset_confirm,
        name="password-reset-confirm",
    ),
    path("preferences/", views.UserPreferencesView.as_view(), name="user-preferences"),
    path("refresh/", views.refresh_token, name="token-refresh"),
    path("logout/", views.logout_user, name="logout"),
    # Debug endpoints
    path("debug/auth-status/", views.debug_auth_status, name="debug-auth-status"),
    path(
        "debug/create-test-user/",
        views.debug_create_test_user,
        name="debug-create-test-user",
    ),
    path("debug/validate-cors/", views.debug_validate_cors, name="debug-validate-cors"),
    path(
        "management-agents/",
        views.ManagementAgentListView.as_view(),
        name="management-agents",
    ),
    path(
        "management-agents/<int:pk>/",
        views.ManagementAgentDetailView.as_view(),
        name="management-agent-detail",
    ),
]
