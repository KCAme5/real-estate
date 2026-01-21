import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api/client';

interface Property {
    id: number;
    title: string;
    price: number;
    description: string;
    location: {
        name: string;
        county: string;
    };
    property_type: string;
    main_image: string;
    main_image_url: string;
    images: Array<{
        id: number;
        image: string;
        is_primary: boolean;
        caption: string;
        created_at: string;
    }>;
    bedrooms: number;
    bathrooms: number;
    square_feet: number;
    address: string;
    agent: {
        id: number;
        first_name: string;
        last_name: string;
        phone_number: string;
        email: string;
        profile_picture?: string;
        company?: string;
        experience?: string;
        rating?: number;
        total_listings?: number;
    };
    features: string[];
    year_built: number;
    is_featured: boolean;
    currency: string;
    plot_size?: number;
    status: string;
    created_at: string;
    views: number;
    is_verified: boolean;
    price_display: string;
}

interface SavedProperty {
    id: number;
    property: number;
    saved_at: string;
    notes?: string;
}


export function usePropertyData(propertyId: any, isAuthenticated: boolean) {
    const [property, setProperty] = useState<Property | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeImage, setActiveImage] = useState(0);
    const [isSaved, setIsSaved] = useState(false);
    const [saving, setSaving] = useState(false);
    const [savedProperties, setSavedProperties] = useState<SavedProperty[]>([]);

    useEffect(() => {
        const fetchProperty = async () => {
            try {
                setLoading(true);
                setError(null);
                const data = await apiClient.get(`/properties/${propertyId}`);
                setProperty(data);

                if (isAuthenticated) {
                    await checkSavedStatus();
                }
            } catch (error: any) {
                console.error('Error fetching property:', error);
                setError(error.message || 'Failed to load property details');
            } finally {
                setLoading(false);
            }
        };

        if (propertyId) {
            fetchProperty();
        }
    }, [propertyId, isAuthenticated]);

    const checkSavedStatus = async () => {
        if (!isAuthenticated) return;

        try {
            const savedResponse = await apiClient.get('/properties/saved/');

            if (Array.isArray(savedResponse)) {
                setSavedProperties(savedResponse);
                const isPropertySaved = savedResponse.some((item: any) => {
                    const propertyIdToCheck = item.property?.id || item.property;
                    return propertyIdToCheck === property?.id;
                });
                setIsSaved(isPropertySaved);
            } else if (savedResponse && Array.isArray(savedResponse.results)) {
                setSavedProperties(savedResponse.results);
                const isPropertySaved = savedResponse.results.some((item: any) => {
                    const propertyIdToCheck = item.property?.id || item.property;
                    return propertyIdToCheck === property?.id;
                });
                setIsSaved(isPropertySaved);
            }
        } catch (error: any) {
            console.error('Error checking saved status:', error);
        }
    };

    const handleSaveProperty = async () => {
        if (!property) return;

        // Check authentication first
        if (!isAuthenticated) {
            throw new Error('Authentication required'); // This will trigger the login prompt
        }

        try {
            setSaving(true);

            if (isSaved) {
                let savedPropertyId: number | null = null;

                for (const item of savedProperties) {
                    const propertyIdToCheck = (item as any).property?.id || item.property;
                    if (propertyIdToCheck === property.id) {
                        savedPropertyId = item.id;
                        break;
                    }
                }

                if (savedPropertyId) {
                    await apiClient.delete(`/properties/saved/${savedPropertyId}/`);
                    setIsSaved(false);
                    setSavedProperties(prev => prev.filter(sp => sp.id !== savedPropertyId));
                }
            } else {
                const response = await apiClient.post('/properties/saved/', {
                    property: property.id,
                    notes: `Interested in ${property.title}`
                });

                const newSavedProperty: SavedProperty = {
                    id: response.id,
                    property: property.id,
                    saved_at: response.saved_at,
                    notes: response.notes
                };

                setIsSaved(true);
                setSavedProperties(prev => [...prev, newSavedProperty]);
            }
        } catch (error: any) {
            console.error('Error saving property:', error);

            if (error.status === 401) {
                throw new Error('Authentication required');
            } else if (error.status === 400 && error.message?.includes('already saved')) {
                setIsSaved(true);
                await checkSavedStatus();
            } else {
                throw error;
            }
        } finally {
            setSaving(false);
        }
    };

    return {
        property,
        loading,
        error,
        activeImage,
        setActiveImage,
        isSaved,
        saving,
        savedProperties,
        handleSaveProperty,
        checkSavedStatus
    };
}