"use client";

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

const cities = [
    {
        name: 'Nairobi',
        count: '2,450',
        image: 'https://images.unsplash.com/photo-1620549146396-9024d914cd99?q=80&w=600&auto=format&fit=crop', // Nairobi skyline placeholder
    },
    {
        name: 'Mombasa',
        count: '1,120',
        image: 'https://images.unsplash.com/photo-1547895056-bb6d0c733350?q=80&w=600&auto=format&fit=crop', // Coastal/Mombasa link
    },
    {
        name: 'Kisumu',
        count: '680',
        image: 'https://images.unsplash.com/photo-1549247656-749448834d88?q=80&w=600&auto=format&fit=crop', // Lake/Nature
    },
    {
        name: 'Nakuru',
        count: '450',
        image: 'https://images.unsplash.com/photo-1580974852860-19d26390a424?q=80&w=600&auto=format&fit=crop', // Flamingo/Lake
    },
    {
        name: 'Eldoret',
        count: '192',
        image: 'https://images.unsplash.com/photo-1565514020176-db8a7fb99564?q=80&w=600&auto=format&fit=crop', // General urban/nature
    },
];

const PopularAreas = () => {
    return (
        <section className="py-24 bg-slate-950 relative">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
                    <div>
                        <h2 className="text-3xl md:text-4xl font-bold text-white font-serif mb-2">Popular Areas</h2>
                        <div className="h-1 w-20 bg-emerald-500 rounded-full"></div>
                    </div>
                    <Link
                        href="/locations"
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
                            className="group relative h-80 rounded-2xl overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
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
                                    {city.count} Properties
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
