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
