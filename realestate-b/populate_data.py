import os
import django
import random

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'realestate.settings')
django.setup()

from django.contrib.auth import get_user_model
from agents.models import AgentProfile
from properties.models import Property, Location, PropertyImage

User = get_user_model()

def populate():
    # 1. Create Agents if they don't exist
    agent_data = [
        {"username": "agent_sarah", "first_name": "Sarah", "last_name": "Jenkins", "email": "sarah@realestate.com", "phone": "+254712345678"},
        {"username": "agent_mike", "first_name": "Mike", "last_name": "Ross", "email": "mike@realestate.com", "phone": "+254722334455"},
        {"username": "agent_elena", "first_name": "Elena", "last_name": "Gilbert", "email": "elena@realestate.com", "phone": "+254733112233"}
    ]

    agents = []
    for data in agent_data:
        user, created = User.objects.get_or_create(
            username=data["username"],
            defaults={
                "first_name": data["first_name"],
                "last_name": data["last_name"],
                "email": data["email"],
                "phone_number": data["phone"],
                "user_type": "agent"
            }
        )
        if created:
            user.set_password("password123")
            user.save()
        
        profile, p_created = AgentProfile.objects.get_or_create(
            user=user,
            defaults={
                "bio": f"Experienced real estate agent specializing in luxury properties. {data['first_name']} has over 10 years of experience in the market.",
                "license_number": f"RE-{random.randint(1000, 9999)}",
                "years_of_experience": random.randint(3, 15),
                "is_verified": True,
                "whatsapp_number": data["phone"]
            }
        )
        agents.append(user)

    # 2. Assign agents to existing properties that don't have one
    existing_properties = Property.objects.filter(agent__isnull=True)
    for p in existing_properties:
        p.agent = random.choice(agents)
        p.save()
        print(f"Assigned {p.agent.username} to {p.title}")

    # 3. Add more properties
    locations = list(Location.objects.all())
    if not locations:
        print("No locations found. Please create locations first.")
        return

    property_titles = [
        "Modern Penthouse with City View",
        "Cozy Suburban Family Home",
        "Beachfront Luxury Villa",
        "Industrial Style Loft",
        "Secluded Mountain Cabin",
        "Elegant Victorian Manor",
        "Minimalist Studio Apartment",
        "Spacious Farmhouse with Acreage"
    ]

    types = ["apartment", "house", "villa", "land", "commercial"]
    
    for title in property_titles:
        if Property.objects.filter(title=title).exists():
            continue
            
        p = Property.objects.create(
            title=title,
            description=f"This {title} offers unparalleled comfort and style. Perfect for those seeking a premium lifestyle in a prime location. Features include modern finishes, ample natural light, and state-of-the-art amenities.",
            price=random.randint(5000000, 50000000),
            property_type=random.choice(types),
            location=random.choice(locations),
            bedrooms=random.randint(1, 6),
            bathrooms=random.randint(1, 4),
            square_feet=random.randint(800, 5000),
            address=f"{random.randint(10, 999)} Real Estate Ave",
            status="available",
            agent=random.choice(agents),
            is_featured=random.choice([True, False]),
            main_image="https://i.pinimg.com/736x/8a/8a/8a/8a8a8a8a8a8a8a8a8a8a8a8a8a8a8a8a.jpg", # Placeholder but will use Pinterest URLs
            features=["Broadband", "Swimming Pool", "Gym", "Security", "Backup Generator", "Garden"]
        )
        print(f"Created property: {p.title}")

if __name__ == "__main__":
    populate()
