'use client';

import Link from 'next/link';
import React from 'react';

export default function DashboardSidebar({ compact = false }: { compact?: boolean }) {
    return (
        <aside className={`w-72 md:w-64 bg-base-100 border-r border-base-300 p-4`}>
            <div className="mb-6">
                <div className="text-lg font-bold">Dashboard</div>
                <div className="text-sm text-base-content/70">Agent tools</div>
            </div>

            <nav className="space-y-1">
                <Link href="/dashboard" className="block px-3 py-2 rounded-md hover:bg-base-200">Overview</Link>
                <Link href="/dashboard/agent" className="block px-3 py-2 rounded-md hover:bg-base-200">My Properties</Link>
                <Link href="/dashboard/bookings" className="block px-3 py-2 rounded-md hover:bg-base-200">Bookings</Link>
                <Link href="/dashboard/leads" className="block px-3 py-2 rounded-md hover:bg-base-200">Leads</Link>
                <Link href="/dashboard/analytics" className="block px-3 py-2 rounded-md hover:bg-base-200">Analytics</Link>
                <Link href="/profile" className="block px-3 py-2 rounded-md hover:bg-base-200">Profile</Link>
                <Link href="/settings" className="block px-3 py-2 rounded-md hover:bg-base-200">Settings</Link>
            </nav>

            <div className="mt-6 text-sm text-base-content/70">
                <div className="mb-1">Pro Tip</div>
                <div>Keep your listings updated and add good photos — they increase inquiries.</div>
            </div>
        </aside>
    );
}
