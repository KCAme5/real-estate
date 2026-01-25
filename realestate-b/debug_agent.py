#!/usr/bin/env python
import os
import sys
import django

# Setup Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "realestate.settings")
django.setup()

from properties.models import Property
from properties.serializers import PropertyDetailSerializer
from agents.models import AgentProfile

print("=== DEBUGGING AGENT DATA ===")

# Check properties and their agents
properties = Property.objects.all()
print(f"Total properties: {properties.count()}")

for prop in properties:
    print(f"\nProperty ID: {prop.id}")
    print(f"Property Title: {prop.title}")
    print(f"Agent ID: {prop.agent_id}")

    if prop.agent:
        print(f"Agent object: {prop.agent}")
        print(f"Agent user: {prop.agent.user}")
        if prop.agent.user:
            print(f"User username: {prop.agent.user.username}")
            print(f"User email: {prop.agent.user.email}")
            print(f"User get_full_name: {prop.agent.user.get_full_name()}")
        else:
            print("NO USER RELATIONSHIP!")
    else:
        print("NO AGENT!")

# Test serialization
print("\n=== SERIALIZATION TEST ===")
property = Property.objects.first()
if property:
    serializer = PropertyDetailSerializer(property)
    data = serializer.data
    print(f"Serialized agent data: {data['agent']}")
else:
    print("No properties found")

print("\n=== ALL AGENT PROFILES ===")
agents = AgentProfile.objects.all()
for agent in agents:
    print(f"Agent ID: {agent.id}, User ID: {agent.user_id}, User: {agent.user}")
