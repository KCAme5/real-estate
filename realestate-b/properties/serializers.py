# realestate_backend/properties/serializers.py
from rest_framework import serializers
from django.core.files.storage import default_storage
from django.conf import settings
from .models import Property, Location, PropertyImage, SavedProperty
from agents.serializers import AgentCompactSerializer


class LocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Location
        fields = "__all__"


class PropertyImageSerializer(serializers.ModelSerializer):
    image_url = serializers.URLField(source="image", read_only=True)

    class Meta:
        model = PropertyImage
        fields = ["id", "image", "image_url", "is_primary", "caption", "created_at"]
        extra_kwargs = {"image": {"required": False, "allow_null": True}}


class PropertyListSerializer(serializers.ModelSerializer):
    location = LocationSerializer(read_only=True)
    agent = AgentCompactSerializer(read_only=True)
    agent_name = serializers.CharField(source="agent.get_full_name", read_only=True)
    main_image_url = serializers.URLField(source="main_image", read_only=True)
    verification_status = serializers.SerializerMethodField()
    location_name = serializers.CharField(read_only=True)
    created_at = serializers.DateTimeField(read_only=True)

    class Meta:
        model = Property
        fields = (
            "id",
            "title",
            "slug",
            "property_type",
            "price",
            "currency",
            "price_display",
            "location",
            "location_name",
            "bedrooms",
            "bathrooms",
            "square_feet",
            "main_image",
            "main_image_url",
            "is_featured",
            "listing_type",
            "is_development",
            "agent",
            "agent_name",
            "verification_status",
            "created_at",
        )

    def get_verification_status(self, obj):
        # We don't have a specific 'rejected' status in model yet, but
        # let's assume is_verified=False is pending for now.
        # If we need 'rejected', we might need a Status field in the model.
        # For now let's map is_verified to 'verified'/'pending'
        return "verified" if obj.is_verified else "pending"


class PropertyDetailSerializer(serializers.ModelSerializer):
    location = LocationSerializer(read_only=True)
    agent = AgentCompactSerializer(read_only=True)
    gallery = PropertyImageSerializer(
        many=True, read_only=True, source="property_images"
    )
    main_image_url = serializers.URLField(source="main_image", read_only=True)
    verification_status = serializers.SerializerMethodField()
    location_name = serializers.CharField(read_only=True)
    created_at = serializers.DateTimeField(read_only=True)

    class Meta:
        model = Property
        fields = "__all__"

    def get_verification_status(self, obj):
        return "verified" if obj.is_verified else "pending"
        extra_kwargs = {"main_image": {"required": False, "allow_null": True}}


class PropertyCreateSerializer(serializers.ModelSerializer):
    image_urls = serializers.ListField(
        child=serializers.URLField(),
        required=False,
        allow_null=True,
        write_only=True,
        help_text="List of image URLs from external sources",
    )

    features = serializers.JSONField(
        required=False, allow_null=True, help_text="List of property features"
    )

    location_name = serializers.CharField(
        required=False,
        allow_blank=True,
        allow_null=True,
        max_length=200,
        help_text="Free-form location name",
    )

    class Meta:
        model = Property
        exclude = ("slug", "price_display", "views", "is_verified")
        extra_kwargs = {
            "main_image": {"required": False, "allow_null": True},
            "images": {"required": False, "allow_null": True},
            "location": {"required": False, "allow_null": True},
            "description": {"required": False, "allow_blank": True},
            "property_type": {"required": False, "allow_blank": True},
            "bedrooms": {"required": False, "allow_null": True},
            "bathrooms": {"required": False, "allow_null": True},
            "square_feet": {"required": False, "allow_null": True},
            "address": {"required": False, "allow_blank": True},
            "latitude": {"required": False, "allow_null": True},
            "longitude": {"required": False, "allow_null": True},
            "year_built": {"required": False, "allow_null": True},
            "plot_size": {"required": False, "allow_null": True},
            "video_url": {"required": False, "allow_blank": True},
            "owner_name": {"required": False, "allow_blank": True},
            "owner_phone": {"required": False, "allow_blank": True},
        }

    def to_internal_value(self, data):
        # Handle features field that comes as JSON string from FormData
        if "features" in data and isinstance(data["features"], str):
            try:
                import json

                data["features"] = json.loads(data["features"])
            except (json.JSONDecodeError, ValueError):
                data["features"] = []

        return super().to_internal_value(data)

    def validate(self, attrs):
        # Ensure at least title and price are provided
        if not attrs.get("title"):
            raise serializers.ValidationError("Title is required")
        if not attrs.get("price"):
            raise serializers.ValidationError("Price is required")

        return attrs

    def create(self, validated_data):
        request = self.context.get("request")
        image_urls = validated_data.pop("image_urls", [])

        try:
            # Handle main_image file upload
            if request and request.FILES.get("main_image"):
                f = request.FILES["main_image"]
                filename = default_storage.save(f"properties/{f.name}", f)
                try:
                    url = default_storage.url(filename)
                except Exception:
                    url = settings.MEDIA_URL + filename
                validated_data["main_image"] = url
            elif image_urls:
                # Use first URL as main image if no file uploaded
                validated_data["main_image"] = image_urls[0]

            validated_data.setdefault("property_type", "apartment")
            validated_data.setdefault("description", validated_data.get("title", ""))
            validated_data.setdefault("listing_type", "sale")
            validated_data.setdefault("currency", "KES")

            # Create property
            prop = Property.objects.create(**validated_data)

            # Handle multiple images from files
            if request:
                files = request.FILES.getlist("images")
                for f in files:
                    filename = default_storage.save(f"properties/{f.name}", f)
                    try:
                        url = default_storage.url(filename)
                    except Exception:
                        url = settings.MEDIA_URL + filename
                    PropertyImage.objects.create(
                        property=prop, image=url, is_primary=False
                    )

            # Handle image URLs
            if image_urls:
                for i, url in enumerate(image_urls):
                    PropertyImage.objects.create(
                        property=prop,
                        image=url,
                        is_primary=(i == 0 and not validated_data.get("main_image")),
                    )

            return prop
        except Exception as e:
            print(f"Error creating property: {str(e)}")
            raise serializers.ValidationError(f"Failed to create property: {str(e)}")

    def update(self, instance, validated_data):
        request = self.context.get("request")
        image_urls = validated_data.pop("image_urls", [])

        # Handle location updates
        location_data = validated_data.pop("location", None)
        if location_data:
            if isinstance(location_data, str):
                # Create new location from string
                location, created = Location.objects.get_or_create(
                    name=location_data.strip(),
                    defaults={
                        "county": "Unknown",
                        "slug": location_data.lower()
                        .replace(" ", "-")
                        .replace("/", "-")[:50],
                    },
                )
                validated_data["location"] = location
            elif isinstance(location_data, int):
                # Get existing location by ID
                try:
                    location = Location.objects.get(id=location_data)
                    validated_data["location"] = location
                except Location.DoesNotExist:
                    raise serializers.ValidationError(
                        f"Location with ID {location_data} not found"
                    )

        # Handle main_image file upload
        if request and request.FILES.get("main_image"):
            f = request.FILES["main_image"]
            filename = default_storage.save(f"properties/{f.name}", f)
            try:
                url = default_storage.url(filename)
            except Exception:
                url = settings.MEDIA_URL + filename
            validated_data["main_image"] = url
        elif image_urls:
            # Use first URL as main image if no file uploaded
            validated_data["main_image"] = image_urls[0]

        prop = super().update(instance, validated_data)

        # Handle additional uploaded images on update
        if request:
            files = request.FILES.getlist("images")
            for f in files:
                filename = default_storage.save(f"properties/{f.name}", f)
                try:
                    url = default_storage.url(filename)
                except Exception:
                    url = settings.MEDIA_URL + filename
                PropertyImage.objects.create(property=prop, image=url, is_primary=False)

        # Handle image URLs on update
        if image_urls:
            for i, url in enumerate(image_urls):
                PropertyImage.objects.create(
                    property=prop,
                    image=url,
                    is_primary=(i == 0 and not validated_data.get("main_image")),
                )

        return prop


class SavedPropertySerializer(serializers.ModelSerializer):
    property = PropertyListSerializer(read_only=True)

    class Meta:
        model = SavedProperty
        fields = ["id", "property", "saved_at", "notes"]


class SavedPropertyCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = SavedProperty
        fields = ["property", "notes"]


class PropertySearchSerializer(serializers.ModelSerializer):
    location = LocationSerializer(read_only=True)
    main_image_url = serializers.URLField(source="main_image", read_only=True)

    class Meta:
        model = Property
        fields = [
            "id",
            "title",
            "slug",
            "property_type",
            "price",
            "price_display",
            "location",
            "bedrooms",
            "bathrooms",
            "main_image",
            "main_image_url",
            "is_featured",
        ]
