# realestate_backend/properties/serializers.py
from rest_framework import serializers
from django.core.files.storage import default_storage
from django.conf import settings
from .models import Property, Location, PropertyImage, SavedProperty


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
    agent_name = serializers.CharField(source="agent.get_full_name", read_only=True)
    main_image_url = serializers.URLField(source="main_image", read_only=True)

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
            "bedrooms",
            "bathrooms",
            "square_feet",
            "main_image",
            "main_image_url",
            "is_featured",
            "agent_name",
        )


class PropertyDetailSerializer(serializers.ModelSerializer):
    location = LocationSerializer(read_only=True)
    agent_name = serializers.CharField(source="agent.get_full_name", read_only=True)
    agent_phone = serializers.CharField(source="agent.phone_number", read_only=True)
    agent_profile_id = serializers.IntegerField(source="agent.agent_profile.id", read_only=True)
    gallery = PropertyImageSerializer(
        many=True, read_only=True, source="property_images"
    )
    main_image_url = serializers.URLField(source="main_image", read_only=True)

    class Meta:
        model = Property
        fields = "__all__"
        extra_kwargs = {"main_image": {"required": False, "allow_null": True}}


class PropertyCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Property
        exclude = ("slug", "price_display", "views", "is_verified")
        extra_kwargs = {
            "main_image": {"required": False, "allow_null": True},
            "images": {"required": False, "allow_null": True},
        }

    def create(self, validated_data):
        request = self.context.get("request")
        # Handle uploaded main_image in request.FILES and store to default storage
        if request and request.FILES.get("main_image"):
            f = request.FILES["main_image"]
            # Save file to MEDIA using default storage
            filename = default_storage.save(f"properties/{f.name}", f)
            try:
                url = default_storage.url(filename)
            except Exception:
                # Fallback to MEDIA_URL + filename
                url = settings.MEDIA_URL + filename
            validated_data["main_image"] = url

        prop = Property.objects.create(**validated_data)

        # Handle multiple images uploaded under 'images'
        if request:
            files = request.FILES.getlist("images")
            for f in files:
                filename = default_storage.save(f"properties/{f.name}", f)
                try:
                    url = default_storage.url(filename)
                except Exception:
                    url = settings.MEDIA_URL + filename
                PropertyImage.objects.create(property=prop, image=url)

        return prop

    def update(self, instance, validated_data):
        request = self.context.get("request")
        if request and request.FILES.get("main_image"):
            f = request.FILES["main_image"]
            filename = default_storage.save(f"properties/{f.name}", f)
            try:
                url = default_storage.url(filename)
            except Exception:
                url = settings.MEDIA_URL + filename
            validated_data["main_image"] = url

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
                PropertyImage.objects.create(property=prop, image=url)

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
