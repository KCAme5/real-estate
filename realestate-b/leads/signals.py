from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver
from django.db.models import Count
from django.contrib.auth import get_user_model
from .models import Lead, LeadStatusLog, LeadActivity, Conversation

User = get_user_model()


# ─── Auto-assignment & conversation creation on lead creation ───────────────


@receiver(post_save, sender=Lead)
def on_lead_created(sender, instance, created, **kwargs):
    """
    Fires once when a new Lead is created.
    1. Auto-assigns to least-busy agent if none provided
    2. Creates a linked Conversation so messaging works immediately
    3. Fires a notification to the assigned agent
    """
    if not created:
        return

    # 1. Auto-assign agent (round-robin by least assigned leads)
    if not instance.agent:
        # Prefer the property's own agent first
        if instance.property and instance.property.agent:
            agent_user = instance.property.agent.user  # adjust if agent FK differs
            Lead.objects.filter(pk=instance.pk).update(agent=agent_user)
            instance.agent = agent_user
        else:
            # Fall back to least-busy agent
            available = (
                User.objects.filter(user_type="agent")
                .annotate(lead_count=Count("assigned_leads"))
                .order_by("lead_count")
            )
            if available.exists():
                agent_user = available.first()
                Lead.objects.filter(pk=instance.pk).update(agent=agent_user)
                instance.agent = agent_user

    # 2. Auto-create Conversation if a user and agent are both present
    if instance.agent and instance.user:
        Conversation.objects.get_or_create(
            client=instance.user,
            agent=instance.agent,
            property=instance.property,
            defaults={"lead": instance},
        )

    # 3. Notify agent — import here to avoid circular imports
    try:
        from notifications.utils import notify_agent_new_lead

        notify_agent_new_lead(instance)
    except ImportError:
        pass


# ─── Status change logging ───────────────────────────────────────────────────


@receiver(pre_save, sender=Lead)
def capture_status_before_change(sender, instance, **kwargs):
    """
    Store the current status on the instance before it's overwritten.
    We read this in the post_save to know what it changed FROM.
    """
    if instance.pk:
        try:
            instance._previous_status = Lead.objects.get(pk=instance.pk).status
        except Lead.DoesNotExist:
            instance._previous_status = None
    else:
        instance._previous_status = None


@receiver(post_save, sender=Lead)
def log_status_change(sender, instance, created, **kwargs):
    """
    On every save, if status changed, write to LeadStatusLog
    and create a LeadActivity entry for the timeline.
    """
    if created:
        return

    previous = getattr(instance, "_previous_status", None)
    if previous and previous != instance.status:
        LeadStatusLog.objects.create(
            lead=instance,
            from_status=previous,
            to_status=instance.status,
            changed_by=getattr(instance, "_changed_by", None),
        )
        LeadActivity.objects.create(
            lead=instance,
            activity_type="status_change",
            description=f"Status changed from {previous} to {instance.status}",
            agent=getattr(instance, "_changed_by", None) or instance.agent,
        )
