// lib/api/properties.ts
import { apiClient } from './client';

export interface PropertyData {
    title: string;
    price: string | number;
    location: number;
    description?: string;
    property_type?: string;
    bedrooms?: number;
    bathrooms?: number;
    square_feet?: number;
    features?: string[];
    main_image?: File;
    images?: File[];
    floor_plan?: File;
    virtual_tour_url?: string;
}

export interface Property {
    id: number;
    title: string;
    slug: string;
    description: string;
    price: number | string;
    price_display?: string;
    location: {
        id: number;
        name: string;
        county: string;
    };
    property_type: string;
    verification_status: 'pending' | 'verified' | 'rejected';
    is_featured: boolean;
    is_available: boolean;
    main_image: string;
    agent: {
        id: number;
        username: string;
        user_name: string;
        user_email: string;
        user_phone?: string;
        user_avatar?: string;
    };
    created_at: string;
    views?: number;
    floor_plan?: string;
    virtual_tour_url?: string;
}

export const propertyAPI = {
    // Create a new property
    createProperty: async (propertyData: PropertyData | FormData) => {
        return apiClient.post('/properties/create/', propertyData);
    },

    // Update an existing property
    updateProperty: async (propertyId: number, propertyData: PropertyData | FormData) => {
        return apiClient.patch(`/properties/${propertyId}/`, propertyData);
    },

    // Delete a property
    deleteProperty: async (propertyId: number) => {
        return apiClient.delete(`/properties/delete-property/${propertyId}/`);
    },

    // Delete a property image
    deletePropertyImage: async (imageId: number) => {
        return apiClient.delete(`/properties/images/${imageId}/`);
    },

    // Get locations for dropdown
    getLocations: async () => {
        return apiClient.get('/properties/locations/');
    },

    // Save a property
    saveProperty: async (propertyId: number) => {
        return apiClient.post('/properties/saved/', {
            property: propertyId,
            notes: '',
            saved_at: new Date().toISOString()
        });
    },

    // Remove saved property
    removeSavedProperty: async (savedPropertyId: number) => {
        return apiClient.delete(`/properties/saved/${savedPropertyId}/`);
    },

    // Get saved properties
    getSavedProperties: async () => {
        return apiClient.get('/properties/saved/');
    },

    // Get property by ID or slug
    getProperty: async (identifier: string | number) => {
        return apiClient.get(`/properties/${identifier}/`);
    },

    // Get all properties with optional filters
    getAll: async (params?: any) => {
        return apiClient.get('/properties/', { params });
    },

    // Get only properties managed by the current agent
    getAgentProperties: async () => {
        return apiClient.get('/properties/my-properties/');
    },

    // Get featured properties
    getFeaturedProperties: async () => {
        return apiClient.get('/properties/featured/');
    },

    // Search properties
    searchProperties: async (query: string) => {
        return apiClient.get('/properties/search/', { params: { search: query } });
    },

    // Get property recommendations
    getRecommendations: async () => {
        return apiClient.get('/properties/recommendations/');
    },

    // Management
    getManagementProperties: async (params?: any) => {
        return apiClient.get('/properties/management-properties/', { params });
    },

    updateManagementProperty: async (propertyId: number, propertyData: PropertyData | FormData) => {
        return apiClient.patch(`/properties/management-properties/${propertyId}/`, propertyData);
    },

    deleteManagementProperty: async (propertyId: number) => {
        return apiClient.delete(`/properties/management-properties/${propertyId}/`);
    },

    approveProperty: async (id: number) => {
        return apiClient.post(`/properties/approve-property/${id}/`, {});
    },

    rejectProperty: async (id: number) => {
        return apiClient.post(`/properties/reject-property/${id}/`, {});
    },

    toggleFeatured: async (id: number) => {
        return apiClient.post(`/properties/toggle-featured/${id}/`, {});
    }
};