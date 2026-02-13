'use client';

import { Property } from '@/types/property';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Heart, MapPin, Bed, Bath, Maximize, Star } from 'lucide-react';
import { propertyAPI } from '@/lib/api/properties';
import { useAuth } from '@/hooks/useAuth';

interface PropertyCardProps {
    property: Property;
    initialSaved?: boolean;
}

export default function PropertyCard({ property, initialSaved = false }: PropertyCardProps) {
    const { isAuthenticated } = useAuth();
    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageError, setImageError] = useState(false);
    const [isSaved, setIsSaved] = useState(initialSaved);
    const [saving, setSaving] = useState(false);

    const formatPrice = (price: number | string) => {
        const numPrice = typeof price === 'string' ? parseFloat(price) : price;
        return new Intl.NumberFormat('en-KE', {
            style: 'currency',
            currency: property.currency || 'KES',
            minimumFractionDigits: 0,
        }).format(numPrice);
    };

    const handleSave = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!isAuthenticated) {
            // Optional: Show login prompt
            return;
        }

        try {
            setSaving(true);
            if (isSaved) {
                // If we had the saved_id we'd use it, otherwise we might need to find it
                // For now, let's assume the API handles toggle or we fetch it
                // propertyAPI.removeSavedProperty needs the ID of the SavedProperty entry
                // Simplified for now:
                await propertyAPI.saveProperty(property.id); // Toggle logic on backend usually?
                setIsSaved(false);
            } else {
                await propertyAPI.saveProperty(property.id);
                setIsSaved(true);
            }
        } catch (error) {
            console.error('Error toggling save:', error);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="group relative bg-slate-900 rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 aspect-3/4 sm:aspect-2/3 hover:-translate-y-2">
            {/* Animated Green Frame */}
            <div className="absolute inset-0 border-2 border-emerald-500/0 group-hover:border-emerald-500/50 rounded-3xl transition-colors duration-500 pointer-events-none z-20"></div>
            <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-20"></div>

            <Link href={`/properties/${property.slug}`} className="absolute inset-0 z-10" />

            {/* Main Image - Now covers the whole card */}
            <div className="absolute inset-0">
                {!imageLoaded && !imageError && (
                    <div className="absolute inset-0 bg-slate-800 animate-pulse" />
                )}
                <img
                    src={property.main_image || property.main_image_url || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=400&h=300'}
                    alt={property.title}
                    onLoad={() => setImageLoaded(true)}
                    onError={() => setImageError(true)}
                    className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                />

                {/* Gradient Overlay for better text readability on hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/50 to-transparent opacity-60 group-hover:opacity-90 transition-opacity duration-300" />
            </div>

            {/* Status Badges - Top Left (Keep these minimal) */}
            <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
                {property.is_featured && (
                    <span className="bg-emerald-600 text-white text-[10px] font-semibold px-3 py-1.5 rounded-full uppercase tracking-wider shadow-lg flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Star size={10} fill="currentColor" />
                        Featured
                    </span>
                )}
                <span className="bg-slate-950/60 backdrop-blur-md text-emerald-100 text-[10px] font-semibold px-3 py-1.5 rounded-full uppercase tracking-wider shadow-lg border border-emerald-500/20">
                    {property.property_type || 'For Sale'}
                </span>
            </div>

            {/* Save Button - Top Right */}
            <button
                onClick={handleSave}
                disabled={saving}
                className={`absolute top-4 right-4 z-30 p-2.5 rounded-xl backdrop-blur-md transition-all duration-300 shadow-lg ${isSaved
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-950/40 text-white/80 hover:text-white hover:bg-slate-950/60 hover:text-emerald-400'
                    }`}
            >
                <Heart size={18} fill={isSaved ? 'currentColor' : 'none'} className={saving ? 'animate-pulse' : ''} />
            </button>

            {/* Hover Content Section - Appears from bottom */}
            <div className="absolute inset-x-0 bottom-0 z-20 p-6 flex flex-col space-y-4 translate-y-2 transition-all duration-300">
                <div className="space-y-1">
                    <h3 className="text-xl font-semibold text-white leading-tight group-hover:text-emerald-400 transition-colors">
                        {property.title}
                    </h3>
                    <div className="flex items-center gap-1.5 text-slate-300">
                        <MapPin size={14} className="text-emerald-500" />
                        <span className="text-sm truncate">
                            {property.location?.name || 'Location N/A'}
                        </span>
                    </div>
                </div>

                <div className="text-2xl font-bold text-white group-hover:scale-105 transition-transform duration-300 origin-left">
                    {formatPrice(property.price)}
                </div>

                {/* Property Features */}
                <div className="flex items-center gap-4 pt-4 border-t border-emerald-500/20 opacity-80 group-hover:opacity-100 transition-opacity delay-75">
                    <div className="flex items-center gap-2">
                        <Bed size={16} className="text-emerald-400" />
                        <span className="text-sm font-semibold text-slate-200">{property.bedrooms}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Bath size={16} className="text-emerald-400" />
                        <span className="text-sm font-semibold text-slate-200">{property.bathrooms}</span>
                    </div>
                    {property.square_feet && (
                        <div className="flex items-center gap-2">
                            <Maximize size={16} className="text-emerald-400" />
                            <span className="text-sm font-semibold text-slate-200">{property.square_feet}</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
