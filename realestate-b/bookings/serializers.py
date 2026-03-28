from rest_framework import serializers
from django.utils import timezone
from .models import Booking
from leads.models import Lead


class BookingSerializer(serializers.ModelSerializer):
    property_title = serializers.CharField(source="property.title", read_only=True)
    property_image = serializers.SerializerMethodField()
    property_price = serializers.DecimalField(
        source="property.price", max_digits=12, decimal_places=2, read_only=True
    )
    property_location = serializers.CharField(
        source="property.location", read_only=True
    )
    client_name = serializers.CharField(source="client.get_full_name", read_only=True)
    client_email = serializers.EmailField(source="client.email", read_only=True)
    client_phone = serializers.CharField(source="client.phone_number", read_only=True)
    agent_name = serializers.CharField(source="agent.get_full_name", read_only=True)
    agent_email = serializers.EmailField(source="agent.email", read_only=True)
    agent_phone = serializers.CharField(source="agent.phone_number", read_only=True)
    booking_date = serializers.SerializerMethodField()
    booking_time = serializers.SerializerMethodField()

    class Meta:
        model = Booking
        fields = [
            "id",
            "property",
            "property_title",
            "property_image",
            "property_price",
            "property_location",
            "client",
            "client_name",
            "client_email",
            "client_phone",
            "agent",
            "agent_name",
            "agent_email",
            "agent_phone",
            "date",
            "booking_date",
            "booking_time",
            "duration",
            "status",
            "client_notes",
            "agent_notes",
            "created_at",
            "updated_at",
        ]

    def get_booking_date(self, obj):
        return obj.date.date().isoformat() if obj.date else None

    def get_booking_time(self, obj):
        return obj.date.time().strftime("%H:%M") if obj.date else None

    def get_property_image(self, obj):
        # FIX: Handle both string URLs and ImageField objects
        main_image = obj.property.main_image

        if not main_image:
            return None

        # If it's already a string (URL), return it directly
        if isinstance(main_image, str):
            return main_image

        # If it's an ImageField, get the URL
        try:
            return main_image.url
        except AttributeError:
            return None


class BookingCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Booking
        fields = ["property", "date", "duration", "client_notes", "lead"]

    def validate(self, data):
        property_obj = data["property"]
        lead_obj = data.get("lead")

        if lead_obj is not None and not isinstance(lead_obj, Lead):
            raise serializers.ValidationError({"lead": "Invalid lead."})

        request = self.context.get("request")
        if request and lead_obj and lead_obj.user and lead_obj.user != request.user:
            raise serializers.ValidationError({"lead": "Lead does not belong to the authenticated user."})

        # Check if the property exists
        if not property_obj:
            raise serializers.ValidationError("Selected property does not exist.")

        # Check if the date is in the future
        if data["date"] <= timezone.now():
            raise serializers.ValidationError("Booking date must be in the future.")

        return data
