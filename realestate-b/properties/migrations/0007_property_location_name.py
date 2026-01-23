# Generated migration for location_name field
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("properties", "0006_property_is_development_property_listing_type"),
    ]

    operations = [
        migrations.AddField(
            model_name="property",
            name="location_name",
            field=models.CharField(blank=True, max_length=200, null=True),
        ),
    ]
