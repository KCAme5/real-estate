'use client';

import React from 'react';

export default function AgentPropertyCard({ property, onEdit, onDelete }: { property: any; onEdit?: (p: any) => void; onDelete?: (id: number) => void }) {
    return (
        <div className="p-4 border rounded-lg shadow-sm bg-base-100 flex flex-col">
            <div className="h-40 w-full bg-base-200 rounded-md overflow-hidden mb-3 flex items-center justify-center">
                {property.main_image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={property.main_image} alt={property.title} className="object-cover w-full h-full" />
                ) : (
                    <div className="text-base-content/50">No image</div>
                )}
            </div>

            <div className="flex-1">
                <h3 className="font-semibold truncate">{property.title}</h3>
                <p className="text-sm text-base-content/70 truncate">{property.location ? (property.location.name || property.location) : '—'}</p>
                <div className="mt-2 font-medium">KES {property.price}</div>
            </div>

            <div className="mt-4 flex items-center gap-2">
                <button className="btn btn-sm btn-outline" onClick={() => onEdit && onEdit(property)}>Edit</button>
                <button className="btn btn-sm btn-error" onClick={() => onDelete && onDelete(property.id)}>Delete</button>
                <a href={`/properties/${property.slug}`} className="ml-auto text-sm text-primary">View</a>
            </div>
        </div>
    );
}
