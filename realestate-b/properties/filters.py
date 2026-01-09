import django_filters
from .models import Property


class PropertyFilter(django_filters.FilterSet):
    min_price = django_filters.NumberFilter(field_name="price", lookup_expr="gte")
    max_price = django_filters.NumberFilter(field_name="price", lookup_expr="lte")
    property_type = django_filters.MultipleChoiceFilter(choices=Property.PROPERTY_TYPES)
    bedrooms = django_filters.NumberFilter(field_name="bedrooms", lookup_expr="gte")
    bathrooms = django_filters.NumberFilter(field_name="bathrooms", lookup_expr="gte")
    location = django_filters.CharFilter(
        field_name="location__name", lookup_expr="icontains"
    )

    class Meta:
        model = Property
        fields = ["property_type", "status", "location", "bedrooms", "bathrooms"]
