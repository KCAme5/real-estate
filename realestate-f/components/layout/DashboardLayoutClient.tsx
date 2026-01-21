"use client";

import React, { useState } from 'react';
import DashboardSidebar from '@/components/layout/DashboardSidebar';

export default function DashboardLayoutClient({ children }: { children: React.ReactNode }) {
    const [showMobileSidebar, setShowMobileSidebar] = useState(false);

    return (
        <div className="min-h-screen bg-base-100">
            <div className="container mx-auto px-4 py-6">
                {/* Mobile top bar */}
                <div className="md:hidden flex items-center justify-between mb-4">
                    <div className="text-lg font-bold">Dashboard</div>
                    <button
                        className="btn btn-ghost"
                        onClick={() => setShowMobileSidebar(!showMobileSidebar)}
                    >
                        Menu
                    </button>
                </div>

                <div className="flex">
                    {/* Mobile overlay sidebar */}
                    {showMobileSidebar && (
                        <div className="fixed inset-0 z-50 bg-black/40 md:hidden" onClick={() => setShowMobileSidebar(false)}>
                            <div className="w-64 bg-base-100 h-full p-4" onClick={(e) => e.stopPropagation()}>
                                <DashboardSidebar />
                            </div>
                        </div>
                    )}

                    <div className="flex flex-col md:flex-row gap-6 w-full">
                        <div className="hidden md:block">
                            <DashboardSidebar />
                        </div>
                        <main className="flex-1">
                            {children}
                        </main>
                    </div>
                </div>
            </div>
        </div>
    );
}
