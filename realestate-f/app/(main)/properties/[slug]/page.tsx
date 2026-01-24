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

export default function PropertyDetailPage({ params }: { params: Promise<{ slug: string }> }) {
    const { user } = useAuth();
    const { slug } = use(params);
    const router = useRouter();
    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const [isSaved, setIsSaved] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isViewingModalOpen, setIsViewingModalOpen] = useState(false);
    const [isStartingChat, setIsStartingChat] = useState(false);
    const [isSubmittingViewing, setIsSubmittingViewing] = useState(false);
    const [isLightboxOpen, setIsLightboxOpen] = useState(false);
    const [viewingForm, setViewingForm] = useState({
        date: '',
        time: 'Morning (9AM - 12PM)',
        phone: '',
        notes: ''
    });

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

    useEffect(() => {
        if (savedProperties && property) {
            const list = Array.isArray(savedProperties) ? savedProperties : (savedProperties.results || []);
            setIsSaved(list.some((p: any) => p.property === property.id || p.property?.id === property.id));
        }
    }, [savedProperties, property]);

    const agent = property?.agent;

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
            if (error?.status !== 400 && error?.response?.status !== 400) {
                console.error('Inquiry creation note:', error);
            }
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

    return (
        <div className="min-h-screen bg-background pt-20">
            <div className="container mx-auto px-4 py-8">
                {/* Breadcrumb */}
                <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-6">
                    <Link href="/" className="hover:text-primary transition-colors">Home</Link>
                    <span>/</span>
                    <Link href="/properties" className="hover:text-primary transition-colors">Properties</Link>
                    <span>/</span>
                    <span className="text-foreground font-medium">{property.title}</span>
                </nav>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Image Gallery */}
                        <div className="relative">
                            <div className="relative h-[400px] lg:h-[500px] rounded-3xl overflow-hidden bg-muted">
                                {images.length > 0 ? (
                                    <>
                                        <Image
                                            src={images[activeImageIndex]}
                                            alt={property.title}
                                            fill
                                            className="object-cover"
                                        />
                                        {images.length > 1 && (
                                            <>
                                                <button
                                                    onClick={prevImage}
                                                    className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors shadow-lg"
                                                >
                                                    <ChevronLeft className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={nextImage}
                                                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors shadow-lg"
                                                >
                                                    <ChevronRight className="w-5 h-5" />
                                                </button>
                                            </>
                                        )}
                                    </>
                                ) : (
                                    <div className="h-full w-full flex items-center justify-center bg-gray-100">
                                        <Home className="w-16 h-16 text-gray-300" />
                                    </div>
                                )}
                            </div>

                            {/* Thumbnail Gallery */}
                            {images.length > 1 && (
                                <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
                                    {images.map((img, index) => (
                                        <button
                                            key={index}
                                            onClick={() => setActiveImageIndex(index)}
                                            className={`shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${index === activeImageIndex
                                                ? 'border-blue-500 shadow-lg'
                                                : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                        >
                                            <Image
                                                src={img}
                                                alt={`${property.title} ${index + 1}`}
                                                width={80}
                                                height={80}
                                                className="object-cover w-full h-full"
                                            />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Property Details */}
                        <div className="bg-card rounded-3xl p-8 shadow-sm border border-border">
                            <div className="flex items-start justify-between mb-6">
                                <div>
                                    <h1 className="text-3xl font-bold text-foreground mb-2">{property.title}</h1>
                                    <div className="flex items-center gap-4 text-muted-foreground">
                                        <div className="flex items-center gap-1">
                                            <MapPin className="w-4 h-4" />
                                            <span>{property.location?.name}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Calendar className="w-4 h-4" />
                                            <span>{new Date(property.created_at).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-3xl font-bold text-primary">
                                        {formatCurrency(property.price)}
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        {property.listing_type === 'rent' ? '/month' : ''}
                                    </div>
                                </div>
                            </div>

                            {/* Property Features */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                                <div className="bg-muted rounded-xl p-4 text-center">
                                    <Home className="w-6 h-6 text-primary mx-auto mb-2" />
                                    <div className="font-semibold text-foreground">{property.bedrooms || 0}</div>
                                    <div className="text-sm text-muted-foreground">Bedrooms</div>
                                </div>
                                <div className="bg-muted rounded-xl p-4 text-center">
                                    <div className="w-6 h-6 bg-primary/10 rounded-full mx-auto mb-2 flex items-center justify-center">
                                        <div className="w-3 h-3 bg-primary rounded-full"></div>
                                    </div>
                                    <div className="font-semibold text-foreground">{property.bathrooms || 0}</div>
                                    <div className="text-sm text-muted-foreground">Bathrooms</div>
                                </div>
                                <div className="bg-muted rounded-xl p-4 text-center">
                                    <Maximize2 className="w-6 h-6 text-primary mx-auto mb-2" />
                                    <div className="font-semibold text-foreground">{property.square_feet || 0}</div>
                                    <div className="text-sm text-muted-foreground">sq ft</div>
                                </div>
                                <div className="bg-muted rounded-xl p-4 text-center">
                                    <Ruler className="w-6 h-6 text-primary mx-auto mb-2" />
                                    <div className="font-semibold text-foreground">{property.property_type}</div>
                                    <div className="text-sm text-muted-foreground">Type</div>
                                </div>
                            </div>

                            {/* Description */}
                            <div className="mb-8">
                                <h2 className="text-xl font-bold text-foreground mb-4">Description</h2>
                                <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                                    {property.description}
                                </p>
                            </div>

                            {/* Features */}
                            {property.features && property.features.length > 0 && (
                                <div className="mb-8">
                                    <h2 className="text-xl font-bold text-foreground mb-4">Features</h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {property.features.map((feature: string, index: number) => (
                                            <div key={index} className="flex items-center gap-2">
                                                <Check className="w-5 h-5 text-green-500 shrink-0" />
                                                <span className="text-foreground">{feature}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Location */}
                            <div className="mb-8">
                                <h2 className="text-xl font-bold text-foreground mb-4">Location</h2>
                                <div className="bg-muted rounded-xl p-6">
                                    <div className="flex items-center gap-2 mb-4">
                                        <MapPin className="w-5 h-5 text-primary" />
                                        <span className="font-semibold text-foreground">{property.location?.name}</span>
                                    </div>
                                    {property.location?.county && (
                                        <p className="text-muted-foreground">{property.location.county}</p>
                                    )}
                                </div>
                            </div>

                            {/* Map */}
                            <div>
                                <h2 className="text-xl font-bold text-foreground mb-4">Location Map</h2>
                                <div className="h-[400px] rounded-2xl overflow-hidden">
                                    <Map
                                        center={[
                                            property.latitude || 0,
                                            property.longitude || 0
                                        ]}
                                        zoom={15}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Similar Properties */}
                        {similarProperties && similarProperties.length > 0 && (
                            <div className="bg-card rounded-3xl p-8 shadow-sm border border-border">
                                <h2 className="text-2xl font-bold text-foreground mb-6">Similar Properties</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {similarProperties.map((similarProperty: any) => (
                                        <Link
                                            key={similarProperty.id}
                                            href={`/properties/${similarProperty.slug}`}
                                            className="group block"
                                        >
                                            <div className="bg-muted rounded-2xl overflow-hidden hover:shadow-lg transition-shadow">
                                                <div className="relative h-48 bg-muted">
                                                    {similarProperty.main_image ? (
                                                        <Image
                                                            src={similarProperty.main_image}
                                                            alt={similarProperty.title}
                                                            fill
                                                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                                                        />
                                                    ) : (
                                                        <div className="h-full w-full flex items-center justify-center">
                                                            <Home className="w-12 h-12 text-muted-foreground" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="p-4">
                                                    <h3 className="font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                                                        {similarProperty.title}
                                                    </h3>
                                                    <div className="text-primary font-bold">
                                                        {formatCurrency(similarProperty.price)}
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Agent Card */}
                        {agent && (
                            <div className="bg-card rounded-3xl p-6 shadow-sm border border-border">
                                <h3 className="text-lg font-bold text-foreground mb-4">Property Agent</h3>
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-16 h-16 bg-muted rounded-full overflow-hidden">
                                        {agent?.profile_picture ? (
                                            <Image
                                                src={agent.profile_picture}
                                                alt={agent?.username || 'Agent'}
                                                width={64}
                                                height={64}
                                                className="object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-primary/10">
                                                <span className="text-primary font-bold text-xl">
                                                    {agent?.username?.charAt(0)?.toUpperCase() || 'A'}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-foreground">{agent?.username || 'Loading agent...'}</h4>
                                        <p className="text-sm text-muted-foreground">Real Estate Agent</p>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <button
                                        onClick={handleStartChat}
                                        disabled={isStartingChat}
                                        className="w-full py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        {isStartingChat ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <MessageSquare className="w-4 h-4" />
                                        )}
                                        {isStartingChat ? 'Starting Chat...' : 'Contact Agent'}
                                    </button>
                                    {agent?.phone_number && (
                                        <a
                                            href={`tel:${agent.phone_number}`}
                                            className="w-full py-3 bg-muted text-foreground rounded-xl hover:bg-muted/80 transition-colors flex items-center justify-center gap-2"
                                        >
                                            <Phone className="w-4 h-4" />
                                            Call Agent
                                        </a>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="bg-card rounded-3xl p-6 shadow-sm border border-border">
                            <div className="space-y-3">
                                <button
                                    onClick={handleToggleSave}
                                    disabled={isSaving}
                                    className="w-full py-3 bg-muted text-foreground rounded-xl hover:bg-muted/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {isSaving ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Heart className={`w-4 h-4 ${isSaved ? 'fill-red-500 text-red-500' : ''}`} />
                                    )}
                                    {isSaving ? 'Saving...' : (isSaved ? 'Saved' : 'Save Property')}
                                </button>
                                <button
                                    onClick={() => setIsViewingModalOpen(true)}
                                    className="w-full py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                                >
                                    <Calendar className="w-4 h-4" />
                                    Schedule Viewing
                                </button>
                                <button className="w-full py-3 bg-muted text-foreground rounded-xl hover:bg-muted/80 transition-colors flex items-center justify-center gap-2">
                                    <Share2 className="w-4 h-4" />
                                    Share Property
                                </button>
                            </div>
                        </div>

                        {/* Property Status */}
                        <div className="bg-card rounded-3xl p-6 shadow-sm border border-border">
                            <h3 className="text-lg font-bold text-foreground mb-4">Property Status</h3>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">Status</span>
                                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${property.verification_status === 'verified'
                                        ? 'bg-green-100 text-green-800'
                                        : property.verification_status === 'rejected'
                                            ? 'bg-red-100 text-red-800'
                                            : 'bg-yellow-100 text-yellow-800'
                                        }`}>
                                        {property.verification_status}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">Listed</span>
                                    <span className="text-foreground">{new Date(property.created_at).toLocaleDateString()}</span>
                                </div>
                                {property.views !== undefined && (
                                    <div className="flex items-center justify-between">
                                        <span className="text-muted-foreground">Views</span>
                                        <span className="text-foreground">{property.views.toLocaleString()}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Viewing Modal */}
            {isViewingModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-3xl p-8 max-w-md w-full">
                        <h3 className="text-2xl font-bold text-gray-900 mb-6">Schedule Property Viewing</h3>
                        <form onSubmit={handleScheduleViewing} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Preferred Date
                                </label>
                                <input
                                    type="date"
                                    required
                                    value={viewingForm.date}
                                    onChange={(e) => setViewingForm({ ...viewingForm, date: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Preferred Time
                                </label>
                                <select
                                    value={viewingForm.time}
                                    onChange={(e) => setViewingForm({ ...viewingForm, time: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="Morning (9AM - 12PM)">Morning (9AM - 12PM)</option>
                                    <option value="Afternoon (12PM - 4PM)">Afternoon (12PM - 4PM)</option>
                                    <option value="Evening (4PM - 7PM)">Evening (4PM - 7PM)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Phone Number
                                </label>
                                <input
                                    type="tel"
                                    required
                                    value={viewingForm.phone}
                                    onChange={(e) => setViewingForm({ ...viewingForm, phone: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Additional Notes
                                </label>
                                <textarea
                                    rows={3}
                                    value={viewingForm.notes}
                                    onChange={(e) => setViewingForm({ ...viewingForm, notes: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <div className="flex gap-3">
                                <button
                                    type="submit"
                                    disabled={isSubmittingViewing}
                                    className="flex-1 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSubmittingViewing ? 'Submitting...' : 'Submit Request'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setIsViewingModalOpen(false)}
                                    className="flex-1 py-3 bg-gray-100 text-gray-900 rounded-xl hover:bg-gray-200 transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
