from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import AgentProfile

@receiver(post_save, sender=AgentProfile)
def sync_user_verification(sender, instance, **kwargs):
    """
    Sync is_verified status from AgentProfile to CustomUser
    """
    # Avoid recursion
    if getattr(instance, '_syncing_verification', False):
        return
        
    user = instance.user
    if user.is_verified != instance.is_verified:
        user._syncing_verification = True
        user.is_verified = instance.is_verified
        user.save(update_fields=['is_verified'])
        del user._syncing_verification
