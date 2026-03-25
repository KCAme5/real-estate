'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api/client';
import Breadcrumb from '@/components/dashboard/Breadcrumb';
import AgentPropertyForm from '@/components/agents/AgentPropertyForm';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface Property {
    id: number;
    title: string;
    description: string;
    property_type: string;
    listing_type: string;
    price: number;
    currency: string;
    bedrooms?: number;
    bathrooms?: number;
    square_feet?: number;
    address?: string;
    latitude?: number;
    longitude?: number;
    year_built?: number;
    plot_size?: number;
    video_url?: string;
    owner_name?: string;
    owner_phone?: string;
    main_image?: string;
    images?: string[];
    features?: string[];
    location?: any;
    location_name?: string;
}

export default function EditProperty({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const { id } = use(params);
    const [property, setProperty] = useState<Property | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchProperty = async () => {
            try {
                setLoading(true);
                const data = await apiClient.get(`/properties/${id}/`);
                setProperty(data);
            } catch (error: any) {
                console.error('Error fetching property:', error);
                setError(error?.response?.data?.detail || 'Failed to load property');
            } finally {
                setLoading(false);
            }
        };

        fetchProperty();
    }, [id]);

    const handlePropertyUpdated = (updatedProperty: any) => {
        setProperty(updatedProperty);
        // Optionally show success message or redirect
        router.push('/dashboard/agent/properties');
    };

    if (loading) {
        return (
            <div className="p-4 md:p-8 lg:p-10">
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center justify-center min-h-[60vh]">
                        <div className="text-center">
                            <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
                            <p className="text-muted-foreground">Loading property details...</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !property) {
        return (
            <div className="p-4 md:p-8 lg:p-10">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center">
                        <div className="bg-destructive/10 text-destructive p-8 rounded-3xl">
                            <h3 className="text-2xl font-bold mb-2">Error Loading Property</h3>
                            <p className="text-muted-foreground mb-6">{error || 'Property not found'}</p>
                            <Link
                                href="/dashboard/agent/properties"
                                className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-colors"
                            >
                                <ArrowLeft size={18} />
                                Back to Properties
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 lg:p-10">
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Header */}
                <div className="space-y-4">
                    <Breadcrumb />
                    <div className="flex items-center gap-4">
                        <Link
                            href="/dashboard/agent/properties"
                            className="p-3 bg-muted/10 text-muted-foreground hover:bg-muted hover:text-foreground rounded-xl transition-all"
                        >
                            <ArrowLeft size={20} />
                        </Link>
                        <div>
                            <h1 className="text-3xl font-black text-foreground tracking-tight">
                                Edit <span className="text-primary">Property</span>
                            </h1>
                            <p className="text-muted-foreground font-medium mt-1">Update property information and details</p>
                        </div>
                    </div>
                </div>

                {/* Property Form */}
                <div className="bg-card border border-border rounded-3xl p-6 md:p-8">
                    <AgentPropertyForm
                        initial={property}
                        onUpdated={handlePropertyUpdated}
                        onCreated={() => { }} // Not used in edit mode
                        onCancel={() => router.push('/dashboard/agent/properties')}
                    />
                </div>
            </div>
        </div>
    );
}
