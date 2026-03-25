from django.db.models.signals import post_save
from django.dispatch import receiver
from django.apps import apps
from .models import CustomUser

@receiver(post_save, sender=CustomUser)
def sync_agent_verification(sender, instance, **kwargs):
    """
    Sync is_verified status from CustomUser to AgentProfile
    """
    # Avoid recursion: check if we are already in a sync operation
    if getattr(instance, '_syncing_verification', False):
        return

    if instance.user_type == 'agent':
        try:
            AgentProfile = apps.get_model('agents', 'AgentProfile')
            # Use filter().first() to avoid DoesNotExist exception during initial creation
            profile = AgentProfile.objects.filter(user=instance).first()
            if profile and profile.is_verified != instance.is_verified:
                profile._syncing_verification = True
                profile.is_verified = instance.is_verified
                profile.save(update_fields=['is_verified'])
                del profile._syncing_verification
        except (LookupError):
            pass
