'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { apiClient } from '@/lib/api/client';
import Breadcrumb from '@/components/dashboard/Breadcrumb';
import {
    Grid,
    List,
    Plus,
    Search,
    SlidersHorizontal,
    ChevronDown,
    MoreHorizontal,
    Eye,
    Edit2,
    Trash2,
    ExternalLink,
    MapPin,
    LayoutGrid,
    TableProperties
} from 'lucide-react';

interface Property {
    id: number;
    title: string;
    price: number;
    price_display?: string;
    status: string;
    property_type: string;
    verification_status?: string;
    main_image_url?: string;
    main_image?: string;
    created_at: string;
    location: {
        name: string;
    } | any;
    views: number;
}

export default function AgentProperties() {
    const [properties, setProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
    const [searchQuery, setSearchQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState('All Types');
    const [sortBy, setSortBy] = useState('Newest');

    useEffect(() => {
        const fetchProperties = async () => {
            try {
                setLoading(true);
                const data = await apiClient.get('/properties/my-properties/');
                setProperties(data.results || data);
            } catch (error) {
                console.error('Error fetching properties:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProperties();
    }, []);

    const filteredProperties = useMemo(() => {
        return properties
            .filter(p => {
                const title = p.title || '';
                const searchQueryLower = (searchQuery || '').toLowerCase();
                const locationName = p.location?.name || '';
                const propertyId = (p.id || '').toString();

                const matchesSearch = title.toLowerCase().includes(searchQueryLower) ||
                    locationName.toLowerCase().includes(searchQueryLower) ||
                    propertyId.includes(searchQuery);

                const propertyType = p.property_type || '';
                const typeFilterLower = (typeFilter || '').toLowerCase();
                const matchesType = typeFilter === 'All Types' || propertyType.toLowerCase() === typeFilterLower;

                return matchesSearch && matchesType;
            })
            .sort((a, b) => {
                if (sortBy === 'Newest') return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
                if (sortBy === 'Oldest') return new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime();
                const priceA = a.price || 0;
                const priceB = b.price || 0;
                if (sortBy === 'Price: High to Low') return priceB - priceA;
                if (sortBy === 'Price: Low to High') return priceA - priceB;
                const viewsA = a.views || 0;
                const viewsB = b.views || 0;
                if (sortBy === 'Most Viewed') return viewsB - viewsA;
                return 0;
            });
    }, [properties, searchQuery, typeFilter, sortBy]);

    const deleteProperty = async (propertyId: number) => {
        if (confirm('Are you sure you want to delete this property? This action cannot be undone.')) {
            try {
                await apiClient.delete(`/properties/${propertyId}`);
                setProperties(prev => prev.filter(p => p.id !== propertyId));
            } catch (error) {
                console.error('Error deleting property:', error);
            }
        }
    };

    const formatPrice = (price: number) => {
        return `Kes ${(price || 0).toLocaleString()}`;
    };

    const getStatusStyles = (status: string) => {
        const s = (status || '').toLowerCase();
        if (s === 'active' || s === 'published') return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
        if (s === 'pending') return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
        if (s === 'sold') return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
    };

    return (
        <div className="min-h-screen bg-[#020617] text-slate-200">
            <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="space-y-1">
                        <h1 className="text-3xl font-bold tracking-tight text-white">Manage Properties</h1>
                        <p className="text-slate-400 text-sm font-medium">
                            You have {properties.length} total properties in your portfolio.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1 shadow-inner">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-slate-800 text-blue-400 shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
                            >
                                <LayoutGrid size={18} />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-slate-800 text-blue-400 shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
                            >
                                <TableProperties size={18} />
                            </button>
                        </div>

                        <Link
                            href="/dashboard/agent/properties/new"
                            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-blue-600/20 active:scale-95"
                        >
                            <Plus size={18} />
                            Add Property
                        </Link>
                    </div>
                </div>

                {/* Filter Controls */}
                <div className="flex flex-col lg:flex-row gap-4">
                    <div className="relative flex-1 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder="Search by title, location or ID..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl py-3.5 pl-12 pr-4 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/40 transition-all placeholder:text-slate-600"
                        />
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <button className="flex items-center gap-2 px-4 py-3 bg-slate-900/50 border border-slate-800 rounded-2xl text-sm font-semibold hover:bg-slate-800 transition-all">
                            <SlidersHorizontal size={16} className="text-blue-400" />
                            Filters
                        </button>

                        <div className="relative group">
                            <select
                                value={typeFilter}
                                onChange={(e) => setTypeFilter(e.target.value)}
                                className="appearance-none bg-slate-900/50 border border-slate-800 rounded-2xl py-3 pl-4 pr-10 text-sm font-semibold focus:outline-hidden hover:bg-slate-800 transition-all cursor-pointer min-w-[140px]"
                            >
                                <option>All Types</option>
                                <option>Apartment</option>
                                <option>House</option>
                                <option>Villa</option>
                                <option>Land</option>
                                <option>Commercial</option>
                            </select>
                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={16} />
                        </div>

                        <div className="relative group">
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="appearance-none bg-slate-900/50 border border-slate-800 rounded-2xl py-3 pl-4 pr-10 text-sm font-semibold focus:outline-hidden hover:bg-slate-800 transition-all cursor-pointer min-w-[160px]"
                            >
                                <option>Newest</option>
                                <option>Oldest</option>
                                <option>Price: High to Low</option>
                                <option>Price: Low to High</option>
                                <option>Most Viewed</option>
                            </select>
                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={16} />
                        </div>
                    </div>
                </div>

                {/* Properties Display Area */}
                <div className="min-h-[400px]">
                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
                            {[1, 2, 3, 4, 5, 6].map(i => (
                                <div key={i} className="h-64 bg-slate-900/50 border border-slate-800 rounded-[2rem]"></div>
                            ))}
                        </div>
                    ) : filteredProperties.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 bg-slate-900/30 border border-dashed border-slate-800 rounded-[2.5rem]">
                            <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mb-6">
                                <LayoutGrid size={40} className="text-slate-600" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">No properties found</h3>
                            <p className="text-slate-400 max-w-xs text-center">Try adjusting your filters or add a new property listing.</p>
                        </div>
                    ) : viewMode === 'list' ? (
                        <div className="bg-slate-900/20 border border-slate-800 rounded-[2.5rem] overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-slate-800">
                                            <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-500">Property</th>
                                            <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-500">Type</th>
                                            <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-500">Price</th>
                                            <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-500 text-center">Status</th>
                                            <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-500 text-center">Views</th>
                                            <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-500 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-800/50">
                                        {filteredProperties.map((p) => (
                                            <tr key={p.id} className="hover:bg-slate-800/20 transition-colors group">
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-16 h-12 bg-slate-800 rounded-xl overflow-hidden shadow-inner border border-slate-700/50">
                                                            <img
                                                                src={p.main_image_url || p.main_image || '/placeholder-property.jpg'}
                                                                alt={p.title}
                                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                                                            />
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="font-bold text-slate-200 group-hover:text-blue-400 transition-colors line-clamp-1">{p.title}</span>
                                                            <span className="text-xs text-slate-500 flex items-center gap-1">
                                                                <MapPin size={10} />
                                                                {p.location?.name || 'Address N/A'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <span className="text-sm font-semibold text-slate-400 capitalize">
                                                        {p.property_type || 'Property'}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <span className="text-xl font-bold text-white tracking-tight">
                                                        Kes {p.price.toLocaleString()}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="flex justify-center">
                                                        <span className={`px-4 py-1 rounded-md text-[10px] font-black uppercase tracking-widest border ${getStatusStyles(p.status)}`}>
                                                            {p.status}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6 text-center">
                                                    <div className="flex items-center justify-center gap-1.5 text-slate-400">
                                                        <Eye size={14} className="text-blue-400/50" />
                                                        <span className="text-sm font-bold">{p.views || 0}</span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="flex justify-end items-center gap-2">
                                                        <Link
                                                            href={`/dashboard/agent/properties/${p.id}/edit`}
                                                            className="p-2.5 bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-700 rounded-xl transition-all"
                                                            title="Edit Property"
                                                        >
                                                            <Edit2 size={16} />
                                                        </Link>
                                                        <button
                                                            onClick={() => deleteProperty(p.id)}
                                                            className="p-2.5 bg-slate-800/50 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all"
                                                            title="Delete Property"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                        <div className="relative group/menu">
                                                            <button className="p-2.5 bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-700 rounded-xl transition-all">
                                                                <MoreHorizontal size={16} />
                                                            </button>
                                                            {/* Simple dropdown on hover or click */}
                                                            <div className="absolute right-0 top-full mt-2 w-48 bg-slate-900 border border-slate-800 rounded-2xl p-2 shadow-2xl opacity-0 scale-95 pointer-events-none group-hover/menu:opacity-100 group-hover/menu:scale-100 group-hover/menu:pointer-events-auto transition-all z-50">
                                                                <Link
                                                                    href={p.verification_status === 'verified' ? `/properties/${p.id}` : `/dashboard/management/properties/${p.id}`}
                                                                    target="_blank"
                                                                    className="flex items-center gap-3 px-4 py-2 text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition-all"
                                                                >
                                                                    <ExternalLink size={14} /> View Public Listing
                                                                </Link>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {filteredProperties.map((p) => (
                                <div key={p.id} className="bg-slate-900/40 border border-slate-800 rounded-[2.5rem] overflow-hidden hover:shadow-2xl hover:shadow-blue-600/5 transition-all group">
                                    <div className="relative h-48 overflow-hidden">
                                        <img
                                            src={p.main_image_url || p.main_image || '/placeholder-property.jpg'}
                                            alt={p.title}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                        />
                                        <div className="absolute top-4 left-4">
                                            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border backdrop-blur-md ${getStatusStyles(p.status)}`}>
                                                {p.status}
                                            </span>
                                        </div>
                                        <div className="absolute bottom-4 right-4 bg-slate-950/60 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700/50">
                                            <div className="flex items-center gap-1.5 text-slate-200">
                                                <Eye size={14} className="text-blue-400" />
                                                <span className="text-xs font-black">{p.views || 0}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-8 space-y-4">
                                        <div className="space-y-1">
                                            <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors line-clamp-1">{p.title}</h3>
                                            <p className="text-sm text-slate-500 flex items-center gap-1">
                                                <MapPin size={12} /> {p.location?.name || 'Address N/A'}
                                            </p>
                                        </div>

                                        <div className="flex items-center justify-between pt-2">
                                            <div className="text-2xl font-black text-white">
                                                Kes {p.price.toLocaleString()}
                                            </div>
                                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                                                {p.property_type || 'Property'}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-2 pt-4 border-t border-slate-800/50">
                                            <Link
                                                href={`/dashboard/agent/properties/${p.id}/edit`}
                                                className="flex-1 flex items-center justify-center gap-2 py-3 bg-slate-800/50 hover:bg-blue-600 text-white font-bold rounded-2xl transition-all"
                                            >
                                                <Edit2 size={16} /> Edit
                                            </Link>
                                            <button
                                                onClick={() => deleteProperty(p.id)}
                                                className="px-4 py-3 bg-slate-800/50 hover:bg-red-500 text-white rounded-2xl transition-all"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Navigation Spacer for footer if needed */}
            <div className="h-20"></div>
        </div>
    );
}
