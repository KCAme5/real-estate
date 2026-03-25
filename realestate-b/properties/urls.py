# realestate_backend/properties/urls.py
from django.urls import path
from . import views

urlpatterns = [
    path("", views.PropertyListView.as_view(), name="property-list"),
    path("featured/", views.featured_properties, name="featured-properties"),
    path("create/", views.PropertyCreateView.as_view(), name="property-create"),
    path(
        "my-properties/", views.AgentPropertyListView.as_view(), name="agent-properties"
    ),
    path("locations/", views.LocationListView.as_view(), name="location-list"),
    # Move saved routes BEFORE the slug pattern to avoid conflicts
    path(
        "saved/", views.SavedPropertyListCreateView.as_view(), name="saved-properties"
    ),
    path(
        "saved/<int:pk>/",
        views.SavedPropertyDestroyView.as_view(),
        name="saved-property-detail",
    ),
    # PK-based detail for agent management (edit/delete)
    path(
        "<int:pk>/", views.PropertyDetailModifyView.as_view(), name="property-detail-pk"
    ),
    # Delete individual property images
    path(
        "images/<int:pk>/",
        views.PropertyImageDeleteView.as_view(),
        name="property-image-delete",
    ),
    path("search/", views.PropertySearchView.as_view(), name="property-search"),
    path(
        "recommendations/",
        views.UserRecommendationsView.as_view(),
        name="user-recommendations",
    ),
    path(
        "management-properties/",
        views.ManagementPropertyListView.as_view(),
        name="management-properties",
    ),
    path(
        "management-properties/<int:pk>/",
        views.ManagementPropertyDetailView.as_view(),
        name="management-property-detail",
    ),
    path("approve-property/<int:pk>/", views.ApprovePropertyView.as_view(), name="approve-property"),
    path("reject-property/<int:pk>/", views.RejectPropertyView.as_view(), name="reject-property"),
    path("toggle-featured/<int:pk>/", views.ToggleFeaturedPropertyView.as_view(), name="toggle-featured"),
    # Keep slug pattern LAST to avoid catching other routes
    path("<slug:slug>/", views.PropertyDetailView.as_view(), name="property-detail"),
]
