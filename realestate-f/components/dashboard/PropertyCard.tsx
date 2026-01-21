'use client';

import React from 'react';
import PropertyCard from '@/components/property/PropertyCard';
import { Property } from '@/types/property';

export function PropertyCardsContainer({ properties: propData }: { properties?: Property[] }) {
    // If no properties are provided, it might mean we are loading or there are none.
    // The parent component should handle empty states, but we can provide a fallback if needed.

    if (!propData || propData.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 px-4 bg-muted/20 rounded-[2.5rem] border border-dashed border-border">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                    <span className="text-2xl">🏠</span>
                </div>
                <h3 className="text-xl font-black text-foreground mb-2">No properties found</h3>
                <p className="text-muted-foreground font-medium text-center max-w-xs">
                    We couldn't find any properties matching your criteria. Try adjusting your search!
                </p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {propData.map((prop: Property) => (
                <PropertyCard
                    key={prop.id}
                    property={prop}
                />
            ))}
        </div>
    );
}

export { PropertyCard };
