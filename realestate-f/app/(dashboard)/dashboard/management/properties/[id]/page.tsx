'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { apiClient } from '@/lib/api/client';
import Breadcrumb from '@/components/dashboard/Breadcrumb';
import {
    ArrowLeft,
    MapPin,
    Bed,
    Bath,
    Maximize,
    Calendar,
    DollarSign,
    Home,
    CheckCircle,
    XCircle,
    AlertCircle,
    Star,
    Eye,
    User,
    Mail,
    Phone
} from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';

export default function ManagementPropertyDetailPage() {
    const { user } = useAuth();
    const params = useParams();
    const router = useRouter();
    const [property, setProperty] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (user?.user_type !== 'management') {
            setError('Access denied. Management privileges required.');
            setLoading(false);
            return;
        }

        if (params.id) {
            fetchProperty();
        }
    }, [user, params.id]);

    const fetchProperty = async () => {
        try {
            setLoading(true);
            const data = await apiClient.get(`/properties/${params.id}/`);
            setProperty(data);
        } catch (error: any) {
            console.error('Failed to fetch property:', error);
            setError(error?.response?.data?.detail || 'Failed to load property');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async () => {
        if (!confirm('Are you sure you want to approve this property?')) return;
        try {
            await apiClient.post(`/properties/approve-property/${property.id}/`);
            fetchProperty(); // Refresh
        } catch (error) {
            console.error('Failed to approve property:', error);
            alert('Failed to approve property');
        }
    };

    const handleReject = async () => {
        if (!confirm('Are you sure you want to reject this property?')) return;
        try {
            await apiClient.post(`/properties/reject-property/${property.id}/`);
            fetchProperty(); // Refresh
        } catch (error) {
            console.error('Failed to reject property:', error);
            alert('Failed to reject property');
        }
    };

    const handleToggleFeatured = async () => {
        try {
            await apiClient.post(`/properties/toggle-featured/${property.id}/`);
            fetchProperty();
        } catch (error) {
            console.error('Failed to toggle featured:', error);
        }
    };

    if (loading) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
            </div>
        );
    }

    if (error || !property) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <div className="text-center space-y-4">
                    <AlertCircle className="text-error mx-auto" size={48} />
                    <p className="text-error font-bold">{error || 'Property not found'}</p>
                    <Link
                        href="/dashboard/management/properties"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-colors"
                    >
                        Back to Properties
                    </Link>
                </div>
            </div>
        );
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'verified':
                return (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-success/10 text-success border border-success/20">
                        <CheckCircle size={12} />
                        Verified
                    </span>
                );
            case 'rejected':
                return (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-error/10 text-error border border-error/20">
                        <XCircle size={12} />
                        Rejected
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-warning/10 text-warning border border-warning/20">
                        <AlertCircle size={12} />
                        Pending
                    </span>
                );
        }
    };

    return (
        <div className="p-4 md:p-8 lg:p-10">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="space-y-4">
                    <Breadcrumb />
                    <div className="flex items-center gap-4">
                        <Link
                            href="/dashboard/management/properties"
                            className="p-3 bg-muted/10 text-muted-foreground hover:bg-muted hover:text-foreground rounded-xl transition-all"
                        >
                            <ArrowLeft size={20} />
                        </Link>
                        <div>
                            <h1 className="text-3xl font-black text-foreground tracking-tight">
                                Property <span className="text-primary">Details</span>
                            </h1>
                            <p className="text-muted-foreground mt-1">Management view of property listing</p>
                        </div>
                    </div>
                </div>

                {/* Status and Actions */}
                <div className="bg-card border border-border rounded-3xl p-6 shadow-sm">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            {getStatusBadge(property.verification_status)}
                            {property.is_featured && (
                                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-warning/10 text-warning border border-warning/20">
                                    <Star size={12} fill="currentColor" />
                                    Featured
                                </span>
                            )}
                            <div className="text-sm text-muted-foreground">
                                ID: #{property.id}
                            </div>
                        </div>
                        <div className="flex gap-2">
                            {property.verification_status !== 'verified' && (
                                <button
                                    onClick={handleApprove}
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-success text-success-foreground rounded-lg text-sm font-semibold hover:bg-success/90 transition-colors"
                                >
                                    <CheckCircle size={16} />
                                    Approve
                                </button>
                            )}
                            {property.verification_status !== 'rejected' && (
                                <button
                                    onClick={handleReject}
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-error text-error-foreground rounded-lg text-sm font-semibold hover:bg-error/90 transition-colors"
                                >
                                    <XCircle size={16} />
                                    Reject
                                </button>
                            )}
                            <button
                                onClick={handleToggleFeatured}
                                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${property.is_featured
                                    ? 'bg-warning text-warning-foreground hover:bg-warning/90'
                                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                                    }`}
                            >
                                <Star size={16} fill={property.is_featured ? "currentColor" : "none"} />
                                {property.is_featured ? 'Remove Featured' : 'Mark Featured'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Property Details Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Images */}
                        <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm">
                            <div className="aspect-video bg-muted relative">
                                <img
                                    src={property.main_image || '/placeholder-property.jpg'}
                                    alt={property.title}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            {property.property_images && property.property_images.length > 1 && (
                                <div className="p-4 grid grid-cols-4 gap-2">
                                    {property.property_images.slice(1, 5).map((img: any, index: number) => (
                                        <div key={index} className="aspect-video bg-muted rounded-lg overflow-hidden">
                                            <img
                                                src={img.image || img.image_url}
                                                alt={`${property.title} ${index + 2}`}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Property Info */}
                        <div className="bg-card border border-border rounded-3xl p-8 shadow-sm space-y-6">
                            <div>
                                <h2 className="text-2xl font-bold text-foreground mb-2">{property.title}</h2>
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <MapPin size={16} />
                                    <span>{property.location?.name || property.location_name || 'Location not specified'}</span>
                                </div>
                            </div>

                            <div className="prose prose-neutral dark:prose-invert max-w-none">
                                <p>{property.description}</p>
                            </div>

                            {/* Property Features */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {property.bedrooms && (
                                    <div className="flex items-center gap-2">
                                        <Bed size={20} className="text-muted-foreground" />
                                        <div>
                                            <div className="font-semibold">{property.bedrooms}</div>
                                            <div className="text-sm text-muted-foreground">Bedrooms</div>
                                        </div>
                                    </div>
                                )}
                                {property.bathrooms && (
                                    <div className="flex items-center gap-2">
                                        <Bath size={20} className="text-muted-foreground" />
                                        <div>
                                            <div className="font-semibold">{property.bathrooms}</div>
                                            <div className="text-sm text-muted-foreground">Bathrooms</div>
                                        </div>
                                    </div>
                                )}
                                {property.square_feet && (
                                    <div className="flex items-center gap-2">
                                        <Maximize size={20} className="text-muted-foreground" />
                                        <div>
                                            <div className="font-semibold">{property.square_feet}</div>
                                            <div className="text-sm text-muted-foreground">Sq Ft</div>
                                        </div>
                                    </div>
                                )}
                                <div className="flex items-center gap-2">
                                    <Home size={20} className="text-muted-foreground" />
                                    <div>
                                        <div className="font-semibold capitalize">{property.property_type}</div>
                                        <div className="text-sm text-muted-foreground">Type</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Price */}
                        <div className="bg-card border border-border rounded-3xl p-6 shadow-sm">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                                <DollarSign size={16} />
                                Price
                            </div>
                            <div className="text-3xl font-bold text-foreground">
                                {property.price_display}
                            </div>
                            <div className="text-sm text-muted-foreground capitalize">
                                {property.listing_type}
                            </div>
                        </div>

                        {/* Agent Info */}
                        <div className="bg-card border border-border rounded-3xl p-6 shadow-sm">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                                <User size={16} />
                                Agent Information
                            </div>
                            <div className="space-y-3">
                                <div>
                                    <div className="font-semibold">{property.agent?.username || property.agent_name || 'Unknown'}</div>
                                    <div className="text-sm text-muted-foreground">
                                        {property.agent?.email || 'No email provided'}
                                    </div>
                                </div>
                                {property.agent?.phone_number && (
                                    <div className="flex items-center gap-2 text-sm">
                                        <Phone size={14} />
                                        {property.agent.phone_number}
                                    </div>
                                )}
                                {property.agent?.email && (
                                    <div className="flex items-center gap-2 text-sm">
                                        <Mail size={14} />
                                        {property.agent.email}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Metadata */}
                        <div className="bg-card border border-border rounded-3xl p-6 shadow-sm">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                                <Calendar size={16} />
                                Property Metadata
                            </div>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Listed:</span>
                                    <span>{property.created_at ? format(new Date(property.created_at), 'MMM dd, yyyy') : 'N/A'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Views:</span>
                                    <span>{property.views || 0}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Slug:</span>
                                    <span className="font-mono text-xs">{property.slug}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
