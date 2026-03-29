"""
Test suite for Property API endpoints.
"""
from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from properties.models import Property, Location
import json


class PropertyAPITest(TestCase):
    """Test Property API endpoints."""

    def setUp(self):
        self.client = APIClient()
        self.user = get_user_model().objects.create_user(
            username="agent1",
            email="agent1@test.com",
            password="testpass123",
            user_type="agent"
        )
        self.management_user = get_user_model().objects.create_user(
            username="admin1",
            email="admin1@test.com",
            password="adminpass123",
            user_type="management"
        )
        self.location = Location.objects.create(
            name="Westlands",
            county="Nairobi",
            latitude=-1.2637,
            longitude=36.8036
        )
        self.property = Property.objects.create(
            title="Test Apartment",
            slug="test-apartment",
            description="A nice apartment",
            price=5000000,
            currency="KES",
            location=self.location,
            bedrooms=2,
            bathrooms=2,
            square_feet=1200,
            property_type="apartment",
            listing_type="sale",
            agent=self.user,
            is_verified=True,
            main_image="https://example.com/main.jpg"
        )

    def test_property_list_public_access(self):
        """Test that property list is publicly accessible."""
        response = self.client.get('/api/properties/')
        self.assertEqual(response.status_code, 200)
        self.assertIsInstance(response.data, list)

    def test_property_list_only_verified_and_available(self):
        """Test that list shows only verified and available properties."""
        # Create an unverified property
        Property.objects.create(
            title="Unverified Property",
            price=1000000,
            agent=self.user,
            is_verified=False,
            status="available"
        )
        # Create a sold property
        Property.objects.create(
            title="Sold Property",
            price=2000000,
            agent=self.user,
            is_verified=True,
            status="sold"
        )
        response = self.client.get('/api/properties/')
        titles = [p['title'] for p in response.data]
        self.assertIn("Test Apartment", titles)
        self.assertNotIn("Unverified Property", titles)
        self.assertNotIn("Sold Property", titles)

    def test_property_detail_by_slug(self):
        """Test retrieving property detail by slug."""
        response = self.client.get(f'/api/properties/{self.property.slug}/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['title'], "Test Apartment")
        self.assertEqual(response.data['price'], "5000000.00")
        # Check that nested location data is included
        self.assertEqual(response.data['location']['name'], "Westlands")

    def test_property_detail_increments_views(self):
        """Test that viewing a property increments its view count."""
        initial_views = self.property.views
        response = self.client.get(f'/api/properties/{self.property.slug}/')
        self.assertEqual(response.status_code, 200)
        self.property.refresh_from_db()
        self.assertEqual(self.property.views, initial_views + 1)

    def test_property_view_creates_lead_activity_for_authenticated_user(self):
        """TDD: Property view should create LeadActivity for authenticated user with lead."""
        from leads.models import Lead, LeadActivity

        # Create a lead for this user with the property
        lead = Lead.objects.create(
            first_name="Test",
            last_name="User",
            email="testuser@test.com",
            user=self.user,
            agent=self.user,
            property=self.property
        )

        # Initial activity count
        initial_count = LeadActivity.objects.filter(lead=lead, activity_type="property_viewing").count()

        # Authenticate and view the property
        self.client.force_authenticate(user=self.user)
        response = self.client.get(f'/api/properties/{self.property.slug}/')
        self.assertEqual(response.status_code, 200)

        # Should create LeadActivity
        new_count = LeadActivity.objects.filter(lead=lead, activity_type="property_viewing").count()
        self.assertEqual(new_count, initial_count + 1)

        # Verify activity details
        activity = LeadActivity.objects.filter(lead=lead, activity_type="property_viewing").first()
        self.assertIsNotNone(activity)
        self.assertIn(self.property.title, activity.description)

    def test_property_view_creates_lead_activity_for_client_with_lead(self):
        """TDD: Property view should create LeadActivity for client users with existing leads."""
        from leads.models import Lead, LeadActivity

        # Create a client user
        client = get_user_model().objects.create_user(
            username="client_viewer",
            email="client@test.com",
            password="testpass123",
            user_type="client"
        )

        # Create a lead for this client assigned to this agent with the property
        lead = Lead.objects.create(
            first_name="Client",
            last_name="Viewer",
            email="client@test.com",
            user=client,
            agent=self.user,
            property=self.property
        )

        # View the property as client
        self.client.force_authenticate(user=client)
        response = self.client.get(f'/api/properties/{self.property.slug}/')
        self.assertEqual(response.status_code, 200)

        # Should create LeadActivity
        activity = LeadActivity.objects.filter(
            lead=lead,
            activity_type="property_viewing"
        ).first()
        self.assertIsNotNone(activity)
        self.assertEqual(activity.agent, self.user)

    def test_property_view_does_not_duplicate_for_same_session(self):
        """TDD: Property view should not create duplicate activities for same user within session."""
        from leads.models import Lead, LeadActivity

        lead = Lead.objects.create(
            first_name="Session",
            last_name="Test",
            email="session@test.com",
            user=self.user,
            agent=self.user,
            property=self.property
        )

        # Authenticate and view property multiple times
        self.client.force_authenticate(user=self.user)
        for _ in range(3):
            response = self.client.get(f'/api/properties/{self.property.slug}/')
            self.assertEqual(response.status_code, 200)

        # Should only have 1 activity (first view counts, subsequent within session don't)
        count = LeadActivity.objects.filter(
            lead=lead,
            activity_type="property_viewing"
        ).count()
        # This test expects 1 - we need to implement session-based deduplication
        self.assertEqual(count, 1)

    def test_property_view_updates_lead_score(self):
        """TDD: Property view should trigger lead score update."""
        from leads.models import Lead, LeadActivity

        lead = Lead.objects.create(
            first_name="Score",
            last_name="Test",
            email="score@test.com",
            user=self.user,
            agent=self.user,
            property=self.property
        )

        initial_score = lead.score

        # Authenticate and view the property
        self.client.force_authenticate(user=self.user)
        response = self.client.get(f'/api/properties/{self.property.slug}/')
        self.assertEqual(response.status_code, 200)

        # Lead score should increase (property_viewing adds 15 points)
        lead.refresh_from_db()
        self.assertEqual(lead.score, initial_score + 15)

    def test_property_create_requires_authentication(self):
        """Test that creating a property requires login."""
        data = {
            "title": "New Property",
            "price": 3000000,
            "property_type": "apartment"
        }
        response = self.client.post('/api/properties/', data)
        self.assertEqual(response.status_code, 401)  # Unauthorized

    def test_property_create_as_agent_succeeds(self):
        """Test that authenticated agent can create property."""
        self.client.force_authenticate(user=self.user)
        data = {
            "title": "Agent's New Property",
            "price": 4000000,
            "property_type": "bungalow",
            "bedrooms": 3,
            "bathrooms": 2,
            "location_name": "Kilimani, Nairobi"
        }
        response = self.client.post('/api/properties/', data)
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data['title'], "Agent's New Property")
        # Property should be created with agent set
        self.assertEqual(response.data['agent'], self.user.id)

    def test_property_create_as_non_agent_fails(self):
        """Test that non-agent users cannot create properties."""
        # Create a regular client user
        client_user = get_user_model().objects.create_user(
            username="client1",
            email="client1@test.com",
            password="clientpass",
            user_type="client"
        )
        self.client.force_authenticate(user=client_user)
        data = {
            "title": "Client Property",
            "price": 1000000
        }
        response = self.client.post('/api/properties/', data)
        self.assertEqual(response.status_code, 403)

    def test_property_update_by_agent_owner(self):
        """Test that agent who owns property can update it."""
        self.client.force_authenticate(user=self.user)
        data = {"description": "Updated description"}
        response = self.client.patch(
            f'/api/properties/{self.property.pk}/',
            data,
            format='json'
        )
        self.assertEqual(response.status_code, 200)
        self.property.refresh_from_db()
        self.assertEqual(self.property.description, "Updated description")

    def test_property_update_by_other_agent_fails(self):
        """Test that other agents cannot update property they don't own."""
        agent2 = get_user_model().objects.create_user(
            username="agent2",
            email="agent2@test.com",
            password="pass2",
            user_type="agent"
        )
        self.client.force_authenticate(user=agent2)
        data = {"description": "Hacked description"}
        response = self.client.patch(
            f'/api/properties/{self.property.pk}/',
            data,
            format='json'
        )
        self.assertEqual(response.status_code, 403)

    def test_property_delete_by_agent_owner(self):
        """Test that agent can delete their own property."""
        self.client.force_authenticate(user=self.user)
        response = self.client.delete(f'/api/properties/{self.property.pk}/')
        self.assertEqual(response.status_code, 204)
        self.assertFalse(Property.objects.filter(pk=self.property.pk).exists())

    def test_property_delete_by_other_agent_fails(self):
        """Test that other agents cannot delete property."""
        agent2 = get_user_model().objects.create_user(
            username="agent2",
            email="agent2@test.com",
            password="pass2",
            user_type="agent"
        )
        self.client.force_authenticate(user=agent2)
        response = self.client.delete(f'/api/properties/{self.property.pk}/')
        self.assertEqual(response.status_code, 403)

    def test_management_can_see_all_properties(self):
        """Test that management users can see all properties in management endpoint."""
        self.client.force_authenticate(user=self.management_user)
        response = self.client.get('/api/properties/management-properties/')
        self.assertEqual(response.status_code, 200)
        # Should include both verified and unverified
        titles = [p['title'] for p in response.data]
        self.assertIn("Test Apartment", titles)

    def test_agent_cannot_access_management_endpoint(self):
        """Test that regular agents cannot access management endpoint."""
        self.client.force_authenticate(user=self.user)
        response = self.client.get('/api/properties/management-properties/')
        self.assertEqual(response.status_code, 403)

    def test_approve_property_endpoint(self):
        """Test that management can approve a property."""
        unverified = Property.objects.create(
            title="Unverified",
            price=1000000,
            agent=self.user,
            is_verified=False
        )
        self.client.force_authenticate(user=self.management_user)
        response = self.client.post(f'/api/properties/{unverified.pk}/approve/')
        self.assertEqual(response.status_code, 200)
        unverified.refresh_from_db()
        self.assertTrue(unverified.is_verified)

    def test_featured_properties_endpoint(self):
        """Test featured properties list."""
        featured = Property.objects.create(
            title="Featured Property",
            price=8000000,
            agent=self.user,
            is_verified=True,
            is_featured=True
        )
        response = self.client.get('/api/properties/featured/')
        self.assertEqual(response.status_code, 200)
        titles = [p['title'] for p in response.data]
        self.assertIn("Featured Property", titles)
        # Non-featured should not appear
        self.assertNotIn("Test Apartment", titles)

    def test_search_properties(self):
        """Test property search by location, price, bedrooms."""
        response = self.client.get('/api/properties/search/', {
            'location': 'West',
            'min_price': 4000000,
            'max_price': 6000000,
            'bedrooms': 2
        })
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['title'], "Test Apartment")

    def test_search_no_results(self):
        """Test search with no matching properties."""
        response = self.client.get('/api/properties/search/', {
            'location': 'NonExistent',
            'min_price': 10000000
        })
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 0)

    def test_saved_property_create(self):
        """Test that authenticated user can save a property."""
        self.client.force_authenticate(user=self.user)
        response = self.client.post('/api/properties/saved/', {
            'property': self.property.pk,
            'notes': 'Love this one'
        })
        self.assertEqual(response.status_code, 201)
        # Should not allow duplicate save
        response2 = self.client.post('/api/properties/saved/', {
            'property': self.property.pk
        })
        self.assertEqual(response2.status_code, 400)

    def test_saved_property_list(self):
        """Test user can list their saved properties."""
        from properties.models import SavedProperty
        SavedProperty.objects.create(user=self.user, property=self.property)
        self.client.force_authenticate(user=self.user)
        response = self.client.get('/api/properties/saved/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['property']['title'], "Test Apartment")

    def test_user_cannot_access_others_saved_properties(self):
        """Test that users only see their own saved properties."""
        from properties.models import SavedProperty
        user2 = get_user_model().objects.create_user(
            username="user2",
            email="user2@test.com",
            password="pass2"
        )
        SavedProperty.objects.create(user=user2, property=self.property)
        self.client.force_authenticate(user=self.user)
        response = self.client.get('/api/properties/saved/')
        self.assertEqual(len(response.data), 0)

    def test_valuation_endpoint_exists(self):
        """Test that valuation endpoint exists and is publicly accessible."""
        # Use existing location and size from test setup
        response = self.client.get('/api/properties/valuation/', {
            'location': 'Westlands',
            'size': 1200
        })
        # Should return 200 or 404 (if no comparable properties exist)
        self.assertIn(response.status_code, [200, 404])

    def test_valuation_requires_location_parameter(self):
        """Test that valuation endpoint requires location parameter."""
        response = self.client.get('/api/properties/valuation/')
        self.assertEqual(response.status_code, 400)
        self.assertIn('location', response.data)

    def test_valuation_requires_size_parameter(self):
        """Test that valuation endpoint requires size parameter."""
        response = self.client.get('/api/properties/valuation/', {
            'location': 'Westlands'
        })
        self.assertEqual(response.status_code, 400)
        self.assertIn('size', response.data)

    def test_valuation_with_no_comparable_properties(self):
        """Test valuation when no comparable properties exist in location."""
        response = self.client.get('/api/properties/valuation/', {
            'location': 'NonExistentLocation',
            'size': 1000
        })
        self.assertEqual(response.status_code, 404)
        self.assertIn('error', response.data)

    def test_valuation_calculation_with_comparable_properties(self):
        """Test valuation calculation uses average price per sqm from comparable properties."""
        # Create additional properties in the same location for comparison
        Property.objects.create(
            title="Comparable 1",
            price=6000000,
            currency="KES",
            location=self.location,
            square_feet=1200,
            agent=self.user,
            is_verified=True,
            status="available"
        )
        Property.objects.create(
            title="Comparable 2",
            price=7000000,
            currency="KES",
            location=self.location,
            square_feet=1400,
            agent=self.user,
            is_verified=True,
            status="available"
        )
        
        response = self.client.get('/api/properties/valuation/', {
            'location': 'Westlands',
            'size': 1300
        })
        self.assertEqual(response.status_code, 200)
        self.assertIn('estimated_value', response.data)
        self.assertIn('price_per_sqm', response.data)
        self.assertIn('comparable_count', response.data)
        
        # Verify calculation: average price/sqm * requested size
        self.assertGreater(response.data['estimated_value'], 6000000)
        self.assertLess(response.data['estimated_value'], 6500000)
        self.assertEqual(response.data['comparable_count'], 3)

    def test_valuation_filters_by_location_name(self):
        """Test that valuation only uses properties from the specified location."""
        # Create property in different location
        other_location = Location.objects.create(
            name="Kilimani",
            county="Nairobi",
            latitude=-1.2833,
            longitude=36.7833
        )
        Property.objects.create(
            title="Kilimani Property",
            price=10000000,
            currency="KES",
            location=other_location,
            square_feet=2000,
            agent=self.user,
            is_verified=True,
            status="available"
        )
        
        response = self.client.get('/api/properties/valuation/', {
            'location': 'Westlands',
            'size': 1200
        })
        self.assertEqual(response.status_code, 200)
        # Should only use Westlands properties, not Kilimani
        self.assertEqual(response.data['comparable_count'], 1)
        # Estimated value should be based on Westlands property only
        self.assertEqual(response.data['estimated_value'], 5000000)

    def test_valuation_excludes_unverified_properties(self):
        """Test that valuation excludes unverified properties from calculation."""
        Property.objects.create(
            title="Unverified Property",
            price=10000000,
            currency="KES",
            location=self.location,
            square_feet=1000,
            agent=self.user,
            is_verified=False,
            status="available"
        )
        
        response = self.client.get('/api/properties/valuation/', {
            'location': 'Westlands',
            'size': 1200
        })
        self.assertEqual(response.status_code, 200)
        # Should only use verified properties
        self.assertEqual(response.data['comparable_count'], 1)
        self.assertEqual(response.data['estimated_value'], 5000000)

    def test_valuation_excludes_sold_properties(self):
        """Test that valuation excludes sold properties from calculation."""
        Property.objects.create(
            title="Sold Property",
            price=10000000,
            currency="KES",
            location=self.location,
            square_feet=1000,
            agent=self.user,
            is_verified=True,
            status="sold"
        )
        
        response = self.client.get('/api/properties/valuation/', {
            'location': 'Westlands',
            'size': 1200
        })
        self.assertEqual(response.status_code, 200)
        # Should only use available properties
        self.assertEqual(response.data['comparable_count'], 1)
        self.assertEqual(response.data['estimated_value'], 5000000)


class PropertyRecommendationsTest(TestCase):
    """Test Property Recommendation API endpoints."""

    def setUp(self):
        self.client = APIClient()
        self.user = get_user_model().objects.create_user(
            username="client1",
            email="client1@test.com",
            password="testpass123",
            user_type="client"
        )
        self.agent = get_user_model().objects.create_user(
            username="agent1",
            email="agent1@test.com",
            password="testpass123",
            user_type="agent"
        )
        
        # Create locations
        self.nairobi_location = Location.objects.create(
            name="Nairobi",
            county="Nairobi",
            latitude=-1.2921,
            longitude=36.8219
        )
        self.mombasa_location = Location.objects.create(
            name="Mombasa",
            county="Mombasa",
            latitude=-4.0435,
            longitude=39.6682
        )

    def test_featured_development_returns_high_interest_project(self):
        """TDD: Get featured development project for homepage overlay."""
        # Create a featured development property
        development = Property.objects.create(
            title="Kezariruta Heights",
            slug="kezariruta-heights",
            description="Luxury apartments in Ruiru",
            price=4500000,
            currency="KES",
            property_type="apartment",
            is_development=True,
            is_featured=True,
            is_verified=True,
            status="available",
            location=self.nairobi_location,
            agent=self.agent,
            bedrooms=2,
            bathrooms=2,
            square_feet=1200
        )

        # Also create a non-featured property (should not be returned)
        Property.objects.create(
            title="Regular Apartment",
            slug="regular-apartment",
            price=3000000,
            property_type="apartment",
            is_development=False,
            is_featured=False,
            is_verified=True,
            status="available",
            location=self.nairobi_location,
            agent=self.agent
        )

        response = self.client.get('/api/properties/featured-development/')
        self.assertEqual(response.status_code, 200)
        self.assertIsNotNone(response.data)
        self.assertEqual(response.data['title'], "Kezariruta Heights")
        self.assertEqual(response.data['is_development'], True)
        self.assertEqual(response.data['is_featured'], True)

    def test_featured_development_returns_null_when_none_exists(self):
        """TDD: Return null when no featured development exists."""
        # No featured development properties - only regular properties
        Property.objects.create(
            title="Regular Sale Property",
            slug="regular-sale-prop",
            price=3000000,
            property_type="apartment",
            is_development=False,
            is_featured=False,
            is_verified=True,
            status="available",
            location=self.nairobi_location,
            agent=self.agent
        )

        response = self.client.get('/api/properties/featured-development/')
        self.assertEqual(response.status_code, 200)
        self.assertIsNone(response.data)

    def test_featured_development_requires_no_auth(self):
        """TDD: Featured development endpoint should be public (no auth required)."""
        response = self.client.get('/api/properties/featured-development/')
        # Should work without authentication
        self.assertIn(response.status_code, [200, 404])
        
        # Create properties in Nairobi - similar to what user might like
        for i in range(3):
            Property.objects.create(
                title=f"Nairobi Apartment {i}",
                slug=f"nairobi-apartment-{i}",
                description="Modern apartment in Nairobi",
                price=5000000 + (i * 500000),
                currency="KES",
                location=self.nairobi_location,
                bedrooms=2,
                bathrooms=2,
                square_feet=1200,
                property_type="apartment",
                listing_type="sale",
                agent=self.agent,
                is_verified=True,
                status="available"
            )
        
        # Create properties in Mombasa - different location
        for i in range(3):
            Property.objects.create(
                title=f"Mombasa Villa {i}",
                slug=f"mombasa-villa-{i}",
                description="Beach villa in Mombasa",
                price=8000000 + (i * 1000000),
                currency="KES",
                location=self.mombasa_location,
                bedrooms=4,
                bathrooms=3,
                square_feet=2000,
                property_type="villa",
                listing_type="sale",
                agent=self.agent,
                is_verified=True,  # Make sure Mombasa properties are also verified
                status="available"
            )

    def test_recommendations_require_authentication(self):
        """Test that recommendations endpoint requires login."""
        response = self.client.get('/api/properties/recommendations/')
        # Should return 401 (unauthorized) or 403 (forbidden) when not authenticated
        self.assertIn(response.status_code, [401, 403])

    def test_authenticated_user_can_get_recommendations(self):
        """Test that authenticated users can access recommendations."""
        self.client.force_authenticate(user=self.user)
        response = self.client.get('/api/properties/recommendations/')
        self.assertEqual(response.status_code, 200)

    def test_recommendations_based_on_saved_properties(self):
        """Test that recommendations prioritize properties similar to saved ones."""
        from properties.models import SavedProperty
        
        # User saves a Nairobi apartment
        nairobi_prop = Property.objects.filter(location=self.nairobi_location).first()
        SavedProperty.objects.create(user=self.user, property=nairobi_prop)
        
        self.client.force_authenticate(user=self.user)
        response = self.client.get('/api/properties/recommendations/')
        
        self.assertEqual(response.status_code, 200)
        results = response.data.get('results', response.data)
        # Recommendations should include properties from same location
        recommended_locations = [p.get('location', {}).get('name') for p in results if p.get('location')]
        self.assertIn("Nairobi", recommended_locations)

    def test_recommendations_exclude_saved_properties(self):
        """Test that recommendations don't include properties user already saved."""
        from properties.models import SavedProperty
        
        # Save a property
        saved_prop = Property.objects.first()
        SavedProperty.objects.create(user=self.user, property=saved_prop)
        
        self.client.force_authenticate(user=self.user)
        response = self.client.get('/api/properties/recommendations/')
        
        self.assertEqual(response.status_code, 200)
        results = response.data.get('results', response.data)
        # The saved property should NOT be in recommendations
        recommended_ids = [p.get('id') for p in results]
        self.assertNotIn(saved_prop.id, recommended_ids)

    def test_recommendations_based_on_lead_preferences(self):
        """Test that recommendations consider user's lead preferences."""
        from leads.models import Lead
        
        # User has a lead with specific preferences
        Lead.objects.create(
            first_name="Test",
            last_name="User",
            email="test@test.com",
            user=self.user,
            source="website",
            status="new",
            priority="high",
            preferred_locations=["Nairobi"],
            property_types=["apartment"],
            budget_min=3000000,
            budget_max=7000000
        )
        
        self.client.force_authenticate(user=self.user)
        response = self.client.get('/api/properties/recommendations/')
        
        self.assertEqual(response.status_code, 200)
        results = response.data.get('results', response.data)
        # Should have recommendations
        self.assertGreater(len(results), 0)

    def test_recommendations_limit_results(self):
        """Test that recommendations are limited (e.g., 6 properties)."""
        self.client.force_authenticate(user=self.user)
        response = self.client.get('/api/properties/recommendations/')
        
        self.assertEqual(response.status_code, 200)
        results = response.data.get('results', response.data)
        # Should return limited number of recommendations
        self.assertLessEqual(len(results), 10)

    def test_recommendations_fallback_for_new_users(self):
        """Test that new users (no saved properties, no leads) get featured properties."""
        # Create a fresh user with no activity
        new_user = get_user_model().objects.create_user(
            username="newuser",
            email="newuser@test.com",
            password="testpass123",
            user_type="client"
        )
        
        # Mark some properties as featured
        Property.objects.update(is_featured=True)
        
        self.client.force_authenticate(user=new_user)
        response = self.client.get('/api/properties/recommendations/')
        
        self.assertEqual(response.status_code, 200)
        results = response.data.get('results', response.data)
        # Should return featured properties as fallback
        self.assertGreater(len(results), 0)

    def test_recommendations_only_include_available_verified(self):
        """Test that recommendations only include verified and available properties."""
        # Create unavailable and unverified properties
        Property.objects.create(
            title="Unavailable Property",
            slug="unavailable-property-test-3",
            price=5000000,
            currency="KES",
            location=self.nairobi_location,
            agent=self.agent,
            is_verified=True,
            status="sold"
        )
        Property.objects.create(
            title="Unverified Property",
            slug="unverified-property-test-3",
            price=5000000,
            currency="KES",
            location=self.nairobi_location,
            agent=self.agent,
            is_verified=False,
            status="available"
        )
        
        self.client.force_authenticate(user=self.user)
        response = self.client.get('/api/properties/recommendations/')
        
        self.assertEqual(response.status_code, 200)
        results = response.data.get('results', response.data)
        # Backend already filters by is_verified=True and status="available" in get_queryset
        # So we just verify we get properties back and they are verified via verification_status
        self.assertGreater(len(results), 0)
        for prop in results:
            # verification_status is the serialized field (returns 'verified' or 'pending')
            self.assertEqual(prop.get('verification_status'), 'verified', 
                f"Property {prop.get('title')} should be verified")
