'use client';

import React, { useEffect, useState } from 'react';
import { propertyAPI, Property } from '@/lib/api/properties'; // Assuming Property interface is exported or I'll define a local partial one
import { useAuth } from '@/hooks/useAuth';
import Breadcrumb from '@/components/dashboard/Breadcrumb';
import {
    Home,
    CheckCircle,
    XCircle,
    AlertCircle,
    Search,
    Filter,
    Eye,
    Star,
    MoreHorizontal,
    Trash
} from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function ManagementPropertiesPage() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [properties, setProperties] = useState<any[]>([]);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('all'); // all, pending, verified, rejected

    useEffect(() => {
        if (user?.user_type === 'management') {
            fetchProperties();
        }
    }, [user]);

    const fetchProperties = async () => {
        try {
            setLoading(true);
            const response = await propertyAPI.getManagementProperties();
            // Handle pagination (DRF returns { results: [], count: ... })
            if (response && response.results) {
                setProperties(response.results);
            } else if (Array.isArray(response)) {
                setProperties(response);
            } else {
                setProperties([]);
            }
        } catch (error) {
            console.error('Failed to fetch properties:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id: number) => {
        if (!confirm('Are you sure you want to approve this property?')) return;
        try {
            await propertyAPI.approveProperty(id);
            fetchProperties(); // Refresh list
        } catch (error) {
            console.error('Failed to approve property:', error);
            alert('Failed to approve property');
        }
    };

    const handleReject = async (id: number) => {
        if (!confirm('Are you sure you want to reject this property?')) return;
        try {
            await propertyAPI.rejectProperty(id);
            fetchProperties(); // Refresh list
        } catch (error) {
            console.error('Failed to reject property:', error);
            alert('Failed to reject property');
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to PERMANENTLY delete this property? This action cannot be undone.')) return;
        try {
            await propertyAPI.deleteProperty(id);
            fetchProperties(); // Refresh list
        } catch (error) {
            console.error('Failed to delete property:', error);
            alert('Failed to delete property');
        }
    };

    const handleToggleFeatured = async (id: number) => {
        try {
            await propertyAPI.toggleFeatured(id);
            fetchProperties();
        } catch (error) {
            console.error('Failed to toggle featured:', error);
        }
    };

    const filteredProperties = properties.filter(p => {
        const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase()) ||
            p.location?.name?.toLowerCase().includes(search.toLowerCase()) ||
            p.location_name?.toLowerCase().includes(search.toLowerCase()) ||
            p.agent?.username?.toLowerCase().includes(search.toLowerCase()) ||
            p.agent_name?.toLowerCase().includes(search.toLowerCase());
        const matchesFilter = filter === 'all' ? true :
            filter === 'pending' ? p.verification_status === 'pending' :
                filter === 'verified' ? p.verification_status === 'verified' :
                    p.verification_status === 'rejected';
        return matchesSearch && matchesFilter;
    });

    const getStatusDot = (status: string) => {
        switch (status) {
            case 'verified': return <div className="w-3 h-3 rounded-full bg-success" title="Verified"></div>;
            case 'rejected': return <div className="w-3 h-3 rounded-full bg-error" title="Rejected"></div>;
            case 'pending': return <div className="w-3 h-3 rounded-full bg-warning" title="Pending"></div>;
            default: return <div className="w-3 h-3 rounded-full bg-gray-300"></div>;
        }
    };

    return (
        <div className="p-4 md:p-8 lg:p-10">
            <div className="max-w-7xl mx-auto space-y-8">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <Breadcrumb />
                        <h1 className="text-3xl font-black text-foreground tracking-tight flex items-center gap-3 mt-4">
                            <Home className="text-primary" size={32} />
                            Manage <span className="text-primary">Properties</span>
                        </h1>
                        <p className="text-muted-foreground mt-2">Review and approve property listings</p>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-card p-4 rounded-2xl border border-border shadow-sm">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
                        <input
                            type="text"
                            placeholder="Search properties, locations, or agents..."
                            className="input input-bordered w-full pl-10 rounded-xl"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2">
                        <button
                            className={`btn rounded-xl ${filter === 'all' ? 'btn-primary' : 'btn-ghost'}`}
                            onClick={() => setFilter('all')}
                        >
                            All
                        </button>
                        <button
                            className={`btn rounded-xl ${filter === 'pending' ? 'btn-warning' : 'btn-ghost'}`}
                            onClick={() => setFilter('pending')}
                        >
                            Pending
                        </button>
                        <button
                            className={`btn rounded-xl ${filter === 'verified' ? 'btn-success text-white' : 'btn-ghost'}`}
                            onClick={() => setFilter('verified')}
                        >
                            Verified
                        </button>
                        <button
                            className={`btn rounded-xl ${filter === 'rejected' ? 'btn-error text-white' : 'btn-ghost'}`}
                            onClick={() => setFilter('rejected')}
                        >
                            Rejected
                        </button>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-card border border-border rounded-3xl shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="table table-lg">
                            <thead className="bg-base-200/50">
                                <tr>
                                    <th className="py-4 pl-8 text-sm font-semibold uppercase tracking-wider text-muted-foreground w-[35%]">Property</th>
                                    <th className="py-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground w-[15%]">Agent</th>
                                    <th className="py-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground w-[20%]">Price</th>
                                    <th className="py-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground w-[10%]">Status</th>
                                    <th className="py-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground w-[10%]">Date</th>
                                    <th className="py-4 pr-8 text-sm font-semibold uppercase tracking-wider text-muted-foreground w-[10%] text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-base-100">
                                {loading ? (
                                    <tr>
                                        <td colSpan={6} className="text-center py-10">
                                            <span className="loading loading-spinner loading-lg text-primary"></span>
                                        </td>
                                    </tr>
                                ) : filteredProperties.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="text-center py-10 text-muted-foreground">
                                            No properties found
                                        </td>
                                    </tr>
                                ) : (
                                    filteredProperties.map((property) => (
                                        <tr key={property.id} className="hover:bg-muted/10 transition-colors group">
                                            <td className="py-6 pl-8">
                                                <div className="flex items-center gap-6">
                                                    <div className="avatar">
                                                        <div className="mask mask-squircle w-24 h-24 shadow-sm border border-base-200">
                                                            <img
                                                                src={property.main_image || '/placeholder-property.jpg'}
                                                                alt={property.title}
                                                                className="object-cover transition-transform duration-500 group-hover:scale-110"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="max-w-[200px] xl:max-w-xs space-y-1">
                                                        <div className="font-bold text-lg leading-tight truncate" title={property.title}>{property.title}</div>
                                                        <div className="text-sm opacity-60 flex items-center gap-1 truncate">
                                                            <span>{property.location?.name}, {property.location?.county}</span>
                                                        </div>
                                                        {property.is_featured && (
                                                            <span className="badge badge-warning badge-sm gap-1 text-white text-xs font-bold uppercase tracking-widest mt-1">
                                                                <Star size={10} fill="currentColor" /> Featured
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="flex items-center gap-2">
                                                    <div className="avatar placeholder">
                                                        <div className="bg-neutral text-neutral-content rounded-full w-8">
                                                            <span>{property.agent?.username?.charAt(0).toUpperCase() || property.agent_name?.charAt(0).toUpperCase() || 'U'}</span>
                                                        </div>
                                                    </div>
                                                    <span>{property.agent?.username || property.agent_name || 'Unknown'}</span>
                                                </div>
                                            </td>
                                            <td className="font-medium">
                                                {property.price_display}
                                            </td>
                                            <td>
                                                <div className="flex items-center gap-2">
                                                    {getStatusDot(property.verification_status)}
                                                    <span className="capitalize text-sm font-medium opacity-70">{property.verification_status}</span>
                                                </div>
                                            </td>
                                            <td className="text-muted-foreground">
                                                {property.created_at ? format(new Date(property.created_at), 'MMM dd, yyyy') : '-'}
                                            </td>
                                            <td className="pr-8 text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger className="btn btn-ghost btn-sm font-normal">
                                                        Actions
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-48 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
                                                        <DropdownMenuItem asChild>
                                                            <Link href={`/dashboard/management/properties/${property.id}`} className="w-full cursor-pointer">
                                                                View Details
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleToggleFeatured(property.id)}>
                                                            {property.is_featured ? 'Remove Featured' : 'Mark Featured'}
                                                        </DropdownMenuItem>

                                                        {property.verification_status !== 'verified' && (
                                                            <DropdownMenuItem onClick={() => handleApprove(property.id)} className="text-success focus:text-success focus:bg-green-50">
                                                                Approve
                                                            </DropdownMenuItem>
                                                        )}
                                                        {property.verification_status !== 'rejected' && (
                                                            <DropdownMenuItem onClick={() => handleReject(property.id)} className="text-error focus:text-error focus:bg-red-50">
                                                                Reject
                                                            </DropdownMenuItem>
                                                        )}

                                                        <DropdownMenuSeparator />

                                                        <DropdownMenuItem onClick={() => handleDelete(property.id)} className="text-error font-bold focus:text-error focus:bg-red-50">
                                                            Delete
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </td>

                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
