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
                        <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight flex items-center gap-3 mt-4">
                            <Users className="text-primary" size={32} />
                            Manage <span className="text-primary">Agents</span>
                        </h1>
                        <p className="text-sm text-muted-foreground mt-2">Verify and manage real estate agents</p>
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
                    <div className="space-y-4 md:space-y-6">
                        {filteredAgents.map((agent) => (
                            <div key={agent.id} className="bg-card border border-border rounded-2xl md:rounded-3xl p-4 md:p-6 shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
                                <div className="flex flex-col md:flex-row items-center md:items-center gap-4 md:gap-8">
                                    <div className="flex flex-col items-center text-center md:text-left md:items-start min-w-[120px]">
                                        <div className="avatar placeholder mb-3 md:mb-0">
                                            <div className="bg-neutral text-neutral-content rounded-full w-16 md:w-20 ring ring-primary ring-offset-base-100 ring-offset-2">
                                                {agent.profile_picture ? (
                                                    <img src={agent.profile_picture} alt={agent.username} className="object-cover" />
                                                ) : (
                                                    <span className="text-2xl">{agent.username.charAt(0).toUpperCase()}</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex-1 min-w-0 text-center md:text-left">
                                        <div className="flex flex-col md:flex-row md:items-center gap-2 mb-2">
                                            <h3 className="text-lg md:text-xl font-bold text-foreground truncate">{agent.username}</h3>
                                            {agent.is_verified && (
                                                <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-success/10 text-success text-[10px] md:text-xs font-bold rounded-full">
                                                    <ShieldCheck size={12} /> Verified
                                                </div>
                                            )}
                                        </div>
                                        <p className="text-primary font-semibold text-sm mb-3">{agent.agency_name || 'Independent Agent'}</p>

                                        <div className="flex flex-wrap justify-center md:justify-start gap-3 md:gap-4 text-xs md:text-sm text-muted-foreground font-medium">
                                            <span className="flex items-center gap-1.5 min-w-0">
                                                <Mail size={14} className="text-primary/70 shrink-0" />
                                                <span className="truncate">{agent.email}</span>
                                            </span>
                                            {agent.phone_number && (
                                                <span className="flex items-center gap-1.5 shrink-0">
                                                    <Phone size={14} className="text-primary/70" />
                                                    {agent.phone_number}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="hidden lg:grid grid-cols-2 gap-4 border-l border-border px-8 min-w-[200px]">
                                        <div className="text-center">
                                            <p className="text-lg font-bold text-foreground">{agent.properties_count || 0}</p>
                                            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Properties</p>
                                        </div>
                                        <div className="text-center border-l border-border pl-4">
                                            <p className="text-lg font-bold text-foreground">{agent.sales_count || 0}</p>
                                            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Sold</p>
                                        </div>
                                    </div>

                                    <div className="flex flex-row md:flex-col gap-2 w-full md:w-auto shrink-0 md:min-w-[140px]">
                                        <Link
                                            href={`/dashboard/management/agents/${agent.id}`}
                                            className="btn btn-outline btn-sm md:btn-md flex-1 rounded-xl font-bold border-2"
                                        >
                                            <Eye size={16} />
                                            Details
                                        </Link>
                                        {!agent.is_verified && (
                                            <button
                                                className="btn btn-success btn-sm md:btn-md text-white flex-1 rounded-xl font-bold"
                                                onClick={() => handleVerify(agent.id)}
                                            >
                                                <CheckCircle size={16} />
                                                Verify
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
