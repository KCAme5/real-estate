# Generated migration for location_name field
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("properties", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="property",
            name="location_name",
            field=models.CharField(blank=True, max_length=200, null=True),
        ),
    ]
