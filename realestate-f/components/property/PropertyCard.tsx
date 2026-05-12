'use client';

import { Property } from '@/types/property';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, MapPin, Bed, Bath, Maximize, Star } from 'lucide-react';
import { propertyAPI } from '@/lib/api/properties';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/toast';

interface PropertyCardProps {
    property: Property;
    initialSaved?: boolean;
    viewMode?: 'grid' | 'list';
}

export default function PropertyCard({ property, initialSaved = false, viewMode = 'grid' }: PropertyCardProps) {
    const { isAuthenticated } = useAuth();
    const { success, error: showError } = useToast();
    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageError, setImageError] = useState(false);
    const [isSaved, setIsSaved] = useState(initialSaved);
    const [saving, setSaving] = useState(false);

    // Sync with property data (from API) - this is the persistent state
    useEffect(() => {
        if (property.is_saved !== undefined) {
            setIsSaved(property.is_saved);
        }
    }, [property.is_saved]);

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
            showError('Login Required', 'Please log in to save properties');
            return;
        }

        try {
            setSaving(true);
            if (isSaved) {
                await propertyAPI.saveProperty(property.id);
                setIsSaved(false);
                success('Removed from Saved', 'Property removed from your collection');
            } else {
                await propertyAPI.saveProperty(property.id);
                setIsSaved(true);
                success('Property Saved!', 'Property added to your collection');
            }
        } catch (error) {
            console.error('Error toggling save:', error);
            showError('Action Failed', 'Failed to save property. Please try again.');
        } finally {
            setSaving(false);
        }
    };


    if (viewMode === 'list') {
        return (
            <div className="group relative bg-card rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 flex flex-col md:flex-row h-full md:h-64 border border-border/50">
                <Link href={`/properties/${property.slug}`} className="absolute inset-0 z-10" />

                {/* Left Side - Image */}
                <div className="relative w-full md:w-72 h-48 md:h-full overflow-hidden">
                    {!imageLoaded && !imageError && (
                        <div className="absolute inset-0 bg-muted animate-pulse" />
                    )}
                    <Image
                        src={property.main_image || property.main_image_url || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=400&h=300'}
                        alt={property.title}
                        width={400}
                        height={300}
                        onLoad={() => setImageLoaded(true)}
                        onError={() => setImageError(true)}
                        className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                    />
                    <div className="absolute top-3 left-3 z-20 flex flex-col gap-2">
                        {property.is_featured && (
                            <span className="bg-emerald-600 text-white text-xs font-medium px-2.5 py-1 rounded-full shadow-lg flex items-center gap-1">
                                <Star size={12} fill="currentColor" />
                                Featured
                            </span>
                        )}
                        <span className="bg-background/80 backdrop-blur-sm text-foreground text-xs font-medium px-2.5 py-1 rounded-full shadow-lg border border-border/50">
                            {property.property_type || 'For Sale'}
                        </span>
                    </div>
                </div>

                {/* Right Side - Content */}
                <div className="relative p-5 md:p-6 flex flex-col justify-between w-full md:w-[calc(100%-18rem)] bg-card">
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className={`absolute top-5 right-5 z-30 p-2 rounded-lg bg-secondary/50 hover:bg-secondary text-muted-foreground hover:text-emerald-400 transition-colors ${isSaved ? 'text-emerald-500' : ''}`}
                    >
                        <Heart size={18} fill={isSaved ? 'currentColor' : 'none'} className={saving ? 'animate-pulse' : ''} />
                    </button>

                    <div className="space-y-3 pr-10">
                        <div>
                            <h3 className="text-lg md:text-xl font-semibold text-foreground mb-1.5 line-clamp-1">
                                {property.title}
                            </h3>
                            <div className="flex items-center gap-1.5 text-muted-foreground text-sm">
                                <MapPin size={14} className="text-emerald-500" />
                                <span className="truncate">{property.location?.name || 'Location N/A'}</span>
                            </div>
                        </div>

                        <div className="text-xl font-bold text-emerald-400">
                            {formatPrice(property.price)}
                        </div>

                        <p className="text-muted-foreground text-sm line-clamp-2 leading-relaxed">
                            {property.description || 'Experience luxury living in this stunning property with modern amenities and prime location.'}
                        </p>
                    </div>

                    <div className="flex items-center gap-5 mt-4 pt-4 border-t border-border">
                        <div className="flex items-center gap-2">
                            <Bed size={16} className="text-emerald-500" />
                            <span className="text-sm font-medium text-foreground">{property.bedrooms} Beds</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Bath size={16} className="text-emerald-500" />
                            <span className="text-sm font-medium text-foreground">{property.bathrooms} Baths</span>
                        </div>
                        {property.square_feet && (
                            <div className="flex items-center gap-2">
                                <Maximize size={16} className="text-emerald-500" />
                                <span className="text-sm font-medium text-foreground">{property.square_feet} sqft</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // Default Grid View - Professional & Clean
    return (
        <div className="group relative bg-card rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-border/50">
            <Link href={`/properties/${property.slug}`} className="absolute inset-0 z-10" />

            {/* Main Image */}
            <div className="relative aspect-[4/3] sm:aspect-[3/2] overflow-hidden">
                {!imageLoaded && !imageError && (
                    <div className="absolute inset-0 bg-muted animate-pulse" />
                )}
                <Image
                    src={property.main_image || property.main_image_url || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=600&h=400'}
                    alt={property.title}
                    width={600}
                    height={400}
                    onLoad={() => setImageLoaded(true)}
                    onError={() => setImageError(true)}
                    className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                />

                {/* Badges - Top Left */}
                <div className="absolute top-3 left-3 z-20 flex flex-col gap-2">
                    {property.is_featured && (
                        <span className="bg-emerald-600 text-white text-xs font-medium px-2.5 py-1 rounded-full shadow-lg flex items-center gap-1">
                            <Star size={12} fill="currentColor" />
                            Featured
                        </span>
                    )}
                    <span className="bg-background/80 backdrop-blur-sm text-foreground text-xs font-medium px-2.5 py-1 rounded-full shadow-lg border border-border/50">
                        {property.property_type || 'For Sale'}
                    </span>
                </div>

                {/* Save Button - Top Right */}
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className={`absolute top-3 right-3 z-30 p-2 rounded-lg backdrop-blur-sm transition-all shadow-lg ${isSaved
                        ? 'bg-emerald-600 text-white'
                        : 'bg-background/60 text-muted-foreground hover:text-emerald-400 hover:bg-background/80'
                        }`}
                >
                    <Heart size={18} fill={isSaved ? 'currentColor' : 'none'} className={saving ? 'animate-pulse' : ''} />
                </button>
            </div>

            {/* Content Section */}
            <div className="p-4 space-y-3">
                <div className="space-y-1.5">
                    <h3 className="text-base font-semibold text-foreground line-clamp-1 group-hover:text-emerald-400 transition-colors">
                        {property.title}
                    </h3>
                    <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
                        <MapPin size={12} className="text-emerald-500" />
                        <span className="truncate">{property.location?.name || 'Location N/A'}</span>
                    </div>
                </div>

                <div className="text-lg font-bold text-emerald-400">
                    {formatPrice(property.price)}
                </div>

                {/* Property Features */}
                <div className="flex items-center gap-4 pt-3 border-t border-border">
                    <div className="flex items-center gap-1.5">
                        <Bed size={14} className="text-emerald-500" />
                        <span className="text-xs font-medium text-foreground">{property.bedrooms}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Bath size={14} className="text-emerald-500" />
                        <span className="text-xs font-medium text-foreground">{property.bathrooms}</span>
                    </div>
                    {property.square_feet && (
                        <div className="flex items-center gap-1.5">
                            <Maximize size={14} className="text-emerald-500" />
                            <span className="text-xs font-medium text-foreground">{property.square_feet}</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

}
