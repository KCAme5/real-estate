#!/usr/bin/env python
import os
import sys
import django

# Setup Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "realestate.settings")
django.setup()

from properties.models import Property
from agents.models import AgentProfile
from django.contrib.auth import get_user_model

User = get_user_model()

print("=== FINDING DUKE USER ===")

# Find user with username 'duke' or similar
duke_users = User.objects.filter(username__icontains="duke")
print(f"Users with duke in username: {duke_users.count()}")
for user in duke_users:
    print(
        f"ID: {user.id}, Username: {user.username}, Email: {user.email}, User Type: {user.user_type}"
    )

# Also check all agent users
agent_users = User.objects.filter(user_type="agent")
print(f"\nAll agent users:")
for user in agent_users:
    print(f"ID: {user.id}, Username: {user.username}, Email: {user.email}")

print("\n=== CURRENT PROPERTY ASSIGNMENTS ===")
# Check properties and their agents
properties = Property.objects.all()
print(f"Total properties: {properties.count()}")

for prop in properties:
    print(f"Property ID: {prop.id}, Title: {prop.title}, Agent ID: {prop.agent_id}")
    if prop.agent:
        print(f"  -> Agent Username: {prop.agent.username}, Email: {prop.agent.email}")
    else:
        print("  -> No agent assigned")

print("\n=== LOOKING FOR USER ID 22 ===")
# Check what happened to user ID 22
try:
    user_22 = User.objects.get(id=22)
    print(
        f"User ID 22: {user_22.username}, Email: {user_22.email}, Type: {user_22.user_type}"
    )
except User.DoesNotExist:
    print("User ID 22 does not exist")

# Check if there's a user with username containing 'duke'
duke_user = User.objects.filter(username__icontains="duke").first()
if duke_user:
    print(f"\nFound Duke user: ID {duke_user.id}, Username: {duke_user.username}")
    print(f"Updating all properties to use Duke (ID: {duke_user.id})")
    updated = Property.objects.all().update(agent_id=duke_user.id)
    print(f"Updated {updated} properties to use Duke")
else:
    print('\nNo user found with "duke" in username')
