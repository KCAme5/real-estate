"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { apiClient } from '@/lib/api/client';

type City = {
    name: string;
    count: number | null;
    percent: number | null;
    total: number | null;
    image: string;
};

type LocationStatsResponse = {
    total: number;
    locations: Array<{ name: string; count: number; percent: number }>;
};

const initialCities: City[] = [
    {
        name: 'Nairobi',
        count: null,
        percent: null,
        total: null,
        image: 'https://images.unsplash.com/photo-1620549146396-9024d914cd99?q=80&w=600&auto=format&fit=crop',
    },
    {
        name: 'Mombasa',
        count: null,
        percent: null,
        total: null,
        image: 'https://images.unsplash.com/photo-1547895056-bb6d0c733350?q=80&w=600&auto=format&fit=crop',
    },
    {
        name: 'Kisumu',
        count: null,
        percent: null,
        total: null,
        image: 'https://images.unsplash.com/photo-1549247656-749448834d88?q=80&w=600&auto=format&fit=crop',
    },
    {
        name: 'Nakuru',
        count: null,
        percent: null,
        total: null,
        image: 'https://images.unsplash.com/photo-1580974852860-19d26390a424?q=80&w=600&auto=format&fit=crop',
    },
    {
        name: 'Eldoret',
        count: null,
        percent: null,
        total: null,
        image: 'https://images.unsplash.com/photo-1565514020176-db8a7fb99564?q=80&w=600&auto=format&fit=crop',
    },
];

const PopularAreas = () => {
    const [cities, setCities] = useState(initialCities);

    useEffect(() => {
        const fetchCounts = async () => {
            try {
                const names = initialCities.map((c) => c.name).join(',');
                const data = await apiClient.get<LocationStatsResponse>('/properties/location-stats/', {
                    params: { names },
                });

                const byName = new Map<string, { count: number }>(
                    (data.locations || []).map((l) => [l.name, { count: l.count }])
                );

                setCities(
                    initialCities.map((city) => ({
                        ...city,
                        count: byName.get(city.name)?.count ?? 0,
                        total: data.total ?? 0,
                        percent: (data.total ?? 0) > 0 ? Math.round(((byName.get(city.name)?.count ?? 0) / (data.total ?? 0)) * 100) : 0,
                    }))
                );
            } catch (error) {
                console.error('Error fetching popular area counts:', error);
                setCities(initialCities.map((city) => ({ ...city, count: 0, percent: 0, total: 0 })));
            }
        };

        fetchCounts();
    }, []);

    return (
        <section className="py-24 bg-slate-950 relative">
            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-emerald-900/10 rounded-full blur-3xl"></div>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
                    <div>
                        <h2 className="text-3xl md:text-4xl font-bold text-white font-serif mb-2">Popular Areas</h2>
                        <div className="h-1 w-20 bg-emerald-500 rounded-full"></div>
                    </div>
                    <Link
                        href="/properties"
                        className="group flex items-center text-emerald-500 font-medium hover:text-emerald-400 transition-colors"
                    >
                        View All Locations
                        <ArrowRight className="ml-2 w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                    {cities.map((city) => (
                        <Link
                            key={city.name}
                            href={`/properties?location=${city.name}`}
                            className="group relative h-80 rounded-2xl overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-slate-800"
                        >
                            {/* Background Image */}
                            <div
                                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                                style={{ backgroundImage: `url(${city.image})` }}
                            ></div>

                            {/* Gradient Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent transition-opacity duration-300 group-hover:via-black/50"></div>

                            {/* Content */}
                            <div className="absolute bottom-0 left-0 p-6 w-full transform transition-transform duration-300 translate-y-2 group-hover:translate-y-0">
                                <h3 className="text-xl font-bold text-white mb-1 group-hover:text-emerald-400 transition-colors">{city.name}</h3>
                                <p className="text-xs font-bold text-slate-300 tracking-wider uppercase mb-2 opacity-80 group-hover:opacity-100 transition-opacity">
                                    {city.count === null || city.percent === null || city.total === null
                                        ? '...'
                                        : `${city.count} ${city.count === 1 ? 'Property' : 'Properties'} • ${city.percent}% of listings`}
                                </p>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default PopularAreas;
