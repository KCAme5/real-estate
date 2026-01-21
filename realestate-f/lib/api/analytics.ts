// lib/api/analytics.ts
import { apiClient } from './client';

export interface DashboardStats {
    total_properties: number;
    active_properties: number;
    sold_properties: number;
    total_leads: number;
    new_leads: number;
    property_views: number;
    recent_leads: number;
    conversion_rate: number;
    average_response_time?: string;
}

export interface ChartData {
    labels: string[];
    datasets: Array<{
        label: string;
        data: number[];
        backgroundColor?: string;
        borderColor?: string;
        [key: string]: any;
    }>;
}

export interface PropertyView {
    id: number;
    property: number;
    property_title: string;
    user?: number;
    user_email?: string;
    ip_address: string;
    viewed_at: string;
}

export interface AgentPerformance {
    id: number;
    agent: number;
    agent_name: string;
    agent_email: string;
    period: string;
    properties_listed: number;
    properties_sold: number;
    total_sales_value: number;
    leads_generated: number;
    leads_converted: number;
    conversion_rate: number;
    conversion_rate_percentage: string;
    average_response_time?: string;
    created_at: string;
    updated_at: string;
}

export interface ManagementAnalytics {
    overview: {
        total_properties: number;
        verified_properties: number;
        total_agents: number;
        total_clients: number;
        total_leads: number;
        total_revenue: number;
        property_status_distribution: {
            verified: number;
            pending: number;
            rejected: number;
        };
    };
    today: {
        new_properties: number;
        new_leads: number;
        property_views: number;
        searches: number;
    };
    this_month: {
        new_agents: number;
        conversion_rate: number;
    };
    top_agents: Array<{
        username: string;
        properties_count: number;
        leads_count: number;
        sold_properties: number;
    }>;
    agent_performance_list: Array<{
        id: number;
        username: string;
        email: string;
        properties_count: number;
        properties_sold: number;
        leads_count: number;
        revenue: number;
    }>;
    lead_trends: Array<{
        date: string;
        count: number;
    }>;
}

export interface PropertyAnalytics {
    total_views: number;
    recent_views: Array<{
        date: string;
        views: number;
    }>;
    leads_from_property: number;
    performance_metrics: {
        conversion_rate: number;
        average_daily_views: number;
    };
}

export const analyticsAPI = {
    // Dashboard Analytics
    getDashboardStats: async () => {
        return apiClient.get('/analytics/dashboard/');
    },

    // Agent Analytics
    getAgentPerformance: async () => {
        return apiClient.get('/analytics/agent-performance/');
    },

    getAgentAnalyticsCharts: (days: number = 30) =>
        apiClient.get(`/analytics/agent-charts/?days=${days}`),

    // Management Analytics
    getManagementAnalytics: () =>
        apiClient.get('/analytics/management/'),

    // Property Analytics
    getPropertyAnalytics: async (propertyId: number) => {
        return apiClient.get(`/analytics/property/${propertyId}/`);
    },

    // Property Views
    getPropertyViews: (params?: { property?: number }) =>
        apiClient.get('/analytics/property-views/', { params }),

    getPropertyViewsSummary: () =>
        apiClient.get('/analytics/property-views/summary/'),

    // Search Analytics
    getSearchAnalytics: () =>
        apiClient.get('/analytics/search-analytics/'),
};
