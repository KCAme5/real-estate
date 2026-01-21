"use client";

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

/**
 * Leaflet icon fix for Next.js
 * Manually setting icon paths to unpkg CDN to avoid path resolution errors in Turbopack.
 */
function useLeafletFix() {
    useEffect(() => {
        // Fix for default marker icons
        const DefaultIcon = L.icon({
            iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
            iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
            shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            tooltipAnchor: [16, -28],
            shadowSize: [41, 41]
        });

        L.Marker.prototype.options.icon = DefaultIcon;
    }, []);
}

/**
 * Component to handle map view updates when props change
 */
function MapSynchronizer({ center, zoom }: { center: [number, number], zoom: number }) {
    const map = useMap();

    useEffect(() => {
        if (center && !isNaN(center[0]) && !isNaN(center[1])) {
            map.setView(center, zoom);
        }
    }, [map, center, zoom]);

    return null;
}

interface MapProps {
    center: [number, number];
    zoom?: number;
    title?: string;
}

export default function Map({ center, zoom = 13, title }: MapProps) {
    const [isMounted, setIsMounted] = useState(false);

    useLeafletFix();

    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Basic validation to prevent Leaflet from crashing on invalid data
    const isValidCoords = Array.isArray(center) &&
        center.length === 2 &&
        !isNaN(center[0]) &&
        !isNaN(center[1]);

    if (!isMounted || !isValidCoords) {
        return (
            <div className="h-full w-full bg-muted/50 animate-pulse rounded-[3rem] flex items-center justify-center">
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Initializing Protected Map Area...</span>
            </div>
        );
    }

    return (
        <div className="h-full w-full rounded-[3rem] overflow-hidden border border-border/50 shadow-2xl relative">
            <MapContainer
                center={center}
                zoom={zoom}
                scrollWheelZoom={false}
                className="h-full w-full"
                style={{ background: '#f8f9fa' }}
            >
                <TileLayer
                    attribution='&copy; OpenStreetMap'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <Marker position={center}>
                    {title && (
                        <Popup minWidth={90}>
                            <div className="text-center">
                                <p className="font-black text-xs uppercase tracking-tight m-0">{title}</p>
                            </div>
                        </Popup>
                    )}
                </Marker>

                <MapSynchronizer center={center} zoom={zoom} />
            </MapContainer>
        </div>
    );
}
