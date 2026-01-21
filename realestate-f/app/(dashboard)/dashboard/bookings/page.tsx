'use client';

import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { BookingsList } from '@/components/dashboard/BookingsList';
import { Calendar, Filter } from 'lucide-react';

export default function BookingsPage() {
    const { user } = useAuth();
    const [statusFilter, setStatusFilter] = useState('all');

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p>Loading...</p>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 lg:p-10 h-full">
            <div className="max-w-7xl mx-auto space-y-10">
                {/* Page Header */}
                <div className="space-y-1">
                    <h1 className="text-4xl font-black text-foreground tracking-tight flex items-center gap-3">
                        <Calendar className="text-primary" size={36} />
                        My Bookings
                    </h1>
                    <p className="text-muted-foreground font-medium">Manage your property viewings and appointments</p>
                </div>

                {/* Combined Filter & Content Section */}
                <div className="space-y-8">
                    {/* Filters - Breadcrumb style */}
                    <div className="flex flex-wrap items-center gap-3 p-2 bg-card border border-border rounded-2xl w-fit shadow-sm">
                        <div className="px-4 py-2 text-muted-foreground">
                            <Filter size={18} />
                        </div>
                        {[
                            { id: 'all', label: 'All Bookings', color: 'primary' },
                            { id: 'confirmed', label: 'Confirmed', color: 'secondary' },
                            { id: 'pending', label: 'Pending Approval', color: 'accent' },
                        ].map((filter) => (
                            <button
                                key={filter.id}
                                className={`px-6 py-2.5 rounded-xl font-bold transition-all text-sm ${statusFilter === filter.id
                                    ? `bg-${filter.color} text-${filter.color}-foreground shadow-lg`
                                    : 'hover:bg-muted/50 text-muted-foreground hover:text-foreground'
                                    }`}
                                onClick={() => setStatusFilter(filter.id)}
                            >
                                {filter.label}
                            </button>
                        ))}
                    </div>

                    {/* Bookings List Implementation */}
                    <section className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm">
                        <div className="p-8 border-b border-border bg-muted/5">
                            <h2 className="text-2xl font-black text-foreground tracking-tight">Upcoming Appointments</h2>
                        </div>
                        <div className="p-2">
                            <BookingsList />
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
