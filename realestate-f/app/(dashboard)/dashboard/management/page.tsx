'use client';

import React, { useEffect, useState } from 'react';
import { analyticsAPI, ManagementAnalytics } from '@/lib/api/analytics';
import { useAuth } from '@/hooks/useAuth';
import Breadcrumb from '@/components/dashboard/Breadcrumb';
import {
    Users,
    Home,
    TrendingUp,
    Eye,
    BarChart3,
    Shield,
    Settings,
    UserCheck,
    DollarSign,
    Activity,
    CheckCircle
} from 'lucide-react';

export default function ManagementDashboard() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [analytics, setAnalytics] = useState<ManagementAnalytics | null>(null);

    useEffect(() => {
        if (user?.user_type === 'management') {
            fetchManagementAnalytics();
        } else {
            setError('Access denied. Management privileges required.');
            setLoading(false);
        }
    }, [user]);

    const fetchManagementAnalytics = async () => {
        try {
            const data = await analyticsAPI.getManagementAnalytics();
            setAnalytics(data);
        } catch (e: any) {
            console.error('Failed to fetch management analytics:', e);
            setError(e?.message || 'Failed to load management analytics');
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

    if (error) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <div className="text-center space-y-4">
                    <Shield className="text-error mx-auto" size={48} />
                    <p className="text-error font-bold">{error}</p>
                </div>
            </div>
        );
    }

    if (!analytics) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <p className="text-muted-foreground">No analytics data available</p>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 lg:p-10">
            <div className="max-w-7xl mx-auto space-y-10">
                {/* Header */}
                <div className="space-y-4">
                    <Breadcrumb />
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                        <div>
                            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground tracking-tight flex items-center gap-2 md:gap-3">
                                <BarChart3 className="text-primary w-6 h-6 md:w-8 md:h-8 lg:w-9 lg:h-9" />
                                Management <span className="text-primary">Dashboard</span>
                            </h1>
                            <p className="text-sm text-muted-foreground font-medium mt-1">Complete overview of the real estate platform</p>
                        </div>
                    </div>
                </div>

                {/* Overview Cards */}
                <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4 lg:gap-6">
                    {[
                        {
                            label: 'Total Revenue',
                            value: `KES ${analytics.overview.total_revenue.toLocaleString()}`,
                            icon: DollarSign,
                            color: 'success',
                        },
                        {
                            label: 'Total Properties',
                            value: analytics.overview.total_properties,
                            icon: Home,
                            color: 'primary',
                        },
                        {
                            label: 'Verified Properties',
                            value: analytics.overview.verified_properties,
                            icon: CheckCircle,
                            color: 'success',
                        },
                        {
                            label: 'Total Agents',
                            value: analytics.overview.total_agents,
                            icon: UserCheck,
                            color: 'accent',
                        },
                        {
                            label: 'Total Clients',
                            value: analytics.overview.total_clients,
                            icon: Users,
                            color: 'secondary',
                        },
                        {
                            label: 'Total Leads',
                            value: analytics.overview.total_leads,
                            icon: TrendingUp,
                            color: 'warning',
                        }
                    ].map((stat, index) => (
                        <div key={index} className="bg-card border border-border rounded-2xl p-3 md:p-4 shadow-sm hover:shadow-md transition-all group">
                            <div className="flex items-center justify-between mb-2 md:mb-3">
                                <div className={`w-8 h-8 md:w-10 md:h-10 bg-${stat.color}/10 text-${stat.color} rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform`}>
                                    <stat.icon className="w-4 h-4 md:w-5 md:h-5" />
                                </div>
                            </div>
                            <h3 className="text-sm md:text-lg lg:text-xl font-bold text-foreground mb-0.5 md:mb-1 truncate">{stat.value}</h3>
                            <p className="text-[10px] md:text-xs font-semibold text-muted-foreground uppercase tracking-wider md:tracking-widest truncate">{stat.label}</p>
                        </div>
                    ))}
                </section>

                {/* Today's Activity */}
                <section className="bg-card border border-border rounded-3xl p-6 md:p-8 shadow-sm">
                    <div className="mb-6 md:mb-8">
                        <h2 className="text-xl md:text-2xl font-bold text-foreground flex items-center gap-3">
                            <Activity className="text-primary w-6 h-6 md:w-7 md:h-7" />
                            Today's Activity
                        </h2>
                        <p className="text-sm text-muted-foreground font-medium mt-1">Real-time platform activity</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="bg-linear-to-r from-primary/10 to-primary/5 rounded-2xl p-5 md:p-6 border border-primary/20">
                            <div className="flex items-center justify-between">
                                <Home className="text-primary w-5 h-5 md:w-6 md:h-6" />
                            </div>
                            <p className="text-2xl md:text-3xl font-bold text-primary mt-3 md:mt-4">{analytics.today.new_properties}</p>
                            <p className="text-[10px] md:text-xs font-semibold text-muted-foreground uppercase tracking-wider md:tracking-widest mt-2">New Properties</p>
                        </div>
                        <div className="bg-linear-to-r from-secondary/10 to-secondary/5 rounded-2xl p-5 md:p-6 border border-secondary/20">
                            <div className="flex items-center justify-between">
                                <TrendingUp className="text-secondary w-5 h-5 md:w-6 md:h-6" />
                            </div>
                            <p className="text-2xl md:text-3xl font-bold text-secondary mt-3 md:mt-4">{analytics.today.new_leads}</p>
                            <p className="text-[10px] md:text-xs font-semibold text-muted-foreground uppercase tracking-wider md:tracking-widest mt-2">New Leads</p>
                        </div>
                        <div className="bg-linear-to-r from-accent/10 to-accent/5 rounded-2xl p-5 md:p-6 border border-accent/20">
                            <div className="flex items-center justify-between">
                                <Eye className="text-accent w-5 h-5 md:w-6 md:h-6" />
                            </div>
                            <p className="text-2xl md:text-3xl font-bold text-accent mt-3 md:mt-4">{analytics.today.property_views}</p>
                            <p className="text-[10px] md:text-xs font-semibold text-muted-foreground uppercase tracking-wider md:tracking-widest mt-2">Property Views</p>
                        </div>
                        <div className="bg-linear-to-r from-success/10 to-success/5 rounded-2xl p-5 md:p-6 border border-success/20">
                            <div className="flex items-center justify-between">
                                <Activity className="text-success w-5 h-5 md:w-6 md:h-6" />
                            </div>
                            <p className="text-2xl md:text-3xl font-bold text-success mt-3 md:mt-4">{analytics.today.searches}</p>
                            <p className="text-[10px] md:text-xs font-semibold text-muted-foreground uppercase tracking-wider md:tracking-widest mt-2">Searches</p>
                        </div>
                    </div>
                </section>

                {/* Top Performing Agents */}
                <section className="bg-card border border-border rounded-3xl p-8 shadow-sm">
                    <div className="mb-8">
                        <h2 className="text-2xl font-black text-foreground flex items-center gap-3">
                            <Users className="text-primary" size={28} />
                            Top Performing Agents
                        </h2>
                        <p className="text-sm text-muted-foreground font-medium mt-1">Agents with the best performance this month</p>
                    </div>
                    <div className="overflow-x-auto">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {analytics.top_agents.map((agent, index) => (
                                <div key={agent.username} className="bg-muted/20 rounded-2xl p-6 border border-border/50 hover:border-primary/20 transition-all">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
                                                <UserCheck className="text-primary" size={20} />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-foreground">{agent.username}</h4>
                                                <p className="text-xs text-muted-foreground">Top Agent</p>
                                            </div>
                                        </div>
                                        <div className="text-2xl font-black text-primary">#{index + 1}</div>
                                    </div>
                                    <div className="grid grid-cols-3 gap-4 text-center">
                                        <div>
                                            <p className="text-lg font-black text-foreground">{agent.properties_count}</p>
                                            <p className="text-xs text-muted-foreground">Listed</p>
                                        </div>
                                        <div>
                                            <p className="text-lg font-black text-accent">{agent.sold_properties}</p>
                                            <p className="text-xs text-muted-foreground">Sold</p>
                                        </div>
                                        <div>
                                            <p className="text-lg font-black text-secondary">{agent.leads_count}</p>
                                            <p className="text-xs text-muted-foreground">Leads</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Quick Actions */}
                <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                        {
                            title: 'Manage Properties',
                            description: 'Review and verify property listings',
                            icon: Home,
                            href: '/dashboard/management/properties',
                            color: 'primary'
                        },
                        {
                            title: 'Manage Agents',
                            description: 'Approve agent applications',
                            icon: UserCheck,
                            href: '/dashboard/management/agents',
                            color: 'secondary'
                        },
                        {
                            title: 'View Analytics',
                            description: 'Detailed platform insights',
                            icon: BarChart3,
                            href: '/dashboard/management/analytics',
                            color: 'accent'
                        },
                        {
                            title: 'Platform Settings',
                            description: 'Configure platform settings',
                            icon: Settings,
                            href: '/dashboard/settings',
                            color: 'success'
                        }
                    ].map((action, index) => (
                        <a
                            key={index}
                            href={action.href}
                            className="bg-card border border-border rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all group block"
                        >
                            <div className={`w-16 h-16 bg-${action.color}/10 text-${action.color} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                                <action.icon size={28} />
                            </div>
                            <h3 className="font-bold text-foreground mb-2 group-hover:text-primary transition-colors">{action.title}</h3>
                            <p className="text-sm text-muted-foreground">{action.description}</p>
                        </a>
                    ))}
                </section>
            </div>
        </div>
    );
}