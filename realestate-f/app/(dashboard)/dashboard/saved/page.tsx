'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { PropertyCardsContainer } from '@/components/dashboard/PropertyCard';
import { Filter, Search, Heart } from 'lucide-react';
import Link from 'next/link';
import { propertyAPI } from '@/lib/api/properties';
import Breadcrumb from '@/components/dashboard/Breadcrumb';

export default function SavedPropertiesPage() {
    const { user } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');
    const [savedProperties, setSavedProperties] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSaved = async () => {
            try {
                const data = await propertyAPI.getSavedProperties();
                const properties = data.results?.map((item: any) => item.property || item) || data.map((item: any) => item.property || item) || [];
                setSavedProperties(properties);
            } catch (error) {
                console.error('Failed to fetch saved properties:', error);
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchSaved();
        }
    }, [user]);

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 lg:p-10">
            <div className="max-w-7xl mx-auto space-y-10">
                {/* Page Header */}
                <div className="space-y-4">
                    <Breadcrumb />
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                        <div>
                            <h1 className="text-4xl font-black text-foreground tracking-tight flex items-center gap-3">
                                <Heart className="text-secondary" fill="currentColor" size={36} />
                                Saved <span className="text-primary">Properties</span>
                            </h1>
                            <p className="text-muted-foreground font-medium mt-1">
                                You have {savedProperties.length} properties in your wishlist
                            </p>
                        </div>
                    </div>
                </div>

                {/* Filters & Search - Premium Styling */}
                <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="relative group">
                            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
                            <input
                                type="text"
                                placeholder="Search your wishlist..."
                                className="w-full pl-12 pr-4 py-3 bg-muted/20 border border-border/50 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none font-medium"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <select className="w-full px-4 py-3 bg-muted/20 border border-border/50 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none font-medium appearance-none">
                            <option>All Locations</option>
                            <option>Westlands</option>
                            <option>Kilimani</option>
                            <option>Karen</option>
                        </select>
                        <select className="w-full px-4 py-3 bg-muted/20 border border-border/50 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none font-medium appearance-none">
                            <option>All Prices</option>
                            <option>Under Kes 10M</option>
                            <option>Kes 10M - 50M</option>
                            <option>Over Kes 50M</option>
                        </select>
                    </div>
                </div>

                {/* Properties Grid */}
                <section className="pb-20">
                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="aspect-square bg-muted/30 rounded-2xl animate-pulse"></div>
                            ))}
                        </div>
                    ) : savedProperties.length > 0 ? (
                        <PropertyCardsContainer properties={savedProperties} />
                    ) : (
                        <div className="text-center py-20 bg-muted/10 rounded-3xl border-2 border-dashed border-border/50">
                            <div className="w-20 h-20 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
                                <Heart size={40} />
                            </div>
                            <h3 className="text-2xl font-bold text-foreground">Your wishlist is empty</h3>
                            <p className="text-muted-foreground mt-2 mb-8">Start exploring properties to save your favorites!</p>
                            <Link href="/properties" className="btn btn-primary px-8 rounded-xl font-bold">
                                Browse Properties
                            </Link>
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}
