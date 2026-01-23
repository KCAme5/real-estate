# realestate_backend/properties/views.py
from rest_framework import generics, permissions, status, exceptions
from rest_framework.views import APIView
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q
from .models import *
from .serializers import *
from .filters import PropertyFilter


class PropertyListView(generics.ListAPIView):
    serializer_class = PropertyListSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [DjangoFilterBackend]
    filterset_class = PropertyFilter

    def get_queryset(self):
        queryset = Property.objects.filter(status="available", is_verified=True)

        # Search functionality
        search_query = self.request.query_params.get("search", None)
        if search_query:
            queryset = queryset.filter(
                Q(title__icontains=search_query)
                | Q(description__icontains=search_query)
                | Q(location__name__icontains=search_query)
            )

        # Ordering
        ordering = self.request.query_params.get("ordering", "-created_at")
        if ordering in ["price", "-price", "created_at", "-created_at"]:
            queryset = queryset.order_by(ordering)

        return queryset


class PropertyDetailView(generics.RetrieveAPIView):
    serializer_class = PropertyDetailSerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = "slug"

    def get_queryset(self):
        return Property.objects.filter(is_verified=True)

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.views += 1
        instance.save()
        serializer = self.get_serializer(instance)
        return Response(serializer.data)


class PropertyCreateView(generics.CreateAPIView):
    serializer_class = PropertyCreateSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        # Check if user is an agent
        if self.request.user.user_type != "agent":
            raise exceptions.PermissionDenied("Only agents can create properties")
        serializer.save(agent=self.request.user)


class AgentPropertyListView(generics.ListAPIView):
    serializer_class = PropertyListSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Property.objects.filter(agent=self.request.user)


class LocationListView(generics.ListAPIView):
    serializer_class = LocationSerializer
    permission_classes = [permissions.AllowAny]
    queryset = Location.objects.all()


class PropertyDetailModifyView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve/Update/Delete by PK for agents to manage their properties."""

    serializer_class = PropertyDetailSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    lookup_field = "pk"

    def get_queryset(self):
        return Property.objects.all()

    def perform_update(self, serializer):
        instance = self.get_object()
        user = self.request.user
        if instance.agent and instance.agent != user and not user.is_staff:
            from rest_framework.exceptions import PermissionDenied

            raise PermissionDenied("You do not have permission to edit this property.")
        serializer.save()

    def perform_destroy(self, instance):
        user = self.request.user
        if instance.agent and instance.agent != user and not user.is_staff:
            from rest_framework.exceptions import PermissionDenied

            raise PermissionDenied(
                "You do not have permission to delete this property."
            )
        instance.delete()


@api_view(["GET"])
@permission_classes([permissions.AllowAny])
def featured_properties(request):
    properties = Property.objects.filter(
        is_featured=True, is_verified=True, status="available"
    )[:6]
    serializer = PropertyListSerializer(properties, many=True)
    return Response(serializer.data)


class SavedPropertyListCreateView(generics.ListCreateAPIView):
    serializer_class = SavedPropertySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return SavedProperty.objects.filter(user=self.request.user)

    def get_serializer_class(self):
        if self.request.method == "POST":
            return SavedPropertyCreateSerializer
        return SavedPropertySerializer

    def perform_create(self, serializer):
        property_id = self.request.data.get("property")
        if SavedProperty.objects.filter(
            user=self.request.user, property_id=property_id
        ).exists():
            raise serializers.ValidationError("Property already saved")
        serializer.save(user=self.request.user)


class SavedPropertyDestroyView(generics.DestroyAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return SavedProperty.objects.filter(user=self.request.user)


class PropertySearchView(generics.ListAPIView):
    serializer_class = PropertySearchSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        queryset = Property.objects.filter(status="available", is_verified=True)

        # Location filter
        location = self.request.query_params.get("location", None)
        if location:
            queryset = queryset.filter(location__name__icontains=location)

        # Price range filter
        min_price = self.request.query_params.get("min_price", None)
        max_price = self.request.query_params.get("max_price", None)
        if min_price:
            queryset = queryset.filter(price__gte=min_price)
        if max_price:
            queryset = queryset.filter(price__lte=max_price)

        # Property type filter
        property_type = self.request.query_params.get("type", None)
        if property_type:
            queryset = queryset.filter(property_type=property_type)

        # Bedrooms filter
        bedrooms = self.request.query_params.get("bedrooms", None)
        if bedrooms:
            queryset = queryset.filter(bedrooms=bedrooms)

        return queryset.order_by("-created_at")


class UserRecommendationsView(generics.ListAPIView):
    serializer_class = PropertyListSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # For now, return featured properties
        # Later you can implement recommendation logic based on user behavior
        return Property.objects.filter(
            is_featured=True, is_verified=True, status="available"
        )[:6]


class PropertyImageDeleteView(generics.DestroyAPIView):
    """Delete a PropertyImage by PK. Only property owner (agent) or staff may delete."""

    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return PropertyImage.objects.all()

    def perform_destroy(self, instance):
        user = self.request.user
        if (
            instance.property.agent
            and instance.property.agent != user
            and not user.is_staff
        ):
            from rest_framework.exceptions import PermissionDenied

            raise PermissionDenied("You do not have permission to delete this image.")
        instance.delete()


class ManagementPropertyListView(generics.ListAPIView):
    serializer_class = PropertyListSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_class = PropertyFilter

    def get_queryset(self):
        if self.request.user.user_type != "management":
            return Property.objects.none()

        # Return ALL properties for management, ordered by verification status (unverified first) then date
        return Property.objects.all().order_by("is_verified", "-created_at")


class ManagementPropertyDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = PropertyDetailSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.user_type != "management":
            return Property.objects.none()
        return Property.objects.all()


class ApprovePropertyView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        if request.user.user_type != "management":
            return Response(
                {"detail": "Permission denied"}, status=status.HTTP_403_FORBIDDEN
            )
        try:
            prop = Property.objects.get(pk=pk)
            prop.is_verified = True
            prop.save()
            return Response({"status": "property approved"})
        except Property.DoesNotExist:
            return Response(
                {"detail": "Property not found"}, status=status.HTTP_404_NOT_FOUND
            )


class RejectPropertyView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        if request.user.user_type != "management":
            return Response(
                {"detail": "Permission denied"}, status=status.HTTP_403_FORBIDDEN
            )
        try:
            prop = Property.objects.get(pk=pk)
            prop.is_verified = False
            prop.save()
            return Response({"status": "property rejected"})
        except Property.DoesNotExist:
            return Response(
                {"detail": "Property not found"}, status=status.HTTP_404_NOT_FOUND
            )


class ToggleFeaturedPropertyView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        if request.user.user_type != "management":
            return Response(
                {"detail": "Permission denied"}, status=status.HTTP_403_FORBIDDEN
            )
        try:
            prop = Property.objects.get(pk=pk)
            prop.is_featured = not prop.is_featured
            prop.save()
            return Response(
                {"status": "featured toggled", "is_featured": prop.is_featured}
            )
        except Property.DoesNotExist:
            return Response(
                {"detail": "Property not found"}, status=status.HTTP_404_NOT_FOUND
            )
