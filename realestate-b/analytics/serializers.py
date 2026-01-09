from rest_framework import serializers
from .models import AgentPerformance, PropertyView, SearchAnalytics, LeadConversion


class AgentPerformanceSerializer(serializers.ModelSerializer):
    agent_name = serializers.CharField(source="agent.get_full_name", read_only=True)

    class Meta:
        model = AgentPerformance
        fields = "__all__"


class PropertyViewSerializer(serializers.ModelSerializer):
    property_title = serializers.CharField(source="property.title", read_only=True)

    class Meta:
        model = PropertyView
        fields = "__all__"


class SearchAnalyticsSerializer(serializers.ModelSerializer):
    class Meta:
        model = SearchAnalytics
        fields = "__all__"


class LeadConversionSerializer(serializers.ModelSerializer):
    lead_name = serializers.CharField(source="lead.get_full_name", read_only=True)

    class Meta:
        model = LeadConversion
        fields = "__all__"
