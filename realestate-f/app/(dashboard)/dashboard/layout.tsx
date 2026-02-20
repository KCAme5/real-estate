'use client';

import React, { useState } from 'react';
import DashboardSidebarClient from '@/components/dashboard/DashboardSidebarClient';
import { Menu, X } from 'lucide-react';

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

    return (
        <DashboardErrorBoundary>
            <div className="h-[calc(100vh-4rem)] lg:h-[calc(100vh-5rem)] bg-background flex flex-col lg:flex-row overflow-hidden">
            {/* Mobile Header / Toggle */}
            <div className="lg:hidden flex items-center justify-between p-4 bg-card border-b border-border">
                <span className="text-sm font-bold text-primary">Dashboard Menu</span>
                <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="p-2 bg-muted rounded-lg text-foreground"
                >
                    {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
            </div>

            {/* Main Sidebar (Desktop) */}
            <div className="hidden lg:flex">
                <DashboardSidebarClient />
            </div>

            {/* Mobile Sidebar Overlay */}
            {isMobileMenuOpen && (
                <div className="lg:hidden fixed inset-0 z-50 flex">
                    <div
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={() => setIsMobileMenuOpen(false)}
                    />
                    <div className="relative w-72 bg-card h-full shadow-2xl animate-in slide-in-from-left duration-300">
                        <div className="h-full flex flex-col">
                            <div className="p-6 border-b border-border flex items-center justify-between">
                                <span className="font-bold text-lg">Menu</span>
                                <button onClick={() => setIsMobileMenuOpen(false)}>
                                    <X size={20} />
                                </button>
                            </div>
                            <div className="flex-1 overflow-y-auto" onClick={() => setIsMobileMenuOpen(false)}>
                                <DashboardSidebarClient />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <main className="flex-1 overflow-y-auto">
                {children}
            </main>
        </div>
        </DashboardErrorBoundary>
    );
}
