'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, Home, Star, Bed, Bath, Maximize2, X, Search, Filter, ChevronDown } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import 'leaflet.markercluster';

// Fix for default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface Property {
    id: number;
    title: string;
    slug: string;
    latitude: number | null;
    longitude: number | null;
    price: number;
    currency: string;
    property_type: string;
    location_name?: string;
    location?: {
        name: string;
        county: string;
    };
    main_image?: string;
    bedrooms?: number;
    bathrooms?: number;
    square_feet?: number;
    is_featured?: boolean;
    listing_type?: string;
}

// Custom marker icons for different property types
const getMarkerIcon = (propertyType: string, isFeatured: boolean = false) => {
    const iconColors: Record<string, string> = {
        apartment: '#10b981',
        townhouse: '#3b82f6',
        maisonette: '#8b5cf6',
        land: '#f59e0b',
        commercial: '#ef4444',
        office: '#6366f1',
        duplex: '#ec4899',
        bungalow: '#14b8a6',
        villa: '#f97316',
    };

    const color = iconColors[propertyType] || '#10b981';
    const size = isFeatured ? 40 : 30;
    const borderWidth = isFeatured ? 3 : 2;
    const starIcon = isFeatured ? '<span style="position:absolute;top:-8px;right:-8px;font-size:14px;">⭐</span>' : '';

    return L.divIcon({
        className: 'custom-marker',
        html: `
            <div style="position:relative;">
                <div style="
                    background-color: ${color};
                    width: ${size}px;
                    height: ${size}px;
                    border-radius: 50% 50% 50% 0;
                    transform: rotate(-45deg);
                    border: ${borderWidth}px solid white;
                    box-shadow: 0 2px 5px rgba(0,0,0,0.3);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                ">
                    <div style="
                        transform: rotate(45deg);
                        color: white;
                        font-size: ${isFeatured ? 14 : 12}px;
                        font-weight: bold;
                    ">
                        ${propertyType.charAt(0).toUpperCase()}
                    </div>
                </div>
                ${starIcon}
            </div>
        `,
        iconSize: [size, size],
        iconAnchor: [size / 2, size],
        popupAnchor: [0, -size],
    });
};

export default function MapPage() {
    const router = useRouter();
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<L.Map | null>(null);
    const clusterGroupRef = useRef<L.MarkerClusterGroup | null>(null);

    const [properties, setProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [showFilters, setShowFilters] = useState(false);

    // Fetch properties
    useEffect(() => {
        const fetchProperties = async () => {
            try {
                const response = await fetch(
                    (process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api') + '/properties/'
                );
                const data = await response.json();
                setProperties(data.results || data || []);
            } catch (error) {
                console.error('Error fetching properties:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProperties();
    }, []);

    // Initialize map
    useEffect(() => {
        if (!mapRef.current || mapInstanceRef.current) return;

        const map = L.map(mapRef.current).setView([-1.2921, 36.8219], 12);

        // Add Carto dark tile layer
        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
            subdomains: 'abcd',
            maxZoom: 20,
        }).addTo(map);

        // Initialize marker cluster group
        const clusterGroup = L.markerClusterGroup({
            chunkedLoading: true,
            spiderfyOnMaxZoom: true,
            showCoverageOnHover: false,
            zoomToBoundsOnClick: true,
            maxClusterRadius: 50,
        });

        map.addLayer(clusterGroup);
        mapInstanceRef.current = map;
        clusterGroupRef.current = clusterGroup;

        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
                clusterGroupRef.current = null;
            }
        };
    }, []);

    // Update markers when properties or filters change
    useEffect(() => {
        if (!clusterGroupRef.current || !mapInstanceRef.current) return;

        clusterGroupRef.current.clearLayers();

        let filteredProperties = properties.filter(
            (p) => p.latitude !== null && p.longitude !== null
        );

        // Apply search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filteredProperties = filteredProperties.filter(
                (p) =>
                    p.title.toLowerCase().includes(query) ||
                    p.location_name?.toLowerCase().includes(query) ||
                    p.location?.name.toLowerCase().includes(query)
            );
        }

        // Apply type filter
        if (filterType !== 'all') {
            filteredProperties = filteredProperties.filter(
                (p) => p.property_type === filterType
            );
        }

        filteredProperties.forEach((property) => {
            const marker = L.marker(
                [property.latitude as number, property.longitude as number],
                { icon: getMarkerIcon(property.property_type, property.is_featured) }
            );

            const formatPrice = (price: number, currency: string) => {
                return new Intl.NumberFormat('en-KE', {
                    style: 'currency',
                    currency: currency || 'KES',
                    maximumFractionDigits: 0,
                }).format(price);
            };

            const popupContent = `
                <div class="p-2 min-w-[250px]">
                    ${property.main_image ? `
                        <img 
                            src="${property.main_image}" 
                            alt="${property.title}"
                            class="w-full h-32 object-cover rounded-lg mb-2"
                        />
                    ` : ''}
                    <div class="flex items-center gap-2 mb-1">
                        ${property.is_featured ? '<span class="text-yellow-500">⭐</span>' : ''}
                        <h3 class="font-semibold text-sm">${property.title}</h3>
                    </div>
                    <p class="text-xs text-gray-600 mb-1">
                        ${property.location_name || property.location?.name || 'Location not specified'}
                    </p>
                    <p class="text-sm font-bold text-emerald-600">
                        ${formatPrice(property.price, property.currency)}
                    </p>
                    <div class="flex gap-3 mt-2 text-xs text-gray-500">
                        ${property.bedrooms ? `<span class="flex items-center gap-1"><span>🛏️</span>${property.bedrooms}</span>` : ''}
                        ${property.bathrooms ? `<span class="flex items-center gap-1"><span>🚿</span>${property.bathrooms}</span>` : ''}
                        ${property.square_feet ? `<span class="flex items-center gap-1"><span>📐</span>${property.square_feet} sqft</span>` : ''}
                    </div>
                    <button 
                        onclick="window.location.href='/properties/${property.slug}'"
                        class="mt-2 w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition-colors"
                    >
                        View Details
                    </button>
                </div>
            `;

            marker.bindPopup(popupContent);
            marker.on('click', () => {
                setSelectedProperty(property);
            });

            clusterGroupRef.current?.addLayer(marker);
        });

        // Fit map to show all markers
        if (filteredProperties.length > 0) {
            const bounds = L.latLngBounds(
                filteredProperties.map((p) => [p.latitude as number, p.longitude as number])
            );
            mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50] });
        }
    }, [properties, searchQuery, filterType]);

    const propertyTypes = ['all', 'apartment', 'townhouse', 'maisonette', 'land', 'commercial', 'office', 'duplex', 'bungalow', 'villa'];

    return (
        <div className="relative h-screen w-full bg-slate-950">
            {/* Header */}
            <div className="absolute top-0 left-0 right-0 z-20 bg-slate-900/95 backdrop-blur-xl border-b border-slate-800">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center">
                                <MapPin className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-white">Property Map</h1>
                                <p className="text-xs text-slate-400">
                                    {properties.filter(p => p.latitude && p.longitude).length} properties on map
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            {/* Search */}
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search properties..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 w-64"
                                />
                            </div>

                            {/* Filter Button */}
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className="flex items-center gap-2 px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white hover:bg-slate-700 transition-colors"
                            >
                                <Filter className="w-4 h-4" />
                                <span>Filter</span>
                                <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                            </button>

                            {/* Close Button */}
                            <button
                                onClick={() => router.back()}
                                className="p-2 bg-slate-800 border border-slate-700 rounded-xl text-white hover:bg-slate-700 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Filters */}
                    {showFilters && (
                        <div className="mt-4 flex flex-wrap gap-2">
                            {propertyTypes.map((type) => (
                                <button
                                    key={type}
                                    onClick={() => setFilterType(type)}
                                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${filterType === type
                                            ? 'bg-emerald-500 text-white'
                                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                                        }`}
                                >
                                    {type === 'all' ? 'All Types' : type.charAt(0).toUpperCase() + type.slice(1)}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Map */}
            <div ref={mapRef} className="h-full w-full" />

            {/* Loading State */}
            {loading && (
                <div className="absolute inset-0 bg-slate-950/80 flex items-center justify-center z-30">
                    <div className="text-center">
                        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-white font-medium">Loading properties...</p>
                    </div>
                </div>
            )}

            {/* Legend */}
            <div className="absolute bottom-4 left-4 z-20 bg-slate-900/95 backdrop-blur-xl rounded-xl p-4 border border-slate-800">
                <h3 className="text-sm font-bold text-white mb-3">Property Types</h3>
                <div className="grid grid-cols-2 gap-2 text-xs">
                    {[
                        { type: 'Apartment', color: '#10b981' },
                        { type: 'Townhouse', color: '#3b82f6' },
                        { type: 'Maisonette', color: '#8b5cf6' },
                        { type: 'Land', color: '#f59e0b' },
                        { type: 'Commercial', color: '#ef4444' },
                        { type: 'Office', color: '#6366f1' },
                        { type: 'Duplex', color: '#ec4899' },
                        { type: 'Bungalow', color: '#14b8a6' },
                        { type: 'Villa', color: '#f97316' },
                    ].map(({ type, color }) => (
                        <div key={type} className="flex items-center gap-2">
                            <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: color }}
                            />
                            <span className="text-slate-300">{type}</span>
                        </div>
                    ))}
                </div>
                <div className="mt-3 pt-3 border-t border-slate-700">
                    <div className="flex items-center gap-2 text-xs text-slate-300">
                        <span>⭐</span>
                        <span>Featured Property</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
