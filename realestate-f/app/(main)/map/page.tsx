'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { apiClient } from '@/lib/api/client';
import dynamic from 'next/dynamic';
import { Property } from '@/types/property';

// Dynamically import the map component with SSR disabled
const PropertiesMap = dynamic(() => import('@/components/property/PropertiesMap'), {
    ssr: false,
    loading: () => (
        <div className="h-full w-full bg-muted/50 animate-pulse flex items-center justify-center">
            <div className="text-center">
                <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-muted-foreground font-medium">Loading Map...</p>
            </div>
        </div>
    )
});

function MapContent() {
    const searchParams = useSearchParams();
    const type = searchParams.get('type');
    const [properties, setProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProperties = async () => {
            setLoading(true);
            try {
                const params = new URLSearchParams();

                // If type is development, filter strictly. 
                // Checks backend support for 'is_development'
                if (type === 'development') {
                    params.append('is_development', 'true');
                } else {
                    // Default to showing all properties if no type specified? 
                    // Or maybe just show featured? 
                    // Let's safe-guard to fetch a reasonable list. 
                    // Ideally, the map page should probably show everything available on map.
                    params.append('page_size', '100');
                }

                const response = await apiClient.get(`/properties/?${params.toString()}`);

                if (response.results) {
                    setProperties(response.results);
                } else if (Array.isArray(response)) {
                    setProperties(response);
                }
            } catch (error) {
                console.error('Failed to fetch properties', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProperties();
    }, [type]);

    return (
        <div className="h-[calc(100vh-80px)] w-full relative bg-background">
            <PropertiesMap properties={properties} />

            {/* Overlay Title Card */}
            <div className="absolute top-4 left-4 z-[400] bg-background/95 backdrop-blur-md p-5 rounded-2xl shadow-xl border border-border/50 max-w-xs w-full transition-all hover:scale-[1.02]">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0121 18.382V7.618a1 1 0 01-.553-.894L15 4m0 13V4m0 0L9 7" />
                        </svg>
                    </div>
                    <div>
                        <h1 className="text-lg font-bold text-foreground leading-tight">
                            {type === 'development' ? 'Development Projects' : 'Property Map'}
                        </h1>
                        <p className="text-xs text-muted-foreground font-medium">Explore locations</p>
                    </div>
                </div>

                <div className="h-px bg-border my-3" />

                <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">Properties Found</span>
                    <span className="text-sm font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                        {loading ? '...' : properties.length}
                    </span>
                </div>
            </div>
        </div>
    );
}

export default function MapPage() {
    return (
        <main className="min-h-screen pt-20">
            <Suspense fallback={
                <div className="h-[calc(100vh-80px)] w-full bg-background flex items-center justify-center">
                    <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
                </div>
            }>
                <MapContent />
            </Suspense>
        </main>
    )
}
