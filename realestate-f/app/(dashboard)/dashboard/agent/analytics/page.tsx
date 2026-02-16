'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { analyticsAPI } from '@/lib/api/analytics';
import Breadcrumb from '@/components/dashboard/Breadcrumb';
import {
    BarChart3,
    TrendingUp,
    Users,
    Home,
    ArrowUpRight,
    ArrowDownRight,
    Activity,
    Target,
    PieChart as PieChartIcon,
    Zap
} from 'lucide-react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    Cell,
    PieChart,
    Pie
} from 'recharts';

export default function AnalyticsDashboard() {
    const { user } = useAuth();
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const res = await analyticsAPI.getDashboardStats();
                setData(res);
            } catch (error) {
                console.error('Failed to fetch analytics:', error);
            } finally {
                setLoading(false);
            }
        };

        if (user) fetchAnalytics();
    }, [user]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#020617] flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];

    // Mock data for trends if not available
    const trendData = [
        { name: 'Week 1', leads: 400, views: 2400 },
        { name: 'Week 2', leads: 300, views: 1398 },
        { name: 'Week 3', leads: 200, views: 9800 },
        { name: 'Week 4', leads: 278, views: 3908 },
    ];

    const sourceData = [
        { name: 'Website', value: 400 },
        { name: 'WhatsApp', value: 300 },
        { name: 'Referral', value: 300 },
        { name: 'Phone', value: 200 },
    ];

    return (
        <div className="min-h-screen bg-[#020617] text-slate-200 p-4 md:p-8">
            <div className="max-w-7xl mx-auto space-y-10">
                <div className="space-y-4">
                    <Breadcrumb />
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center">
                            <BarChart3 className="text-white" size={24} />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-white tracking-tight">Intelligence Hub</h1>
                            <p className="text-slate-500 font-medium">Real-time performance & market insights</p>
                        </div>
                    </div>
                </div>

                {/* Performance Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                        { label: 'Total Revenue', value: 'KES 42.8M', trend: '+12.5%', icon: TrendingUp, color: 'emerald' },
                        { label: 'Lead Conversion', value: '18.4%', trend: '+2.1%', icon: Target, color: 'blue' },
                        { label: 'Avg Sale Cycle', value: '24 Days', trend: '-3 Days', icon: Activity, color: 'purple' },
                        { label: 'Market Reach', value: '1.2M', trend: '+45k', icon: Zap, color: 'amber' }
                    ].map((stat, i) => (
                        <div key={i} className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] shadow-xl relative overflow-hidden group">
                            <div className={`absolute top-0 right-0 w-32 h-32 bg-${stat.color}-500/5 rounded-full blur-3xl -mr-16 -mt-16`} />
                            <div className="flex justify-between items-start relative z-10">
                                <div className="space-y-4">
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{stat.label}</p>
                                    <h3 className="text-3xl font-black text-white tracking-tight">{stat.value}</h3>
                                    <div className="flex items-center gap-2">
                                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full bg-${stat.color}-500/10 text-${stat.color}-400 border border-${stat.color}-500/20`}>
                                            {stat.trend}
                                        </span>
                                        <span className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">vs Last Month</span>
                                    </div>
                                </div>
                                <div className={`p-4 bg-slate-800 rounded-2xl text-${stat.color}-400`}>
                                    <stat.icon size={24} />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Lead Inflow Chart */}
                    <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-[2.5rem] p-10 shadow-2xl">
                        <div className="flex items-center justify-between mb-10">
                            <div>
                                <h3 className="text-xl font-black text-white uppercase tracking-tight">Lead Acquisition Trend</h3>
                                <p className="text-slate-500 text-xs font-medium">Monthly volume across all channels</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-blue-500" />
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Leads</span>
                            </div>
                        </div>
                        <div className="h-[350px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={trendData}>
                                    <defs>
                                        <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                    <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }}
                                        itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                                    />
                                    <Area type="monotone" dataKey="leads" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#colorLeads)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Distribution Chart */}
                    <div className="lg:col-span-1 bg-slate-900 border border-slate-800 rounded-[2.5rem] p-10 shadow-2xl">
                        <div className="mb-10 text-center">
                            <h3 className="text-xl font-black text-white uppercase tracking-tight">Source Distribution</h3>
                            <p className="text-slate-500 text-xs font-medium">Top performing lead sources</p>
                        </div>
                        <div className="h-[300px] relative">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={sourceData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={80}
                                        outerRadius={100}
                                        paddingAngle={8}
                                        dataKey="value"
                                    >
                                        {sourceData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <h4 className="text-3xl font-black text-white">1.2k</h4>
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Total Leads</p>
                            </div>
                        </div>
                        <div className="mt-8 space-y-4">
                            {sourceData.map((s, i) => (
                                <div key={i} className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                                        <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{s.name}</span>
                                    </div>
                                    <span className="text-xs font-black text-white">{((s.value / 1200) * 100).toFixed(0)}%</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Popular Properties Section */}
                <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] overflow-hidden shadow-2xl">
                    <div className="p-10 border-b border-slate-800 flex items-center justify-between bg-slate-900/50 backdrop-blur-md">
                        <div>
                            <h3 className="text-xl font-black text-white uppercase tracking-tight">Top Performance Assets</h3>
                            <p className="text-slate-500 text-xs font-medium">Properties with highest engagement metrics</p>
                        </div>
                        <button className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-[10px] font-black tracking-widest transition-all">
                            EXPORT ANALYSIS (PDF)
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-900/50">
                                    <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Property Identity</th>
                                    <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 text-center">Engagement</th>
                                    <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 text-center">Lead Gen</th>
                                    <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 text-center">Conversion</th>
                                    <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 text-right">Progress</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800">
                                {[
                                    { title: 'Skyline Penthouse', views: '1,240', leads: 42, rate: '3.4%', trend: 'up' },
                                    { title: 'Emerald Valley Villas', views: '890', leads: 38, rate: '4.2%', trend: 'up' },
                                    { title: 'The Waterfront Suite', views: '750', leads: 12, rate: '1.6%', trend: 'down' },
                                ].map((row, i) => (
                                    <tr key={i} className="hover:bg-slate-800/30 transition-colors">
                                        <td className="px-10 py-8">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-slate-800 rounded-xl border border-slate-700 flex items-center justify-center">
                                                    <Home className="text-slate-500" size={20} />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-white tracking-tight">{row.title}</p>
                                                    <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Premium Listing</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-10 py-8 text-center font-bold text-slate-300">{row.views} Views</td>
                                        <td className="px-10 py-8 text-center font-bold text-slate-300">{row.leads} Leads</td>
                                        <td className="px-10 py-8 text-center">
                                            <span className={`text-xs font-black p-2 rounded-lg ${row.trend === 'up' ? 'text-emerald-400 bg-emerald-400/10' : 'text-rose-400 bg-rose-400/10'}`}>
                                                {row.rate}
                                            </span>
                                        </td>
                                        <td className="px-10 py-8">
                                            <div className="w-24 h-1.5 bg-slate-800 rounded-full ml-auto overflow-hidden">
                                                <div className="h-full bg-blue-600" style={{ width: `${Math.random() * 60 + 20}%` }} />
                                            </div>
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
