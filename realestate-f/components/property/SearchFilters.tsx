// components/property/SearchFilters.tsx
'use client';

import { useState } from 'react';

interface SearchFiltersProps {
    onClose: () => void;
    onSearch: (filters: any) => void;
    initialFilters?: any;
}

export default function SearchFilters({ onClose, onSearch, initialFilters = {} }: SearchFiltersProps) {
    const [filters, setFilters] = useState({
        property_type: initialFilters.property_type || '',
        location: initialFilters.location || '',
        price_min: initialFilters.price_min || '',
        price_max: initialFilters.price_max || '',
        bedrooms: initialFilters.bedrooms || '',
        bathrooms: initialFilters.bathrooms || '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSearch(filters);
    };

    const handleReset = () => {
        setFilters({
            property_type: '',
            location: '',
            price_min: '',
            price_max: '',
            bedrooms: '',
            bathrooms: '',
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 bg-white dark:bg-gray-950 p-6 md:p-8 rounded-2xl">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Property Type */}
                <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">
                        Property Type
                    </label>
                    <select
                        value={filters.property_type}
                        onChange={(e) => setFilters({ ...filters, property_type: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-200 dark:border-gray-800 rounded-xl bg-gray-50 dark:bg-gray-900 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    >
                        <option value="">Any Type</option>
                        <option value="house">House</option>
                        <option value="apartment">Apartment</option>
                        <option value="land">Land</option>
                        <option value="commercial">Commercial</option>
                        <option value="office">Office</option>
                    </select>
                </div>

                {/* Location - Free Text Input */}
                <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">
                        Location
                    </label>
                    <input
                        type="text"
                        placeholder="Enter location..."
                        value={filters.location}
                        onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-200 dark:border-gray-800 rounded-xl bg-gray-50 dark:bg-gray-900 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    />
                </div>

                {/* Price Range */}
                <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">
                        Min Price (KES)
                    </label>
                    <input
                        type="number"
                        placeholder="0"
                        value={filters.price_min}
                        onChange={(e) => setFilters({ ...filters, price_min: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-200 dark:border-gray-800 rounded-xl bg-gray-50 dark:bg-gray-900 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    />
                </div>

                <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">
                        Max Price (KES)
                    </label>
                    <input
                        type="number"
                        placeholder="Any"
                        value={filters.price_max}
                        onChange={(e) => setFilters({ ...filters, price_max: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-200 dark:border-gray-800 rounded-xl bg-gray-50 dark:bg-gray-900 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    />
                </div>

                {/* Bedrooms - Free Input */}
                <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">
                        Bedrooms
                    </label>
                    <input
                        type="number"
                        min="0"
                        placeholder="Any"
                        value={filters.bedrooms}
                        onChange={(e) => setFilters({ ...filters, bedrooms: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-200 dark:border-gray-800 rounded-xl bg-gray-50 dark:bg-gray-900 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    />
                </div>

                {/* Bathrooms - Free Input */}
                <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">
                        Bathrooms
                    </label>
                    <input
                        type="number"
                        min="0"
                        placeholder="Any"
                        value={filters.bathrooms}
                        onChange={(e) => setFilters({ ...filters, bathrooms: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-200 dark:border-gray-800 rounded-xl bg-gray-50 dark:bg-gray-900 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    />
                </div>
            </div>

            {/* Additional Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Property Status */}
                <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">
                        Status
                    </label>
                    <select className="w-full px-4 py-3 border border-gray-200 dark:border-gray-800 rounded-xl bg-gray-50 dark:bg-gray-900 text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all">
                        <option value="">Any Status</option>
                        <option value="available">Available</option>
                        <option value="sold">Sold</option>
                        <option value="rented">Rented</option>
                        <option value="pending">Pending</option>
                    </select>
                </div>

                {/* Sort By */}
                <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">
                        Sort By
                    </label>
                    <select className="w-full px-4 py-3 border border-gray-200 dark:border-gray-800 rounded-xl bg-gray-50 dark:bg-gray-900 text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all">
                        <option value="newest">Newest First</option>
                        <option value="price_low">Price: Low to High</option>
                        <option value="price_high">Price: High to Low</option>
                        <option value="featured">Featured</option>
                    </select>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-6 border-t border-gray-100 dark:border-gray-800">
                <button
                    type="submit"
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3.5 px-6 rounded-xl font-semibold transition-all duration-300 shadow-md hover:shadow-lg active:scale-[0.98]"
                >
                    <span className="flex items-center gap-3 justify-center">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        Search Properties
                    </span>
                </button>
                <button
                    type="button"
                    onClick={handleReset}
                    className="px-6 py-3.5 border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-all active:scale-[0.98]"
                >
                    Reset
                </button>
            </div>
        </form>
    );
}