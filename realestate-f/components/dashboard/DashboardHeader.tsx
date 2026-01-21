'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { Bell, MessageSquare, User, LogOut, Settings, Search } from 'lucide-react';

export default function DashboardHeader() {
    const { user, logout } = useAuth();
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);

    const handleLogout = async () => {
        await logout();
    };

    return (
        <header className="sticky top-0 z-40 border-b border-border/50 bg-background/80 backdrop-blur-xl shadow-sm">
            <div className="max-w-7xl mx-auto px-6 py-4">
                <div className="flex items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="group flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary text-primary-foreground rounded-xl flex items-center justify-center font-black text-xl shadow-lg ring-4 ring-primary/10 group-hover:scale-110 transition-transform duration-300">
                            K
                        </div>
                        <span className="text-xl font-black text-foreground tracking-tight hidden sm:block group-hover:text-primary transition-colors">
                            KenyaPrime <span className="text-primary/50 font-medium">Properties</span>
                        </span>
                    </Link>

                    {/* Right section - Notifications and User */}
                    <div className="flex items-center gap-3 md:gap-6">
                        {/* Search Bar - Mockup */}
                        <div className="hidden lg:flex items-center gap-2 px-4 py-2 bg-muted/40 rounded-full border border-border/50 w-64 text-muted-foreground focus-within:ring-2 focus-within:ring-primary/20 focus-within:bg-background transition-all">
                            <Search size={16} />
                            <span className="text-xs font-semibold">Search anything...</span>
                        </div>

                        {/* Notifications */}
                        <div className="relative">
                            <button
                                className="p-2.5 hover:bg-muted/50 rounded-xl relative transition-colors group"
                                onClick={() => setShowNotifications(!showNotifications)}
                            >
                                <Bell size={20} className="text-muted-foreground group-hover:text-foreground transition-colors" />
                                <span className="absolute top-2 right-2 w-4 h-4 bg-primary text-[10px] font-black text-primary-foreground rounded-full flex items-center justify-center border-2 border-background">7</span>
                            </button>

                            {showNotifications && (
                                <div className="absolute right-0 mt-4 w-96 bg-card rounded-2xl shadow-2xl border border-border overflow-hidden z-50 animate-fade-in">
                                    <div className="p-5 border-b border-border bg-muted/30 flex items-center justify-between">
                                        <h3 className="font-bold text-foreground">Notifications</h3>
                                        <button className="text-xs font-bold text-primary hover:underline">Mark all as read</button>
                                    </div>
                                    <div className="p-2 max-h-[400px] overflow-y-auto space-y-1">
                                        {[
                                            { title: 'New message from Sarah', desc: 'Regarding the Riverside Apartment inquiry', time: '2 hours ago', icon: <MessageSquare size={14} />, color: 'primary' },
                                            { title: 'New property alert', desc: 'Matching your Westlands search', time: '5 hours ago', icon: <Settings size={14} />, color: 'secondary' },
                                            { title: 'Booking confirmed', desc: 'Saturday viewing at 10:00 AM', time: '1 day ago', icon: <Bell size={14} />, color: 'accent' },
                                        ].map((n, i) => (
                                            <div key={i} className="p-4 hover:bg-muted/30 rounded-xl cursor-not-allowed transition-colors border border-transparent hover:border-border/50 group">
                                                <div className="flex gap-4">
                                                    <div className={`shrink-0 w-10 h-10 rounded-full bg-linear-to-br from-primary/10 to-primary/5 text-primary flex items-center justify-center`}>
                                                        {n.icon}
                                                    </div>
                                                    <div className="space-y-1">
                                                        <p className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">{n.title}</p>
                                                        <p className="text-xs text-muted-foreground font-medium">{n.desc}</p>
                                                        <p className="text-[10px] text-muted-foreground/50 font-bold uppercase mt-1">{n.time}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="p-4 bg-muted/10 border-t border-border text-center">
                                        <button className="text-xs font-bold text-muted-foreground hover:text-foreground transition-colors uppercase tracking-widest">See all notifications</button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Messages (agent only) */}
                        {user?.user_type === 'agent' && (
                            <button className="p-2.5 hover:bg-muted/50 rounded-xl relative transition-colors group">
                                <MessageSquare size={20} className="text-muted-foreground group-hover:text-foreground transition-colors" />
                                <span className="absolute top-2 right-2 w-4 h-4 bg-secondary text-[10px] font-black text-secondary-foreground rounded-full flex items-center justify-center border-2 border-background">5</span>
                            </button>
                        )}

                        {/* User Menu */}
                        <div className="relative">
                            <button
                                className="flex items-center gap-3 p-1.5 hover:bg-muted/50 rounded-full transition-all border border-transparent hover:border-border/50 group"
                                onClick={() => setShowUserMenu(!showUserMenu)}
                            >
                                <div className="w-9 h-9 bg-linear-to-br from-primary to-primary/70 rounded-full flex items-center justify-center text-primary-foreground text-sm font-black shadow-lg ring-2 ring-primary/10 group-hover:scale-105 transition-transform">
                                    {user?.first_name?.charAt(0) || 'U'}
                                </div>
                                <div className="hidden md:block text-left mr-2">
                                    <p className="text-xs font-black text-foreground leading-none">{user?.first_name} {user?.last_name?.charAt(0)}.</p>
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">{user?.user_type || 'User'}</p>
                                </div>
                            </button>

                            {showUserMenu && (
                                <div className="absolute right-0 mt-4 w-64 bg-card rounded-2xl shadow-2xl border border-border p-2 z-50 animate-fade-in">
                                    <div className="px-4 py-4 border-b border-border mb-2">
                                        <p className="font-black text-sm text-foreground">{user?.first_name} {user?.last_name}</p>
                                        <p className="text-xs text-muted-foreground font-medium truncate">{user?.email}</p>
                                    </div>
                                    {[
                                        { label: 'My Profile', icon: User, href: '/profile' },
                                        { label: 'Settings', icon: Settings, href: '/dashboard/settings' },
                                    ].map((item, i) => (
                                        <Link
                                            key={i}
                                            href={item.href}
                                            className="flex items-center gap-3 px-3 py-2.5 text-sm font-bold text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-xl transition-all"
                                            onClick={() => setShowUserMenu(false)}
                                        >
                                            <item.icon size={18} />
                                            {item.label}
                                        </Link>
                                    ))}
                                    <div className="h-px bg-border my-2"></div>
                                    <button
                                        className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-black text-destructive hover:bg-destructive/10 rounded-xl transition-all"
                                        onClick={() => {
                                            setShowUserMenu(false);
                                            handleLogout();
                                        }}
                                    >
                                        <LogOut size={18} />
                                        Sign Out Account
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}
