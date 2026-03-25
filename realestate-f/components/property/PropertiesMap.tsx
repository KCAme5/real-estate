'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import Link from 'next/link';
import Image from 'next/image';
import { Property } from '@/types/property';

// Fix for default marker icons
const iconUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png';
const iconRetinaUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png';
const shadowUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png';

function useLeafletFix() {
    useEffect(() => {
        // Only run on client
        if (typeof window === 'undefined') return;

        const DefaultIcon = L.icon({
            iconUrl,
            iconRetinaUrl,
            shadowUrl,
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            tooltipAnchor: [16, -28],
            shadowSize: [41, 41]
        });
        L.Marker.prototype.options.icon = DefaultIcon;
    }, []);
}

interface PropertiesMapProps {
    properties: Property[];
}

// Component to fit bounds
function MapBounds({ properties }: { properties: Property[] }) {
    const map = useMap();

    useEffect(() => {
        if (properties.length > 0) {
            const bounds = L.latLngBounds([]);
            let hasValidCoords = false;

            properties.forEach(p => {
                const lat = parseFloat(p.latitude || '0');
                const lng = parseFloat(p.longitude || '0');
                if (!isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0) {
                    bounds.extend([lat, lng]);
                    hasValidCoords = true;
                }
            });

            if (hasValidCoords) {
                map.fitBounds(bounds, { padding: [50, 50] });
            }
        }
    }, [map, properties]);

    return null;
}

export default function PropertiesMap({ properties }: PropertiesMapProps) {
    const [isMounted, setIsMounted] = useState(false);
    useLeafletFix();

    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Default center (Nairobi)
    const defaultCenter: [number, number] = [-1.2921, 36.8219];

    if (!isMounted) {
        return <div className="h-full w-full bg-muted animate-pulse rounded-xl flex items-center justify-center text-muted-foreground font-medium">Loading Map...</div>;
    }

    // Filter valid properties
    const validProperties = properties.filter(p => {
        const lat = parseFloat(p.latitude || '0');
        const lng = parseFloat(p.longitude || '0');
        return !isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0;
    });

    return (
        <div className="h-full w-full rounded-none md:rounded-xl overflow-hidden border-0 md:border border-border shadow-none md:shadow-sm relative z-0">
            <MapContainer
                center={defaultCenter}
                zoom={12}
                scrollWheelZoom={true}
                className="h-full w-full"
                style={{ height: '100%', width: '100%' }}
            >
                <TileLayer
                    attribution='&copy; OpenStreetMap'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {validProperties.map((property) => {
                    const lat = parseFloat(property.latitude!);
                    const lng = parseFloat(property.longitude!);
                    return (
                        <Marker
                            key={property.id}
                            position={[lat, lng]}
                        >
                            <Popup minWidth={280} maxWidth={320} className="property-popup">
                                <div className="flex flex-col gap-2 p-1">
                                    <div className="relative w-full h-32 rounded-lg overflow-hidden bg-muted">
                                        <Image
                                            src={property.main_image || property.main_image_url || '/placeholder-property.jpg'}
                                            alt={property.title}
                                            fill
                                            className="object-cover"
                                            sizes="300px"
                                        />
                                        <div className="absolute top-2 left-2 bg-primary/90 backdrop-blur-sm text-primary-foreground text-[10px] px-2 py-1 rounded-full font-bold uppercase tracking-wider">
                                            {property.property_type || property.listing_type}
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <h3 className="font-bold text-sm text-foreground line-clamp-1">{property.title}</h3>
                                        <p className="text-muted-foreground text-xs line-clamp-1">{property.location?.name}</p>
                                        <div className="flex justify-between items-center mt-2">
                                            <p className="font-bold text-primary text-sm">
                                                {new Intl.NumberFormat('en-KE', { style: 'currency', currency: property.currency || 'KES' }).format(Number(property.price))}
                                            </p>
                                        </div>
                                    </div>
                                    <Link
                                        href={`/properties/${property.slug}`}
                                        className="block w-full text-center bg-primary text-primary-foreground text-xs font-bold py-2.5 rounded-lg hover:bg-primary/90 transition-all shadow-md mt-1"
                                    >
                                        View Details
                                    </Link>
                                </div>
                            </Popup>
                        </Marker>
                    );
                })}

                <MapBounds properties={properties} />
            </MapContainer>
        </div>
    );
}
