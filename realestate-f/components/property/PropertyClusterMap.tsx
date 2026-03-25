'use client';

import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import 'leaflet.markercluster';

// Fix for default marker icons in Leaflet with webpack
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface Property {
    id: number;
    title: string;
    latitude: number | null;
    longitude: number | null;
    price: number;
    currency: string;
    property_type: string;
    location_name?: string;
    main_image?: string;
    bedrooms?: number;
    bathrooms?: number;
}

interface PropertyClusterMapProps {
    properties: Property[];
    className?: string;
    height?: string;
    zoom?: number;
    onPropertyClick?: (property: Property) => void;
}

// Custom marker icons for different property types
const getMarkerIcon = (propertyType: string) => {
    const iconColors: Record<string, string> = {
        apartment: '#10b981', // emerald
        townhouse: '#3b82f6', // blue
        maisonette: '#8b5cf6', // violet
        land: '#f59e0b', // amber
        commercial: '#ef4444', // red
        office: '#6366f1', // indigo
        duplex: '#ec4899', // pink
        bungalow: '#14b8a6', // teal
        villa: '#f97316', // orange
    };

    const color = iconColors[propertyType] || '#10b981';

    return L.divIcon({
        className: 'custom-marker',
        html: `
            <div style="
                background-color: ${color};
                width: 30px;
                height: 30px;
                border-radius: 50% 50% 50% 0;
                transform: rotate(-45deg);
                border: 2px solid white;
                box-shadow: 0 2px 5px rgba(0,0,0,0.3);
                display: flex;
                align-items: center;
                justify-content: center;
            ">
                <div style="
                    transform: rotate(45deg);
                    color: white;
                    font-size: 12px;
                    font-weight: bold;
                ">
                    ${propertyType.charAt(0).toUpperCase()}
                </div>
            </div>
        `,
        iconSize: [30, 30],
        iconAnchor: [15, 30],
        popupAnchor: [0, -30],
    });
};

export default function PropertyClusterMap({
    properties,
    className = '',
    height = '500px',
    zoom = 12,
    onPropertyClick,
}: PropertyClusterMapProps) {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<L.Map | null>(null);
    const clusterGroupRef = useRef<L.MarkerClusterGroup | null>(null);

    useEffect(() => {
        if (!mapRef.current || mapInstanceRef.current) return;

        // Initialize map centered on Nairobi, Kenya
        const map = L.map(mapRef.current).setView([-1.2921, 36.8219], zoom);

        // Add Carto dark tile layer for premium look
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

        // Cleanup function
        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
                clusterGroupRef.current = null;
            }
        };
    }, [zoom]);

    // Update markers when properties change
    useEffect(() => {
        if (!clusterGroupRef.current || !mapInstanceRef.current) return;

        // Clear existing markers
        clusterGroupRef.current.clearLayers();

        // Add markers for each property with valid coordinates
        const validProperties = properties.filter(
            (p) => p.latitude !== null && p.longitude !== null
        );

        validProperties.forEach((property) => {
            const marker = L.marker(
                [property.latitude as number, property.longitude as number],
                { icon: getMarkerIcon(property.property_type) }
            );

            // Create popup content
            const popupContent = `
                <div class="p-2 min-w-[200px]">
                    ${property.main_image ? `
                        <img 
                            src="${property.main_image}" 
                            alt="${property.title}"
                            class="w-full h-24 object-cover rounded-lg mb-2"
                        />
                    ` : ''}
                    <h3 class="font-semibold text-sm mb-1">${property.title}</h3>
                    <p class="text-xs text-gray-600 mb-1">
                        ${property.location_name || 'Location not specified'}
                    </p>
                    <p class="text-sm font-bold text-emerald-600">
                        ${property.currency} ${property.price.toLocaleString()}
                    </p>
                    <div class="flex gap-2 mt-2 text-xs text-gray-500">
                        ${property.bedrooms ? `<span>${property.bedrooms} beds</span>` : ''}
                        ${property.bathrooms ? `<span>${property.bathrooms} baths</span>` : ''}
                    </div>
                </div>
            `;

            marker.bindPopup(popupContent);

            // Add click handler
            if (onPropertyClick) {
                marker.on('click', () => {
                    onPropertyClick(property);
                });
            }

            clusterGroupRef.current?.addLayer(marker);
        });

        // Fit map to show all markers
        if (validProperties.length > 0) {
            const bounds = L.latLngBounds(
                validProperties.map((p) => [p.latitude as number, p.longitude as number])
            );
            mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50] });
        }
    }, [properties, onPropertyClick]);

    return (
        <div
            ref={mapRef}
            className={`rounded-xl overflow-hidden border border-slate-700 ${className}`}
            style={{ height }}
        />
    );
}
