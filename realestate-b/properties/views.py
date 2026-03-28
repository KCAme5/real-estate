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

    def get_serializer_context(self):
        """Pass request to serializer for is_saved check."""
        context = super().get_serializer_context()
        context.update({'request': self.request})
        return context

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

    def get_serializer_context(self):
        """Pass request to serializer for is_saved check."""
        context = super().get_serializer_context()
        context.update({'request': self.request})
        return context

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

        # Debug: Print user info
        print(
            f"User: {self.request.user.username}, Type: {self.request.user.user_type}"
        )
        print(f"Validated data: {serializer.validated_data}")

        serializer.save(agent=self.request.user)


class AgentPropertyListView(generics.ListAPIView):
    serializer_class = PropertyListSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context.update({'request': self.request})
        return context

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
    serializer = PropertyListSerializer(properties, many=True, context={'request': request})
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

    def create(self, request, *args, **kwargs):
        """Handle toggle behavior: if property is already saved, unsave it."""
        property_id = request.data.get("property")
        
        # Check if already saved
        existing = SavedProperty.objects.filter(
            user=request.user, property_id=property_id
        ).first()
        
        if existing:
            # Already saved - remove it (unsave)
            existing.delete()
            from rest_framework.response import Response
            return Response({
                "status": "unsaved",
                "message": "Property removed from saved",
                "property": property_id
            }, status=200)
        
        # Not saved - create new saved property
        return super().create(request, *args, **kwargs)

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

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context.update({'request': self.request})
        return context

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

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context.update({'request': self.request})
        return context

    def get_queryset(self):
        """
        Personalized property recommendations based on:
        1. User's saved properties (location, property_type preferences)
        2. User's lead preferences (budget, locations, property types)
        3. Fallback to featured properties for new users
        """
        user = self.request.user
        
        # Import models here to avoid circular imports
        from properties.models import SavedProperty
        from leads.models import Lead
        
        # Start with all available and verified properties
        base_qs = Property.objects.filter(
            is_verified=True,
            status="available"
        )
        
        # Get IDs of properties user has already saved (exclude these)
        saved_property_ids = SavedProperty.objects.filter(
            user=user
        ).values_list('property_id', flat=True)
        
        # Get user's lead preferences
        user_leads = Lead.objects.filter(user=user)
        
        # Extract preferences from leads
        preferred_locations = set()
        preferred_property_types = set()
        min_budget = None
        max_budget = None
        
        for lead in user_leads:
            if lead.preferred_locations:
                preferred_locations.update(lead.preferred_locations)
            if lead.property_types:
                preferred_property_types.update(lead.property_types)
            if lead.budget_min and (min_budget is None or lead.budget_min < min_budget):
                min_budget = lead.budget_min
            if lead.budget_max and (max_budget is None or lead.budget_max > max_budget):
                max_budget = lead.budget_max
        
        # Get preferences from saved properties
        saved_properties = Property.objects.filter(id__in=saved_property_ids)
        for prop in saved_properties:
            if prop.location:
                preferred_locations.add(prop.location.name)
            if prop.property_type:
                preferred_property_types.add(prop.property_type)
        
        # Build recommendation query
        recommendations = base_qs.exclude(id__in=saved_property_ids)
        
        # Apply location filter if we have preferences
        if preferred_locations:
            recommendations = recommendations.filter(
                location__name__in=list(preferred_locations)
            )
        
        # Apply property type filter if we have preferences
        if preferred_property_types:
            recommendations = recommendations.filter(
                property_type__in=list(preferred_property_types)
            )
        
        # Apply budget filter if we have preferences
        if min_budget:
            recommendations = recommendations.filter(price__gte=min_budget)
        if max_budget:
            recommendations = recommendations.filter(price__lte=max_budget)
        
        # Check if we have any recommendations
        if not recommendations.exists():
            # Fallback: return featured properties for new users
            recommendations = Property.objects.filter(
                is_featured=True,
                is_verified=True,
                status="available"
            ).exclude(id__in=saved_property_ids)
        
        # Order by featured first, then by creation date
        return recommendations.order_by('-is_featured', '-created_at')[:10]


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

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context.update({'request': self.request})
        return context

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


class PropertyValuationView(APIView):
    """
    Property Valuation API - estimates property value based on comparable properties.
    
    Algorithm: Uses average price per sqm from comparable properties in the same location.
    Formula: estimated_value = avg(price_per_sqm) * requested_size
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        # Get parameters
        location_name = request.query_params.get('location', '').strip()
        size = request.query_params.get('size')

        # Validate required parameters
        errors = {}
        if not location_name:
            errors['location'] = 'Location is required'
        if not size:
            errors['size'] = 'Property size is required'
        
        if errors:
            return Response(errors, status=status.HTTP_400_BAD_REQUEST)

        # Parse size as integer
        try:
            size = int(size)
            if size <= 0:
                return Response(
                    {'size': 'Size must be a positive number'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        except ValueError:
            return Response(
                {'size': 'Size must be a valid number'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Find comparable properties in the same location (case-insensitive)
        comparable_properties = Property.objects.filter(
            location__name__iexact=location_name,
            is_verified=True,
            status='available',
            square_feet__isnull=False,
            square_feet__gt=0
        )

        # If no comparable properties found
        if not comparable_properties.exists():
            return Response(
                {
                    'error': f'No comparable properties found in {location_name}. Cannot calculate valuation.'
                },
                status=status.HTTP_404_NOT_FOUND
            )

        # Calculate price per sqm for each property
        price_per_sqm_list = []
        for prop in comparable_properties:
            if prop.square_feet and prop.square_feet > 0:
                # Convert sqft to sqm (1 sqft = 0.092903 sqm)
                sqm = float(prop.square_feet) * 0.092903
                price_per_sqm = float(prop.price) / sqm
                price_per_sqm_list.append(price_per_sqm)

        if not price_per_sqm_list:
            return Response(
                {
                    'error': f'No properties with valid size found in {location_name}. Cannot calculate valuation.'
                },
                status=status.HTTP_404_NOT_FOUND
            )

        # Calculate average price per sqm
        avg_price_per_sqm = sum(price_per_sqm_list) / len(price_per_sqm_list)

        # Convert requested size from sqft to sqm
        requested_size_sqm = int(size) * 0.092903

        # Calculate estimated value
        estimated_value = int(avg_price_per_sqm * requested_size_sqm)

        return Response({
            'location': location_name,
            'size': size,
            'estimated_value': estimated_value,
            'price_per_sqm': round(avg_price_per_sqm, 2),
            'comparable_count': comparable_properties.count(),
            'currency': 'KES'
        })
