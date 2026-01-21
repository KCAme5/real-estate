'use client';

import React, { useEffect, useState } from 'react';
import { agentsAPI } from '@/lib/api/agents';
import { useAuth } from '@/hooks/useAuth';
import Breadcrumb from '@/components/dashboard/Breadcrumb';
import {
    Users,
    CheckCircle,
    XCircle,
    Search,
    ShieldCheck,
    Eye,
    Mail,
    Phone
} from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';

export default function ManagementAgentsPage() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [agents, setAgents] = useState<any[]>([]);
    const [search, setSearch] = useState('');

    useEffect(() => {
        if (user?.user_type === 'management') {
            fetchAgents();
        }
    }, [user]);

    const fetchAgents = async () => {
        try {
            setLoading(true);
            const response = await agentsAPI.getManagementAgents();

            if (response && response.results) {
                setAgents(response.results);
            } else if (Array.isArray(response)) {
                setAgents(response);
            } else {
                setAgents([]);
            }
        } catch (error) {
            console.error('Failed to fetch agents:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async (id: number) => {
        if (!confirm('Are you sure you want to verify this agent?')) return;
        try {
            await agentsAPI.verifyAgent(id);
            fetchAgents(); // Refresh list
        } catch (error) {
            console.error('Failed to verify agent:', error);
            alert('Failed to verify agent');
        }
    };

    const filteredAgents = agents.filter(a =>
        (a.username && a.username.toLowerCase().includes(search.toLowerCase())) ||
        (a.email && a.email.toLowerCase().includes(search.toLowerCase()))
    );

    return (
        <div className="p-4 md:p-8 lg:p-10">
            <div className="max-w-7xl mx-auto space-y-8">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <Breadcrumb />
                        <h1 className="text-3xl font-black text-foreground tracking-tight flex items-center gap-3 mt-4">
                            <Users className="text-primary" size={32} />
                            Manage <span className="text-primary">Agents</span>
                        </h1>
                        <p className="text-muted-foreground mt-2">Verify and manage real estate agents</p>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex items-center justify-between bg-card p-4 rounded-2xl border border-border shadow-sm">
                    <div className="relative w-full max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
                        <input
                            type="text"
                            placeholder="Search agents by name or email..."
                            className="input input-bordered w-full pl-10 rounded-xl"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                {/* Agents Grid */}
                {loading ? (
                    <div className="flex justify-center py-20">
                        <span className="loading loading-spinner loading-lg text-primary"></span>
                    </div>
                ) : filteredAgents.length === 0 ? (
                    <div className="text-center py-20 text-muted-foreground">
                        No agents found
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredAgents.map((agent) => (
                            <div key={agent.id} className="bg-card border border-border rounded-3xl p-6 shadow-sm hover:shadow-lg transition-all relative overflow-hidden group">
                                {agent.is_verified && (
                                    <div className="absolute top-4 right-4 text-success" title="Verified Agent">
                                        <ShieldCheck size={24} />
                                    </div>
                                )}
                                <div className="flex flex-col items-center text-center mb-6">
                                    <div className="avatar placeholder mb-4">
                                        <div className="bg-neutral text-neutral-content rounded-full w-24 ring ring-primary ring-offset-base-100 ring-offset-2">
                                            {agent.profile_picture ? (
                                                <img src={agent.profile_picture} alt={agent.username} />
                                            ) : (
                                                <span className="text-3xl">{agent.username.charAt(0).toUpperCase()}</span>
                                            )}
                                        </div>
                                    </div>
                                    <h3 className="text-xl font-bold text-foreground">{agent.username}</h3>
                                    <p className="text-primary font-medium">{agent.agency_name || 'Independent Agent'}</p>

                                    <div className="flex gap-2 mt-4 text-sm text-muted-foreground">
                                        <span className="flex items-center gap-1">
                                            <Mail size={14} />
                                            {agent.email}
                                        </span>
                                    </div>
                                    {agent.phone_number && (
                                        <div className="flex gap-2 mt-1 text-sm text-muted-foreground">
                                            <span className="flex items-center gap-1">
                                                <Phone size={14} />
                                                {agent.phone_number}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                <div className="grid grid-cols-3 gap-2 border-t border-border pt-6 mb-6">
                                    <div className="text-center">
                                        <p className="text-xl font-black text-foreground">{agent.properties_count || 0}</p>
                                        <p className="text-xs text-muted-foreground uppercase">Properties</p>
                                    </div>
                                    <div className="text-center border-l border-r border-border">
                                        <p className="text-xl font-black text-foreground">{agent.sales_count || 0}</p>
                                        <p className="text-xs text-muted-foreground uppercase">Sold</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-xl font-black text-foreground">{(agent.rating || 0).toFixed(1)}</p>
                                        <p className="text-xs text-muted-foreground uppercase">Rating</p>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <Link
                                        href={`/dashboard/management/agents/${agent.id}`}
                                        className="btn btn-outline flex-1 rounded-xl"
                                    >
                                        <Eye size={18} />
                                        View Details
                                    </Link>
                                    {!agent.is_verified && (
                                        <button
                                            className="btn btn-success text-white flex-1 rounded-xl"
                                            onClick={() => handleVerify(agent.id)}
                                        >
                                            <CheckCircle size={18} />
                                            Verify
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
