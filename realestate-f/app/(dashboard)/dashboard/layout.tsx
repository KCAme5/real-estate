'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import DashboardSidebarClient from '@/components/dashboard/DashboardSidebarClient';
import { Menu, X, Home, Heart, MessageSquare } from 'lucide-react';

type DashboardErrorBoundaryState = {
    hasError: boolean;
    error: Error | null;
};

class DashboardErrorBoundary extends React.Component<{ children: React.ReactNode }, DashboardErrorBoundaryState> {
    state: DashboardErrorBoundaryState = {
        hasError: false,
        error: null,
    };

    static getDerivedStateFromError(error: Error): DashboardErrorBoundaryState {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, info: React.ErrorInfo) {
        console.error('DashboardErrorBoundary caught an error', { error, info });
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-background px-4">
                    <div className="max-w-md text-center space-y-4">
                        <h1 className="text-2xl font-semibold">Something went wrong in the dashboard</h1>
                        <p className="text-sm text-muted-foreground">
                            Try refreshing the page or navigating to a different section.
                        </p>
                        <button
                            onClick={() => this.setState({ hasError: false, error: null })}
                            className="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium text-white"
                        >
                            Try again
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const pathname = usePathname();

    const mobileQuickLinks = [
        { href: '/dashboard', label: 'Home', icon: Home },
        { href: '/dashboard/saved', label: 'Saved', icon: Heart },
        { href: '/dashboard/messages', label: 'Chat', icon: MessageSquare },
    ];

    return (
        <DashboardErrorBoundary>
            <div className="h-screen bg-background flex flex-col lg:flex-row overflow-hidden pb-20 lg:pb-0">
                {/* Desktop Sidebar */}
                <div className="hidden lg:flex shrink-0">
                    <DashboardSidebarClient />
                </div>

                {/* Mobile Bottom Dock - Floating & Glassy */}
                <div className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] w-[92%] max-w-sm">
                    <div className="bg-slate-950/80 backdrop-blur-2xl border border-slate-700/50 rounded-3xl p-2.5 flex items-center justify-between shadow-2xl shadow-black/50 overflow-hidden relative">
                        <div className="absolute -top-[100%] left-1/2 -translate-x-1/2 w-[80%] h-full bg-blue-500/10 blur-[40px] rounded-full pointer-events-none" />

                        {mobileQuickLinks.map((item) => {
                            const Icon = item.icon;
                            const active = pathname === item.href;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`flex flex-col items-center justify-center py-2 px-5 rounded-2xl transition-all duration-300 relative ${active ? 'text-blue-400 bg-blue-400/10' : 'text-slate-400'}`}
                                >
                                    <Icon size={22} strokeWidth={active ? 2.5 : 2} className={active ? 'scale-110' : 'active:scale-90'} />
                                    <span className={`text-[10px] font-black uppercase tracking-widest mt-1.5 ${active ? 'opacity-100' : 'opacity-60'}`}>{item.label}</span>
                                    {active && (
                                        <div className="absolute -bottom-1 w-1 h-1 bg-blue-400 rounded-full shadow-[0_0_8px_#60a5fa]" />
                                    )}
                                </Link>
                            )
                        })}

                        <button
                            onClick={() => setIsMobileMenuOpen(true)}
                            className={`flex flex-col items-center justify-center py-2 px-5 rounded-2xl transition-all duration-300 ${isMobileMenuOpen ? 'text-emerald-400 bg-emerald-400/10' : 'text-slate-400'}`}
                        >
                            <Menu size={22} strokeWidth={isMobileMenuOpen ? 2.5 : 2} />
                            <span className="text-[10px] font-black uppercase tracking-widest mt-1.5 opacity-60">Menu</span>
                        </button>
                    </div>
                </div>

                {/* Mobile Sidebar Overlay - Redesigned */}
                {isMobileMenuOpen && (
                    <div className="lg:hidden fixed inset-0 z-[70] flex justify-end">
                        <div
                            className="fixed inset-0 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-500"
                            onClick={() => setIsMobileMenuOpen(false)}
                        />
                        <div className="relative w-[300px] bg-slate-950 h-full shadow-[0_0_50px_rgba(0,0,0,0.5)] animate-in slide-in-from-right duration-500 border-l border-slate-800/50">
                            <div className="h-full flex flex-col">
                                <div className="p-8 pb-4 flex items-center justify-between">
                                    <div>
                                        <h2 className="text-xl font-black text-white tracking-tight">Navigation</h2>
                                        <div className="w-8 h-1 bg-blue-600 mt-1 rounded-full" />
                                    </div>
                                    <button
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className="p-3 bg-slate-900 border border-slate-800 text-slate-400 hover:text-white rounded-2xl active:scale-95 transition-all"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>
                                <div className="flex-1 overflow-y-auto px-2" onClick={() => setIsMobileMenuOpen(false)}>
                                    <DashboardSidebarClient />
                                </div>
                                <div className="p-8 pt-4">
                                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest text-center">KenyaPrime Properties v2.0</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <main className="flex-1 overflow-y-auto w-full relative">
                    {children}
                </main>
            </div>
        </DashboardErrorBoundary>
    );
}
