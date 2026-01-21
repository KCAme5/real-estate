'use client';

import React from 'react';
import { MessageSquare, Home, Calendar, Activity, BellOff } from 'lucide-react';
import { Notification } from '@/lib/api/notifications';

interface ActivityItemProps {
    icon: React.ReactNode;
    title: string;
    description: string;
    timestamp: string;
    type: 'MESSAGE' | 'PROPERTY' | 'BOOKING' | 'SYSTEM';
    isRead?: boolean;
}

export function ActivityItem({ icon, title, description, timestamp, type, isRead }: ActivityItemProps) {
    const typeColors = {
        MESSAGE: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
        PROPERTY: 'bg-secondary/10 text-secondary border-secondary/20',
        BOOKING: 'bg-accent/10 text-accent border-accent/20',
        SYSTEM: 'bg-primary/10 text-primary border-primary/20',
    };

    return (
        <div className={`group flex gap-5 p-4 rounded-xl hover:bg-muted/30 transition-all border border-transparent hover:border-border/50 ${!isRead ? 'bg-primary/5' : ''}`}>
            <div className={`p-3 rounded-xl h-fit border ${typeColors[type] || typeColors.SYSTEM} group-hover:scale-110 transition-transform duration-300`}>
                {icon}
            </div>
            <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center justify-between gap-2">
                    <p className="font-bold text-foreground group-hover:text-primary transition-colors truncate">{title}</p>
                    <span className="shrink-0 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                        {new Date(timestamp).toLocaleDateString() === new Date().toLocaleDateString()
                            ? new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                            : new Date(timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </span>
                </div>
                <p className="text-sm text-muted-foreground font-medium line-clamp-2 leading-relaxed">{description}</p>
            </div>
        </div>
    );
}

interface RecentActivityProps {
    notifications: Notification[];
    loading?: boolean;
}

export function RecentActivity({ notifications, loading }: RecentActivityProps) {
    const getIcon = (type: string) => {
        switch (type) {
            case 'MESSAGE': return <MessageSquare size={18} />;
            case 'PROPERTY': return <Home size={18} />;
            case 'BOOKING': return <Calendar size={18} />;
            default: return <Activity size={18} />;
        }
    };

    return (
        <div className="bg-card border border-border rounded-2xl p-8 shadow-sm h-full">
            <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-secondary/10 rounded-xl flex items-center justify-center text-secondary font-bold">
                    <Activity size={20} />
                </div>
                <h3 className="font-bold text-xl text-foreground tracking-tight">Recent Activity</h3>
            </div>

            <div className="space-y-4">
                {loading ? (
                    [1, 2, 3, 4].map(i => (
                        <div key={i} className="flex gap-5 p-4 animate-pulse">
                            <div className="w-12 h-12 bg-muted rounded-xl" />
                            <div className="flex-1 space-y-2">
                                <div className="h-4 bg-muted rounded w-1/2" />
                                <div className="h-3 bg-muted rounded w-3/4" />
                            </div>
                        </div>
                    ))
                ) : notifications.length > 0 ? (
                    notifications.slice(0, 6).map((notif, index) => (
                        <ActivityItem
                            key={notif.id}
                            icon={getIcon(notif.notification_type)}
                            title={notif.title}
                            description={notif.message}
                            timestamp={notif.created_at}
                            type={notif.notification_type}
                            isRead={notif.is_read}
                        />
                    ))
                ) : (
                    <div className="py-12 text-center space-y-4 opacity-50 grayscale">
                        <BellOff size={48} className="mx-auto text-muted-foreground" />
                        <p className="font-bold text-muted-foreground">No recent activity</p>
                    </div>
                )}
            </div>
        </div>
    );
}
