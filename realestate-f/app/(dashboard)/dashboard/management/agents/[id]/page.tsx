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
            const response = await agentsAPI.getBySlugOrId(id);
            setAgent(response);

            // Assuming we have an endpoint to get properties by agent ID, or we filter from all properties
            // Ideally backend should provide this. For now let's use the property search or list filter if available
            // Note: The public 'getAgentProperties' usually gets current user's. 
            // We'll use getManagementProperties and filter by agent ID client side for now, or add a backend filter.
            // Let's filter client side from management list as a quick solution, realizing it's not optimal for large datasets.
            const propsData = await propertyAPI.getManagementProperties();
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
            <div className="flex min-h-screen items-center justify-center">
                <span className="loading loading-spinner loading-lg text-primary"></span>
            </div>
        );
    }

    if (!agent) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <p className="text-muted-foreground">Agent not found</p>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 lg:p-10">
            <div className="max-w-7xl mx-auto space-y-8">
                <Breadcrumb />

                {/* Agent Header */}
                <div className="bg-card border border-border rounded-3xl p-8 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                        <User size={200} />
                    </div>
                    <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-8">
                        <div className="avatar">
                            <div className="w-32 h-32 rounded-full ring ring-primary ring-offset-base-100 ring-offset-4 overflow-hidden">
                                <img src={agent.user_avatar || '/placeholder-user.jpg'} alt={agent.user_name} />
                            </div>
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-4 mb-2">
                                <h1 className="text-3xl font-black text-foreground">{agent.user_name}</h1>
                                {agent.is_verified && (
                                    <div className="badge badge-success gap-2 text-white">
                                        <Shield size={14} /> Verified Agent
                                    </div>
                                )}
                            </div>
                            <p className="text-xl text-primary font-medium mb-4">{agent.agency_name || 'Independent Agent'}</p>

                            <div className="flex flex-wrap gap-6 text-muted-foreground">
                                <div className="flex items-center gap-2">
                                    <Mail size={18} />
                                    {agent.user_email}
                                </div>
                                {agent.user_phone && (
                                    <div className="flex items-center gap-2">
                                        <Phone size={18} />
                                        {agent.user_phone}
                                    </div>
                                )}
                                <div className="flex items-center gap-2">
                                    <Calendar size={18} />
                                    Joined {format(new Date(agent.user_date_joined || new Date()), 'MMM yyyy')}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-card border border-border rounded-2xl p-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
                                <Home size={24} />
                            </div>
                            <div>
                                <p className="text-2xl font-black">{properties.length}</p>
                                <p className="text-sm text-muted-foreground">Properties</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-card border border-border rounded-2xl p-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-success/10 text-success rounded-xl flex items-center justify-center">
                                <CheckCircle size={24} />
                            </div>
                            <div>
                                <p className="text-2xl font-black">{properties.filter(p => p.status === 'sold').length}</p>
                                <p className="text-sm text-muted-foreground">Properties Sold</p>
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
