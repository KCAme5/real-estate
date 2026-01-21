'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import {
    LayoutDashboard,
    Home,
    Users,
    BarChart3,
    DollarSign,
    Settings,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';

const navigation = [
    { name: 'Dashboard', href: '/dashboard/agent', icon: LayoutDashboard },
    { name: 'Properties', href: '/dashboard/agent/properties', icon: Home },
    { name: 'Leads', href: '/dashboard/agent/leads', icon: Users },
    { name: 'Analytics', href: '/dashboard/agent/analytics', icon: BarChart3 },
    { name: 'Commission', href: '/dashboard/agent/commission', icon: DollarSign },
    { name: 'Settings', href: '/dashboard/agent/settings', icon: Settings },
];

export default function AgentSidebar() {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const pathname = usePathname();
    const { user } = useAuth();

    // Get user initials
    const getInitials = () => {
        if (!user) return 'AG';
        const firstName = user.first_name || '';
        const lastName = user.last_name || '';
        if (firstName && lastName) {
            return `${firstName[0]}${lastName[0]}`.toUpperCase();
        }
        return user.username ? user.username.substring(0, 2).toUpperCase() : 'AG';
    };

    const getFullName = () => {
        if (!user) return 'Agent';
        if (user.first_name && user.last_name) {
            return `${user.first_name} ${user.last_name}`;
        }
        return user.username || 'Agent';
    };

    return (
        <div className={`bg-card border-r border-border transition-all duration-300 flex flex-col h-full ${isCollapsed ? 'w-20' : 'w-64'}`}>
            {/* Header */}
            <div className="p-6 border-b border-border">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary text-primary-foreground rounded-xl flex items-center justify-center shadow-md flex-shrink-0">
                        <span className="font-bold text-lg">KP</span>
                    </div>
                    {!isCollapsed && (
                        <div>
                            <div className="text-lg font-bold text-foreground">KenyaPrime</div>
                            <div className="text-xs text-muted-foreground -mt-1">Agent Portal</div>
                        </div>
                    )}
                </div>
            </div>

            {/* Navigation */}
            <nav className="p-4 space-y-2 flex-1 overflow-y-auto">
                {navigation.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${isActive
                                    ? 'bg-primary text-primary-foreground shadow-md'
                                    : 'text-foreground hover:bg-muted'
                                }`}
                        >
                            <Icon className="flex-shrink-0" size={20} />
                            {!isCollapsed && (
                                <span className="font-medium">{item.name}</span>
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* User Profile */}
            <div className="p-4 border-t border-border">
                <div className="flex items-center gap-3">
                    <div className="avatar">
                        <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                            <span className="font-bold text-sm">{getInitials()}</span>
                        </div>
                    </div>
                    {!isCollapsed && (
                        <div className="flex-1 min-w-0">
                            <div className="font-medium text-foreground truncate">{getFullName()}</div>
                            <div className="text-xs text-muted-foreground truncate">Agent</div>
                        </div>
                    )}
                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="p-1 hover:bg-muted rounded-lg transition-colors"
                        aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                    >
                        {isCollapsed ? <ChevronRight size={20} className="text-foreground" /> : <ChevronLeft size={20} className="text-foreground" />}
                    </button>
                </div>
            </div>
        </div>
    );
}