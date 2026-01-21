'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { bookingsAPI, Booking } from '@/lib/api/bookings';
import Breadcrumb from '@/components/dashboard/Breadcrumb';
import { Calendar, Clock, MapPin, User, Home } from 'lucide-react';

const statusColors: Record<string, string> = {
    'PENDING': 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300',
    'CONFIRMED': 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300',
    'CANCELLED': 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300',
};

export default function BookingsPage() {
    const { user } = useAuth();
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                const data = await bookingsAPI.getAll();
                const bookingsArray = data.results || data || [];
                setBookings(bookingsArray);
            } catch (error) {
                console.error('Failed to fetch bookings:', error);
            } finally {
                setLoading(false);
            }
        };

        if (user?.user_type === 'agent') {
            fetchBookings();
        }
    }, [user]);

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
                            {bookings.filter(b => b.status === 'CONFIRMED').length}
                        </p>
                    </div>
                    <div className="bg-card border border-border rounded-xl p-4">
                        <p className="text-sm text-muted-foreground font-medium">Pending</p>
                        <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400 mt-1">
                            {bookings.filter(b => b.status === 'PENDING').length}
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
                                                <span className="text-foreground font-medium">{booking.client_name}</span>
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
                                                <span className="text-foreground">{booking.booking_time}</span>
                                            </div>
                                        </div>

                                        {booking.notes && (
                                            <p className="text-sm text-muted-foreground italic">{booking.notes}</p>
                                        )}
                                    </div>

                                    <div className="flex flex-col items-end gap-2">
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${statusColors[booking.status]}`}>
                                            <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                                            {booking.status}
                                        </span>
                                        {booking.status === 'PENDING' && (
                                            <button className="text-sm text-primary hover:underline font-semibold">
                                                Confirm
                                            </button>
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
