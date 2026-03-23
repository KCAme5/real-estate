'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { bookingsAPI } from '@/lib/api/bookings';
import { Booking } from '@/lib/api/bookings';
import { Calendar, Filter, Loader2, AlertCircle, Clock, MapPin, User, Home } from 'lucide-react';
import { useToast } from '@/components/ui/toast';

export default function BookingsPage() {
    const { user } = useAuth();
    const { success, error: showError } = useToast();
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
    const [statusFilter, setStatusFilter] = useState('all');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [updatingId, setUpdatingId] = useState<number | null>(null);

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                setLoading(true);
                setError(null);
                const data = await bookingsAPI.getAll();
                const bookingsArray = data.results || data || [];
                setBookings(bookingsArray);
            } catch (err) {
                console.error('Failed to fetch bookings:', err);
                setError('Failed to load bookings');
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchBookings();
        }
    }, [user]);

    useEffect(() => {
        if (statusFilter === 'all') {
            setFilteredBookings(bookings);
        } else {
            setFilteredBookings(bookings.filter(b => b.status?.toUpperCase() === statusFilter.toUpperCase()));
        }
    }, [bookings, statusFilter]);

    const handleStatusUpdate = async (bookingId: number, newStatus: string) => {
        setUpdatingId(bookingId);
        try {
            await bookingsAPI.update(bookingId, { status: newStatus });
            setBookings(prev => prev.map(b =>
                b.id === bookingId ? { ...b, status: newStatus as any } : b
            ));
            success('Booking updated', `Status changed to ${newStatus}`);
        } catch (err) {
            showError('Update failed', 'Could not update booking status');
        } finally {
            setUpdatingId(null);
        }
    };

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
                            { id: 'all', label: 'All Bookings' },
                            { id: 'CONFIRMED', label: 'Confirmed' },
                            { id: 'PENDING', label: 'Pending Approval' },
                        ].map((filter) => (
                            <button
                                key={filter.id}
                                className={`px-6 py-2.5 rounded-xl font-bold transition-all text-sm ${statusFilter === filter.id
                                    ? 'bg-primary text-primary-foreground shadow-lg'
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
                        <div className="p-4">
                            {loading ? (
                                <div className="flex items-center justify-center py-12">
                                    <Loader2 className="animate-spin text-primary mr-2" />
                                    <span className="text-muted-foreground">Loading bookings...</span>
                                </div>
                            ) : error ? (
                                <div className="flex items-center gap-3 p-6 text-red-600 bg-red-50 rounded-2xl m-4">
                                    <AlertCircle size={20} />
                                    <span>{error}</span>
                                </div>
                            ) : filteredBookings.length === 0 ? (
                                <div className="text-center py-12">
                                    <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                                    <p className="text-muted-foreground font-medium">No bookings yet</p>
                                    <p className="text-sm text-muted-foreground mt-1">Schedule a viewing on a property to create a booking</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {filteredBookings.map((booking) => (
                                        <div key={booking.id} className="p-6 bg-slate-900 border border-slate-800 rounded-xl hover:border-emerald-500/30 transition-all">
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-3">
                                                        <Home size={20} className="text-emerald-500" />
                                                        <h3 className="text-lg font-black text-white">{booking.property_title || 'Property'}</h3>
                                                    </div>
                                                    <p className="text-sm text-slate-400">
                                                        <MapPin size={14} className="inline mr-1" />
                                                        {booking.property_location || 'Location TBD'}
                                                    </p>
                                                </div>
                                                <div className={`px-4 py-2 rounded-lg font-bold text-sm ${booking.status === 'CONFIRMED'
                                                        ? 'bg-emerald-500/10 text-emerald-400'
                                                        : booking.status === 'PENDING'
                                                            ? 'bg-amber-500/10 text-amber-400'
                                                            : 'bg-red-500/10 text-red-400'
                                                    }`}>
                                                    {booking.status || 'PENDING'}
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 p-4 bg-slate-800/50 rounded-lg">
                                                <div>
                                                    <p className="text-xs text-slate-500 font-bold mb-1">DATE</p>
                                                    <p className="font-black text-white text-sm">{new Date(booking.booking_date).toLocaleDateString()}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-slate-500 font-bold mb-1">TIME</p>
                                                    <p className="font-black text-white text-sm">{booking.booking_time || 'TBD'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-slate-500 font-bold mb-1">AGENT</p>
                                                    <p className="font-black text-white text-sm">{booking.agent_name || 'Assigned Soon'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-slate-500 font-bold mb-1">DURATION</p>
                                                    <p className="font-black text-white text-sm">{booking.duration || 30} min</p>
                                                </div>
                                            </div>

                                            {booking.client_notes && (
                                                <div className="mb-4 p-3 bg-slate-800/30 rounded-lg border-l-2 border-slate-600">
                                                    <p className="text-xs text-slate-500 font-bold mb-1">NOTES</p>
                                                    <p className="text-sm text-slate-300">{booking.client_notes}</p>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
                                </div >
                            ) : error ? (
    <div className="flex items-center gap-3 p-6 text-red-600 bg-red-50 rounded-2xl m-4">
        <AlertCircle size={20} />
        <span>{error}</span>
    </div>
) : filteredBookings.length === 0 ? (
    <div className="text-center py-12">
        <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
        <p className="text-muted-foreground font-medium">No bookings yet</p>
        <p className="text-sm text-muted-foreground mt-1">Schedule a viewing on a property to create a booking</p>
    </div>
) : (
    <div className="space-y-3">
        {filteredBookings.map((booking) => (
            <div key={booking.id} className="p-4 bg-base-50 border border-base-200 rounded-lg hover:bg-base-100 transition-colors">
                <div className="flex items-start justify-between mb-3">
                    <div>
                        <h4 className="font-semibold text-foreground">{booking.property_title || 'Property'}</h4>
                        <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                            Agent: {booking.agent_name || 'Assigned Agent'}
                        </p>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 ${booking.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' :
                        booking.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                        }`}>
                        {booking.status || 'PENDING'}
                    </div>
                </div>
                <div className="flex gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                        <Calendar size={14} />
                        {new Date(booking.booking_date).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-1">
                        {booking.booking_time || 'Time TBD'}
                    </div>
                </div>
            </div>
        ))}
    </div>
)}
                        </div >
                    </section >
                </div >
            </div >
        </div >
    );
}
