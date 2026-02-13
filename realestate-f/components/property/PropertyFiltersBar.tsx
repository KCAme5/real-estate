'use client';

import { useState } from 'react';
import { Search, SlidersHorizontal, ChevronDown, X } from 'lucide-react';

interface PropertyFiltersBarProps {
    onSearch: (filters: any) => void;
    currentFilters: any;
    onViewChange: (mode: 'grid' | 'list' | 'map') => void;
    currentView: 'grid' | 'list' | 'map';
    totalProperties: number;
}

export default function PropertyFiltersBar({
    onSearch,
    currentFilters,
    onViewChange,
    currentView,
    totalProperties
}: PropertyFiltersBarProps) {
    const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
    const [localFilters, setLocalFilters] = useState(currentFilters);

    const handleQuickFilterChange = (key: string, value: string) => {
        const newFilters = { ...localFilters, [key]: value };
        setLocalFilters(newFilters);
        onSearch(newFilters);
    };

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSearch(localFilters);
    };

    return (
        <div className="sticky top-20 z-40 w-full mb-8">
            {/* Main Bar */}
            <div className="bg-slate-900/95 backdrop-blur-xl border-y border-slate-800 shadow-xl">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">

                        {/* Search Input & Quick Filters */}
                        <form onSubmit={handleSearchSubmit} className="flex flex-1 w-full gap-3 items-center">
                            <div className="relative flex-1 min-w-[200px]">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                                <input
                                    type="text"
                                    placeholder="Search location, area or project..."
                                    value={localFilters.location || ''}
                                    onChange={(e) => setLocalFilters({ ...localFilters, location: e.target.value })}
                                    className="w-full pl-12 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                                />
                            </div>

                            <select
                                value={localFilters.property_type || ''}
                                onChange={(e) => handleQuickFilterChange('property_type', e.target.value)}
                                className="hidden md:block px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 hover:border-slate-700 cursor-pointer transition-all"
                            >
                                <option value="">Property Type</option>
                                <option value="house">House</option>
                                <option value="apartment">Apartment</option>
                                <option value="land">Land</option>
                                <option value="commercial">Commercial</option>
                            </select>

                            <select
                                value={localFilters.bedrooms || ''}
                                onChange={(e) => handleQuickFilterChange('bedrooms', e.target.value)}
                                className="hidden md:block px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 hover:border-slate-700 cursor-pointer transition-all"
                            >
                                <option value="">Beds</option>
                                <option value="1">1+ Beds</option>
                                <option value="2">2+ Beds</option>
                                <option value="3">3+ Beds</option>
                                <option value="4">4+ Beds</option>
                            </select>

                            <button
                                type="button"
                                onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
                                className={`flex items-center gap-2 px-5 py-3 rounded-xl font-medium transition-all ${isAdvancedOpen
                                        ? 'bg-emerald-600 text-white shadow-emerald-500/20 shadow-lg'
                                        : 'bg-emerald-600/10 text-emerald-400 hover:bg-emerald-600/20 border border-emerald-500/20'
                                    }`}
                            >
                                <SlidersHorizontal className="w-4 h-4" />
                                <span className="hidden sm:inline">Advanced Filters</span>
                            </button>
                        </form>

                        {/* View Options */}
                        <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
                            <button
                                onClick={() => onViewChange('grid')}
                                className={`p-2 rounded-lg transition-all ${currentView === 'grid'
                                        ? 'bg-emerald-600 text-white shadow-lg'
                                        : 'text-slate-400 hover:text-white hover:bg-slate-900'
                                    }`}
                                title="Grid View"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                                </svg>
                            </button>
                            <button
                                onClick={() => onViewChange('list')}
                                className={`p-2 rounded-lg transition-all ${currentView === 'list'
                                        ? 'bg-emerald-600 text-white shadow-lg'
                                        : 'text-slate-400 hover:text-white hover:bg-slate-900'
                                    }`}
                                title="List View"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            </button>
                            {/* Map View Placeholder */}
                            <button
                                onClick={() => onViewChange('map')}
                                className={`p-2 rounded-lg transition-all ${currentView === 'map'
                                        ? 'bg-emerald-600 text-white shadow-lg'
                                        : 'text-slate-400 hover:text-white hover:bg-slate-900'
                                    }`}
                                title="Map View"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Advanced Filters Drawer */}
                <div className={`overflow-hidden transition-all duration-300 ease-in-out border-t border-slate-800 bg-slate-950 ${isAdvancedOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
                    <div className="container mx-auto px-4 py-8">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">

                            {/* Amenities Column */}
                            <div className="space-y-4">
                                <h4 className="text-slate-400 font-semibold text-sm uppercase tracking-wider">Amenities</h4>
                                <div className="grid grid-cols-2 gap-3">
                                    {['Pool', 'Gym', 'Garden', 'Security', 'Ocean View', 'Fiber Internet'].map((amenity) => (
                                        <label key={amenity} className="flex items-center gap-2 cursor-pointer group">
                                            <div className="relative flex items-center">
                                                <input type="checkbox" className="peer appearance-none w-5 h-5 border border-slate-700 rounded bg-slate-900 checked:bg-emerald-600 checked:border-emerald-600 transition-all" />
                                                <svg className="absolute w-3.5 h-3.5 text-white left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 peer-checked:opacity-100 pointer-events-none" viewBox="0 0 12 12" fill="none" stroke="currentColor">
                                                    <path d="M10 3L4.5 9L2 6.5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                            </div>
                                            <span className="text-slate-300 text-sm group-hover:text-emerald-400 transition-colors">{amenity}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Location Area Column */}
                            <div className="space-y-4">
                                <h4 className="text-slate-400 font-semibold text-sm uppercase tracking-wider">Location Area</h4>
                                <div className="grid grid-cols-2 gap-3">
                                    {['Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret', 'Nyali', 'Westlands', 'Karen'].map((area) => (
                                        <label key={area} className="flex items-center gap-2 cursor-pointer group">
                                            <div className="relative flex items-center">
                                                <input type="checkbox" className="peer appearance-none w-5 h-5 border border-slate-700 rounded bg-slate-900 checked:bg-emerald-600 checked:border-emerald-600 transition-all" />
                                                <svg className="absolute w-3.5 h-3.5 text-white left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 peer-checked:opacity-100 pointer-events-none" viewBox="0 0 12 12" fill="none" stroke="currentColor">
                                                    <path d="M10 3L4.5 9L2 6.5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                            </div>
                                            <span className="text-slate-300 text-sm group-hover:text-emerald-400 transition-colors">{area}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Price Range Column */}
                            <div className="space-y-4 md:col-span-2">
                                <h4 className="text-slate-400 font-semibold text-sm uppercase tracking-wider">Price Range (KSH)</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs text-slate-500 mb-1 block">Minimum Price</label>
                                        <input
                                            type="number"
                                            placeholder="0"
                                            value={localFilters.price_min || ''}
                                            onChange={(e) => setLocalFilters({ ...localFilters, price_min: e.target.value })}
                                            className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500 transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-slate-500 mb-1 block">Maximum Price</label>
                                        <input
                                            type="number"
                                            placeholder="Any"
                                            value={localFilters.price_max || ''}
                                            onChange={(e) => setLocalFilters({ ...localFilters, price_max: e.target.value })}
                                            className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500 transition-all"
                                        />
                                    </div>
                                </div>
                                <div className="pt-4 flex justify-end gap-3">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setLocalFilters({});
                                            onSearch({});
                                        }}
                                        className="px-6 py-2.5 text-sm font-semibold text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all"
                                    >
                                        Reset All
                                    </button>
                                    <button
                                        type="button"
                                        onClick={(e) => handleSearchSubmit(e)}
                                        className="px-8 py-2.5 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg shadow-lg hover:shadow-emerald-500/25 transition-all"
                                    >
                                        Apply Filters
                                    </button>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </div>

            {/* Total Results Bar (below sticky bar) */}
            <div className="bg-slate-950 border-b border-slate-800 py-3">
                <div className="container mx-auto px-4 flex justify-between items-center text-sm">
                    <div className="flex items-center gap-2">
                        <span className="font-bold text-xl text-white">{totalProperties}</span>
                        <span className="text-slate-400">Properties found in <span className="text-emerald-400 font-semibold">Kenya</span></span>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="text-slate-400 hidden sm:inline">Sort by:</span>
                        <select className="bg-transparent text-white font-medium focus:outline-none cursor-pointer hover:text-emerald-400 transition-colors">
                            <option value="newest">Newest First</option>
                            <option value="price_asc">Price: Low to High</option>
                            <option value="price_desc">Price: High to Low</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>
    );
}
