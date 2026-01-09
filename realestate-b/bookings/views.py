from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied
from django.utils import timezone
from datetime import datetime, timedelta
from django.db import models
from .models import Booking
from .serializers import BookingSerializer, BookingCreateSerializer


class BookingListView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.request.method == "POST":
            return BookingCreateSerializer
        return BookingSerializer

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
        serializer.save(client=self.request.user)


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
