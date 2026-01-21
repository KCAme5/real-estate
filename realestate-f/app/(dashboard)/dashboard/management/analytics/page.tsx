'use client';

import React, { useEffect, useState } from 'react';
import { analyticsAPI, ManagementAnalytics } from '@/lib/api/analytics';
import { useAuth } from '@/hooks/useAuth';
import Breadcrumb from '@/components/dashboard/Breadcrumb';
import {
    BarChart3,
    TrendingUp,
    Users,
    DollarSign,
    Target
} from 'lucide-react';
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default function ManagementAnalyticsPage() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [analytics, setAnalytics] = useState<ManagementAnalytics | null>(null);
    const [showAllAgents, setShowAllAgents] = useState(false);

    useEffect(() => {
        if (user?.user_type === 'management') {
            fetchAnalytics();
        }
    }, [user]);

    const fetchAnalytics = async () => {
        try {
            const data = await analyticsAPI.getManagementAnalytics();
            setAnalytics(data);
        } catch (error) {
            console.error('Failed to fetch analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading || !analytics) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <span className="loading loading-spinner loading-lg text-primary"></span>
            </div>
        );
    }

    // Process data for charts
    const leadTrendsData = analytics.lead_trends || [];
    const agentPerformanceData = analytics.agent_performance_list || [];

    // Data for Pie Chart
    const propertyStatusData = [
        { name: 'Active', value: analytics.overview.property_status_distribution?.verified || 0 },
        { name: 'Pending', value: analytics.overview.property_status_distribution?.pending || 0 },
        { name: 'Rejected', value: analytics.overview.property_status_distribution?.rejected || 0 },
    ];

    const STATUS_COLORS = ['#22c55e', '#eab308', '#ef4444']; // Green, Yellow, Red

    return (
        <div className="p-4 md:p-8 lg:p-10">
            <div className="max-w-7xl mx-auto space-y-10">
                <div className="flex items-end justify-between">
                    <div>
                        <Breadcrumb />
                        <h1 className="text-3xl font-black text-foreground tracking-tight flex items-center gap-3 mt-4">
                            <BarChart3 className="text-primary" size={32} />
                            Platform <span className="text-primary">Analytics</span>
                        </h1>
                        <p className="text-muted-foreground mt-2">Comprehensive platform performance metrics</p>
                    </div>
                </div>

                {/* Key Metrics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-card border border-border rounded-3xl p-6 shadow-sm">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 bg-success/10 text-success rounded-xl flex items-center justify-center">
                                <DollarSign size={24} />
                            </div>
                            <span className="text-sm font-bold text-muted-foreground">Total Revenue</span>
                        </div>
                        <p className="text-3xl font-black text-foreground">
                            KES {analytics.overview.total_revenue?.toLocaleString() || '0'}
                        </p>
                    </div>
                    <div className="bg-card border border-border rounded-3xl p-6 shadow-sm">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
                                <Users size={24} />
                            </div>
                            <span className="text-sm font-bold text-muted-foreground">Total Agents</span>
                        </div>
                        <p className="text-3xl font-black text-foreground">
                            {analytics.overview.total_agents}
                        </p>
                    </div>
                    <div className="bg-card border border-border rounded-3xl p-6 shadow-sm">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 bg-secondary/10 text-secondary rounded-xl flex items-center justify-center">
                                <TrendingUp size={24} />
                            </div>
                            <span className="text-sm font-bold text-muted-foreground">Conversion Rate</span>
                        </div>
                        <p className="text-3xl font-black text-foreground">
                            {analytics.this_month.conversion_rate}%
                        </p>
                    </div>
                    <div className="bg-card border border-border rounded-3xl p-6 shadow-sm">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 bg-accent/10 text-accent rounded-xl flex items-center justify-center">
                                <Target size={24} />
                            </div>
                            <span className="text-sm font-bold text-muted-foreground">Total Leads</span>
                        </div>
                        <p className="text-3xl font-black text-foreground">
                            {analytics.overview.total_leads}
                        </p>
                    </div>
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Lead Generation Trends */}
                    <div className="bg-card border border-border rounded-3xl p-6 shadow-sm">
                        <h3 className="text-xl font-bold text-foreground mb-6">Lead Generation (Last 7 Days)</h3>
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={leadTrendsData}>
                                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                                    <XAxis dataKey="date" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis fontSize={12} tickLine={false} axisLine={false} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: 'var(--color-card)', borderRadius: '12px', border: '1px solid var(--color-border)' }}
                                        labelStyle={{ color: 'var(--color-muted-foreground)' }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="count"
                                        stroke="hsl(var(--primary))"
                                        strokeWidth={4}
                                        dot={{ r: 4, strokeWidth: 2 }}
                                        activeDot={{ r: 8 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Agent Performance (Properties vs Sold) */}
                    <div className="bg-card border border-border rounded-3xl p-6 shadow-sm">
                        <h3 className="text-xl font-bold text-foreground mb-6">Top Agent Performance</h3>
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={agentPerformanceData.slice(0, 5)}>
                                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                                    <XAxis dataKey="username" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis fontSize={12} tickLine={false} axisLine={false} />
                                    <Tooltip
                                        cursor={{ fill: 'transparent' }}
                                        contentStyle={{ backgroundColor: 'var(--color-card)', borderRadius: '12px', border: '1px solid var(--color-border)' }}
                                    />
                                    <Legend />
                                    <Bar dataKey="properties_count" name="Listed" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="properties_sold" name="Sold" fill="hsl(var(--secondary))" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Property Status & Agent Performance Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Property Status Distribution (Pie Chart) */}
                    <div className="bg-card border border-border rounded-3xl p-6 shadow-sm">
                        <h3 className="text-xl font-bold text-foreground mb-6">Property Status Distribution</h3>
                        <div className="h-80 w-full flex justify-center">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={propertyStatusData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={100}
                                        fill="#8884d8"
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {propertyStatusData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={STATUS_COLORS[index % STATUS_COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ backgroundColor: 'var(--color-card)', borderRadius: '12px', border: '1px solid var(--color-border)' }}
                                    />
                                    <Legend verticalAlign="bottom" height={36} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Agent Performance (Properties vs Sold) */}
                    <div className="bg-card border border-border rounded-3xl p-6 shadow-sm">
                        <h3 className="text-xl font-bold text-foreground mb-6">Top Agent Performance</h3>
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={agentPerformanceData.slice(0, 5)}>
                                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                                    <XAxis dataKey="username" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis fontSize={12} tickLine={false} axisLine={false} />
                                    <Tooltip
                                        cursor={{ fill: 'transparent' }}
                                        contentStyle={{ backgroundColor: 'var(--color-card)', borderRadius: '12px', border: '1px solid var(--color-border)' }}
                                    />
                                    <Legend />
                                    <Bar dataKey="properties_count" name="Listed" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="properties_sold" name="Sold" fill="hsl(var(--secondary))" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Agent Performance Table */}
                <div className="bg-card border border-border rounded-3xl shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-border flex justify-between items-center">
                        <h3 className="text-xl font-bold text-foreground">Detailed Agent Performance</h3>
                        <button
                            onClick={() => setShowAllAgents(!showAllAgents)}
                            className="btn btn-sm btn-ghost text-primary"
                        >
                            {showAllAgents ? 'Show Less' : 'View All'}
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="table table-lg">
                            <thead>
                                <tr className="bg-muted/50">
                                    <th>Agent</th>
                                    <th className="text-center">Properties Listed</th>
                                    <th className="text-center">Properties Sold</th>
                                    <th className="text-center">Leads Generated</th>
                                    <th className="text-right">Revenue Generated</th>
                                </tr>
                            </thead>
                            <tbody>
                                {agentPerformanceData.slice(0, showAllAgents ? undefined : 5).map((agent) => (
                                    <tr key={agent.id} className="hover:bg-muted/10">
                                        <td>
                                            <div className="font-bold">{agent.username}</div>
                                            <div className="text-xs text-muted-foreground">{agent.email}</div>
                                        </td>
                                        <td className="text-center font-bold">{agent.properties_count}</td>
                                        <td className="text-center font-bold text-secondary">{agent.properties_sold}</td>
                                        <td className="text-center font-bold text-accent">{agent.leads_count}</td>
                                        <td className="text-right font-black text-success">
                                            KES {agent.revenue.toLocaleString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
