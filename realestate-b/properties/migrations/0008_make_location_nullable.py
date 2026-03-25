# Generated migration to make location field nullable
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("properties", "0007_property_location_name"),
    ]

    operations = [
        migrations.AlterField(
            model_name="property",
            name="location",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=models.CASCADE,
                related_name="properties",
                to="properties.location",
            ),
        ),
    ]
