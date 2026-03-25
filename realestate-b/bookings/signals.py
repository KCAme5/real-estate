from django.db.models.signals import post_save
from django.dispatch import receiver
from django.core.mail import send_mail
from django.conf import settings
from .models import Booking
from leads.models import Lead


@receiver(post_save, sender=Booking)
def send_booking_notification(sender, instance, created, **kwargs):
    if created:
        # Send email to agent
        subject = f"New Booking Request: {instance.property.title}"
        message = f"""
        You have a new booking request from {instance.client.get_full_name()}.
        
        Property: {instance.property.title}
        Date: {instance.date}
        Duration: {instance.duration} minutes
        Client Notes: {instance.client_notes or 'None'}
        
        Please log in to your dashboard to confirm or decline this booking.
        """

        send_mail(
            subject,
            message,
            settings.DEFAULT_FROM_EMAIL,
            [instance.agent.email],
            fail_silently=True,
        )

        # Send confirmation email to client
        client_subject = f"Booking Request Confirmed: {instance.property.title}"
        client_message = f"""
        Thank you for your booking request!
        
        Property: {instance.property.title}
        Date: {instance.date}
        Duration: {instance.duration} minutes
        Agent: {instance.agent.get_full_name()}
        
        Your agent will review your request and confirm the appointment soon.
        """

        send_mail(
            client_subject,
            client_message,
            settings.DEFAULT_FROM_EMAIL,
            [instance.client.email],
            fail_silently=True,
        )

        # Create a Lead for the agent
        try:
            Lead.objects.get_or_create(
                property=instance.property,
                agent=instance.agent,
                email=instance.client.email,
                defaults={
                    'first_name': instance.client.first_name or instance.client.username,
                    'last_name': instance.client.last_name or "",
                    'phone': getattr(instance.client, 'phone_number', "") or "",
                    'source': 'website',
                    'status': 'new',
                    'notes': f"Automated lead from booking request. Client Notes: {instance.client_notes}"
                }
            )
        except Exception as e:
            # We don't want to crash the booking if lead creation fails
            print(f"Error creating lead from booking: {e}")
