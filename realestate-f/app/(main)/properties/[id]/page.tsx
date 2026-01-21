"use client";

import { use, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
    MapPin, Home, Maximize2, Calendar, Phone, Mail, MessageSquare,
    Share2, Heart, Check, Loader2, AlertCircle, ArrowLeft, Ruler, Sparkles,
    ChevronLeft, ChevronRight, Users, Shield, Clock, X, Star
} from "lucide-react";
import dynamic from 'next/dynamic';
import { propertyAPI } from "@/lib/api/properties";
import { agentsAPI } from "@/lib/api/agents";
import { leadsAPI } from "@/lib/api/leads";
import { bookingsAPI } from "@/lib/api/bookings";
import { useAuth } from "@/hooks/useAuth";

const Map = dynamic(() => import('@/components/ui/Map'), {
    ssr: false,
    loading: () => (
        <div className="h-[400px] w-full bg-gray-100 animate-pulse rounded-2xl">
            <div className="h-full w-full flex items-center justify-center">
                <div className="text-center">
                    <MapPin className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-400">Loading map...</p>
                </div>
            </div>
        </div>
    )
});

export default function PropertyDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { user } = useAuth();
    const { id } = use(params);
    const router = useRouter();
    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const [isSaved, setIsSaved] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isViewingModalOpen, setIsViewingModalOpen] = useState(false);
    const [isStartingChat, setIsStartingChat] = useState(false);
    const [isSubmittingViewing, setIsSubmittingViewing] = useState(false);
    const [viewingForm, setViewingForm] = useState({
        date: '',
        time: 'Morning (9AM - 12PM)',
        phone: '',
        notes: ''
    });

    const { data: property, isLoading, error } = useQuery({
        queryKey: ["property", id],
        queryFn: async () => {
            return await propertyAPI.getProperty(id);
        },
    });

    const { data: savedProperties } = useQuery({
        queryKey: ["saved-properties", user?.id],
        queryFn: () => propertyAPI.getSavedProperties(),
        enabled: !!user,
    });

    useEffect(() => {
        if (savedProperties && property) {
            const list = Array.isArray(savedProperties) ? savedProperties : (savedProperties.results || []);
            setIsSaved(list.some((p: any) => p.property === property.id || p.property?.id === property.id));
        }
    }, [savedProperties, property]);

    const agentId = property?.agent_profile_id || property?.agent;
    const { data: agent } = useQuery({
        queryKey: ["agent", agentId],
        queryFn: () => agentsAPI.getBySlugOrId(agentId),
        enabled: !!agentId
    });

    const { data: similarProperties } = useQuery({
        queryKey: ["similar-properties", property?.property_type, property?.location?.id],
        queryFn: async () => {
            const res = await propertyAPI.getAll();
            const all = res.results || res || [];
            return all.filter((p: any) =>
                p.id !== property.id &&
                (p.property_type === property.property_type || p.location?.id === property.location?.id)
            ).slice(0, 3);
        },
        enabled: !!property
    });

    const handleStartChat = async () => {
        if (!user) {
            router.push(`/login?redirect=/properties/${id}`);
            return;
        }
        if (!property || !agent) return;

        try {
            setIsStartingChat(true);
            const res = await leadsAPI.createConversation(property.id, agent.user);
            const conversationId = res.id || res.data?.id;

            if (conversationId) {
                router.push(`/dashboard/messages?id=${conversationId}`);
            } else {
                router.push(`/dashboard/messages?propertyId=${property.id}&recipientId=${agent.user}`);
            }
        } catch (error: any) {
            if (error?.status !== 400 && error?.response?.status !== 400) {
                console.error('Inquiry creation note:', error);
            }
            router.push(`/dashboard/messages?propertyId=${property.id}&recipientId=${agent.user}`);
        } finally {
            setIsStartingChat(false);
        }
    };

    const handleToggleSave = async () => {
        if (!user) {
            router.push(`/login?redirect=/properties/${id}`);
            return;
        }
        if (!property) return;

        try {
            setIsSaving(true);
            if (isSaved) {
                const list = Array.isArray(savedProperties) ? savedProperties : (savedProperties?.results || []);
                const savedItem = list.find((p: any) => p.property === property.id || p.property?.id === property.id);
                if (savedItem) {
                    await propertyAPI.removeSavedProperty(savedItem.id);
                } else {
                    // Fallback to calling save if we can't find the ID (some backends toggle)
                    await propertyAPI.saveProperty(property.id);
                }
                setIsSaved(false);
                alert("Removed from saved properties");
            } else {
                await propertyAPI.saveProperty(property.id);
                setIsSaved(true);
                alert("Property saved!");
            }
        } catch (error) {
            console.error("Error saving property:", error);
            alert("Failed to save property. Please try again.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleScheduleViewing = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) {
            router.push(`/login?redirect=/properties/${id}`);
            return;
        }
        if (!property) return;

        try {
            setIsSubmittingViewing(true);
            await bookingsAPI.create({
                property: property.id,
                booking_date: viewingForm.date,
                booking_time: viewingForm.time === 'Morning (9AM - 12PM)' ? '09:00' : viewingForm.time === 'Afternoon (12PM - 4PM)' ? '14:00' : '17:00',
                notes: `Phone: ${viewingForm.phone}\n${viewingForm.notes}`
            });
            setIsViewingModalOpen(false);
            alert("Viewing request sent! Our agent will contact you shortly.");
            setViewingForm({ date: '', time: 'Morning (9AM - 12PM)', phone: '', notes: '' });
        } catch (error) {
            console.error("Error scheduling viewing:", error);
            alert("Failed to schedule viewing. Please try again.");
        } finally {
            setIsSubmittingViewing(false);
        }
    };

    // Process Images
    const images: string[] = [];

    if (property) {
        if (property.main_image) {
            images.push(property.main_image);
        } else if (property.main_image_url) {
            images.push(property.main_image_url);
        }

        if (property.gallery && Array.isArray(property.gallery)) {
            property.gallery.forEach((img: any) => {
                const url = img.image_url || img.image;
                if (url && !images.includes(url)) images.push(url);
            });
        }

        if (property.images && Array.isArray(property.images)) {
            property.images.forEach((img: any) => {
                const url = typeof img === 'string' ? img : (img.image_url || img.image);
                if (url && !images.includes(url)) images.push(url);
            });
        }
    }

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('en-KE', {
            style: 'currency',
            currency: property?.currency || 'KES',
            maximumFractionDigits: 0
        }).format(val);
    };

    const nextImage = () => {
        setActiveImageIndex((prev) => (prev + 1) % images.length);
    };

    const prevImage = () => {
        setActiveImageIndex((prev) => (prev - 1 + images.length) % images.length);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 pt-20">
                <div className="container mx-auto px-4 py-8">
                    <div className="animate-pulse">
                        <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
                        <div className="h-96 bg-gray-200 rounded-2xl mb-8"></div>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2 space-y-6">
                                <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                                <div className="h-4 bg-gray-200 rounded w-full"></div>
                                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                            </div>
                            <div className="h-64 bg-gray-200 rounded-2xl"></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !property) {
        return (
            <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
                <div className="max-w-md mx-auto text-center px-4">
                    <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-200">
                        <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h2 className="text-2xl font-semibold text-gray-800 mb-2">Property Not Found</h2>
                        <p className="text-gray-600 mb-6">The property you're looking for might have been removed or is temporarily unavailable.</p>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <button
                                onClick={() => router.back()}
                                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Go Back
                            </button>
                            <Link
                                href="/properties"
                                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Browse Properties
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const handleManagementAction = async (action: 'approve' | 'reject' | 'toggleFeatured') => {
        if (!property) return;
        try {
            if (action === 'approve') {
                if (!confirm('Approve this property?')) return;
                await propertyAPI.approveProperty(property.id);
                // Force reload or update local state
                window.location.reload();
            } else if (action === 'reject') {
                if (!confirm('Reject this property?')) return;
                await propertyAPI.rejectProperty(property.id);
                window.location.reload();
            } else if (action === 'toggleFeatured') {
                await propertyAPI.toggleFeatured(property.id);
                window.location.reload();
            }
        } catch (error) {
            console.error(`Failed to ${action} property:`, error);
            alert(`Failed to ${action} property`);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Management Toolbar */}
            {user?.user_type === 'management' && property && (
                <div className="bg-slate-900 text-white p-3 px-6 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-[60]">
                    <div className="flex items-center gap-4">
                        <span className="text-xs font-black uppercase tracking-widest text-slate-400">Management Controls</span>
                        <div className="h-4 w-px bg-slate-700"></div>
                        <div className="flex items-center gap-2">
                            <span className={`badge ${property.verification_status === 'verified' ? 'badge-success' : property.verification_status === 'rejected' ? 'badge-error' : 'badge-warning'} badge-sm`}>
                                {property.verification_status}
                            </span>
                            {property.is_featured && <span className="badge badge-warning badge-sm">Featured</span>}
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => handleManagementAction('toggleFeatured')}
                            className={`btn btn-sm ${property.is_featured ? 'btn-warning' : 'btn-ghost text-white'}`}
                        >
                            <Star size={14} fill={property.is_featured ? "currentColor" : "none"} />
                            {property.is_featured ? 'Featured' : 'Feature'}
                        </button>
                        {property.verification_status !== 'verified' && (
                            <button
                                onClick={() => handleManagementAction('approve')}
                                className="btn btn-sm btn-success text-white"
                            >
                                <Check size={14} /> Approve
                            </button>
                        )}
                        {property.verification_status !== 'rejected' && (
                            <button
                                onClick={() => handleManagementAction('reject')}
                                className="btn btn-sm btn-error text-white"
                            >
                                <X size={14} /> Reject
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* Premium Header */}
            <div className={`fixed ${user?.user_type === 'management' ? 'top-[60px]' : 'top-0'} left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200/50`}>
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <button
                            onClick={() => router.back()}
                            className="group flex items-center gap-2 text-gray-600 hover:text-black transition-all"
                        >
                            <div className="p-2 rounded-full group-hover:bg-gray-100 transition-colors">
                                <ArrowLeft className="w-4 h-4" />
                            </div>
                            <span className="text-sm font-semibold tracking-tight">Properties</span>
                        </button>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleToggleSave}
                                disabled={isSaving}
                                className={`p-2.5 rounded-full transition-all flex items-center justify-center ${isSaved
                                    ? 'bg-rose-50 text-rose-500 shadow-sm'
                                    : 'bg-gray-50 text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                                    }`}
                            >
                                {isSaving ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <Heart className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
                                )}
                            </button>
                            <button className="p-2.5 bg-gray-50 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all">
                                <Share2 className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <main className="pt-20">
                {/* Immersive Gallery Section */}
                <div className="bg-white">
                    <div className="container mx-auto px-4 lg:px-8 py-6">
                        <div className="flex flex-col lg:flex-row gap-6">
                            {/* Main Image Viewport */}
                            <div className="flex-1">
                                {images.length > 0 ? (
                                    <div className="relative aspect-[16/9] lg:aspect-[21/9] rounded-3xl overflow-hidden bg-gray-100 shadow-2xl group">
                                        <Image
                                            src={images[activeImageIndex]}
                                            alt={`${property.title} - Image ${activeImageIndex + 1}`}
                                            fill
                                            className="object-cover transition-all duration-700 group-hover:scale-105"
                                            priority
                                        />

                                        {/* Overlay Gradient */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60 pointer-events-none" />

                                        {/* Navigation Arrows - Glass Effect */}
                                        {images.length > 1 && (
                                            <>
                                                <div className="absolute inset-y-0 left-0 flex items-center px-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); prevImage(); }}
                                                        className="bg-white/20 backdrop-blur-md hover:bg-white/40 text-white w-12 h-12 rounded-2xl flex items-center justify-center shadow-2xl transition-all active:scale-90 border border-white/30"
                                                    >
                                                        <ChevronLeft className="w-6 h-6" />
                                                    </button>
                                                </div>
                                                <div className="absolute inset-y-0 right-0 flex items-center px-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); nextImage(); }}
                                                        className="bg-white/20 backdrop-blur-md hover:bg-white/40 text-white w-12 h-12 rounded-2xl flex items-center justify-center shadow-2xl transition-all active:scale-90 border border-white/30"
                                                    >
                                                        <ChevronRight className="w-6 h-6" />
                                                    </button>
                                                </div>
                                            </>
                                        )}

                                        {/* Image Pagination Dots */}
                                        {images.length > 1 && (
                                            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-1.5 p-1.5 bg-black/20 backdrop-blur-md rounded-full border border-white/20">
                                                {images.map((_, idx) => (
                                                    <button
                                                        key={idx}
                                                        onClick={() => setActiveImageIndex(idx)}
                                                        className={`w-1.5 h-1.5 rounded-full transition-all ${activeImageIndex === idx ? 'w-6 bg-white' : 'bg-white/40 hover:bg-white/60'}`}
                                                    />
                                                ))}
                                            </div>
                                        )}

                                        {/* Badges Overlay */}
                                        <div className="absolute top-6 left-6 flex flex-wrap gap-2">
                                            <div className="px-4 py-2 bg-blue-600/90 backdrop-blur-md text-white text-xs font-bold uppercase tracking-widest rounded-xl shadow-lg border border-blue-400/30">
                                                {property.property_type || 'Property'}
                                            </div>
                                            <div className="px-4 py-2 bg-white/90 backdrop-blur-md text-gray-900 text-xs font-bold uppercase tracking-widest rounded-xl shadow-lg border border-white/30">
                                                {property.status === 'available' ? '🔥 Just Listed' : 'Sold'}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="aspect-[16/9] lg:aspect-[21/9] rounded-3xl bg-gray-50 flex flex-col items-center justify-center border-2 border-dashed border-gray-200">
                                        <Home className="w-20 h-20 text-gray-200 mb-4" />
                                        <p className="text-gray-400 font-medium">No images available for this property</p>
                                    </div>
                                )}
                            </div>

                            {/* Thumbnail Roll - Vertical on desktop */}
                            {images.length > 0 && (
                                <div className="hidden lg:flex flex-col gap-3 w-32 max-h-[calc(21/9*100%)]">
                                    {images.map((img, index) => (
                                        <button
                                            key={index}
                                            onClick={() => setActiveImageIndex(index)}
                                            className={`relative w-full aspect-square rounded-2xl overflow-hidden transition-all duration-300 ${activeImageIndex === index ? 'ring-2 ring-blue-500 scale-95 shadow-lg' : 'opacity-70 hover:opacity-100 hover:scale-[1.02]'}`}
                                        >
                                            <Image
                                                src={img}
                                                alt={`Thumbnail ${index + 1}`}
                                                fill
                                                className="object-cover"
                                            />
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Mobile Thumbnail Scroll */}
                            {images.length > 0 && (
                                <div className="lg:hidden flex gap-3 overflow-x-auto pb-2 scrollbar-hide no-scrollbar">
                                    {images.map((img, index) => (
                                        <button
                                            key={index}
                                            onClick={() => setActiveImageIndex(index)}
                                            className={`relative flex-shrink-0 w-24 aspect-square rounded-2xl overflow-hidden transition-all ${activeImageIndex === index ? 'ring-2 ring-blue-500 scale-95' : 'opacity-70'}`}
                                        >
                                            <Image
                                                src={img}
                                                alt={`Thumbnail ${index + 1}`}
                                                fill
                                                className="object-cover"
                                            />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="container mx-auto px-4 py-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left Column - Property Details */}
                        <div className="lg:col-span-2 space-y-8">
                            {/* Property Main Info */}
                            <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.05)]">
                                <div className="space-y-6">
                                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                                        <div className="space-y-2 flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 rounded-full border border-amber-100">
                                                    <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-current" />
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-amber-600">Premium Listing</span>
                                                </div>
                                            </div>
                                            <h1 className="text-4xl lg:text-5xl font-extrabold text-blue-950 tracking-tight leading-[1.1]">
                                                {property.title}
                                            </h1>
                                            <div className="flex items-center gap-2 text-gray-400 font-medium">
                                                <MapPin className="w-5 h-5 text-blue-500/60" />
                                                <span className="text-base">
                                                    {property.address ? `${property.address}, ` : ''}
                                                    {property.location?.name}, {property.location?.county}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="text-left md:text-right shrink-0">
                                            <p className="text-sm font-bold text-blue-500/60 uppercase tracking-widest mb-1">Asking Price</p>
                                            <div className="text-4xl lg:text-5xl font-black text-blue-600 tracking-tighter">
                                                {property.price_display || formatCurrency(property.price)}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Stats Grid - High Visual Impact */}
                                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 p-6 bg-slate-50/50 rounded-[2rem] border border-slate-100/80">
                                        {[
                                            { icon: Home, label: 'Bedrooms', val: property.bedrooms || 0, color: 'text-indigo-500 bg-indigo-50' },
                                            { icon: Ruler, label: 'Bathrooms', val: property.bathrooms || 0, color: 'text-emerald-500 bg-emerald-50' },
                                            { icon: Maximize2, label: 'Area', val: property.square_feet ? `${property.square_feet.toLocaleString()} sqft` : 'N/A', color: 'text-sky-500 bg-sky-50' },
                                            { icon: Calendar, label: 'Year Built', val: property.year_built || 'N/A', color: 'text-amber-500 bg-amber-50' }
                                        ].map((stat, i) => (
                                            <div key={i} className="flex flex-col items-center text-center p-4 transition-all hover:scale-105">
                                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-3 shadow-sm ${stat.color}`}>
                                                    <stat.icon className="w-6 h-6" />
                                                </div>
                                                <div className="text-xl font-black text-blue-950 leading-tight">{stat.val}</div>
                                                <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">{stat.label}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Description Section */}
                            <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.05)]">
                                <h2 className="text-2xl font-black text-blue-950 mb-6 flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center">
                                        <div className="w-2 h-2 rounded-full bg-blue-500" />
                                    </div>
                                    Property Description
                                </h2>
                                <div className="prose prose-blue max-w-none">
                                    <p className="text-gray-600 text-lg leading-relaxed font-medium whitespace-pre-line opacity-80">
                                        {property.description || "No description available for this property."}
                                    </p>
                                </div>
                            </div>

                            {/* Features */}
                            {property.features && property.features.length > 0 && (
                                <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.05)]">
                                    <h2 className="text-2xl font-black text-blue-950 mb-6 flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center">
                                            <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                        </div>
                                        Amenities & Features
                                    </h2>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {property.features.map((feature: string, index: number) => (
                                            <div key={index} className="group flex items-center gap-3 p-4 bg-slate-50/50 rounded-2xl border border-slate-100/50 hover:bg-slate-100/50 transition-all">
                                                <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                                                    <Check className="w-5 h-5 text-emerald-500" />
                                                </div>
                                                <span className="text-sm font-bold text-slate-700 tracking-tight">{feature}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Video Tour */}
                            {property.video_url && (
                                <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200">
                                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Virtual Tour</h2>
                                    <div className="aspect-video rounded-lg overflow-hidden bg-gray-100">
                                        <iframe
                                            src={property.video_url.includes('youtube.com')
                                                ? property.video_url.replace('watch?v=', 'embed/')
                                                : property.video_url}
                                            className="w-full h-full"
                                            title="Property Video Tour"
                                            allowFullScreen
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Location Map */}
                            <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.05)]">
                                <h2 className="text-2xl font-black text-blue-950 mb-6 flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-xl bg-sky-50 flex items-center justify-center">
                                        <div className="w-2 h-2 rounded-full bg-sky-500" />
                                    </div>
                                    Property Location
                                </h2>
                                <div className="relative h-[450px] rounded-[2rem] overflow-hidden shadow-2xl border-4 border-white">
                                    {property.latitude && property.longitude ? (
                                        <Map
                                            center={[parseFloat(property.latitude), parseFloat(property.longitude)]}
                                            zoom={15}
                                            title={property.title}
                                        />
                                    ) : (
                                        <div className="h-full w-full bg-slate-50 flex flex-col items-center justify-center">
                                            <div className="w-20 h-20 bg-white rounded-3xl shadow-lg flex items-center justify-center mb-4">
                                                <MapPin className="w-10 h-10 text-slate-200" />
                                            </div>
                                            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">GPS Coordinates Unavailable</p>
                                        </div>
                                    )}

                                    {/* Map Overlay Card */}
                                    <div className="absolute bottom-6 left-6 right-6 lg:left-auto lg:right-6 lg:w-72 bg-white/90 backdrop-blur-xl p-5 rounded-2xl shadow-2xl border border-white/50">
                                        <div className="flex items-start gap-3">
                                            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/30">
                                                <MapPin className="w-5 h-5 text-white" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black uppercase tracking-widest text-blue-600 mb-0.5">Exact Address</p>
                                                <p className="text-xs font-bold text-blue-950 leading-relaxed">
                                                    {property.address || `${property.location?.name}, ${property.location?.county}`}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column - Agent & Actions */}
                        <div className="space-y-6">
                            {/* Sticky Agent Card - Glassmorphism */}
                            <div className="sticky top-28 group">
                                <div className="bg-white/70 backdrop-blur-2xl rounded-[2.5rem] p-8 border border-white/50 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)] overflow-hidden relative">
                                    {/* Animated background element */}
                                    <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-500/10 blur-[80px] group-hover:bg-blue-500/20 transition-all rounded-full" />

                                    <div className="relative z-10 space-y-8">
                                        <div className="flex items-center gap-5">
                                            <div className="relative">
                                                <div className="w-20 h-20 rounded-3xl overflow-hidden shadow-2xl ring-4 ring-white">
                                                    <img
                                                        src={agent?.user_avatar || `https://ui-avatars.com/api/?name=${agent?.user_name}&background=6D28D9&color=fff&size=200`}
                                                        alt={agent?.user_name}
                                                        className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-500"
                                                    />
                                                </div>
                                                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-2xl border-4 border-white flex items-center justify-center shadow-lg">
                                                    <Check className="w-4 h-4 text-white" />
                                                </div>
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-black text-blue-950 leading-tight mb-1">{agent?.user_name || 'Loading agent...'}</h3>
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-bold uppercase tracking-widest text-blue-500/70">{agent?.role || 'Senior Real Estate Agent'}</span>
                                                    <div className="flex items-center gap-1 mt-1 opacity-60">
                                                        <Shield className="w-3.5 h-3.5 text-blue-500" />
                                                        <span className="text-[10px] font-bold uppercase tracking-widest">Verified Expert</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <button
                                                onClick={handleStartChat}
                                                disabled={isStartingChat}
                                                className="w-full py-5 bg-blue-600 hover:bg-blue-700 text-white rounded-3xl font-black uppercase tracking-widest text-xs shadow-xl shadow-blue-500/30 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3 overflow-hidden group/btn"
                                            >
                                                {isStartingChat ? (
                                                    <Loader2 className="w-5 h-5 animate-spin" />
                                                ) : (
                                                    <div className="flex items-center gap-3">
                                                        <MessageSquare className="w-5 h-5 group-hover/btn:animate-bounce" />
                                                        <span>Initiate Inquiry</span>
                                                    </div>
                                                )}
                                            </button>

                                            <div className="grid grid-cols-2 gap-3">
                                                <a
                                                    href={`tel:${agent?.user_phone}`}
                                                    className="py-4 bg-slate-50 hover:bg-slate-100 text-blue-950 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 border border-slate-200"
                                                >
                                                    <Phone className="w-4 h-4 text-blue-500" />
                                                    Call
                                                </a>
                                                <a
                                                    href={`https://wa.me/${agent?.whatsapp_number || agent?.user_phone}?text=Hi, I'm interested in ${property.title}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="py-4 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 border border-emerald-200"
                                                >
                                                    <MessageSquare className="w-4 h-4" />
                                                    WhatsApp
                                                </a>
                                            </div>
                                        </div>

                                        <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Clock className="w-3.5 h-3.5 text-blue-400" />
                                                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-0.5">Response Time: ~15m</span>
                                            </div>
                                            <div className="flex items-center -space-x-2">
                                                {[1, 2, 3].map(i => (
                                                    <div key={i} className="w-6 h-6 rounded-full border-2 border-white bg-slate-100 overflow-hidden">
                                                        <img src={`https://i.pravatar.cc/100?u=${i}`} alt="user" />
                                                    </div>
                                                ))}
                                                <div className="w-6 h-6 rounded-full border-2 border-white bg-blue-50 flex items-center justify-center">
                                                    <span className="text-[8px] font-black text-blue-600">+12</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Quick Viewing Card */}
                                <div className="mt-6 bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 blur-[50px] rounded-full" />
                                    <div className="relative z-10 space-y-4">
                                        <h3 className="text-xl font-black leading-tight">Fast-track your <br /> Viewing</h3>
                                        <p className="text-sm text-slate-400 font-medium leading-relaxed">Schedule a private tour of this property with our expert.</p>
                                        <button
                                            onClick={() => setIsViewingModalOpen(true)}
                                            className="w-full py-4 bg-white text-slate-900 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:scale-105 transition-all shadow-xl active:scale-95"
                                        >
                                            Request Viewing Now
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Safety Tips - Outside the main grid for better flow on mobile */}
                    <div className="mt-8 bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.05)]">
                        <h3 className="text-xl font-black text-blue-950 mb-4 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center">
                                <AlertCircle className="w-4 h-4 text-slate-400" />
                            </div>
                            Safety Tips
                        </h3>
                        <ul className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-slate-600 font-medium">
                            <li className="flex items-start gap-4 p-4 bg-slate-50/50 rounded-2xl border border-slate-100/50">
                                <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center shadow-sm shrink-0">1</div>
                                <span>Always verify property documents before any payment</span>
                            </li>
                            <li className="flex items-start gap-4 p-4 bg-slate-50/50 rounded-2xl border border-slate-100/50">
                                <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center shadow-sm shrink-0">2</div>
                                <span>Meet in safe, public locations for viewings</span>
                            </li>
                            <li className="flex items-start gap-4 p-4 bg-slate-50/50 rounded-2xl border border-slate-100/50">
                                <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center shadow-sm shrink-0">3</div>
                                <span>Use secure payment methods for transactions</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Similar Properties Section */}
                {similarProperties && similarProperties.length > 0 && (
                    <div className="container mx-auto px-4 lg:px-8 pb-20 mt-20">
                        <div className="flex items-center justify-between mb-10">
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 mb-2">Discover More</p>
                                <h2 className="text-3xl lg:text-4xl font-black text-blue-950">Similar Properties</h2>
                            </div>
                            <Link
                                href="/properties"
                                className="px-6 py-3 bg-white border border-slate-200 text-blue-950 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm flex items-center gap-2"
                            >
                                Browse All
                                <ArrowLeft className="w-4 h-4 rotate-180" />
                            </Link>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {similarProperties.map((p: any) => (
                                <Link
                                    key={p.id}
                                    href={`/properties/${p.id}`}
                                    className="group bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden hover:shadow-[0_40px_80px_-16px_rgba(0,0,0,0.1)] hover:-translate-y-3 transition-all duration-500"
                                >
                                    <div className="relative h-72 bg-slate-100 overflow-hidden">
                                        {p.main_image_url || p.main_image ? (
                                            <Image
                                                src={p.main_image_url || p.main_image}
                                                alt={p.title}
                                                fill
                                                className="object-cover group-hover:scale-110 transition-transform duration-1000"
                                            />
                                        ) : (
                                            <div className="h-full flex items-center justify-center bg-slate-50">
                                                <Home className="w-16 h-16 text-slate-200" />
                                            </div>
                                        )}
                                        <div className="absolute top-6 left-6">
                                            <div className="px-4 py-2 bg-white/90 backdrop-blur-xl rounded-xl text-[10px] font-black uppercase tracking-widest text-blue-600 shadow-xl border border-white/50">
                                                {p.property_type || 'Property'}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-8">
                                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-blue-500/60 mb-3">
                                            <MapPin className="w-4 h-4" />
                                            <span className="line-clamp-1">{p.location?.name || 'Location N/A'}</span>
                                        </div>
                                        <h3 className="text-xl font-black text-blue-950 mb-6 line-clamp-1 group-hover:text-blue-600 transition-colors uppercase tracking-tight">{p.title}</h3>
                                        <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                                            <span className="text-2xl font-black text-blue-600">
                                                {p.price_display || formatCurrency(p.price)}
                                            </span>
                                            <div className="flex items-center gap-4">
                                                <div className="flex items-center gap-1.5 p-2 bg-slate-50 rounded-xl">
                                                    <Home className="w-4 h-4 text-blue-400" />
                                                    <span className="text-xs font-black text-blue-950">{p.bedrooms || 0}</span>
                                                </div>
                                                <div className="flex items-center gap-1.5 p-2 bg-slate-50 rounded-xl">
                                                    <Maximize2 className="w-4 h-4 text-blue-400" />
                                                    <span className="text-xs font-black text-blue-950">{p.bathrooms || 0}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </main>

            {/* Mobile Sticky Floating Actions */}
            <div className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-3rem)] max-w-sm">
                <div className="bg-slate-950/90 backdrop-blur-2xl rounded-[2.5rem] p-3 shadow-2xl border border-white/10 flex items-center justify-between">
                    <div className="pl-6">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-0.5">Price</p>
                        <p className="text-lg font-black text-white">{property.price_display || formatCurrency(property.price)}</p>
                    </div>
                    <button
                        onClick={handleStartChat}
                        disabled={isStartingChat}
                        className="h-14 px-8 bg-blue-600 hover:bg-blue-700 text-white rounded-[2rem] font-black uppercase tracking-widest text-[10px] shadow-xl shadow-blue-500/40 transition-all active:scale-95 flex items-center gap-3"
                    >
                        {isStartingChat ? <Loader2 className="w-4 h-4 animate-spin" /> : <MessageSquare className="w-4 h-4" />}
                        {isStartingChat ? 'Creating Chat...' : 'Inquiry'}
                    </button>
                </div>
            </div>

            {/* Schedule Viewing Modal */}
            {isViewingModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-slate-950/40 backdrop-blur-md"
                        onClick={() => setIsViewingModalOpen(false)}
                    />
                    <div className="relative bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md animate-in fade-in zoom-in duration-300 overflow-hidden border border-slate-100">
                        <div className="p-10">
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h3 className="text-2xl font-black text-blue-950 uppercase tracking-tight">Schedule Tour</h3>
                                    <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">Select your preferred slot</p>
                                </div>
                                <button
                                    onClick={() => setIsViewingModalOpen(false)}
                                    className="w-10 h-10 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 hover:text-blue-600 transition-all"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <form onSubmit={handleScheduleViewing} className="space-y-6">
                                <div className="space-y-4">
                                    <div className="group">
                                        <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 pl-1">Preferred Date</label>
                                        <input
                                            type="date"
                                            value={viewingForm.date}
                                            onChange={(e) => setViewingForm({ ...viewingForm, date: e.target.value })}
                                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold text-blue-950 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all group-hover:bg-slate-100/50"
                                            required
                                            min={new Date().toISOString().split('T')[0]}
                                        />
                                    </div>
                                    <div className="group">
                                        <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 pl-1">Preferred Time</label>
                                        <select
                                            value={viewingForm.time}
                                            onChange={(e) => setViewingForm({ ...viewingForm, time: e.target.value })}
                                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold text-blue-950 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all group-hover:bg-slate-100/50 appearance-none"
                                        >
                                            <option>Morning (9AM - 12PM)</option>
                                            <option>Afternoon (12PM - 4PM)</option>
                                            <option>Evening (4PM - 7PM)</option>
                                        </select>
                                    </div>
                                    <div className="group">
                                        <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 pl-1">Phone Number</label>
                                        <input
                                            type="tel"
                                            value={viewingForm.phone}
                                            onChange={(e) => setViewingForm({ ...viewingForm, phone: e.target.value })}
                                            placeholder="+254 7XX XXX XXX"
                                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold text-blue-950 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all group-hover:bg-slate-100/50"
                                            required
                                        />
                                    </div>
                                    <div className="group">
                                        <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 pl-1">Additional Notes</label>
                                        <textarea
                                            value={viewingForm.notes}
                                            onChange={(e) => setViewingForm({ ...viewingForm, notes: e.target.value })}
                                            placeholder="Any specific questions?"
                                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold text-blue-950 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all group-hover:bg-slate-100/50 resize-none h-24"
                                        />
                                    </div>
                                </div>
                                <button
                                    type="submit"
                                    disabled={isSubmittingViewing}
                                    className="w-full h-16 bg-blue-600 hover:bg-blue-700 text-white rounded-[2rem] font-black uppercase tracking-widest text-xs shadow-2xl shadow-blue-600/30 transition-all active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-50"
                                >
                                    {isSubmittingViewing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Calendar className="w-5 h-5" />}
                                    {isSubmittingViewing ? 'Processing...' : 'Confirm Request'}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}