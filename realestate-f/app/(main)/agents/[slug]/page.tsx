'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { agentsAPI } from '@/lib/api/agents';
import { useAuth } from '@/contexts/AuthContext';
import { Agent } from '@/types/agent';
import { Loader2, ShieldCheck, Star, MessageSquare, Phone, Mail, Building2, MapPin } from 'lucide-react';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import PropertyCardSkeleton from '@/components/property/PropertyCardSkeleton';

export default function AgentDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { isAuthenticated, user } = useAuth();

    const [agent, setAgent] = useState<Agent | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchAgent = async () => {
            if (!params?.slug) return;

            try {
                const response = await agentsAPI.getBySlugOrId(params.slug as string);
                setAgent(response);
            } catch (err) {
                console.error('Failed to fetch agent details', err);
                setError('Failed to load agent details.');
            } finally {
                setLoading(false);
            }
        };

        fetchAgent();
    }, [params?.slug]);

    const handleChat = () => {
        if (!agent) return;

        if (!isAuthenticated) {
            router.push(`/login?redirect=/agents/${agent.id}`);
            return;
        }

        // Navigate to the correct message board based on user type
        const basePath = user?.user_type === 'agent' ? '/dashboard/agent/messages' : '/dashboard/messages';
        router.push(`${basePath}?recipientId=${agent.user}`);
    };

    if (loading) {
        return (
            <main className="min-h-screen pt-24 pb-16 bg-gray-50 dark:bg-gray-950">
                <div className="container mx-auto px-4 max-w-6xl">
                    <div className="h-6 w-32 mb-8 bg-slate-200 dark:bg-slate-800 animate-pulse rounded-md"></div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-1">
                            <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-800">
                                <Skeleton className="h-32 w-full rounded-none" />
                                <div className="px-8 pb-8 -mt-16 text-center">
                                    <Skeleton className="w-32 h-32 rounded-3xl mx-auto mb-4 border-8 border-white dark:border-gray-900" />
                                    <Skeleton className="h-8 w-48 mx-auto mb-2" />
                                    <Skeleton className="h-6 w-32 mx-auto mb-6 rounded-full" />
                                    <div className="space-y-3">
                                        <Skeleton className="h-14 w-full rounded-2xl" />
                                        <Skeleton className="h-14 w-full rounded-2xl" />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="lg:col-span-2 space-y-8">
                            <Skeleton className="h-64 w-full rounded-3xl" />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <PropertyCardSkeleton />
                                <PropertyCardSkeleton />
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        );
    }

    if (error || !agent) {
        return (
            <div className="min-h-screen pt-20 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-error mb-2">Error</h2>
                    <p className="text-base-content/70">{error || 'Agent not found'}</p>
                    <Link href="/agents" className="btn btn-primary mt-4">
                        Back to Agents
                    </Link>
                </div>
            </div>
        );
    }

    const handleWhatsApp = () => {
        if (!agent.whatsapp_number) return;
        window.open(`https://wa.me/${agent.whatsapp_number}`, '_blank');
    };

    const avatarUrl = agent.user_avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(agent.user_name)}&background=random`;

    return (
        <main className="min-h-screen pt-24 pb-16 bg-gray-50 dark:bg-gray-950">
            <div className="container mx-auto px-4 max-w-6xl">
                <Link href="/agents" className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 transition-colors mb-8 group">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-4 h-4 group-hover:-translate-x-1 transition-transform">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to All Agents
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Agent Profile Card */}
                    <div className="lg:col-span-1">
                        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-800 sticky top-24">
                            <div className="h-32 bg-linear-to-r from-blue-600 to-emerald-600"></div>
                            <div className="px-8 pb-8 -mt-16 text-center">
                                <div className="avatar mb-4">
                                    <div className="w-32 h-32 rounded-3xl ring-8 ring-white dark:ring-gray-900 overflow-hidden bg-white shadow-lg">
                                        <img src={avatarUrl} alt={agent.user_name} className="object-cover" />
                                    </div>
                                </div>
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{agent.user_name}</h1>

                                {agent.is_verified && (
                                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-sm font-semibold rounded-full mb-4">
                                        <ShieldCheck size={14} /> Verified Expert
                                    </div>
                                )}

                                <div className="flex justify-center gap-1 mb-6">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <Star
                                            key={star}
                                            size={16}
                                            className={star <= Math.round(Number(agent.average_rating)) ? "fill-amber-400 text-amber-400" : "text-gray-300 dark:text-gray-700"}
                                        />
                                    ))}
                                    <span className="ml-2 text-sm text-gray-500">({agent.reviews?.length || 0})</span>
                                </div>

                                <div className="space-y-3">
                                    <button
                                        onClick={handleChat}
                                        className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-2 group"
                                    >
                                        <MessageSquare size={20} />
                                        Message Now
                                    </button>

                                    {agent.whatsapp_number && (
                                        <button
                                            onClick={handleWhatsApp}
                                            className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-2xl shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
                                        >
                                            <Phone size={20} />
                                            WhatsApp
                                        </button>
                                    )}

                                    <a
                                        href={`mailto:${agent.user_email}`}
                                        className="w-full py-4 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-white font-bold rounded-2xl transition-all flex items-center justify-center gap-2"
                                    >
                                        <Mail size={20} />
                                        Email Agent
                                    </a>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mt-8 pt-8 border-t border-gray-100 dark:border-gray-800">
                                    <div className="text-center">
                                        <div className="text-xl font-bold text-gray-900 dark:text-white">{agent.active_properties || 0}</div>
                                        <div className="text-xs text-gray-500 uppercase tracking-wider">Properties</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-xl font-bold text-gray-900 dark:text-white">{agent.years_of_experience}+</div>
                                        <div className="text-xs text-gray-500 uppercase tracking-wider">Years Exp.</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Content Areas */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Bio / About */}
                        <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 border border-gray-100 dark:border-gray-800 shadow-sm">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">About the Agent</h2>
                            <p className="text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-line text-lg">
                                {agent.bio || 'This agent has haven\'t added a biography yet, but they are a verified professional in our network.'}
                            </p>

                            {agent.specialties && agent.specialties.length > 0 && (
                                <div className="mt-8">
                                    <h3 className="font-bold text-gray-900 dark:text-white mb-4">Areas of Expertise</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {agent.specialties.map((spec, i) => (
                                            <span key={i} className="px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 font-medium rounded-xl border border-blue-100 dark:border-blue-800">
                                                {spec}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Uploaded Properties */}
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                                    <Building2 className="text-blue-600" />
                                    Agent's Properties
                                </h2>
                                <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-4 py-1 rounded-full text-sm font-bold">
                                    {agent.properties?.length || 0} Listed
                                </span>
                            </div>

                            {agent.properties && agent.properties.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {agent.properties.map((prop) => (
                                        <Link
                                            key={prop.id}
                                            href={`/properties/${prop.slug}`}
                                            className="bg-white dark:bg-gray-900 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 hover:shadow-xl transition-all group"
                                        >
                                            <div className="relative h-48 overflow-hidden">
                                                <img
                                                    src={prop.main_image_url || '/placeholder-property.jpg'}
                                                    alt={prop.title}
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                />
                                                <div className="absolute top-4 right-4 bg-white/90 dark:bg-black/90 px-3 py-1 rounded-full text-xs font-bold text-blue-600 dark:text-blue-400">
                                                    {prop.property_type?.toUpperCase()}
                                                </div>
                                            </div>
                                            <div className="p-4">
                                                <h3 className="font-bold text-gray-900 dark:text-white line-clamp-1 mb-1">{prop.title}</h3>
                                                <p className="text-blue-600 dark:text-blue-400 font-black text-xl mb-3">{prop.price_display}</p>
                                                <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                                                    <span className="flex items-center gap-1"><MapPin size={14} />{prop.location?.name}</span>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <div className="bg-gray-100 dark:bg-gray-800 rounded-3xl p-12 text-center text-gray-500">
                                    <Building2 className="mx-auto mb-4 opacity-20" size={48} />
                                    <p className="text-lg">No active properties listed at the moment.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
