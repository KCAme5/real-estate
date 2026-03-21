'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in Leaflet with webpack
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface PropertyMapProps {
    latitude: number;
    longitude: number;
    address?: string;
    title?: string;
    className?: string;
    height?: string;
    zoom?: number;
}

export default function PropertyMap({
    latitude,
    longitude,
    address,
    title,
    className = '',
    height = '400px',
    zoom = 15,
}: PropertyMapProps) {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<L.Map | null>(null);

    useEffect(() => {
        if (!mapRef.current || mapInstanceRef.current) return;

        // Initialize map
        const map = L.map(mapRef.current).setView([latitude, longitude], zoom);

        // Add Carto dark tile layer for premium look
        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
            subdomains: 'abcd',
            maxZoom: 20,
        }).addTo(map);

        // Add marker
        const marker = L.marker([latitude, longitude]).addTo(map);

        // Add popup with property info
        if (title || address) {
            const popupContent = `
                <div class="p-2">
                    ${title ? `<h3 class="font-semibold text-sm mb-1">${title}</h3>` : ''}
                    ${address ? `<p class="text-xs text-gray-600">${address}</p>` : ''}
                </div>
            `;
            marker.bindPopup(popupContent);
        }

        mapInstanceRef.current = map;

        // Cleanup function
        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
        };
    }, [latitude, longitude, title, address, zoom]);

    // Update map view if coordinates change
    useEffect(() => {
        if (mapInstanceRef.current) {
            mapInstanceRef.current.setView([latitude, longitude], zoom);
        }
    }, [latitude, longitude, zoom]);

    return (
        <div
            ref={mapRef}
            className={`rounded-xl overflow-hidden border border-slate-700 ${className}`}
            style={{ height }}
        />
    );
}
