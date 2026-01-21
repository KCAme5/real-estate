#!/usr/bin/env bash
# exit on error
set -o errexit

pip install -r requirements.txt

python manage.py collectstatic --no-input
python manage.py migrate

# Create superuser if it doesn't exist
python manage.py shell << EOF
from django.contrib.auth import get_user_model
User = get_user_model()
if not User.objects.filter(username='Hayes').exists():
    User.objects.create_superuser('Hayes', 'hayes@yahoo.com', '${DJANGO_SUPERUSER_PASSWORD:-defaultpassword123qwert}')
    print("Superuser created successfully!")
else:
    print("Superuser already exists.")
EOF