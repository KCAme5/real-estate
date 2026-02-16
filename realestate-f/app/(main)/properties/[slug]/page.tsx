"use client";

import { use, useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
    MapPin, Home, Maximize2, Calendar, Phone, Mail, MessageSquare,
    Share2, Heart, Check, Loader2, AlertCircle, ArrowLeft, Ruler, Sparkles,
    ChevronLeft, ChevronRight, Users, Shield, Clock, X, Star, ExternalLink,
    Zap, Download, Landmark, Eye, Bed, Bath, TrendingUp, FileVideo
} from "lucide-react";
import dynamic from 'next/dynamic';
import { propertyAPI } from "@/lib/api/properties";
import { agentsAPI } from "@/lib/api/agents";
import { leadsAPI } from "@/lib/api/leads";
import { bookingsAPI } from "@/lib/api/bookings";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from '@/components/ui/toast';
import { CRMTracker } from "@/hooks/useCRM";

const Map = dynamic(() => import('@/components/ui/Map'), {
    ssr: false,
    loading: () => (
        <div className="h-[400px] w-full bg-slate-900 animate-pulse rounded-3xl border border-slate-800 flex items-center justify-center">
            <div className="text-center">
                <MapPin className="w-8 h-8 text-slate-700 mx-auto mb-2" />
                <p className="text-sm text-slate-500 font-medium">Loading premium map...</p>
            </div>
        </div>
    )
});

export default function PropertyDetailPage({ params }: { params: Promise<{ slug: string }> }) {
    const { user } = useAuth();
    const { success, error: showError } = useToast();
    const { slug } = use(params);
    const router = useRouter();

    // State
    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const [isSaved, setIsSaved] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isStartingChat, setIsStartingChat] = useState(false);
    const [isSubmittingViewing, setIsSubmittingViewing] = useState(false);
    const [showStickyHeader, setShowStickyHeader] = useState(false);

    const [viewingForm, setViewingForm] = useState({
        date: '',
        time: 'Morning (9AM - 12PM)',
        phone: '',
        notes: ''
    });

    // Refs for scroll handling
    const headerRef = useRef<HTMLDivElement>(null);

    // Queries
    const { data: property, isLoading, error } = useQuery({
        queryKey: ["property", slug],
        queryFn: async () => {
            return await propertyAPI.getProperty(slug);
        },
    });

    const { data: savedProperties } = useQuery({
        queryKey: ["saved-properties", user?.id],
        queryFn: () => propertyAPI.getSavedProperties(),
        enabled: !!user,
    });

    // Effects
    useEffect(() => {
        if (savedProperties && property) {
            const list = Array.isArray(savedProperties) ? savedProperties : (savedProperties.results || []);
            setIsSaved(list.some((p: any) => p.property === property.id || p.property?.id === property.id));
        }
    }, [savedProperties, property]);

    useEffect(() => {
        const handleScroll = () => {
            if (headerRef.current) {
                const headerBottom = headerRef.current.getBoundingClientRect().bottom;
                setShowStickyHeader(headerBottom < 0);
            }
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const agent = property?.agent;

    const { data: similarProperties } = useQuery({
        queryKey: ["similar-properties", property?.property_type, property?.location?.id],
        queryFn: async () => {
            const res = await propertyAPI.getAll();
            const all = res.results || res || [];
            return all.filter((p: any) =>
                p.id !== property?.id &&
                (p.property_type === property?.property_type || p.location?.id === property?.location?.id)
            ).slice(0, 3);
        },
        enabled: !!property
    });

    // Handlers
    const handleStartChat = async () => {
        if (!user) {
            router.push(`/login?redirect=/properties/${slug}`);
            return;
        }
        if (!property || !agent) return;

        try {
            setIsStartingChat(true);
            const res = await leadsAPI.createConversation(property.id, agent?.id);
            const conversationId = res.id || res.data?.id;

            const baseMessagesPath = user.user_type === 'agent' ? '/dashboard/agent/messages' : '/dashboard/messages';
            if (conversationId) {
                router.push(`${baseMessagesPath}?id=${conversationId}`);
            } else {
                router.push(`${baseMessagesPath}?propertyId=${property.id}&recipientId=${agent?.id}`);
            }
        } catch (error: any) {
            console.error('Inquiry creation error:', error);
            const baseMessagesPath = user.user_type === 'agent' ? '/dashboard/agent/messages' : '/dashboard/messages';
            router.push(`${baseMessagesPath}?propertyId=${property.id}&recipientId=${agent?.id}`);
        } finally {
            setIsStartingChat(false);
        }
    };

    const handleToggleSave = async () => {
        if (!user) {
            router.push(`/login?redirect=/properties/${slug}`);
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
                    await propertyAPI.saveProperty(property.id);
                }
                setIsSaved(false);
                success("Removed from Saved", "Property removed from your collection");
            } else {
                await propertyAPI.saveProperty(property.id);
                setIsSaved(true);
                success("Property Saved!", "Property added to your collection");
            }
        } catch (error) {
            console.error("Error saving property:", error);
            showError("Action Failed", "Please try again later");
        } finally {
            setIsSaving(false);
        }
    };

    const handleScheduleViewing = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) {
            router.push(`/login?redirect=/properties/${slug}`);
            return;
        }
        if (!property) return;

        try {
            setIsSubmittingViewing(true);
            const bookingTimeMap: Record<string, string> = {
                'Morning (9AM - 12PM)': '09:00:00',
                'Afternoon (12PM - 4PM)': '14:00:00',
                'Evening (4PM - 7PM)': '17:00:00'
            };
            const dateTimeStr = `${viewingForm.date}T${bookingTimeMap[viewingForm.time] || '09:00:00'}`;

            await bookingsAPI.create({
                property: property.id,
                date: dateTimeStr,
                duration: 30,
                client_notes: `Phone: ${viewingForm.phone}\n${viewingForm.notes}`
            });
            success("Request Sent!", "An agent will contact you shortly to confirm");
            setViewingForm({ date: '', time: 'Morning (9AM - 12PM)', phone: '', notes: '' });
        } catch (error) {
            console.error("Error scheduling viewing:", error);
            showError("Request Failed", "Could not schedule viewing at this time");
        } finally {
            setIsSubmittingViewing(false);
        }
    };

    // Images Processing
    const images: string[] = [];
    if (property) {
        if (property.main_image || property.main_image_url) images.push(property.main_image || property.main_image_url);
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

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-950 pt-24 pb-20 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-slate-400 font-medium animate-pulse">Fetching exclusive property details...</p>
                </div>
            </div>
        );
    }

    if (error || !property) {
        return (
            <div className="min-h-screen bg-slate-950 pt-24 pb-20 flex items-center justify-center px-4">
                <div className="max-w-md w-full text-center bg-slate-900 rounded-[2.5rem] p-10 border border-slate-800 shadow-2xl">
                    <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-500">
                        <AlertCircle size={40} />
                    </div>
                    <h2 className="text-3xl font-black text-white mb-4">Property Unavailable</h2>
                    <p className="text-slate-400 mb-8 leading-relaxed">The listing you are looking for might have been sold, removed, or is temporarily offline.</p>
                    <div className="flex flex-col gap-3">
                        <Link href="/properties" className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl transition-all shadow-lg shadow-emerald-600/20">
                            Browse Available Homes
                        </Link>
                        <button onClick={() => router.back()} className="w-full py-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-2xl transition-all">
                            Go Back
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950">
            {property && <CRMTracker propertyId={property.id} />}
            {/* 1. Sticky Property Header (Hidden until scroll) */}
            <div className={`fixed top-0 left-0 right-0 z-[60] bg-slate-900/95 backdrop-blur-xl border-b border-slate-800 transition-all duration-500 transform ${showStickyHeader ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}`}>
                <div className="container mx-auto px-4 h-16 sm:h-20 flex items-center justify-between">
                    <div className="flex flex-col min-w-0 pr-4">
                        <h2 className="text-white font-bold truncate text-sm sm:text-lg">{property.title}</h2>
                        <div className="flex items-center gap-2 text-[10px] sm:text-xs text-slate-400">
                            <MapPin size={12} className="text-emerald-500" />
                            <span className="truncate">{property.location?.name}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 sm:gap-6 shrink-0">
                        <div className="text-right">
                            <div className="text-emerald-400 font-black text-sm sm:text-xl">
                                {formatCurrency(property.price)}
                            </div>
                            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-none">
                                {property.listing_type === 'rent' ? 'For Rent' : 'For Sale'}
                            </div>
                        </div>
                        <button
                            onClick={handleScheduleViewing}
                            className="hidden sm:block px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-emerald-600/20"
                        >
                            Enquire Now
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content Start */}
            <div className="pt-20">
                <div className="container mx-auto px-4 py-8">

                    {/* 2. Hero Gallery Section */}
                    <div className="mb-12">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[400px] md:h-[600px] lg:h-[700px]">
                            {/* Main Large Image */}
                            <div className="lg:col-span-9 relative rounded-[2.5rem] overflow-hidden group shadow-2xl bg-slate-900 border border-slate-800">
                                <Image
                                    src={images[activeImageIndex] || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80'}
                                    alt={property.title}
                                    fill
                                    className="object-cover transition-transform duration-1000 group-hover:scale-105"
                                    priority
                                />
                                {/* Overlay Badges */}
                                <div className="absolute top-8 left-8 z-10 flex flex-col gap-3">
                                    {property.verification_status === 'verified' && (
                                        <div className="flex items-center gap-2 bg-emerald-500 text-white px-4 py-2 rounded-full font-bold text-xs uppercase tracking-widest shadow-xl border border-emerald-400/50">
                                            <Shield size={14} fill="currentColor" />
                                            Verified Property
                                        </div>
                                    )}
                                    <div className="flex items-center gap-2 bg-slate-950/60 backdrop-blur-md text-white px-4 py-2 rounded-full font-bold text-xs uppercase tracking-widest shadow-xl border border-white/10">
                                        <Sparkles size={14} className="text-emerald-400" />
                                        Featured Listing
                                    </div>
                                </div>
                                <div className="absolute top-8 right-8 z-10">
                                    <div className="bg-emerald-600 px-6 py-3 rounded-2xl shadow-2xl border border-emerald-400/30 text-white">
                                        <div className="text-2xl font-black">{formatCurrency(property.price)}</div>
                                        <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-100 opacity-80 leading-none mt-1">
                                            Asking Price
                                        </div>
                                    </div>
                                </div>
                                {/* Navigation arrows */}
                                <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 px-8 flex justify-between pointer-events-none">
                                    <button
                                        onClick={(e) => { e.preventDefault(); setActiveImageIndex((prev) => (prev - 1 + images.length) % images.length); }}
                                        className="w-14 h-14 bg-slate-950/40 hover:bg-slate-950/80 text-white rounded-full backdrop-blur-md flex items-center justify-center transition-all border border-white/10 pointer-events-auto shadow-2xl"
                                    >
                                        <ChevronLeft size={24} />
                                    </button>
                                    <button
                                        onClick={(e) => { e.preventDefault(); setActiveImageIndex((prev) => (prev + 1) % images.length); }}
                                        className="w-14 h-14 bg-slate-950/40 hover:bg-slate-950/80 text-white rounded-full backdrop-blur-md flex items-center justify-center transition-all border border-white/10 pointer-events-auto shadow-2xl"
                                    >
                                        <ChevronRight size={24} />
                                    </button>
                                </div>
                            </div>

                            {/* Desktop Sidebar Thumbnail Strip */}
                            <div className="hidden lg:flex lg:col-span-3 flex-col gap-4 overflow-y-auto pr-2 custom-scrollbar">
                                {images.map((img, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setActiveImageIndex(idx)}
                                        className={`relative h-44 rounded-3xl overflow-hidden border-4 transition-all duration-300 flex-shrink-0 group ${activeImageIndex === idx ? 'border-emerald-500 shadow-xl scale-[0.98]' : 'border-slate-800 hover:border-slate-700'}`}
                                    >
                                        <Image src={img} alt="" fill className="object-cover group-hover:scale-110 transition-transform duration-500" />
                                        {activeImageIndex !== idx && <div className="absolute inset-0 bg-slate-950/40" />}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* 3. Property Header Info */}
                    <div ref={headerRef} className="mb-12">
                        <div className="flex flex-col lg:flex-row justify-between items-start gap-8">
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-3 mb-4">
                                    <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-lg text-[10px] font-black uppercase tracking-widest border border-emerald-500/20">
                                        For {property.listing_type}
                                    </span>
                                    <span className="flex items-center gap-1.5 text-slate-400 text-sm font-medium">
                                        <Clock size={14} />
                                        Updated {new Date(property.created_at).toLocaleDateString()}
                                    </span>
                                    <span className="flex items-center gap-1.5 text-slate-400 text-sm font-medium">
                                        <Eye size={14} />
                                        {property.views || 0} Views
                                    </span>
                                </div>
                                <h1 className="text-3xl lg:text-5xl font-black text-white mb-4 leading-tight tracking-tight">{property.title}</h1>
                                <div className="flex items-center gap-3 text-slate-400">
                                    <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800 text-emerald-500">
                                        <MapPin size={20} />
                                    </div>
                                    <p className="text-lg lg:text-xl font-medium">{property.location?.name}, {property.location?.county}</p>
                                </div>
                            </div>
                            <div className="hidden lg:flex gap-4">
                                <button onClick={handleToggleSave} className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all border ${isSaved ? 'bg-emerald-600 border-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-emerald-400 hover:border-emerald-500/50'}`}>
                                    <Heart size={24} fill={isSaved ? 'currentColor' : 'none'} />
                                </button>
                                <button className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center text-slate-400 border border-slate-800 hover:text-white hover:border-slate-700 transition-all">
                                    <Share2 size={24} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* 4. Quick Specs Bar */}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-12">
                        {[
                            { icon: <Bed size={20} />, value: property.bedrooms, label: 'Bedrooms' },
                            { icon: <Bath size={20} />, value: property.bathrooms, label: 'Bathrooms' },
                            { icon: <Maximize2 size={20} />, value: `${property.square_feet} sqft`, label: 'Living Area' },
                            { icon: <Sparkles size={20} />, value: property.property_type, label: 'Type' },
                            { icon: <Calendar size={20} />, value: property.year_built || '2024', label: 'Year Built' },
                        ].map((spec, i) => (
                            <div key={i} className="bg-slate-900/80 rounded-[2.5rem] p-6 border border-slate-800 hover:border-emerald-500/40 transition-all group hover:-translate-y-1 shadow-xl text-center">
                                <div className="text-emerald-500 mb-2 flex justify-center group-hover:scale-110 transition-transform">{spec.icon}</div>
                                <div className="text-lg font-black text-white uppercase tracking-tighter">{spec.value || 'N/A'}</div>
                                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mt-1">{spec.label}</div>
                            </div>
                        ))}
                    </div>

                    {/* 5. Two-Column Layout */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">

                        {/* Left Column (70%) */}
                        <div className="lg:col-span-8 space-y-16">

                            {/* Description */}
                            <section>
                                <div className="flex items-center gap-4 mb-8">
                                    <h2 className="text-2xl lg:text-3xl font-black text-white tracking-tight">Property Description</h2>
                                    <div className="h-px flex-1 bg-slate-800" />
                                </div>
                                <div className="prose prose-invert max-w-none">
                                    <p className="text-slate-400 text-base leading-relaxed whitespace-pre-wrap">
                                        {property.description}
                                    </p>
                                </div>
                            </section>

                            {/* Key Features */}
                            {property.features && property.features.length > 0 && (
                                <section>
                                    <div className="flex items-center gap-4 mb-8">
                                        <h2 className="text-2xl lg:text-3xl font-black text-white tracking-tight">Outstanding Features</h2>
                                        <div className="h-px flex-1 bg-slate-800" />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {property.features.map((feature: string, idx: number) => (
                                            <div key={idx} className="flex items-center gap-4 bg-slate-900/50 p-5 rounded-2xl border border-slate-800 group hover:bg-slate-900 transition-colors">
                                                <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500 shrink-0 group-hover:scale-110 transition-transform">
                                                    <Check size={20} />
                                                </div>
                                                <span className="text-slate-200 font-semibold">{feature}</span>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}

                            {/* Floor Plan & Virtual Tour Slot */}
                            {(property.floor_plan || property.virtual_tour_url) && (
                                <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {property.floor_plan && (
                                        <div className="bg-slate-900 rounded-[2.5rem] p-8 border border-slate-800 group hover:border-emerald-500/30 transition-all">
                                            <div className="flex justify-between items-center mb-6">
                                                <h3 className="text-xl font-black text-white">Floor Plan</h3>
                                                <a href={property.floor_plan} target="_blank" className="text-emerald-500 hover:text-emerald-400 transition-colors">
                                                    <Download size={20} />
                                                </a>
                                            </div>
                                            <div className="relative aspect-square rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-center cursor-pointer group/plan">
                                                {property.floor_plan.match(/\.(jpg|jpeg|png|webp|gif)$/i) ? (
                                                    <Image src={property.floor_plan} alt="Floor Plan" fill className="object-contain p-4 group-hover/plan:scale-110 transition-transform duration-700" />
                                                ) : (
                                                    <div className="text-center p-4">
                                                        <FileVideo size={40} className="text-slate-700 mx-auto mb-4" />
                                                        <p className="text-slate-500 text-sm font-bold uppercase tracking-widest">Document View</p>
                                                    </div>
                                                )}
                                                <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover/plan:opacity-100 transition-opacity flex items-center justify-center">
                                                    <div className="px-6 py-2 bg-emerald-600 text-white rounded-full text-xs font-bold uppercase tracking-widest">View Full Plan</div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    {property.virtual_tour_url && (
                                        <div className="bg-emerald-950/20 rounded-[2.5rem] p-8 border border-emerald-500/20 relative overflow-hidden group">
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-emerald-500/20 transition-all duration-700"></div>
                                            <h3 className="text-xl font-black text-white mb-6">360° Virtual Tour</h3>
                                            <div className="relative aspect-square rounded-2xl bg-slate-950 border border-emerald-500/20 flex flex-col items-center justify-center p-6 text-center shadow-2xl">
                                                <Zap size={48} className="text-emerald-500 mb-6 animate-pulse" />
                                                <p className="text-white font-black text-lg mb-2">Experience it Live</p>
                                                <p className="text-emerald-200/50 text-xs font-bold uppercase tracking-widest leading-relaxed mb-6">Step inside this home from your screen</p>
                                                <a
                                                    href={property.virtual_tour_url}
                                                    target="_blank"
                                                    className="px-8 py-3 bg-white text-emerald-900 font-black rounded-xl hover:bg-emerald-50 transition-all shadow-xl shadow-white/5"
                                                >
                                                    LAUNCH TOUR
                                                </a>
                                            </div>
                                        </div>
                                    )}
                                </section>
                            )}

                            {/* Location Map */}
                            <section>
                                <div className="flex items-center gap-4 mb-8">
                                    <h2 className="text-2xl lg:text-3xl font-black text-white tracking-tight">Location Map</h2>
                                    <div className="h-px flex-1 bg-slate-800" />
                                </div>
                                <div className="relative h-[450px] rounded-[2.5rem] overflow-hidden border border-slate-800 shadow-2xl">
                                    <Map center={[property.latitude || -1.2921, property.longitude || 36.8219]} zoom={15} />
                                </div>
                            </section>

                        </div>

                        {/* Right Column (30% Sticky) */}
                        <div className="lg:col-span-4 space-y-8 sticky top-36">

                            {/* Agent Card */}
                            <div className="bg-slate-900 rounded-[2.5rem] p-8 border border-slate-800 shadow-2xl relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-emerald-500/10 transition-colors duration-500"></div>
                                <h3 className="text-xl font-black text-white mb-6">Expert Agent</h3>
                                <div className="flex items-center gap-5 mb-8">
                                    <div className="w-20 h-20 rounded-full bg-linear-to-br from-emerald-500 to-emerald-700 p-1 group-hover:scale-105 transition-transform">
                                        <div className="w-full h-full rounded-full overflow-hidden bg-slate-950 relative border-2 border-slate-950">
                                            {agent?.user_avatar ? (
                                                <Image src={agent.user_avatar} alt="" fill className="object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-emerald-500 font-black text-2xl">
                                                    {agent?.user_name?.charAt(0)}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="min-w-0">
                                        <h4 className="text-xl font-black text-white truncate">{agent?.user_name || 'KenyaPrime Agent'}</h4>
                                        <div className="flex items-center gap-1.5 text-emerald-400 text-[10px] font-bold uppercase tracking-widest mb-1">
                                            <Star size={10} fill="currentColor" />
                                            Top Rated Professional
                                        </div>
                                        <p className="text-slate-500 text-xs flex items-center gap-1">
                                            <Shield size={12} />
                                            Verified by KenyaPrime
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-3 relative z-10">
                                    <button onClick={handleStartChat} disabled={isStartingChat} className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-2xl transition-all shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-3 active:scale-95 disabled:opacity-70">
                                        {isStartingChat ? <Loader2 size={20} className="animate-spin" /> : <MessageSquare size={20} />}
                                        {isStartingChat ? 'CONNECTING...' : 'ENQUIRE VIA CHAT'}
                                    </button>
                                    <div className="grid grid-cols-2 gap-3">
                                        <a href={`tel:${agent?.user_phone}`} className="py-3.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-2xl flex items-center justify-center gap-2 transition-all">
                                            <Phone size={18} />
                                            CALL
                                        </a>
                                        <a href={`https://wa.me/${agent?.user_phone}`} target="_blank" className="py-3.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 font-bold rounded-2xl flex items-center justify-center gap-2 transition-all">
                                            WHATSAPP
                                        </a>
                                    </div>
                                </div>
                            </div>

                            {/* Schedule Viewing Form */}
                            <div className="bg-slate-900 rounded-[2.5rem] p-8 border border-slate-800 shadow-2xl">
                                <h3 className="text-xl font-black text-white mb-6">Request Viewing</h3>
                                <form onSubmit={handleScheduleViewing} className="space-y-4">
                                    <div>
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-2 mb-2 block">Choose Date</label>
                                        <input
                                            type="date"
                                            required
                                            value={viewingForm.date}
                                            onChange={(e) => setViewingForm({ ...viewingForm, date: e.target.value })}
                                            className="w-full px-5 py-4 bg-slate-950 border border-slate-800 rounded-2xl text-white focus:border-emerald-500 transition-all outline-hidden"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-2 mb-2 block">Time Frame</label>
                                        <select
                                            value={viewingForm.time}
                                            onChange={(e) => setViewingForm({ ...viewingForm, time: e.target.value })}
                                            className="w-full px-5 py-4 bg-slate-950 border border-slate-800 rounded-2xl text-white focus:border-emerald-500 transition-all outline-hidden appearance-none"
                                        >
                                            <option>Morning (9AM - 12PM)</option>
                                            <option>Afternoon (12PM - 4PM)</option>
                                            <option>Evening (4PM - 7PM)</option>
                                        </select>
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={isSubmittingViewing}
                                        className="w-full py-4 bg-white text-slate-950 font-black rounded-2xl hover:bg-slate-100 transition-all active:scale-95 disabled:opacity-50"
                                    >
                                        {isSubmittingViewing ? 'REQUESTING...' : 'CONFIRM REQUEST'}
                                    </button>
                                </form>
                            </div>



                        </div>
                    </div>

                    {/* 6. Similar Properties */}
                    {similarProperties && similarProperties.length > 0 && (
                        <div className="mt-24 pt-24 border-t border-slate-900">
                            <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
                                <div>
                                    <div className="text-emerald-500 font-bold text-[10px] uppercase tracking-[0.3em] mb-3">EXECUTIVE COLLECTION</div>
                                    <h2 className="text-3xl lg:text-4xl font-black text-white">Similar Properties</h2>
                                </div>
                                <Link href="/properties" className="group flex items-center gap-3 text-slate-400 hover:text-white transition-all font-bold uppercase tracking-widest text-sm">
                                    View Full Marketplace
                                    <ArrowRight className="group-hover:translate-x-2 transition-transform" />
                                </Link>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {similarProperties.map((p: any) => (
                                    <Link key={p.id} href={`/properties/${p.slug}`} className="group bg-slate-900 rounded-[2.5rem] overflow-hidden border border-slate-800 hover:border-emerald-500/30 transition-all hover:-translate-y-2 shadow-2xl">
                                        <div className="relative h-64 overflow-hidden">
                                            <Image src={p.main_image || images[0]} alt="" fill className="object-cover transition-transform duration-700 group-hover:scale-110" />
                                            <div className="absolute top-6 left-6 flex flex-col gap-2">
                                                <span className="bg-slate-950/60 backdrop-blur-md text-white text-[10px] font-black px-4 py-2 rounded-full uppercase tracking-widest border border-white/10">
                                                    {p.property_type}
                                                </span>
                                            </div>
                                            <div className="absolute bottom-0 inset-x-0 h-1/2 bg-linear-to-t from-slate-950/80 to-transparent" />
                                            <div className="absolute bottom-6 left-6">
                                                <div className="text-2xl font-black text-white">{formatCurrency(p.price)}</div>
                                            </div>
                                        </div>
                                        <div className="p-8">
                                            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-emerald-400 transition-colors truncate">{p.title}</h3>
                                            <div className="flex items-center gap-2 text-slate-500 text-sm mb-6">
                                                <MapPin size={14} className="text-emerald-500" />
                                                <span className="truncate">{p.location?.name}</span>
                                            </div>
                                            <div className="flex items-center gap-6 pt-6 border-t border-slate-800">
                                                <div className="flex items-center gap-2">
                                                    <Bed size={18} className="text-emerald-500" />
                                                    <span className="text-white font-black">{p.bedrooms}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Bath size={18} className="text-emerald-500" />
                                                    <span className="text-white font-black">{p.bathrooms}</span>
                                                </div>
                                                <div className="ml-auto text-emerald-500 group-hover:translate-x-1 transition-transform">
                                                    <ArrowRight size={20} />
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}

// Icon Shorthand for Similar properties
function ArrowRight({ className, size = 24 }: { className?: string, size?: number }) {
    return (
        <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="square" strokeLinejoin="miter">
            <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
    );
}
