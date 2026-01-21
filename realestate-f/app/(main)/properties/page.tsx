'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Property } from '@/types/property';
import PropertyCard from '@/components/property/PropertyCard';
import SearchFilters from '@/components/property/SearchFilters';
import { apiClient } from '@/lib/api/client';

function PropertiesContent() {
    const searchParams = useSearchParams();
    const [properties, setProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState(true);
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState({
        property_type: '',
        location: '',
        price_min: '',
        price_max: '',
        bedrooms: '',
        bathrooms: '',
        listing_type: '',
        is_development: '',
    });

    useEffect(() => {
        // Parse URL params into filters
        const urlFilters: any = {};
        searchParams.forEach((value, key) => {
            urlFilters[key] = value;
        });

        setFilters(prev => ({ ...prev, ...urlFilters }));
        fetchProperties(urlFilters);
    }, [searchParams]);

    const fetchProperties = async (searchFilters = {}) => {
        try {
            setLoading(true);
            // Clean up empty filters
            const cleanFilters: Record<string, any> = {};
            Object.entries(searchFilters).forEach(([key, value]) => {
                if (value) cleanFilters[key] = value;
            });

            const queryParams = new URLSearchParams(cleanFilters).toString();
            const data = await apiClient.get(`/properties/?${queryParams}`);
            setProperties(data.results || data);
        } catch (error) {
            console.error('Error fetching properties:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (searchFilters: any) => {
        setFilters(searchFilters);
        fetchProperties(searchFilters);
        setShowFilters(false);
    };

    // Helper to generate dynamic title
    const getPageTitle = () => {
        const type = searchParams.get('listing_type');
        const category = searchParams.get('property_type');
        const isDev = searchParams.get('is_development');

        if (isDev) return 'Development Projects';

        let title = 'premium properties';
        if (category) {
            title = category.charAt(0).toUpperCase() + category.slice(1) + 's';
            if (category === 'land') title = 'Land';
            if (category === 'commercial') title = 'Commercial Properties';
        }

        if (type) {
            title += ` for ${type.charAt(0).toUpperCase() + type.slice(1)}`;
        } else if (!category) {
            return 'Browse Properties';
        }

        return title;
    };

    return (
        <div className="pt-20 min-h-screen bg-background">
            {/* Header */}
            <div className="bg-card border-b border-border">
                <div className="container mx-auto px-4 py-8">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div>
                            <h1 className="text-4xl font-bold text-foreground mb-2 capitalize">
                                {getPageTitle()}
                            </h1>
                            <p className="text-muted-foreground">
                                Discover {properties.length} {getPageTitle().toLowerCase()} across Kenya
                            </p>
                        </div>

                        <div className="flex gap-4">
                            <button
                                onClick={() => setShowFilters(true)}
                                className="flex items-center gap-2 bg-background border border-input hover:border-primary text-foreground hover:text-primary px-6 py-3 rounded-xl font-semibold transition-all duration-300"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                                </svg>
                                Filters
                            </button>

                            <select className="bg-background border border-input text-foreground px-4 py-3 rounded-xl font-semibold focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent">
                                <option>Sort by: Newest</option>
                                <option>Price: Low to High</option>
                                <option>Price: High to Low</option>
                                <option>Most Popular</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="container mx-auto px-4 py-8">
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="animate-pulse">
                                <div className="bg-muted h-64 rounded-2xl mb-4"></div>
                                <div className="space-y-3">
                                    <div className="h-4 bg-muted rounded w-3/4"></div>
                                    <div className="h-4 bg-muted rounded w-1/2"></div>
                                    <div className="h-4 bg-muted rounded w-2/3"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : properties.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {properties.map((property) => (
                            <PropertyCard key={property.id} property={property} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16">
                        <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-12 h-12 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <h3 className="text-2xl font-bold text-foreground mb-2">No properties found</h3>
                        <p className="text-muted-foreground mb-6">Try adjusting your search filters</p>
                        <button
                            onClick={() => setShowFilters(true)}
                            className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-xl font-semibold transition-colors"
                        >
                            Adjust Filters
                        </button>
                    </div>
                )}
            </div>

            {/* Filters Modal */}
            {showFilters && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-background rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-2xl font-bold text-foreground">Search Filters</h3>
                                <button
                                    onClick={() => setShowFilters(false)}
                                    className="text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            <SearchFilters
                                onClose={() => setShowFilters(false)}
                                onSearch={handleSearch}
                                initialFilters={filters}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

import { Suspense } from 'react';

export default function PropertiesPage() {
    return (
        <Suspense fallback={
            <div className="pt-20 min-h-screen bg-background">
                <div className="container mx-auto px-4 py-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="animate-pulse">
                                <div className="bg-muted h-64 rounded-2xl mb-4"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        }>
            <PropertiesContent />
        </Suspense>
    );
}
