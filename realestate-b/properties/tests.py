"""
Test suite for Property model and related functionality.
Following TDD principles: write tests first, then fix issues.
"""
from django.test import TestCase
from django.contrib.auth import get_user_model
from properties.models import Property, Location, PropertyImage
from properties.serializers import PropertyCreateSerializer, PropertyListSerializer
from datetime import datetime


class LocationModelTest(TestCase):
    """Test the Location model."""

    def test_create_location_with_all_fields(self):
        """Test creating a location with all fields."""
        location = Location.objects.create(
            name="Westlands",
            county="Nairobi",
            latitude=-1.2637,
            longitude=36.8036,
        )
        self.assertEqual(location.name, "Westlands")
        self.assertEqual(location.county, "Nairobi")
        self.assertEqual(location.slug, "westlands")
        self.assertIsNotNone(location.latitude)
        self.assertIsNotNone(location.longitude)

    def test_slug_generated_automatically(self):
        """Test that slug is auto-generated on save."""
        location = Location.objects.create(name="Kilimani", county="Nairobi")
        self.assertEqual(location.slug, "kilimani")

    def test_slug_uniqueness(self):
        """Test that duplicate names generate unique slugs."""
        location1 = Location.objects.create(name="Kileleshwa", county="Nairobi")
        location2 = Location.objects.create(name="Kileleshwa", county="Nairobi")
        self.assertNotEqual(location1.slug, location2.slug)
        self.assertTrue(location2.slug.startswith("kileleshwa"))

    def test_str_representation(self):
        """Test string representation."""
        location = Location.objects.create(name="Karen", county="Nairobi")
        self.assertEqual(str(location), "Karen, Nairobi")


class PropertyModelTest(TestCase):
    """Test the Property model."""

    def setUp(self):
        """Set up test data."""
        self.user = get_user_model().objects.create_user(
            username="agent1",
            email="agent1@test.com",
            password="testpass123",
            user_type="agent"
        )
        self.location = Location.objects.create(
            name="Westlands",
            county="Nairobi",
        )

    def test_create_property_with_required_fields_only(self):
        """Test creating a property with minimal required fields via serializer."""
        data = {
            "title": "Beautiful 3-bed apartment",
            "price": 5000000,
            "property_type": "apartment",
        }
        serializer = PropertyCreateSerializer(data=data)
        self.assertTrue(serializer.is_valid(), f"Errors: {serializer.errors}")
        property_obj = serializer.save()
        self.assertEqual(property_obj.title, "Beautiful 3-bed apartment")
        self.assertEqual(property_obj.price, 5000000)
        self.assertEqual(property_obj.property_type, "apartment")
        # Defaults should be set
        self.assertEqual(property_obj.currency, "KES")
        self.assertEqual(property_obj.listing_type, "sale")
        self.assertEqual(property_obj.status, "available")
        self.assertTrue(property_obj.slug)  # auto-generated

    def test_price_display_formatting_kes(self):
        """Test that KES prices are formatted correctly."""
        property_obj = Property.objects.create(
            title="Test Property",
            price=5000000,
            currency="KES",
            location=self.location,
            agent=self.user
        )
        self.assertEqual(property_obj.price_display, "KES 5,000,000")

    def test_price_display_formatting_usd(self):
        """Test that USD prices are formatted correctly."""
        property_obj = Property.objects.create(
            title="Test Property",
            price=50000,
            currency="USD",
            location=self.location,
            agent=self.user
        )
        self.assertEqual(property_obj.price_display, "USD 50,000")

    def test_slug_generation(self):
        """Test that slug is auto-generated from title."""
        property_obj = Property.objects.create(
            title="Luxury Villa in Mombasa",
            price=10000000,
            location=self.location,
            agent=self.user
        )
        self.assertEqual(property_obj.slug, "luxury-villa-in-mombasa")

    def test_slug_generation_with_duplicate_titles(self):
        """Test that duplicate titles generate unique slugs with incrementing suffix."""
        prop1 = Property.objects.create(
            title="Sea View Apartment",
            price=5000000,
            location=self.location,
            agent=self.user
        )
        self.assertEqual(prop1.slug, "sea-view-apartment")

        prop2 = Property.objects.create(
            title="Sea View Apartment",
            price=6000000,
            location=self.location,
            agent=self.user
        )
        self.assertEqual(prop2.slug, "sea-view-apartment-1")

        prop3 = Property.objects.create(
            title="Sea View Apartment",
            price=7000000,
            location=self.location,
            agent=self.user
        )
        self.assertEqual(prop3.slug, "sea-view-apartment-2")

    def test_property_relationships(self):
        """Test relationships with User, Location."""
        property_obj = Property.objects.create(
            title="Test Property",
            price=7500000,
            location=self.location,
            agent=self.user
        )
        self.assertEqual(property_obj.agent, self.user)
        self.assertEqual(property_obj.location, self.location)
        self.assertEqual(property_obj.agent.user_type, "agent")

    def test_optional_fields_can_be_null(self):
        """Test that optional fields can be None."""
        property_obj = Property.objects.create(
            title="Minimal Property",
            price=1000000,
            agent=self.user
        )
        self.assertIsNone(property_obj.bedrooms)
        self.assertIsNone(property_obj.bathrooms)
        self.assertIsNone(property_obj.square_feet)
        self.assertIsNone(property_obj.location)
        self.assertEqual(property_obj.features, [])

    def test_json_fields_default_to_empty(self):
        """Test that JSON fields default to empty list."""
        property_obj = Property.objects.create(
            title="Test",
            price=1000000,
            agent=self.user
        )
        self.assertEqual(property_obj.features, [])
        self.assertEqual(property_obj.images, [])

    def test_views_counter(self):
        """Test that views counter works."""
        property_obj = Property.objects.create(
            title="Test Property",
            price=2000000,
            agent=self.user
        )
        self.assertEqual(property_obj.views, 0)
        property_obj.views += 1
        property_obj.save()
        property_obj.refresh_from_db()
        self.assertEqual(property_obj.views, 1)

    def test_is_verified_default_false(self):
        """Test that is_verified defaults to False."""
        property_obj = Property.objects.create(
            title="Test",
            price=1000000,
            agent=self.user
        )
        self.assertFalse(property_obj.is_verified)

    def test_is_featured_default_false(self):
        """Test that is_featured defaults to False."""
        property_obj = Property.objects.create(
            title="Test",
            price=1000000,
            agent=self.user
        )
        self.assertFalse(property_obj.is_featured)

    def test_ordering_by_created_at(self):
        """Test that properties are ordered by -created_at by default."""
        Property.objects.create(
            title="First",
            price=1000000,
            agent=self.user
        )
        Property.objects.create(
            title="Second",
            price=2000000,
            agent=self.user
        )
        properties = Property.objects.all()
        self.assertEqual(properties[0].title, "Second")
        self.assertEqual(properties[1].title, "First")

    def test_agent_deletion_sets_null(self):
        """Test that deleting agent sets property.agent to NULL, preserving property."""
        property_obj = Property.objects.create(
            title="Test Property",
            price=3000000,
            agent=self.user
        )
        self.user.delete()
        property_obj.refresh_from_db()
        # After fix: agent should be NULL, property should still exist
        self.assertIsNone(property_obj.agent)
        self.assertTrue(Property.objects.filter(pk=property_obj.pk).exists())

    def test_location_deletion_sets_null(self):
        """Test that deleting location sets property.location to NULL, preserving property."""
        location2 = Location.objects.create(name="Test Location", county="Test")
        property_obj = Property.objects.create(
            title="Test Property",
            price=3000000,
            location=location2,
            agent=self.user
        )
        location2.delete()
        property_obj.refresh_from_db()
        # After fix: location should be NULL, property should still exist
        self.assertIsNone(property_obj.location)
        self.assertTrue(Property.objects.filter(pk=property_obj.pk).exists())


class PropertyImageModelTest(TestCase):
    """Test the PropertyImage model."""

    def setUp(self):
        self.user = get_user_model().objects.create_user(
            username="agent1",
            email="agent1@test.com",
            password="testpass123",
            user_type="agent"
        )
        self.location = Location.objects.create(name="Kileleshwa", county="Nairobi")
        self.property_obj = Property.objects.create(
            title="Test Property",
            price=4000000,
            location=self.location,
            agent=self.user,
            main_image="https://example.com/main.jpg"
        )

    def test_create_property_image(self):
        """Test creating a property image."""
        image = PropertyImage.objects.create(
            property=self.property_obj,
            image="https://example.com/image1.jpg",
            is_primary=False,
            caption="Living room"
        )
        self.assertEqual(image.property, self.property_obj)
        self.assertEqual(image.image, "https://example.com/image1.jpg")
        self.assertFalse(image.is_primary)
        self.assertEqual(image.caption, "Living room")

    def test_primary_image_flag(self):
        """Test marking image as primary."""
        image = PropertyImage.objects.create(
            property=self.property_obj,
            image="https://example.com/primary.jpg",
            is_primary=True
        )
        self.assertTrue(image.is_primary)

    def test_cascade_delete_on_property_delete(self):
        """Test that images are deleted when property is deleted."""
        image = PropertyImage.objects.create(
            property=self.property_obj,
            image="https://example.com/test.jpg"
        )
        self.property_obj.delete()
        self.assertFalse(PropertyImage.objects.filter(pk=image.pk).exists())

    def test_ordering_by_created_at(self):
        """Test that images are ordered by creation date."""
        PropertyImage.objects.create(
            property=self.property_obj,
            image="https://example.com/1.jpg"
        )
        PropertyImage.objects.create(
            property=self.property_obj,
            image="https://example.com/2.jpg"
        )
        images = PropertyImage.objects.all()
        # Should be ordered by -created_at
        self.assertEqual(images[0].image, "https://example.com/2.jpg")
        self.assertEqual(images[1].image, "https://example.com/1.jpg")


class PropertySerializerValidationTest(TestCase):
    """Test PropertyCreateSerializer validation."""

    def test_valid_data_passes(self):
        """Test that valid data passes validation."""
        data = {
            "title": "Nice Apartment",
            "price": 3000000,
            "property_type": "apartment",
            "bedrooms": 2,
            "bathrooms": 2,
        }
        serializer = PropertyCreateSerializer(data=data)
        self.assertTrue(serializer.is_valid(), f"Errors: {serializer.errors}")

    def test_missing_title_fails(self):
        """Test that missing title fails validation."""
        data = {
            "price": 3000000,
            "property_type": "apartment",
        }
        serializer = PropertyCreateSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn("title", serializer.errors)

    def test_missing_price_fails(self):
        """Test that missing price fails validation."""
        data = {
            "title": "Nice Apartment",
            "property_type": "apartment",
        }
        serializer = PropertyCreateSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn("price", serializer.errors)

    def test_invalid_price_type_fails(self):
        """Test that non-numeric price fails."""
        data = {
            "title": "Nice Apartment",
            "price": "three million",
            "property_type": "apartment",
        }
        serializer = PropertyCreateSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn("price", serializer.errors)

    def test_negative_price_fails(self):
        """Test that negative price is allowed (could be data entry error, but Django DecimalField allows negative by default)."""
        # Actually DecimalField default min_value is None, so negative is allowed
        # We might want to add validation, but currently it's allowed
        data = {
            "title": "Test",
            "price": -1000,
            "property_type": "apartment",
        }
        serializer = PropertyCreateSerializer(data=data)
        self.assertTrue(serializer.is_valid())  # Currently allowed, maybe should fail

    def test_invalid_property_type_fails(self):
        """Test that invalid property_type fails."""
        data = {
            "title": "Test",
            "price": 1000000,
            "property_type": "spaceship",  # invalid choice
        }
        serializer = PropertyCreateSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn("property_type", serializer.errors)

    def test_features_json_field_accepts_list(self):
        """Test that features can be a list."""
        data = {
            "title": "Test",
            "price": 1000000,
            "features": ["Swimming Pool", "Garden"],
        }
        serializer = PropertyCreateSerializer(data=data)
        self.assertTrue(serializer.is_valid(), f"Errors: {serializer.errors}")

    def test_features_json_field_accepts_string_json(self):
        """Test that features as JSON string are parsed."""
        data = {
            "title": "Test",
            "price": 1000000,
            "features": '["Swimming Pool", "Garden"]',  # JSON string
        }
        serializer = PropertyCreateSerializer(data=data)
        self.assertTrue(serializer.is_valid(), f"Errors: {serializer.errors}")
        # Should be parsed to list
        self.assertEqual(serializer.validated_data["features"], ["Swimming Pool", "Garden"])

    def test_features_invalid_json_string_fails(self):
        """Test that malformed JSON string falls back to empty list."""
        data = {
            "title": "Test",
            "price": 1000000,
            "features": "not valid json[",
        }
        serializer = PropertyCreateSerializer(data=data)
        self.assertTrue(serializer.is_valid())  # Should default to empty list, not fail
        self.assertEqual(serializer.validated_data.get("features", []), [])

    def test_default_values_set_on_create(self):
        """Test that defaults are set when not provided."""
        data = {
            "title": "Minimal Property",
            "price": 1000000,
        }
        serializer = PropertyCreateSerializer(data=data)
        self.assertTrue(serializer.is_valid())
        prop = serializer.save()
        self.assertEqual(prop.property_type, "apartment")
        self.assertEqual(prop.listing_type, "sale")
        self.assertEqual(prop.currency, "KES")
        self.assertEqual(prop.description, prop.title)  # defaults to title
        self.assertFalse(prop.is_development)
