from django.core.management.base import BaseCommand
from accounts.models import CustomUser
from agents.models import AgentProfile


class Command(BaseCommand):
    help = 'Seeds the database with mock agent data'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('Starting to seed agents...'))

        # Clear existing agents
        AgentProfile.objects.all().delete()
        CustomUser.objects.filter(user_type='agent').delete()

        # Create Agent 1
        user1 = CustomUser.objects.create_user(
            username='john_doe_agent',
            email='john.doe@kenyaprime.com',
            password='password123',
            first_name='John',
            last_name='Doe',
            user_type='agent',
            phone_number='+254712345678',
            is_verified=True
        )

        agent1 = AgentProfile.objects.create(
            user=user1,
            bio='Experienced real estate agent with over 10 years in the Kenyan property market. Specializing in residential and commercial properties in Nairobi and surrounding areas. I have a proven track record of helping clients find their dream homes and make profitable investments.',
            license_number='REA/12345/2024',
            years_of_experience=10,
            specialties=['Residential', 'Commercial', 'Luxury Homes'],
            office_address='ABC Plaza, Waiyaki Way, Westlands, Nairobi',
            whatsapp_number='+254712345678',
            total_properties_sold=45,
            average_rating=4.8,
            is_verified=True,
            facebook_url='https://facebook.com/johndoeagent',
            linkedin_url='https://linkedin.com/in/johndoe'
        )

        self.stdout.write(self.style.SUCCESS(f'✓ Created agent: {user1.get_full_name()}'))

        # Create Agent 2
        user2 = CustomUser.objects.create_user(
            username='sarah_johnson',
            email='sarah.johnson@kenyaprime.com',
            password='password123',
            first_name='Sarah',
            last_name='Johnson',
            user_type='agent',
            phone_number='+254723456789',
            is_verified=True
        )

        agent2 = AgentProfile.objects.create(
            user=user2,
            bio='Passionate about helping diaspora clients invest in Kenyan real estate. Expert in land and investment properties with a focus on prime locations across Kenya. I provide end-to-end support from property search to legal documentation.',
            license_number='REA/23456/2024',
            years_of_experience=7,
            specialties=['Land', 'Investment Properties', 'Diaspora Services'],
            office_address='Delta Towers, Westlands Road, Nairobi',
            whatsapp_number='+254723456789',
            total_properties_sold=32,
            average_rating=4.9,
            is_verified=True,
            twitter_url='https://twitter.com/sarahjohnson',
            instagram_url='https://instagram.com/sarahj_realestate'
        )

        self.stdout.write(self.style.SUCCESS(f'✓ Created agent: {user2.get_full_name()}'))

        # Create Agent 3
        user3 = CustomUser.objects.create_user(
            username='david_kamau',
            email='david.kamau@kenyaprime.com',
            password='password123',
            first_name='David',
            last_name='Kamau',
            user_type='agent',
            phone_number='+254734567890',
            is_verified=True
        )

        agent3 = AgentProfile.objects.create(
            user=user3,
            bio='Specialist in coastal properties with extensive knowledge of Mombasa, Diani, and Malindi areas. Whether you are looking for a beachfront villa or a commercial property, I can help you find the perfect investment opportunity.',
            license_number='REA/34567/2024',
            years_of_experience=5,
            specialties=['Coastal Properties', 'Vacation Homes', 'Commercial'],
            office_address='Mombasa Road, Nyali, Mombasa',
            whatsapp_number='+254734567890',
            total_properties_sold=28,
            average_rating=4.7,
            is_verified=True,
            linkedin_url='https://linkedin.com/in/davidkamau'
        )

        self.stdout.write(self.style.SUCCESS(f'✓ Created agent: {user3.get_full_name()}'))

        # Create Agent 4
        user4 = CustomUser.objects.create_user(
            username='grace_wanjiru',
            email='grace.wanjiru@kenyaprime.com',
            password='password123',
            first_name='Grace',
            last_name='Wanjiru',
            user_type='agent',
            phone_number='+254745678901',
            is_verified=True
        )

        agent4 = AgentProfile.objects.create(
            user=user4,
            bio='Award-winning agent specializing in luxury properties and estates in Karen, Runda, and Muthaiga. With a keen eye for detail and excellent negotiation skills, I ensure my clients get the best deals in the high-end property market.',
            license_number='REA/45678/2024',
            years_of_experience=12,
            specialties=['Luxury Homes', 'Estates', 'High-End Properties'],
            office_address='The Hub, Karen, Nairobi',
            whatsapp_number='+254745678901',
            total_properties_sold=67,
            average_rating=5.0,
            is_verified=True,
            facebook_url='https://facebook.com/gracewanjiruagent',
            instagram_url='https://instagram.com/gracew_luxury'
        )

        self.stdout.write(self.style.SUCCESS(f'✓ Created agent: {user4.get_full_name()}'))

        # Create Agent 5
        user5 = CustomUser.objects.create_user(
            username='james_mwangi',
            email='james.mwangi@kenyaprime.com',
            password='password123',
            first_name='James',
            last_name='Mwangi',
            user_type='agent',
            phone_number='+254756789012',
            is_verified=True
        )

        agent5 = AgentProfile.objects.create(
            user=user5,
            bio='First-time buyer specialist with a commitment to making property ownership accessible. I guide young professionals and families through every step of the home-buying process with patience and expertise.',
            license_number='REA/56789/2024',
            years_of_experience=4,
            specialties=['First-Time Buyers', 'Affordable Housing', 'Residential'],
            office_address='Thika Road Mall, Kasarani, Nairobi',
            whatsapp_number='+254756789012',
            total_properties_sold=21,
            average_rating=4.6,
            is_verified=True,
            twitter_url='https://twitter.com/jamesmwangi_re'
        )

        self.stdout.write(self.style.SUCCESS(f'✓ Created agent: {user5.get_full_name()}'))

        # Create Agent 6 (unverified)
        user6 = CustomUser.objects.create_user(
            username='alice_nyambura',
            email='alice.nyambura@kenyaprime.com',
            password='password123',
            first_name='Alice',
            last_name='Nyambura',
            user_type='agent',
            phone_number='+254767890123',
            is_verified=False
        )

        agent6 = AgentProfile.objects.create(
            user=user6,
            bio='New to the real estate industry but eager to help clients find their ideal properties. Currently working on verification and building my portfolio.',
            license_number='REA/67890/2024',
            years_of_experience=1,
            specialties=['Residential', 'Rentals'],
            office_address='CBD, Nairobi',
            whatsapp_number='+254767890123',
            total_properties_sold=3,
            average_rating=4.2,
            is_verified=False
        )

        self.stdout.write(self.style.WARNING(f'⚠ Created unverified agent: {user6.get_full_name()}'))

        self.stdout.write(self.style.SUCCESS('\n✅ Successfully seeded 6 agents!'))
        self.stdout.write(self.style.SUCCESS('Note: Only verified agents will show on the public listing.'))
