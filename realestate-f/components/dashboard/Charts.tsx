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

export function PropertyPerformanceChart() {
    const properties = [
        { name: 'Kilimani Penthouse', percentage: 80 },
        { name: 'Riverside Apt', percentage: 60 },
        { name: 'Westlands Villa', percentage: 40 },
        { name: 'Karen House', percentage: 20 },
    ];

    return (
        <div className="bg-base-100 p-6 rounded-lg border border-base-300">
            <h3 className="font-semibold mb-4">Property Performance</h3>
            <div className="space-y-4">
                {properties.map((prop, index) => (
                    <div key={index}>
                        <div className="flex justify-between text-sm mb-1">
                            <span className="font-medium">{prop.name}</span>
                            <span className="text-primary font-semibold">{prop.percentage}%</span>
                        </div>
                        <div className="w-full bg-base-200 rounded-full h-2 overflow-hidden">
                            <div
                                className="bg-linear-to-r from-primary to-success h-full transition-all"
                                style={{ width: `${prop.percentage}%` }}
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
        { label: 'Total Properties', value: stats?.total_properties || '0', trend: 'up', color: 'primary' },
        { label: 'Active Leads', value: stats?.total_leads || '0', trend: 'up', color: 'secondary' },
        { label: 'Property Views', value: stats?.property_views || '0', trend: 'up', color: 'accent' },
        { label: 'Active Listings', value: stats?.active_properties || '0', trend: 'up', color: 'info' },
        { label: 'New Leads (30d)', value: stats?.new_leads || '0', trend: 'up', color: 'success' },
        { label: 'Sold Properties', value: stats?.sold_properties || '0', trend: 'up', color: 'primary' },
    ];

    const colorClasses = {
        primary: 'bg-primary/10 text-primary border-primary/20',
        secondary: 'bg-secondary/10 text-secondary border-secondary/20',
        accent: 'bg-accent/10 text-accent border-accent/20',
        info: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
        success: 'bg-green-500/10 text-green-500 border-green-500/20',
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {statsData.map((stat, index) => (
                <div key={index} className="group bg-card p-8 rounded-2xl border border-border shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                    <div className="flex items-start justify-between mb-4">
                        <p className="text-xs font-black text-muted-foreground uppercase tracking-widest">{stat.label}</p>
                        <div className={`p-2 rounded-lg ${(colorClasses as any)[stat.color]} group-hover:scale-110 transition-transform`}>
                            <TrendingUp size={16} />
                        </div>
                    </div>
                    <div className="flex items-end gap-2">
                        <p className="text-4xl font-black text-foreground tracking-tight tabular-nums">{stat.value}</p>
                        <p className="text-xs font-bold text-muted-foreground mb-1.5">+12.5%</p>
                    </div>
                </div>
            ))}
        </div>
    );
}
