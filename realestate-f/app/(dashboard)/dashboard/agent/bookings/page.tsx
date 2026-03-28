'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { bookingsAPI, Booking } from '@/lib/api/bookings';
import { useToast } from '@/components/ui/toast';
import Breadcrumb from '@/components/dashboard/Breadcrumb';
import { Calendar, Clock, MapPin, User, Home, Loader2 } from 'lucide-react';

const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300',
    confirmed: 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300',
    cancelled: 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300',
    completed: 'bg-slate-100 dark:bg-slate-900/20 text-slate-800 dark:text-slate-300',
};

export default function BookingsPage() {
    const { user } = useAuth();
    const { success, error: showError } = useToast();
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [confirmingId, setConfirmingId] = useState<number | null>(null);

    const fetchBookings = async () => {
        try {
            const data = await bookingsAPI.getAll();
            const bookingsArray = data.results || data || [];
            setBookings(bookingsArray);
        } catch (error) {
            console.error('Failed to fetch bookings:', error);
            showError('Failed to load', 'Could not fetch bookings');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user?.user_type === 'agent') {
            fetchBookings();
        }
    }, [user]);

    const handleConfirmBooking = async (bookingId: number) => {
        setConfirmingId(bookingId);
        try {
            await bookingsAPI.update(bookingId, { status: 'confirmed' });
            setBookings(prev => prev.map(b =>
                b.id === bookingId ? { ...b, status: 'confirmed' } : b
            ));
            success('Booking Confirmed', 'Viewing appointment confirmed');
        } catch (error) {
            console.error('Failed to confirm booking:', error);
            showError('Confirmation Failed', 'Could not confirm booking');
        } finally {
            setConfirmingId(null);
        }
    };

    const handleCancelBooking = async (bookingId: number) => {
        setConfirmingId(bookingId);
        try {
            await bookingsAPI.update(bookingId, { status: 'cancelled' });
            setBookings(prev => prev.map(b =>
                b.id === bookingId ? { ...b, status: 'cancelled' } : b
            ));
            success('Booking Cancelled', 'Viewing appointment cancelled');
        } catch (error) {
            console.error('Failed to cancel booking:', error);
            showError('Cancellation Failed', 'Could not cancel booking');
        } finally {
            setConfirmingId(null);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background p-4 md:p-8">
            <div className="max-w-7xl mx-auto space-y-6">
                <Breadcrumb />

                <div>
                    <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                        <Calendar className="text-primary" size={32} />
                        Bookings & Appointments
                    </h1>
                    <p className="text-muted-foreground mt-1">Manage property viewings and appointments</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-card border border-border rounded-xl p-4">
                        <p className="text-sm text-muted-foreground font-medium">Total Bookings</p>
                        <p className="text-2xl font-bold text-foreground mt-1">{bookings.length}</p>
                    </div>
                    <div className="bg-card border border-border rounded-xl p-4">
                        <p className="text-sm text-muted-foreground font-medium">Confirmed</p>
                        <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
                            {bookings.filter(b => b.status === 'confirmed').length}
                        </p>
                    </div>
                    <div className="bg-card border border-border rounded-xl p-4">
                        <p className="text-sm text-muted-foreground font-medium">Pending</p>
                        <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400 mt-1">
                            {bookings.filter(b => b.status === 'pending').length}
                        </p>
                    </div>
                </div>

                {/* Bookings List */}
                <div className="space-y-4">
                    {bookings.length === 0 ? (
                        <div className="bg-card border border-border rounded-2xl p-12 text-center">
                            <Calendar className="mx-auto text-muted-foreground mb-4" size={48} />
                            <p className="text-muted-foreground font-medium">No bookings yet</p>
                        </div>
                    ) : (
                        bookings.map((booking) => (
                            <div key={booking.id} className="bg-card border border-border rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                    <div className="flex-1 space-y-3">
                                        <div className="flex items-start gap-3">
                                            <Home className="text-primary mt-1" size={20} />
                                            <div>
                                                <h3 className="text-lg font-bold text-foreground">{booking.property_title}</h3>
                                                <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                                                    <MapPin size={14} />
                                                    {booking.property_location}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            <div className="flex items-center gap-2 text-sm">
                                                <User size={16} className="text-muted-foreground" />
                                                <div>
                                                    <p className="text-foreground font-medium">{booking.client_name}</p>
                                                    <p className="text-xs text-muted-foreground">{booking.client_email}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm">
                                                <Calendar size={16} className="text-muted-foreground" />
                                                <span className="text-foreground">
                                                    {new Date(booking.booking_date).toLocaleDateString('en-US', {
                                                        weekday: 'short',
                                                        year: 'numeric',
                                                        month: 'short',
                                                        day: 'numeric'
                                                    })}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm">
                                                <Clock size={16} className="text-muted-foreground" />
                                                <span className="text-foreground">{booking.booking_time} ({booking.duration}min)</span>
                                            </div>
                                        </div>

                                        {booking.client_notes && (
                                            <div className="p-3 bg-muted rounded-lg border-l-2 border-primary">
                                                <p className="text-xs text-muted-foreground font-bold mb-1">CLIENT NOTES</p>
                                                <p className="text-sm text-foreground">{booking.client_notes}</p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex flex-col items-end gap-3">
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${statusColors[booking.status]}`}>
                                            <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                                            {booking.status.toUpperCase()}
                                        </span>
                                        {booking.status === 'pending' && (
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleConfirmBooking(booking.id)}
                                                    disabled={confirmingId === booking.id}
                                                    className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-sm transition-colors disabled:opacity-50"
                                                >
                                                    {confirmingId === booking.id && <Loader2 size={14} className="animate-spin" />}
                                                    Confirm
                                                </button>
                                                <button
                                                    onClick={() => handleCancelBooking(booking.id)}
                                                    disabled={confirmingId === booking.id}
                                                    className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg font-bold text-sm transition-colors disabled:opacity-50"
                                                >
                                                    Decline
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
