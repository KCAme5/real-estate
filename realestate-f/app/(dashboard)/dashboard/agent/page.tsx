'use client';

import React, { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Breadcrumb from '@/components/dashboard/Breadcrumb';
import { AgentStatsCards, SimpleChart, PropertyPerformanceChart } from '@/components/dashboard/Charts';
import { PropertyCardsContainer } from '@/components/dashboard/PropertyCard';
import { RecentLeads } from '@/components/dashboard/LeadItem';
import { Plus, MessageSquare, TrendingUp, BarChart3, Calendar, Users, ArrowRight, FileText, Send, Clock } from 'lucide-react';

import { analyticsAPI } from '@/lib/api/analytics';
import { propertyAPI } from '@/lib/api/properties';
import { leadsAPI } from '@/lib/api/leads';

export default function AgentDashboard() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [stats, setStats] = React.useState<any>(null);
    const [properties, setProperties] = React.useState<any[]>([]);
    const [leads, setLeads] = React.useState<any[]>([]);
    const [conversations, setConversations] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState(true);
    const today = new Date();
    const formattedDate = today.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsData, propsData, leadsData, convsData] = await Promise.all([
                    analyticsAPI.getDashboardStats(),
                    propertyAPI.getAgentProperties(),
                    leadsAPI.getAll(),
                    leadsAPI.getConversations()
                ]);
                setStats(statsData);
                setProperties(propsData.results || propsData || []);
                setLeads(leadsData.results || leadsData || []);
                setConversations(convsData.results || convsData || []);
            } catch (error) {
                console.error('Failed to fetch agent dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        if (user && user.user_type === 'agent') {
            fetchData();
        }
    }, [user]);

    // Redirect if not authenticated or not an agent
    useEffect(() => {
        if (!authLoading) {
            if (!user) {
                router.push('/login');
            } else if (user.user_type !== 'agent') {
                router.push('/dashboard');
            }
        }
    }, [user, authLoading, router]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!user || user.user_type !== 'agent') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <p className="text-muted-foreground font-medium">Redirecting to your dashboard...</p>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 lg:p-10">
            <div className="max-w-7xl mx-auto space-y-10">
                {/* Breadcrumb & Welcome */}
                <div className="space-y-4">
                    <Breadcrumb />
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-1">
                            <h1 className="text-2xl md:text-3xl font-semibold text-foreground tracking-tight">
                                Good morning, <span className="text-primary">{user.first_name || 'Sarah'}</span>
                            </h1>
                            <p className="text-sm text-muted-foreground font-medium">
                                {formattedDate} — Performance overview this month
                            </p>
                        </div>
                        <div className="flex items-center gap-4">
                            {conversations.some(c => c.unread_count > 0) && (
                                <Link
                                    href="/dashboard/messages"
                                    className="flex items-center gap-3 px-6 py-3 bg-secondary text-white rounded-full text-sm font-black shadow-lg shadow-secondary/25 animate-bounce-subtle"
                                >
                                    <MessageSquare size={18} />
                                    {conversations.reduce((acc, c) => acc + c.unread_count, 0)} New Messages
                                </Link>
                            )}
                            <div className="hidden lg:flex items-center gap-2 px-6 py-3 bg-primary/10 text-primary rounded-full text-sm font-bold border border-primary/20">
                                <TrendingUp size={16} />
                                Top 5% Agent
                            </div>
                        </div>
                    </div>
                </div>

                {/* Performance Overview Stats */}
                <AgentStatsCards stats={stats} />

                {/* Charts & Analytics Section */}
                <section className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold text-foreground">📈 Analytics Overview</h2>
                        <Link
                            href="/dashboard/agent/analytics"
                            className="text-sm font-bold text-primary hover:underline"
                        >
                            View Full Report
                        </Link>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="bg-card border border-border rounded-2xl p-2 shadow-sm">
                            <SimpleChart data={[45, 52, 68, 75, 82, 88]} label="Lead Conversion Rate (%)" />
                        </div>
                        <div className="bg-card border border-border rounded-2xl p-2 shadow-sm">
                            <PropertyPerformanceChart />
                        </div>
                    </div>
                </section>

                {/* Main Content Grid - Recent Leads & Quick Actions */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Recent Leads */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-bold text-foreground tracking-tight">🎯 Recent Leads</h2>
                            <Link
                                href="/dashboard/agent/leads"
                                className="text-sm font-bold text-primary hover:underline"
                            >
                                Manage All Leads
                            </Link>
                        </div>
                        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm overflow-hidden">
                            <RecentLeads leads={leads.slice(0, 5)} />
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="lg:col-span-1 space-y-6">
                        <h2 className="text-2xl font-bold text-foreground tracking-tight">⚡ Quick Actions</h2>
                        <div className="bg-card border border-border rounded-2xl p-8 sticky top-24 shadow-sm">
                            <div className="space-y-3">
                                {[
                                    { icon: Plus, label: 'Add New Property', action: () => router.push('/dashboard/agent/properties/new') },
                                    { icon: Users, label: 'Create New Lead', action: () => { } },
                                    { icon: Calendar, label: 'Schedule Viewing', action: () => { } },
                                    { icon: FileText, label: 'Generate Report', action: () => { } },
                                    { icon: Send, label: 'Send Bulk Message', action: () => { } },
                                    { icon: Clock, label: 'Update Availability', action: () => { } },
                                ].map((btn, i) => (
                                    <button
                                        key={i}
                                        onClick={btn.action}
                                        className="w-full flex items-center justify-between p-4 bg-muted/10 hover:bg-primary hover:text-primary-foreground group rounded-xl transition-all duration-300 border border-border/50 text-left"
                                    >
                                        <div className="flex items-center gap-3">
                                            <btn.icon size={18} className="group-hover:scale-110 transition-transform" />
                                            <span className="font-semibold">{btn.label}</span>
                                        </div>
                                        <ArrowRight size={16} className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Today's Schedule */}
                <section className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <h2 className="text-2xl font-bold text-foreground tracking-tight">📅 Today's Schedule</h2>
                            <p className="text-sm text-muted-foreground font-medium">Your upcoming appointments</p>
                        </div>
                        <Link
                            href="/dashboard/agent/bookings"
                            className="group flex items-center gap-2 text-sm font-bold text-primary hover:gap-3 transition-all"
                        >
                            Full Schedule
                            <ArrowRight size={16} />
                        </Link>
                    </div>

                    <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-muted/30 border-b border-border">
                                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Time</th>
                                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Client</th>
                                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Property</th>
                                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Location</th>
                                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {!loading && conversations.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                                                No appointments scheduled
                                            </td>
                                        </tr>
                                    ) : (
                                        conversations.slice(0, 5).map((booking: any, i) => {
                                            const statusColors: Record<string, string> = {
                                                'PENDING': 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300',
                                                'CONFIRMED': 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300',
                                                'CANCELLED': 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300',
                                            };
                                            const booking_time = booking.updated_at ? new Date(booking.updated_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : 'TBD';
                                            const status = booking.status || 'PENDING';

                                            return (
                                                <tr key={i} className="hover:bg-muted/20 transition-colors group">
                                                    <td className="px-6 py-5 font-bold text-foreground">{booking_time}</td>
                                                    <td className="px-6 py-5 text-muted-foreground font-medium">
                                                        {booking.other_user?.name || 'Unknown Client'}
                                                    </td>
                                                    <td className="px-6 py-5 font-bold text-foreground group-hover:text-primary transition-colors">
                                                        {booking.property_title || 'Property Inquiry'}
                                                    </td>
                                                    <td className="px-6 py-5 text-muted-foreground font-medium">
                                                        {booking.property_location || 'Nairobi'}
                                                    </td>
                                                    <td className="px-6 py-5">
                                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${statusColors[status] || statusColors['PENDING']}`}>
                                                            <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                                                            {status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </section>

                {/* Active Listings */}
                <section className="space-y-6 pb-20">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <h2 className="text-2xl font-bold text-foreground tracking-tight">🏠 Active Listings</h2>
                            <p className="text-sm text-muted-foreground font-medium">Managing {properties.length} total properties</p>
                        </div>
                        <Link
                            href="/dashboard/agent/properties"
                            className="group flex items-center gap-2 text-sm font-bold text-primary hover:gap-3 transition-all"
                        >
                            Manage Listings
                            <ArrowRight size={16} />
                        </Link>
                    </div>
                    <PropertyCardsContainer properties={properties} />
                </section>
            </div>
        </div>
    );
}