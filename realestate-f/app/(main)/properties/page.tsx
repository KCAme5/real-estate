'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Property } from '@/types/property';
import PropertyCard from '@/components/property/PropertyCard';
import PropertyCardSkeleton from '@/components/property/PropertyCardSkeleton';
import PropertyFiltersBar from '@/components/property/PropertyFiltersBar';
import PropertiesSidebar from '@/components/property/PropertiesSidebar';
import { apiClient } from '@/lib/api/client';

function PropertiesContent() {
    const searchParams = useSearchParams();
    const [properties, setProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<'grid' | 'list' | 'map'>('grid');
    const [totalCount, setTotalCount] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const PAGE_SIZE = 20;

    const [filters, setFilters] = useState({
        property_type: '',
        location: '',
        price_min: '',
        price_max: '',
        bedrooms: '',
        bathrooms: '',
        listing_type: '',
        is_development: '',
    });

    useEffect(() => {
        // Parse URL params into filters
        const urlFilters: any = {};
        searchParams.forEach((value, key) => {
            urlFilters[key] = value;
        });

        setFilters(prev => ({ ...prev, ...urlFilters }));
        fetchProperties(urlFilters);
    }, [searchParams]);

    const fetchProperties = async (searchFilters = {}, page = 1) => {
        try {
            setLoading(true);
            // Clean up empty filters
            const cleanFilters: Record<string, any> = {
                page: page,
                page_size: PAGE_SIZE
            };
            Object.entries(searchFilters).forEach(([key, value]) => {
                if (value) cleanFilters[key] = value;
            });

            const queryParams = new URLSearchParams(cleanFilters).toString();
            const data = await apiClient.get(`/properties/?${queryParams}`);

            if (data.results) {
                setProperties(data.results);
                setTotalCount(data.count || data.results.length);
            } else {
                setProperties(data);
                setTotalCount(Array.isArray(data) ? data.length : 0);
            }
            setCurrentPage(page);
        } catch (error) {
            console.error('Error fetching properties:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (searchFilters: any) => {
        setFilters(searchFilters);
        fetchProperties(searchFilters);
    };

    return (
        <div className="min-h-screen bg-slate-950 pt-20">

            {/* Sticky Filters Bar */}
            <PropertyFiltersBar
                onSearch={handleSearch}
                currentFilters={filters}
                onViewChange={setViewMode}
                currentView={viewMode}
                totalProperties={properties.length}
            />

            <div className="container mx-auto px-4 pb-16">
                <div className="flex flex-col lg:flex-row gap-8 items-start">

                    {/* Main Results Area */}
                    <div className="flex-1 w-full order-1 lg:order-1">

                        {loading ? (
                            <div className={viewMode === 'list' ? 'flex flex-col gap-6' : 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6'}>
                                {[...Array(6)].map((_, i) => (
                                    <PropertyCardSkeleton key={i} viewMode={viewMode === 'list' ? 'list' : 'grid'} />
                                ))}
                            </div>
                        ) : viewMode === 'map' ? (
                            <div className="bg-slate-900 border border-slate-800 rounded-3xl h-[600px] flex items-center justify-center relative overflow-hidden group">
                                <div className="absolute inset-0 bg-[url('https://maps.googleapis.com/maps/api/staticmap?center=Kenya&zoom=6&size=800x600&sensor=false')] bg-cover opacity-20 grayscale group-hover:grayscale-0 transition-all duration-700"></div>
                                <div className="relative z-10 text-center p-8 bg-slate-950/80 backdrop-blur-xl rounded-2xl border border-slate-800">
                                    <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-500">
                                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4" />
                                        </svg>
                                    </div>
                                    <h3 className="text-2xl font-bold text-white mb-2">Interactive Map View</h3>
                                    <p className="text-slate-400 max-w-sm mb-6">Explore properties visually on our interactive map interface. Zoom in to specific areas and see prices at a glance.</p>
                                    <button className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl transition-colors shadow-lg shadow-emerald-500/20">
                                        Launch Full Map
                                    </button>
                                </div>
                            </div>
                        ) : properties.length > 0 ? (
                            <div className={`
                                ${properties.length > 5 ? 'flex flex-nowrap overflow-x-auto lg:grid pb-6 lg:pb-0 scroll-smooth md:snap-x snap-mandatory gap-4 lg:gap-8' : 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8'}
                                ${viewMode === 'list' ? 'flex-col lg:flex' : ''}
                            `}>
                                {properties.map((prop: any) => (
                                    <div key={prop.id} className={`${properties.length > 5 ? 'min-w-[280px] md:min-w-[340px] snap-center lg:min-w-0 h-full' : ''}`}>
                                        <PropertyCard
                                            property={prop}
                                            viewMode={viewMode}
                                        />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-24 bg-slate-900/50 rounded-3xl border border-slate-800 border-dashed">
                                <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-500">
                                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-2">No properties found</h3>
                                <p className="text-slate-400 mb-8 max-w-md mx-auto">We couldn't find any properties matching your current filters. Try adjusting your search criteria.</p>
                                <button
                                    onClick={() => handleSearch({})}
                                    className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-3 rounded-xl font-semibold transition-all shadow-lg hover:shadow-emerald-500/25"
                                >
                                    Clear All Filters
                                </button>
                            </div>
                        )}

                        {/* Functional Pagination */}
                        {totalCount > PAGE_SIZE && (
                            <div className="flex justify-center mt-16 gap-2">
                                <button
                                    onClick={() => fetchProperties(filters, currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-emerald-500 hover:bg-slate-800 flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                    </svg>
                                </button>

                                {Array.from({ length: Math.ceil(totalCount / PAGE_SIZE) }).map((_, i) => {
                                    const pageNum = i + 1;
                                    if (
                                        pageNum === 1 ||
                                        pageNum === Math.ceil(totalCount / PAGE_SIZE) ||
                                        (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                                    ) {
                                        return (
                                            <button
                                                key={pageNum}
                                                onClick={() => fetchProperties(filters, pageNum)}
                                                className={`w-10 h-10 rounded-xl font-bold transition-all flex items-center justify-center ${currentPage === pageNum
                                                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20'
                                                    : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-emerald-500 hover:bg-slate-800'
                                                    }`}
                                            >
                                                {pageNum}
                                            </button>
                                        );
                                    } else if (
                                        (pageNum === currentPage - 2 && pageNum > 1) ||
                                        (pageNum === currentPage + 2 && pageNum < Math.ceil(totalCount / PAGE_SIZE))
                                    ) {
                                        return <span key={pageNum} className="w-10 h-10 flex items-center justify-center text-slate-500">...</span>;
                                    }
                                    return null;
                                })}

                                <button
                                    onClick={() => fetchProperties(filters, currentPage + 1)}
                                    disabled={currentPage === Math.ceil(totalCount / PAGE_SIZE)}
                                    className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-emerald-500 hover:bg-slate-800 flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="w-full lg:w-96 shrink-0 order-2 lg:order-2 space-y-8 lg:sticky lg:top-36">
                        <PropertiesSidebar />
                    </div>

                </div>
            </div>
        </div>
    );
}

export default function PropertiesPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-slate-950 pt-20">
                <div className="container mx-auto px-4 py-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {[...Array(6)].map((_, i) => (
                            <PropertyCardSkeleton key={i} />
                        ))}
                    </div>
                </div>
            </div>
        }>
            <PropertiesContent />
        </Suspense>
    );
}
