'use client';

import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

export function SimpleChart({ data, label }: { data: number[]; label: string }) {
    const max = Math.max(...data);
    const height = 150;

    return (
        <div className="bg-base-100 p-6 rounded-lg border border-base-300">
            <h3 className="font-semibold mb-4">{label}</h3>
            <div className="flex items-end justify-around gap-2 h-40">
                {data.map((value, index) => (
                    <div
                        key={index}
                        className="flex-1 bg-linear-to-t from-primary to-primary/50 rounded-t hover:from-primary/80 transition-colors"
                        style={{ height: `${(value / max) * height}px`, minHeight: '20px' }}
                        title={`${value}%`}
                    />
                ))}
            </div>
            <div className="flex justify-between text-xs text-base-content/70 mt-4">
                <span>Jan</span>
                <span>Feb</span>
                <span>Mar</span>
                <span>Apr</span>
                <span>May</span>
            </div>
        </div>
    );
}

export function PropertyPerformanceChart({ properties }: { properties?: any[] }) {
    if (!properties || properties.length === 0) {
        return (
            <div className="bg-base-100 p-6 rounded-lg border border-base-300">
                <h3 className="font-semibold mb-4">Property Performance</h3>
                <p className="text-muted-foreground text-center py-8">No properties to display</p>
            </div>
        );
    }

    return (
        <div className="bg-base-100 p-6 rounded-lg border border-base-300">
            <h3 className="font-semibold mb-4">Property Performance</h3>
            <div className="space-y-4">
                {properties.slice(0, 4).map((prop, index) => (
                    <div key={index}>
                        <div className="flex justify-between text-sm mb-1">
                            <span className="font-medium truncate">{prop.title || `Property ${index + 1}`}</span>
                            <span className="text-primary font-semibold">{prop.views || 0} views</span>
                        </div>
                        <div className="w-full bg-base-200 rounded-full h-2 overflow-hidden">
                            <div
                                className="bg-linear-to-r from-primary to-success h-full transition-all"
                                style={{ width: `${Math.min((prop.views || 0) / 10, 100)}%` }}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export function AgentStatsCards({ stats }: { stats?: any }) {
    const statsData = [
        { label: 'Total Properties', value: stats?.total_properties || '0', color: 'primary' },
        { label: 'Active Leads', value: stats?.total_leads || '0', color: 'success' },
        { label: 'Property Views', value: stats?.property_views || '0', color: 'info' },
        { label: 'Active Listings', value: stats?.active_properties || '0', color: 'warning' },
        { label: 'New Leads (30d)', value: stats?.new_leads || '0', color: 'success' },
        { label: 'Sold Properties', value: stats?.sold_properties || '0', color: 'error' },
    ];

    const colorGradients = {
        primary: 'from-blue-600/20 via-blue-600/5 to-transparent border-blue-500/20 text-blue-400',
        success: 'from-emerald-600/20 via-emerald-600/5 to-transparent border-emerald-500/20 text-emerald-400',
        info: 'from-sky-600/20 via-sky-600/5 to-transparent border-sky-500/20 text-sky-400',
        warning: 'from-amber-600/20 via-amber-600/5 to-transparent border-amber-500/20 text-amber-400',
        error: 'from-rose-600/20 via-rose-600/5 to-transparent border-rose-500/20 text-rose-400',
    };

    return (
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {statsData.map((stat, index) => (
                <div key={index} className="group relative overflow-hidden bg-slate-900/40 backdrop-blur-xl p-5 rounded-2xl border border-slate-800 shadow-sm hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500">
                    <div className={`absolute inset-0 bg-linear-to-br ${(colorGradients as any)[stat.color]} opacity-20 group-hover:opacity-40 transition-opacity duration-500`} />

                    <div className="relative z-10 space-y-3">
                        <div className="flex items-center justify-between">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{stat.label}</p>
                            <div className={`p-1.5 rounded-lg bg-slate-950 border border-slate-800 group-hover:border-blue-500/30 transition-colors`}>
                                <TrendingUp size={12} className={(colorGradients as any)[stat.color].split(' ').pop()} />
                            </div>
                        </div>
                        <div className="flex items-baseline gap-1">
                            <p className="text-2xl font-black text-white tracking-tight tabular-nums group-hover:text-blue-400 transition-colors duration-300">
                                {stat.value}
                            </p>
                        </div>
                    </div>

                    {/* Subtle progress bar for premium feel */}
                    <div className="mt-4 relative h-0.5 w-full bg-slate-800/50 rounded-full overflow-hidden">
                        <div className="absolute inset-y-0 left-0 bg-blue-500 w-1/2 opacity-30 rounded-full group-hover:w-3/4 transition-all duration-700" />
                    </div>
                </div>
            ))}
        </div>
    );
}
