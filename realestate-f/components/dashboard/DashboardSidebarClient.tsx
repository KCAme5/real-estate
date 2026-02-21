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
        <aside className="flex flex-col h-full bg-slate-950 border-r border-slate-800/50 shadow-2xl w-72">
            <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
                <nav className="space-y-1.5 pt-4">
                    <p className="px-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-6">Main Menu</p>
                    {navigation.map((item) => {
                        const Icon = item.icon;
                        const active = isActive(item.href);

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all duration-300 group ${active
                                    ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/20 font-bold'
                                    : 'text-slate-400 hover:bg-slate-900 hover:text-white font-semibold'
                                    }`}
                            >
                                <div className="flex items-center gap-3.5">
                                    <Icon size={20} className={active ? 'scale-110' : 'group-hover:scale-110 transition-transform'} strokeWidth={active ? 2.5 : 2} />
                                    <span className="tracking-tight">{item.label}</span>
                                </div>
                                {active && <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></div>}
                            </Link>
                        );
                    })}
                </nav>

                {/* Pro Tips Section */}
                <div className="pt-4">
                    {user?.user_type === 'agent' ? (
                        <div className="p-5 bg-emerald-500/5 rounded-3xl border border-emerald-500/10 space-y-3 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 blur-[40px] rounded-full -mr-12 -mt-12 group-hover:bg-emerald-500/20 transition-all" />
                            <div className="flex items-center gap-2 text-emerald-400">
                                <TrendingUp size={16} strokeWidth={2.5} />
                                <span className="text-[10px] font-black uppercase tracking-widest">Agent Pro Tip</span>
                            </div>
                            <p className="text-[11px] text-slate-400 leading-relaxed font-bold">
                                Keep your listings updated with quality photos to increase inquiries by up to <span className="text-emerald-400 font-black">45%</span>.
                            </p>
                        </div>
                    ) : (
                        <div className="p-5 bg-blue-500/5 rounded-3xl border border-blue-500/10 space-y-3 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 blur-[40px] rounded-full -mr-12 -mt-12 group-hover:bg-blue-500/20 transition-all" />
                            <div className="flex items-center gap-2 text-blue-400">
                                <Heart size={16} strokeWidth={2.5} />
                                <span className="text-[10px] font-black uppercase tracking-widest">Smart Search</span>
                            </div>
                            <p className="text-[11px] text-slate-400 leading-relaxed font-bold">
                                Save properties to get personalized alerts and priority access to <span className="text-blue-400 font-black">exclusive</span> deals.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            <div className="p-6 border-t border-slate-800/50 bg-slate-950/50 backdrop-blur-xl">
                <div className="p-4 bg-slate-900/50 rounded-2xl flex items-center gap-3 border border-slate-800/30">
                    <div className="w-10 h-10 rounded-xl bg-blue-600/10 text-blue-400 flex items-center justify-center font-black text-lg border border-blue-500/20 shadow-inner">
                        {user?.first_name?.charAt(0) || 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-black text-white truncate tracking-tight">{user?.first_name} {user?.last_name}</p>
                        <p className="text-[10px] text-slate-500 font-bold truncate uppercase tracking-tighter">{user?.email}</p>
                    </div>
                </div>
            </div>
        </aside>
    );
}
