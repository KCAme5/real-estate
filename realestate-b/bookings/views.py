from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied
from rest_framework.exceptions import ValidationError
from django.utils import timezone
from datetime import datetime, timedelta
from django.db import models
from .models import Booking
from .serializers import BookingSerializer, BookingCreateSerializer
from leads.models import Lead


class BookingListView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.request.method == "POST":
            return BookingCreateSerializer
        return BookingSerializer

    def create(self, request, *args, **kwargs):
        # Check permission BEFORE validation
        if request.user.user_type != "client":
            return Response(
                {"detail": "Only clients can create bookings"},
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        booking = serializer.instance
        output = BookingSerializer(booking, context={"request": request}).data
        return Response(output, status=status.HTTP_201_CREATED)

    def get_queryset(self):
        user = self.request.user
        if user.user_type == "client":
            return Booking.objects.filter(client=user)
        elif user.user_type == "agent":
            return Booking.objects.filter(agent=user)
        return Booking.objects.none()

    def perform_create(self, serializer):
        if self.request.user.user_type != "client":
            raise PermissionDenied("Only clients can create bookings")
        
        # Get the lead and agent from it
        lead = serializer.validated_data.get("lead")
        agent = None
        
        if lead:
            agent = lead.agent
        
        # If no agent from lead, get from property
        if not agent:
            property_obj = serializer.validated_data.get("property")
            if property_obj and hasattr(property_obj, "agent") and property_obj.agent:
                agent = property_obj.agent
        
        # If still no agent, get least-busy agent
        if not agent:
            from django.contrib.auth import get_user_model
            User = get_user_model()
            from django.db.models import Count
            
            agent = (
                User.objects.filter(user_type="agent")
                .annotate(booking_count=Count("agent_bookings"))
                .order_by("booking_count")
                .first()
            )

        if not agent:
            raise ValidationError({"agent": "No available agent found for this booking."})

        # Auto-create a lead when booking comes directly from property detail (no lead provided).
        if not lead:
            user = self.request.user
            property_obj = serializer.validated_data.get("property")
            lead = Lead.objects.create(
                user=user,
                first_name=getattr(user, "first_name", "") or "",
                last_name=getattr(user, "last_name", "") or "",
                email=getattr(user, "email", "") or "",
                phone=getattr(user, "phone_number", "") or "",
                source="book_viewing",
                status="viewing",
                property=property_obj,
                agent=agent,
            )

        requested_start = serializer.validated_data["date"]
        duration = serializer.validated_data.get("duration") or 30
        requested_end = requested_start + timedelta(minutes=duration)

        candidates = Booking.objects.filter(
            agent=agent,
            status__in=["pending", "confirmed"],
            date__lt=requested_end,
            date__gt=requested_start - timedelta(hours=24),
        ).only("date", "duration", "status")

        for existing in candidates:
            existing_end = existing.date + timedelta(minutes=existing.duration)
            if existing.date < requested_end and existing_end > requested_start:
                raise ValidationError({"date": "Agent is not available for the selected time slot."})

        serializer.save(client=self.request.user, agent=agent, lead=lead)


class BookingDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.user_type == "client":
            return Booking.objects.filter(client=user)
        elif user.user_type == "agent":
            return Booking.objects.filter(agent=user)
        return Booking.objects.none()

    def perform_update(self, serializer):
        user = self.request.user
        instance = self.get_object()

        if user.user_type == "agent" and "status" in serializer.validated_data:
            # Agents can only update status and agent_notes
            allowed_fields = ["status", "agent_notes"]
            for field in serializer.validated_data:
                if field not in allowed_fields:
                    raise PermissionDenied(f"Cannot update {field}")

        serializer.save()


@api_view(["GET"])
@permission_classes([permissions.IsAuthenticated])
def booking_calendar(request):
    """Get bookings for calendar view"""
    user = request.user
    start_date = request.GET.get("start")
    end_date = request.GET.get("end")

    try:
        start = datetime.fromisoformat(start_date) if start_date else timezone.now()
        end = (
            datetime.fromisoformat(end_date)
            if end_date
            else timezone.now() + timedelta(days=30)
        )
    except ValueError:
        return Response({"error": "Invalid date format"}, status=400)

    if user.user_type == "client":
        bookings = Booking.objects.filter(client=user, date__range=[start, end])
    elif user.user_type == "agent":
        bookings = Booking.objects.filter(agent=user, date__range=[start, end])
    else:
        bookings = Booking.objects.none()

    calendar_events = []
    for booking in bookings:
        calendar_events.append(
            {
                "id": booking.id,
                "title": f"Viewing: {booking.property.title}",
                "start": booking.date.isoformat(),
                "end": (booking.date + timedelta(minutes=booking.duration)).isoformat(),
                "status": booking.status,
                "client_name": booking.client.get_full_name(),
                "property_title": booking.property.title,
            }
        )

    return Response(calendar_events)
