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
        primary: 'from-primary/10 to-primary/5 text-primary border-primary/10',
        success: 'from-secondary/10 to-secondary/5 text-secondary border-secondary/10',
        warning: 'from-accent/10 to-accent/5 text-accent border-accent/10',
        error: 'from-destructive/10 to-destructive/5 text-destructive border-destructive/10',
        info: 'from-blue-500/10 to-blue-500/5 text-blue-500 border-blue-500/10',
    };

    return (
        <div className="group bg-card p-6 rounded-2xl border border-border shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-start justify-between">
                <div className="space-y-1">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{label}</p>
                    <div className="flex items-baseline gap-1">
                        <p className="text-3xl font-bold text-foreground tabular-nums">{value}</p>
                    </div>
                </div>
                <div className={`p-3 rounded-xl bg-linear-to-br ${colorMap[color]} group-hover:scale-110 transition-transform duration-300`}>
                    {icon}
                </div>
            </div>

            {/* Added a small trend indicator or detail for premium feel */}
            <div className="mt-4 flex items-center gap-2">
                <div className="h-1.5 flex-1 bg-muted rounded-full overflow-hidden">
                    <div
                        className={`h-full bg-current opacity-30 rounded-full transition-all duration-1000`}
                        style={{ width: '65%', color: `var(--color-${color})` }}
                    />
                </div>
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
