'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { apiClient } from '@/lib/api/client';
import Breadcrumb from '@/components/dashboard/Breadcrumb';
import { Home, Plus, Edit2, Trash2, Calendar, MapPin, DollarSign, Activity, ExternalLink } from 'lucide-react';

interface Property {
    id: number;
    title: string;
    price: number;
    price_display?: string;
    status: string;
    verification_status?: string;
    main_image?: string;
    main_image_url?: string;
    created_at: string;
    location?: any;
    views: number;
    property_type?: string;
}

export default function AgentProperties() {
    const [properties, setProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState(true);

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

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'published': return 'bg-success/10 text-success border-success/20';
            case 'draft': return 'bg-warning/10 text-warning border-warning/20';
            case 'sold': return 'bg-error/10 text-error border-error/20';
            case 'rented': return 'bg-accent/10 text-accent border-accent/20';
            default: return 'bg-muted/10 text-muted border-muted/20';
        }
    };

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

    return (
        <div className="p-4 md:p-8 lg:p-10">
            <div className="max-w-7xl mx-auto space-y-10">
                {/* Header */}
                <div className="space-y-4">
                    <Breadcrumb />
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div>
                            <h1 className="text-4xl font-black text-foreground tracking-tight flex items-center gap-3">
                                <Home className="text-primary" size={36} />
                                My <span className="text-primary">Listings</span>
                            </h1>
                            <p className="text-muted-foreground font-medium mt-1">Manage, edit and track your property portfolio</p>
                        </div>
                        <Link
                            href="/dashboard/agent/properties/new"
                            className="flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground rounded-2xl font-black uppercase tracking-widest hover:shadow-xl hover:shadow-primary/40 hover:-translate-y-0.5 active:translate-y-0 transition-all"
                        >
                            <Plus size={20} />
                            List Property
                        </Link>
                    </div>
                </div>

                {/* Properties Grid Container */}
                <div className="space-y-6 pb-20">
                    {loading ? (
                        <div className="grid grid-cols-1 gap-6">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="h-40 bg-muted/30 rounded-3xl animate-pulse"></div>
                            ))}
                        </div>
                    ) : properties.length === 0 ? (
                        <div className="text-center py-24 bg-card border-2 border-dashed border-border rounded-3xl">
                            <div className="w-20 h-20 bg-muted/20 text-muted-foreground rounded-full flex items-center justify-center mx-auto mb-6">
                                <Home size={40} />
                            </div>
                            <h3 className="text-2xl font-black text-foreground">No properties yet</h3>
                            <p className="text-muted-foreground mt-2 mb-8 mx-auto max-w-sm">You haven't listed any properties yet. Start by creating your first listing!</p>
                            <Link href="/dashboard/agent/properties/new" className="btn btn-primary px-8 rounded-xl font-bold">
                                Create Listing
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-6">
                            <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-muted/30 border-b border-border">
                                                <th className="px-8 py-5 text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Property</th>
                                                <th className="px-8 py-5 text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Pricing</th>
                                                <th className="px-8 py-5 text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Status</th>
                                                <th className="px-8 py-5 text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Statistics</th>
                                                <th className="px-8 py-5 text-xs font-black uppercase tracking-[0.2em] text-muted-foreground text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border">
                                            {properties.map((property) => (
                                                <tr key={property.id} className="hover:bg-muted/10 transition-colors group">
                                                    <td className="px-8 py-6">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-20 h-16 rounded-xl overflow-hidden bg-muted/50 border border-border/50 shrink-0">
                                                                <img
                                                                    src={property.main_image_url || property.main_image || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80'}
                                                                    alt={property.title}
                                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                                />
                                                            </div>
                                                            <div className="space-y-1">
                                                                <div className="font-bold text-foreground group-hover:text-primary transition-colors text-lg line-clamp-1">{property.title}</div>
                                                                <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground uppercase tracking-widest">
                                                                    <Calendar size={12} />
                                                                    Listed: {property.created_at ? new Date(property.created_at).toLocaleDateString() : 'N/A'}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-6">
                                                        <div className="font-black text-foreground text-lg">
                                                            Kes {property.price.toLocaleString()}
                                                        </div>
                                                        <div className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Fixed Price</div>
                                                    </td>
                                                    <td className="px-8 py-6">
                                                        <span className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusStyle(property.status)}`}>
                                                            <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                                                            {property.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-8 py-6">
                                                        <div className="flex items-center gap-6">
                                                            <div className="flex flex-col">
                                                                <span className="text-xl font-bold text-foreground">{property.views || 0}</span>
                                                                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Views</span>
                                                            </div>
                                                            <div className="flex flex-col">
                                                                <span className="text-xl font-bold text-foreground">0</span>
                                                                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Leads</span>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-6">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <Link
                                                                href={property.verification_status === 'verified' ? `/properties/${property.id}` : `/dashboard/management/properties/${property.id}`}
                                                                target={property.verification_status === 'verified' ? '_blank' : '_self'}
                                                                className="p-3 bg-muted/10 text-foreground hover:bg-primary hover:text-white rounded-xl transition-all"
                                                                title={property.verification_status === 'verified' ? 'View Public Listing' : 'View Property Details (Management View)'}
                                                            >
                                                                <ExternalLink size={18} />
                                                            </Link>
                                                            <Link
                                                                href={`/dashboard/agent/properties/${property.id}/edit`}
                                                                className="p-3 bg-secondary/10 text-secondary hover:bg-secondary hover:text-white rounded-xl transition-all"
                                                            >
                                                                <Edit2 size={18} />
                                                            </Link>
                                                            <button
                                                                onClick={() => deleteProperty(property.id)}
                                                                className="p-3 bg-error/10 text-error hover:bg-error hover:text-white rounded-xl transition-all"
                                                            >
                                                                <Trash2 size={18} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}