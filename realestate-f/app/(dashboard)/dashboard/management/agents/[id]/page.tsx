'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { agentsAPI } from '@/lib/api/agents';
import { propertyAPI } from '@/lib/api/properties';
import Breadcrumb from '@/components/dashboard/Breadcrumb';
import {
    User,
    Mail,
    Phone,
    MapPin,
    Shield,
    Calendar,
    Home,
    Star,
    CheckCircle
} from 'lucide-react';
import { format } from 'date-fns';

export default function AgentDetailsPage() {
    const params = useParams();
    const id = params.id as string;
    const [loading, setLoading] = useState(true);
    const [agent, setAgent] = useState<any>(null);
    const [properties, setProperties] = useState<any[]>([]);

    useEffect(() => {
        if (id) {
            fetchAgentDetails();
        }
    }, [id]);

    const fetchAgentDetails = async () => {
        try {
            setLoading(true);
            const response = await agentsAPI.getManagementAgentById(id);
            setAgent(response);

            // Fetch properties for this agent from management list
            const propsData = await propertyAPI.getManagementProperties();
            // Backend maps 'agent' object which includes id.
            const agentProps = propsData.data.filter((p: any) => p.agent?.id === parseInt(id));
            setProperties(agentProps);

        } catch (error) {
            console.error('Failed to fetch agent details:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!agent) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <div className="text-center space-y-4">
                    <User className="text-muted-foreground mx-auto" size={48} />
                    <p className="text-muted-foreground font-semibold">Agent not found or access denied</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 lg:p-10">
            <div className="max-w-7xl mx-auto space-y-8">
                <Breadcrumb />

                {/* Agent Header */}
                <div className="bg-card border border-border rounded-3xl p-6 md:p-8 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-5">
                        <User size={160} />
                    </div>
                    <div className="relative z-10 flex flex-col md:flex-row items-center md:items-center text-center md:text-left gap-6 md:gap-8">
                        <div className="avatar">
                            <div className="w-24 h-24 md:w-32 md:h-32 rounded-full ring ring-primary ring-offset-base-100 ring-offset-4 overflow-hidden">
                                <img src={agent.user_avatar || '/placeholder-user.jpg'} alt={agent.user_name} className="object-cover" />
                            </div>
                        </div>
                        <div className="flex-1">
                            <div className="flex flex-col md:flex-row items-center gap-3 md:gap-4 mb-2">
                                <h1 className="text-2xl md:text-3xl font-bold text-foreground">{agent.user_name}</h1>
                                {agent.is_verified && (
                                    <div className="badge badge-success gap-1.5 text-white py-3 px-4 font-semibold">
                                        <Shield size={14} /> Verified Agent
                                    </div>
                                )}
                            </div>
                            <p className="text-lg md:text-xl text-primary font-semibold mb-4">{agent.agency_name || 'Independent Agent'}</p>

                            <div className="flex flex-wrap justify-center md:justify-start gap-4 md:gap-6 text-sm md:text-base text-muted-foreground font-medium">
                                <div className="flex items-center gap-2">
                                    <Mail size={16} className="text-primary" />
                                    {agent.user_email}
                                </div>
                                {agent.user_phone && (
                                    <div className="flex items-center gap-2">
                                        <Phone size={16} className="text-primary" />
                                        {agent.user_phone}
                                    </div>
                                )}
                                <div className="flex items-center gap-2 text-xs md:text-sm">
                                    <Calendar size={16} className="text-primary" />
                                    Joined {format(new Date(agent.user_date_joined || new Date()), 'MMM yyyy')}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                    <div className="bg-card border border-border rounded-2xl p-4 md:p-6 shadow-sm">
                        <div className="flex flex-col md:flex-row items-center gap-3 md:gap-4 text-center md:text-left">
                            <div className="w-10 h-10 md:w-12 md:h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
                                <Home size={20} md:size={24} />
                            </div>
                            <div>
                                <p className="text-xl md:text-2xl font-bold">{properties.length}</p>
                                <p className="text-[10px] md:text-sm text-muted-foreground uppercase tracking-widest font-semibold">Properties</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-card border border-border rounded-2xl p-4 md:p-6 shadow-sm">
                        <div className="flex flex-col md:flex-row items-center gap-3 md:gap-4 text-center md:text-left">
                            <div className="w-10 h-10 md:w-12 md:h-12 bg-success/10 text-success rounded-xl flex items-center justify-center">
                                <CheckCircle size={20} md:size={24} />
                            </div>
                            <div>
                                <p className="text-xl md:text-2xl font-bold">{properties.filter(p => p.status === 'sold').length}</p>
                                <p className="text-[10px] md:text-sm text-muted-foreground uppercase tracking-widest font-semibold">Sold</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Agent Properties */}
                <div className="space-y-4">
                    <h2 className="text-2xl font-black text-foreground flex items-center gap-3">
                        <Home className="text-primary" size={28} />
                        Uploaded Properties
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {properties.map((property) => (
                            <div key={property.id} className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all">
                                <figure className="relative h-48">
                                    <img src={property.main_image || '/placeholder-property.jpg'} alt={property.title} className="w-full h-full object-cover" />
                                    <div className="absolute top-2 right-2 badge badge-neutral">{property.status}</div>
                                </figure>
                                <div className="p-4">
                                    <h3 className="font-bold text-foreground line-clamp-1">{property.title}</h3>
                                    <p className="text-primary font-bold mt-1">{property.price_display}</p>
                                    <div className="flex justify-between items-center mt-4">
                                        <div className={`badge ${property.verification_status === 'verified' ? 'badge-success' : 'badge-warning'}`}>
                                            {property.verification_status}
                                        </div>
                                        <span className="text-xs text-muted-foreground">{format(new Date(property.created_at), 'MMM dd')}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
