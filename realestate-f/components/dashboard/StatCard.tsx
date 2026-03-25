'use client';

import React from 'react';
import { Heart, MessageCircle, Calendar, Bell } from 'lucide-react';

interface StatCardProps {
    label: string;
    value: number | string;
    icon: React.ReactNode;
    color?: 'primary' | 'success' | 'warning' | 'error' | 'info';
}

export function StatCard({ label, value, icon, color = 'primary' }: StatCardProps) {
    const colorMap = {
        primary: 'from-blue-600/20 via-blue-600/5 to-transparent text-blue-400 border-blue-500/20',
        success: 'from-emerald-600/20 via-emerald-600/5 to-transparent text-emerald-400 border-emerald-500/20',
        warning: 'from-amber-600/20 via-amber-600/5 to-transparent text-amber-400 border-amber-500/20',
        error: 'from-rose-600/20 via-rose-600/5 to-transparent text-rose-400 border-rose-500/20',
        info: 'from-sky-600/20 via-sky-600/5 to-transparent text-sky-400 border-sky-500/20',
    };

    return (
        <div className={`group relative overflow-hidden bg-slate-900/50 backdrop-blur-xl p-5 rounded-2xl border border-slate-800 shadow-sm hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-1 transition-all duration-500`}>
            {/* Subtle Gradient Background */}
            <div className={`absolute inset-0 bg-linear-to-br ${colorMap[color]} opacity-30 group-hover:opacity-50 transition-opacity duration-500`} />

            <div className="relative z-10 flex items-start justify-between">
                <div className="space-y-1.5">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{label}</p>
                    <div className="flex items-baseline gap-1">
                        <p className="text-2xl font-black text-white tracking-tight tabular-nums group-hover:text-blue-400 transition-colors duration-300">{value}</p>
                    </div>
                </div>
                <div className={`p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 group-hover:text-blue-400 group-hover:border-blue-500/30 group-hover:scale-110 transition-all duration-500`}>
                    {React.cloneElement(icon as React.ReactElement, { size: 18 })}
                </div>
            </div>

            {/* Premium Mini-chart decoration */}
            <div className="mt-4 relative h-1 w-full bg-slate-800/50 rounded-full overflow-hidden">
                <div
                    className={`absolute inset-y-0 left-0 bg-linear-to-r from-blue-500 to-cyan-400 rounded-full transition-all duration-1000 ease-out`}
                    style={{ width: '70%' }}
                />
            </div>
        </div>
    );
}

export function ClientOverviewCards({ stats }: { stats?: any }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
                label="Properties Viewed"
                value={stats?.properties_viewed || 0}
                icon={<Heart size={24} className="text-primary" />}
                color="primary"
            />
            <StatCard
                label="Searches Done"
                value={stats?.searches_performed || 0}
                icon={<MessageCircle size={24} className="text-success" />}
                color="success"
            />
            <StatCard
                label="Leads Submitted"
                value={stats?.leads_submitted || 0}
                icon={<Calendar size={24} className="text-warning" />}
                color="warning"
            />
            <StatCard
                label="Notifications"
                value={7} // Hardcoded for now as it's typically separate
                icon={<Bell size={24} className="text-error" />}
                color="error"
            />
        </div>
    );
}
