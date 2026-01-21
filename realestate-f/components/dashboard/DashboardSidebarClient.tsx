'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { LayoutDashboard, Heart, Calendar, MessageSquare, Settings, TrendingUp, Users, Home } from 'lucide-react';
import { usePathname } from 'next/navigation';

export default function DashboardSidebarClient() {
    const { user } = useAuth();
    const pathname = usePathname();

    const clientNavigation = [
        { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/dashboard/saved', label: 'Saved Properties', icon: Heart },
        { href: '/dashboard/bookings', label: 'My Bookings', icon: Calendar },
        { href: '/dashboard/messages', label: 'Messages', icon: MessageSquare },
        { href: '/dashboard/settings', label: 'Settings', icon: Settings },
    ];

    const agentNavigation = [
        { href: '/dashboard/agent', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/dashboard/agent/properties', label: 'Properties', icon: Home },
        { href: '/dashboard/agent/leads', label: 'Leads', icon: Users },
        { href: '/dashboard/bookings', label: 'Bookings', icon: Calendar },
        { href: '/dashboard/agent/messages', label: 'Messages', icon: MessageSquare },
        { href: '/dashboard/agent/analytics', label: 'Analytics', icon: TrendingUp },
        { href: '/dashboard/settings', label: 'Settings', icon: Settings },
    ];

    const managementNavigation = [
        { href: '/dashboard/management', label: 'Management', icon: LayoutDashboard },
        { href: '/dashboard/management/properties', label: 'All Properties', icon: Home },
        { href: '/dashboard/management/agents', label: 'Agents', icon: Users },
        { href: '/dashboard/management/analytics', label: 'Analytics', icon: TrendingUp },
        { href: '/dashboard/settings', label: 'Settings', icon: Settings },
    ];

    let navigation;
    if (user?.user_type === 'agent') {
        navigation = agentNavigation;
    } else if (user?.user_type === 'management') {
        navigation = managementNavigation;
    } else {
        navigation = clientNavigation;
    }

    const isActive = (href: string) => {
        if (href === '/dashboard') {
            return pathname === '/dashboard' || pathname === '/dashboard/agent';
        }
        return pathname.startsWith(href);
    };

    return (
        <aside className="flex flex-col h-full bg-card border-r border-border shadow-sm w-72">
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
                <nav className="space-y-1.5 pt-4">
                    <p className="px-4 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-4">Main Menu</p>
                    {navigation.map((item) => {
                        const Icon = item.icon;
                        const active = isActive(item.href);

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center justify-between px-4 py-3.5 rounded-xl transition-all duration-300 group ${active
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20 font-semibold'
                                    : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground font-medium'
                                    }`}
                            >
                                <div className="flex items-center gap-3.5">
                                    <Icon size={20} className={active ? 'scale-110' : 'group-hover:scale-110 transition-transform'} />
                                    <span>{item.label}</span>
                                </div>
                                {active && <div className="w-1.5 h-1.5 rounded-full bg-primary-foreground animate-pulse"></div>}
                            </Link>
                        );
                    })}
                </nav>

                {/* Pro Tips Section */}
                <div className="pt-4">
                    {user?.user_type === 'agent' ? (
                        <div className="p-5 bg-linear-to-br from-primary/10 to-transparent rounded-2xl border border-primary/10 space-y-3">
                            <div className="flex items-center gap-2 text-primary">
                                <TrendingUp size={16} />
                                <span className="text-xs font-bold uppercase tracking-wider">Agent Pro Tip</span>
                            </div>
                            <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                                Keep your listings updated with quality photos to increase inquiries by up to <span className="text-primary font-bold">45%</span>.
                            </p>
                        </div>
                    ) : (
                        <div className="p-5 bg-linear-to-br from-secondary/10 to-transparent rounded-2xl border border-secondary/10 space-y-3">
                            <div className="flex items-center gap-2 text-secondary">
                                <Heart size={16} />
                                <span className="text-xs font-bold uppercase tracking-wider">Smart Search</span>
                            </div>
                            <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                                Save properties to get personalized alerts and priority access to <span className="text-secondary font-bold">exclusive</span> deals.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            <div className="p-6 border-t border-border/50">
                <div className="p-4 bg-muted/20 rounded-xl flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                        {user?.first_name?.charAt(0) || 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-foreground truncate">{user?.first_name} {user?.last_name}</p>
                        <p className="text-[10px] text-muted-foreground truncate">{user?.email}</p>
                    </div>
                </div>
            </div>
        </aside>
    );
}
