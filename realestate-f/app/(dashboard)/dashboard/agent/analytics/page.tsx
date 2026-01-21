'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { analyticsAPI } from '@/lib/api/analytics';
import Breadcrumb from '@/components/dashboard/Breadcrumb';
import { BarChart3, TrendingUp, Users, DollarSign, Eye, Calendar } from 'lucide-react';

export default function AnalyticsPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [analytics, setAnalytics] = useState<any>(null);
    const [performance, setPerformance] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const [analyticsData, performanceData] = await Promise.all([
                    analyticsAPI.getDashboardStats(),
                    analyticsAPI.getAgentPerformance()
                ]);
                setAnalytics(analyticsData);
                setPerformance(performanceData);
            } catch (error) {
                console.error('Failed to fetch analytics:', error);
            } finally {
                setLoading(false);
            }
        };

        if (user?.user_type === 'agent') {
            fetchAnalytics();
        }
    }, [user]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
            </div>
        );
    }

    const stats = [
        {
            label: 'Total Properties',
            value: analytics?.total_properties || 0,
            icon: BarChart3,
            color: 'text-blue-600 dark:text-blue-400',
            bgColor: 'bg-blue-100 dark:bg-blue-900/20',
        },
        {
            label: 'Active Listings',
            value: analytics?.active_properties || 0,
            icon: TrendingUp,
            color: 'text-green-600 dark:text-green-400',
            bgColor: 'bg-green-100 dark:bg-green-900/20',
        },
        {
            label: 'Total Leads',
            value: analytics?.total_leads || 0,
            icon: Users,
            color: 'text-purple-600 dark:text-purple-400',
            bgColor: 'bg-purple-100 dark:bg-purple-900/20',
        },
        {
            label: 'Property Views',
            value: analytics?.property_views || 0,
            icon: Eye,
            color: 'text-orange-600 dark:text-orange-400',
            bgColor: 'bg-orange-100 dark:bg-orange-900/20',
        },
    ];

    return (
        <div className="min-h-screen bg-background p-4 md:p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                <Breadcrumb />

                <div>
                    <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                        <BarChart3 className="text-primary" size={32} />
                        Analytics Dashboard
                    </h1>
                    <p className="text-muted-foreground mt-1">Track your performance and insights</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {stats.map((stat, index) => {
                        const Icon = stat.icon;
                        return (
                            <div key={index} className="bg-card border border-border rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-center justify-between mb-4">
                                    <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                                        <Icon className={stat.color} size={24} />
                                    </div>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground font-medium">{stat.label}</p>
                                    <p className="text-3xl font-bold text-foreground mt-1">{stat.value}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Performance Metrics */}
                {performance && (
                    <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                        <h2 className="text-xl font-bold text-foreground mb-6">Performance Metrics</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <p className="text-sm text-muted-foreground font-medium">Properties Listed</p>
                                <p className="text-2xl font-bold text-foreground mt-1">
                                    {performance.properties_listed || 0}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground font-medium">Properties Sold</p>
                                <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
                                    {performance.properties_sold || 0}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground font-medium">Conversion Rate</p>
                                <p className="text-2xl font-bold text-primary mt-1">
                                    {performance.conversion_rate_percentage || '0%'}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Lead Analytics */}
                <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                    <h2 className="text-xl font-bold text-foreground mb-6">Lead Analytics</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <p className="text-sm text-muted-foreground font-medium">Total Leads</p>
                            <p className="text-2xl font-bold text-foreground mt-1">
                                {analytics?.total_leads || 0}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground font-medium">New Leads (This Month)</p>
                            <p className="text-2xl font-bold text-primary mt-1">
                                {analytics?.new_leads || 0}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground font-medium">Conversion Rate</p>
                            <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
                                {analytics?.conversion_rate ? `${analytics.conversion_rate}%` : '0%'}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground font-medium">Avg Response Time</p>
                            <p className="text-2xl font-bold text-foreground mt-1">
                                {analytics?.average_response_time || 'N/A'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Property Performance */}
                <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                    <h2 className="text-xl font-bold text-foreground mb-6">Property Performance</h2>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-muted/20 rounded-xl">
                            <span className="text-foreground font-medium">Total Views</span>
                            <span className="text-xl font-bold text-primary">
                                {analytics?.property_views || 0}
                            </span>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-muted/20 rounded-xl">
                            <span className="text-foreground font-medium">Active Properties</span>
                            <span className="text-xl font-bold text-green-600 dark:text-green-400">
                                {analytics?.active_properties || 0}
                            </span>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-muted/20 rounded-xl">
                            <span className="text-foreground font-medium">Sold Properties</span>
                            <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
                                {analytics?.sold_properties || 0}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
