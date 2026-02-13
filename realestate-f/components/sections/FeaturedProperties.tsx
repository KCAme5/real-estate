'use client';

import { useState, useEffect } from 'react';
import { Property } from '@/types/property';
import PropertyCard from '@/components/property/PropertyCard';
import { apiClient } from '@/lib/api/client';
import { ChevronRight } from 'lucide-react';

export default function FeaturedProperties() {
    const [properties, setProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFeaturedProperties = async () => {
            try {
                const data = await apiClient.get('/properties/featured/');
                setProperties(data);
            } catch (error) {
                console.error('Error fetching featured properties:', JSON.stringify(error, null, 2), error);
            } finally {
                setLoading(false);
            }
        };

        fetchFeaturedProperties();
    }, []);

    if (loading) {
        return (
            <section className="py-20 bg-muted/50">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                            Featured Properties
                        </h2>
                        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                            Discover our handpicked selection of premium properties
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="animate-pulse">
                                <div className="bg-muted h-64 rounded-2xl mb-4"></div>
                                <div className="space-y-3">
                                    <div className="h-4 bg-muted rounded w-3/4"></div>
                                    <div className="h-4 bg-muted rounded w-1/2"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="py-24 bg-slate-950 relative overflow-hidden">
            <div className="absolute top-0 left-0 -translate-y-1/2 -translate-x-1/2 w-96 h-96 bg-emerald-900/20 rounded-full blur-3xl"></div>
            <div className="container mx-auto px-4 relative z-10">
                {/* Section Header */}
                <div className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 bg-emerald-900/30 text-emerald-400 px-4 py-2 rounded-full text-sm font-medium mb-4 border border-emerald-500/20">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                        Premium Selection
                    </div>
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                        Featured Properties
                    </h2>
                    <p className="text-xl text-slate-400 max-w-2xl mx-auto">
                        Discover our handpicked selection of premium properties tailored for discerning buyers and investors.
                    </p>
                </div>

                {/* Horizontal Scroll Container */}
                <div className="relative">
                    <div className="overflow-x-auto scrollbar-hide pb-4">
                        <div className="flex gap-6 min-w-max">
                            {properties.map((property) => (
                                <div
                                    key={property.id}
                                    className="w-80 shrink-0"
                                >
                                    <PropertyCard property={property} />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Scroll Indicator */}
                    {properties.length > 3 && (
                        <div className="absolute right-0 top-0 bottom-0 w-20 bg-linear-to-l from-muted/50 to-transparent pointer-events-none" />
                    )}
                </div>

                {/* View All Button */}
                <div className="text-center mt-12">
                    <a
                        href="/properties"
                        className="inline-flex items-center gap-3 group bg-transparent border-2 border-slate-700 hover:border-emerald-500 text-white hover:text-emerald-400 px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-emerald-500/10"
                    >
                        View All Properties
                        <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </a>
                </div>
            </div>
        </section>
    );
}