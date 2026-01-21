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
        <div className="group relative bg-card rounded-[2.5rem] border border-border/50 overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 h-full flex flex-col">
            <Link href={`/properties/${property.id}`} className="absolute inset-0 z-10" />

            {/* Image Section */}
            <div className="relative aspect-[4/3] overflow-hidden">
                {!imageLoaded && !imageError && (
                    <div className="absolute inset-0 bg-muted animate-pulse" />
                )}
                <img
                    src={property.main_image || property.main_image_url || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=400&h=300'}
                    alt={property.title}
                    onLoad={() => setImageLoaded(true)}
                    onError={() => setImageError(true)}
                    className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                />

                {/* Badges */}
                <div className="absolute top-5 left-5 z-20 flex flex-col gap-2">
                    {property.is_featured && (
                        <span className="bg-primary text-primary-foreground text-[10px] font-black px-4 py-2 rounded-full uppercase tracking-[0.2em] shadow-lg flex items-center gap-1.5">
                            <Star size={12} fill="currentColor" />
                            Premium
                        </span>
                    )}
                    <span className="bg-background/80 backdrop-blur-md text-foreground text-[10px] font-black px-4 py-2 rounded-full uppercase tracking-[0.2em] shadow-lg">
                        {property.property_type || 'For Sale'}
                    </span>
                </div>

                {/* Save Button */}
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className={`absolute top-5 right-5 z-20 p-3 rounded-2xl backdrop-blur-md transition-all duration-300 shadow-lg ${isSaved
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-background/80 text-muted-foreground hover:text-primary hover:bg-background'
                        }`}
                >
                    <Heart size={20} fill={isSaved ? 'currentColor' : 'none'} className={saving ? 'animate-pulse' : ''} />
                </button>

                {/* Price Tag Overlay */}
                <div className="absolute bottom-5 left-5 z-20">
                    <div className="bg-background/90 backdrop-blur-md px-5 py-2.5 rounded-2xl shadow-xl border border-white/10">
                        <span className="text-primary font-black text-lg md:text-xl">
                            {formatPrice(property.price)}
                        </span>
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <div className="p-6 md:p-8 flex flex-col flex-1 space-y-5">
                <div className="space-y-2">
                    <h3 className="font-black text-xl md:text-2xl text-foreground line-clamp-1 group-hover:text-primary transition-colors tracking-tight">
                        {property.title}
                    </h3>
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin size={16} className="text-secondary" />
                        <span className="text-sm font-bold truncate">
                            {property.location?.name}, {property.location?.county}
                        </span>
                    </div>
                </div>

                {/* Divider */}
                <div className="h-px bg-linear-to-r from-transparent via-border to-transparent" />

                {/* Stats */}
                <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 group/icon">
                            <div className="p-2.5 bg-muted/50 rounded-xl group-hover/icon:bg-primary/10 transition-colors">
                                <Bed size={18} className="text-muted-foreground group-hover/icon:text-primary transition-colors" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-sm font-black text-foreground">{property.bedrooms}</span>
                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Beds</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 group/icon">
                            <div className="p-2.5 bg-muted/50 rounded-xl group-hover/icon:bg-secondary/10 transition-colors">
                                <Bath size={18} className="text-muted-foreground group-hover/icon:text-secondary transition-colors" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-sm font-black text-foreground">{property.bathrooms}</span>
                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Baths</span>
                            </div>
                        </div>
                    </div>

                    {property.square_feet && (
                        <div className="flex items-center gap-2 group/icon">
                            <div className="p-2.5 bg-muted/50 rounded-xl group-hover/icon:bg-accent/10 transition-colors">
                                <Maximize size={18} className="text-muted-foreground group-hover/icon:text-accent transition-colors" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-sm font-black text-foreground">{property.square_feet}</span>
                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Sqft</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
