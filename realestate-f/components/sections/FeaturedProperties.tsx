'use client';

import { useState, useEffect } from 'react';
import { Property } from '@/types/property';
import PropertyCard from '@/components/property/PropertyCard';
import PropertyCardSkeleton from '@/components/property/PropertyCardSkeleton';
import { apiClient } from '@/lib/api/client';
import { ChevronRight } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

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
            <section className="py-24 bg-slate-950 relative overflow-hidden">
                <div className="absolute top-0 left-0 -translate-y-1/2 -translate-x-1/2 w-96 h-96 bg-emerald-900/20 rounded-full blur-3xl"></div>
                <div className="container mx-auto px-4 relative z-10">
                    <div className="text-center mb-16">
                        <div className="inline-flex items-center gap-2 bg-emerald-900/30 text-emerald-400 px-4 py-2 rounded-full text-sm font-medium mb-4 border border-emerald-500/20">
                            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                            Premium Selection
                        </div>
                        <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                            Featured Properties
                        </h2>
                        <Skeleton className="h-6 w-1/2 mx-auto bg-slate-800/50 mb-4 rounded-md" />
                    </div>

                    <div className="overflow-x-auto scrollbar-hide pb-4">
                        <div className="flex gap-6 min-w-max">
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="w-80 shrink-0">
                                    <PropertyCardSkeleton />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="py-16 sm:py-20 bg-background relative overflow-hidden">
            {/* Subtle Background Decoration */}
            <div className="absolute top-0 left-1/4 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl"></div>

            <div className="container mx-auto px-4 relative z-10">
                {/* Section Header - Clean & Professional */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 bg-emerald-500/10 text-emerald-400 px-4 py-1.5 rounded-full text-xs font-medium mb-4 border border-emerald-500/20">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                        Premium Selection
                    </div>
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4 tracking-tight">
                        Featured Properties
                    </h2>
                    <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                        Discover our handpicked selection of premium properties tailored for discerning buyers and investors.
                    </p>
                </div>

                {/* Horizontal Scroll Container - Improved UX */}
                <div className="relative">
                    <div className="overflow-x-auto scrollbar-hide pb-4 -mx-4 px-4">
                        <div className="flex gap-4 sm:gap-6 min-w-max">
                            {properties.map((property) => (
                                <div
                                    key={property.id}
                                    className="w-72 sm:w-80 shrink-0"
                                >
                                    <PropertyCard property={property} />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* View All Button - Professional Style */}
                <div className="text-center mt-10">
                    <a
                        href="/properties"
                        className="inline-flex items-center gap-2 group bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-300 shadow-md hover:shadow-lg"
                    >
                        View All Properties
                        <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </a>
                </div>
            </div>
        </section>
    );
}