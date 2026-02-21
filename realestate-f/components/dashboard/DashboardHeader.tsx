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
        <header className="sticky top-0 z-40 border-b border-slate-800/30 bg-slate-950/80 backdrop-blur-2xl shadow-2xl overflow-hidden relative">
            {/* Decorative background for the header */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20">
                <div className="absolute -top-1/2 left-1/4 w-1/2 h-full bg-blue-500/20 blur-[100px] rounded-full" />
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-8 py-4 sm:py-6 relative z-10">
                <div className="flex items-center justify-between">
                    {/* Logo Section */}
                    <Link href="/" className="group flex items-center gap-4">
                        <div className="w-11 h-11 bg-blue-600 text-white rounded-2xl flex items-center justify-center font-black text-2xl shadow-xl shadow-blue-900/40 ring-4 ring-blue-500/10 group-hover:scale-105 transition-all duration-500 group-hover:rotate-6">
                            K
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xl font-black text-white tracking-tighter leading-none group-hover:text-blue-400 transition-colors">
                                KenyaPrime
                            </span>
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">
                                Real Estate Hub
                            </span>
                        </div>
                    </Link>

                    {/* Right section - Notifications and User */}
                    <div className="flex items-center gap-2 sm:gap-6">
                        {/* Search Bar - Premium Look */}
                        <div className="hidden lg:flex items-center gap-3 px-6 py-3 bg-slate-900/50 rounded-2xl border border-slate-800/50 w-72 text-slate-400 focus-within:ring-2 focus-within:ring-blue-500/30 focus-within:bg-slate-900 focus-within:border-blue-500/50 transition-all shadow-inner group">
                            <Search size={16} className="group-focus-within:text-blue-400 transition-colors" />
                            <input
                                type="text"
                                placeholder="Search listings..."
                                className="bg-transparent border-none outline-none text-xs font-bold w-full placeholder:text-slate-600"
                            />
                        </div>

                        {/* Notifications */}
                        <div className="relative">
                            <button
                                className="p-3 bg-slate-900/50 border border-slate-800/50 hover:border-slate-700 rounded-2xl relative transition-all group"
                                onClick={() => setShowNotifications(!showNotifications)}
                            >
                                <Bell size={20} className="text-slate-400 group-hover:text-white transition-colors" />
                                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-blue-600 text-[10px] font-black text-white rounded-full flex items-center justify-center border-[3px] border-slate-950 shadow-lg animate-bounce">7</span>
                            </button>

                            {showNotifications && (
                                <div className="absolute right-0 mt-4 w-screen max-w-[380px] sm:w-[420px] bg-slate-950 rounded-3xl shadow-[0_0_80px_rgba(0,0,0,0.8)] border border-slate-800/50 overflow-hidden z-50 animate-in fade-in slide-in-from-top-4 duration-300">
                                    <div className="p-6 border-b border-slate-800/50 bg-slate-900/30 flex items-center justify-between">
                                        <h3 className="font-black text-white uppercase tracking-widest text-xs">Notifications</h3>
                                        <button className="text-[10px] font-black text-blue-400 hover:text-blue-300 uppercase tracking-widest transition-colors">Mark as read</button>
                                    </div>
                                    <div className="p-3 max-h-[450px] overflow-y-auto space-y-2 custom-scrollbar">
                                        {[
                                            { title: 'New message from Sarah', desc: 'Regarding the Riverside Apartment inquiry', time: '2 hours ago', icon: <MessageSquare size={16} />, color: 'blue' },
                                            { title: 'New property alert', desc: 'Matching your Westlands search', time: '5 hours ago', icon: <Search size={16} />, color: 'emerald' },
                                            { title: 'Booking confirmed', desc: 'Saturday viewing at 10:00 AM', time: '1 day ago', icon: <Bell size={16} />, color: 'amber' },
                                        ].map((n, i) => (
                                            <div key={i} className="p-4 hover:bg-slate-900/50 rounded-[1.5rem] cursor-pointer transition-all border border-transparent hover:border-slate-800/50 group flex gap-4">
                                                <div className={`shrink-0 w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800/50 flex items-center justify-center group-hover:scale-110 transition-transform`}>
                                                    <div className={n.color === 'blue' ? 'text-blue-400' : n.color === 'emerald' ? 'text-emerald-400' : 'text-amber-400'}>
                                                        {n.icon}
                                                    </div>
                                                </div>
                                                <div className="space-y-1 flex-1">
                                                    <p className="text-sm font-black text-white group-hover:text-blue-400 transition-colors leading-tight">{n.title}</p>
                                                    <p className="text-xs text-slate-500 font-semibold leading-relaxed">{n.desc}</p>
                                                    <p className="text-[9px] text-slate-700 font-black uppercase mt-2 tracking-widest">{n.time}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="p-6 bg-slate-900/50 border-t border-slate-800/50 text-center">
                                        <button className="text-[10px] font-black text-slate-400 hover:text-white transition-colors uppercase tracking-[0.2em] w-full">View all updates</button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* User Hub */}
                        <div className="relative">
                            <button
                                className="flex items-center gap-3 p-1.5 sm:pl-1.5 sm:pr-4 bg-slate-900/50 border border-slate-800/50 hover:border-slate-700 rounded-full transition-all group shadow-inner"
                                onClick={() => setShowUserMenu(!showUserMenu)}
                            >
                                <div className="w-10 h-10 bg-linear-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center text-white text-base font-black shadow-lg ring-4 ring-blue-500/10 group-hover:scale-110 transition-transform duration-500">
                                    {user?.first_name?.charAt(0) || 'U'}
                                </div>
                                <div className="hidden sm:flex flex-col text-left">
                                    <p className="text-xs font-black text-white leading-none tracking-tight">{user?.first_name} {user?.last_name?.charAt(0)}.</p>
                                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-1.5">{user?.user_type || 'User'}</p>
                                </div>
                            </button>

                            {showUserMenu && (
                                <div className="absolute right-0 mt-4 w-72 bg-slate-950 rounded-3xl shadow-[0_0_80px_rgba(0,0,0,0.8)] border border-slate-800/50 p-3 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
                                    <div className="px-5 py-6 bg-slate-900/30 border-b border-slate-800/50 mb-3 rounded-2xl">
                                        <p className="font-black text-sm text-white tracking-tight">{user?.first_name} {user?.last_name}</p>
                                        <p className="text-[10px] text-slate-500 font-bold truncate uppercase tracking-tighter mt-1">{user?.email}</p>
                                    </div>
                                    <div className="space-y-1">
                                        {[
                                            { label: 'Edit Profile', icon: User, href: '/profile' },
                                            { label: 'Account Settings', icon: Settings, href: '/dashboard/settings' },
                                        ].map((item, i) => (
                                            <Link
                                                key={i}
                                                href={item.href}
                                                className="flex items-center gap-4 px-4 py-3.5 text-xs font-black text-slate-400 hover:text-white hover:bg-slate-900/80 rounded-2xl transition-all uppercase tracking-widest"
                                                onClick={() => setShowUserMenu(false)}
                                            >
                                                <item.icon size={18} strokeWidth={2.5} />
                                                {item.label}
                                            </Link>
                                        ))}
                                    </div>
                                    <div className="h-px bg-slate-800/50 my-3 mx-2"></div>
                                    <button
                                        className="w-full flex items-center gap-4 px-4 py-3.5 text-xs font-black text-rose-500 hover:bg-rose-500/10 rounded-2xl transition-all uppercase tracking-[0.1em]"
                                        onClick={() => {
                                            setShowUserMenu(false);
                                            handleLogout();
                                        }}
                                    >
                                        <LogOut size={18} strokeWidth={2.5} />
                                        End Session
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
