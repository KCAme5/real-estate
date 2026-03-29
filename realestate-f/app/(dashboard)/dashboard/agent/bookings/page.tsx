'use client';

import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { bookingsAPI, Booking } from '@/lib/api/bookings';
import { useToast } from '@/components/ui/toast';
import Breadcrumb from '@/components/dashboard/Breadcrumb';
import {
    Calendar,
    Clock,
    Filter,
    Home,
    Loader2,
    MapPin,
    RefreshCw,
    Search,
    User,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300',
    confirmed: 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300',
    cancelled: 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300',
    completed: 'bg-slate-100 dark:bg-slate-900/20 text-slate-800 dark:text-slate-300',
};

const statusPills: Array<{ id: 'all' | Booking['status']; label: string }> = [
    { id: 'all', label: 'All' },
    { id: 'pending', label: 'Pending' },
    { id: 'confirmed', label: 'Confirmed' },
    { id: 'cancelled', label: 'Cancelled' },
    { id: 'completed', label: 'Completed' },
];

function safeText(value: unknown) {
    return typeof value === 'string' ? value : '';
}

function toLocalDateLabel(dateString?: string) {
    if (!dateString) return 'Date TBD';
    const d = new Date(dateString);
    if (Number.isNaN(d.getTime())) return 'Date TBD';
    return d.toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
}

function toDateTime(dateString?: string, timeString?: string) {
    if (!dateString) return null;
    const t = safeText(timeString).trim();
    const iso = t ? `${dateString}T${t}` : dateString;
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return null;
    return d;
}

export default function BookingsPage() {
    const { user } = useAuth();
    const router = useRouter();
    const { success, error: showError } = useToast();
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [confirmingId, setConfirmingId] = useState<number | null>(null);
    const [statusFilter, setStatusFilter] = useState<(typeof statusPills)[number]['id']>('all');
    const [query, setQuery] = useState('');

    const fetchBookings = async () => {
        try {
            const data = await bookingsAPI.getAll();
            const bookingsArray = data.results || data || [];
            setBookings(bookingsArray);
        } catch (error) {
            console.error('Failed to fetch bookings:', error);
            showError('Failed to load', 'Could not fetch bookings');
        }
    };

    useEffect(() => {
        if (!user) return;
        if (user.user_type !== 'agent') {
            router.replace('/dashboard/bookings');
            return;
        }

        (async () => {
            try {
                setLoading(true);
                await fetchBookings();
            } finally {
                setLoading(false);
            }
        })();
    }, [user, router]);

    const handleRefresh = async () => {
        try {
            setRefreshing(true);
            await fetchBookings();
        } finally {
            setRefreshing(false);
        }
    };

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
            <div className="min-h-screen bg-background p-4 md:p-8">
                <div className="max-w-7xl mx-auto space-y-6">
                    <div className="h-6 w-40 rounded-lg bg-muted animate-pulse" />
                    <div className="h-10 w-80 rounded-2xl bg-muted animate-pulse" />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="bg-card border border-border rounded-2xl p-4">
                                <div className="h-4 w-28 rounded bg-muted animate-pulse" />
                                <div className="mt-3 h-7 w-20 rounded bg-muted animate-pulse" />
                            </div>
                        ))}
                    </div>
                    <div className="bg-card border border-border rounded-3xl p-4">
                        <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
                            <div className="h-10 w-full md:w-80 rounded-2xl bg-muted animate-pulse" />
                            <div className="h-10 w-full md:w-56 rounded-2xl bg-muted animate-pulse" />
                        </div>
                    </div>
                    <div className="space-y-3">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="bg-card border border-border rounded-3xl p-6">
                                <div className="h-5 w-2/3 rounded bg-muted animate-pulse" />
                                <div className="mt-3 h-4 w-1/2 rounded bg-muted animate-pulse" />
                                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-3">
                                    <div className="h-10 rounded-2xl bg-muted animate-pulse" />
                                    <div className="h-10 rounded-2xl bg-muted animate-pulse" />
                                    <div className="h-10 rounded-2xl bg-muted animate-pulse" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    const filteredBookings = useMemo(() => {
        const q = query.trim().toLowerCase();
        return bookings
            .filter((b) => (statusFilter === 'all' ? true : b.status === statusFilter))
            .filter((b) => {
                if (!q) return true;
                const haystack = [
                    safeText(b.property_title),
                    safeText(b.property_location),
                    safeText(b.client_name),
                    safeText(b.client_email),
                    safeText(b.booking_date),
                    safeText(b.booking_time),
                ]
                    .join(' ')
                    .toLowerCase();
                return haystack.includes(q);
            })
            .slice()
            .sort((a, b) => {
                const da = toDateTime(a.booking_date, a.booking_time);
                const db = toDateTime(b.booking_date, b.booking_time);
                if (!da && !db) return b.id - a.id;
                if (!da) return 1;
                if (!db) return -1;
                return da.getTime() - db.getTime();
            });
    }, [bookings, query, statusFilter]);

    const total = bookings.length;
    const confirmedCount = bookings.filter((b) => b.status === 'confirmed').length;
    const pendingCount = bookings.filter((b) => b.status === 'pending').length;

    return (
        <div className="min-h-screen bg-background p-4 md:p-8">
            <div className="max-w-7xl mx-auto space-y-6">
                <Breadcrumb />

                <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                            <Calendar className="text-primary" size={32} />
                            Bookings & Appointments
                        </h1>
                        <p className="text-muted-foreground mt-1">Manage property viewings and appointments</p>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleRefresh}
                            disabled={refreshing}
                            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-border bg-card px-4 py-2.5 text-foreground font-semibold hover:bg-muted/40 transition-colors disabled:opacity-50"
                        >
                            {refreshing ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
                            Refresh
                        </button>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-card border border-border rounded-2xl p-4 relative overflow-hidden">
                        <div className="absolute -top-20 -right-20 w-48 h-48 rounded-full bg-primary/10 blur-3xl" />
                        <p className="text-sm text-muted-foreground font-medium">Total Bookings</p>
                        <p className="text-2xl font-bold text-foreground mt-1">{total}</p>
                    </div>
                    <div className="bg-card border border-border rounded-2xl p-4 relative overflow-hidden">
                        <div className="absolute -top-20 -right-20 w-48 h-48 rounded-full bg-green-500/10 blur-3xl" />
                        <p className="text-sm text-muted-foreground font-medium">Confirmed</p>
                        <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
                            {confirmedCount}
                        </p>
                    </div>
                    <div className="bg-card border border-border rounded-2xl p-4 relative overflow-hidden">
                        <div className="absolute -top-20 -right-20 w-48 h-48 rounded-full bg-yellow-500/10 blur-3xl" />
                        <p className="text-sm text-muted-foreground font-medium">Pending</p>
                        <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400 mt-1">
                            {pendingCount}
                        </p>
                    </div>
                </div>

                {/* Controls */}
                <div className="bg-card border border-border rounded-3xl p-4">
                    <div className="flex flex-col lg:flex-row gap-3 lg:items-center lg:justify-between">
                        <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
                            <div className="inline-flex items-center gap-2 text-muted-foreground">
                                <Filter size={16} />
                                <span className="font-semibold">Filter</span>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                {statusPills.map((pill) => (
                                    <button
                                        key={pill.id}
                                        onClick={() => setStatusFilter(pill.id)}
                                        className={`rounded-2xl px-4 py-2.5 font-semibold transition-colors border ${statusFilter === pill.id
                                            ? 'bg-primary text-primary-foreground border-primary'
                                            : 'bg-transparent text-foreground border-border hover:bg-muted/40'
                                            }`}
                                    >
                                        {pill.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="relative w-full lg:w-[420px]">
                            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                            <input
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Search by client, property, location, date…"
                                className="w-full rounded-2xl border border-border bg-background px-12 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40"
                            />
                        </div>
                    </div>
                </div>

                {/* Bookings List */}
                <div className="space-y-4">
                    {filteredBookings.length === 0 ? (
                        <div className="bg-card border border-border rounded-3xl p-12 text-center">
                            <div className="mx-auto w-14 h-14 rounded-3xl bg-muted/40 border border-border flex items-center justify-center mb-4">
                                <Calendar className="text-muted-foreground" size={26} />
                            </div>
                            <p className="text-foreground font-semibold">No bookings found</p>
                            <p className="text-muted-foreground mt-2">
                                Try changing the status filter or search query.
                            </p>
                        </div>
                    ) : (
                        filteredBookings.map((booking) => (
                            <div
                                key={booking.id}
                                className="bg-card border border-border rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden"
                            >
                                <div
                                    className={`absolute left-0 top-0 h-full w-1 ${booking.status === 'confirmed'
                                        ? 'bg-green-500/70'
                                        : booking.status === 'pending'
                                            ? 'bg-yellow-500/70'
                                            : booking.status === 'cancelled'
                                                ? 'bg-red-500/70'
                                                : 'bg-slate-500/60'
                                        }`}
                                />

                                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">
                                    <div className="flex-1 space-y-4">
                                        <div className="flex items-start gap-3">
                                            <div className="mt-0.5 w-10 h-10 rounded-2xl bg-primary/10 border border-primary/15 flex items-center justify-center shrink-0">
                                                <Home className="text-primary" size={18} />
                                            </div>
                                            <div className="min-w-0">
                                                <h3 className="text-foreground font-bold truncate">
                                                    {booking.property_title || 'Property Viewing'}
                                                </h3>
                                                <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                                                    <MapPin size={14} />
                                                    <span className="truncate">{booking.property_location || 'Location TBD'}</span>
                                                </p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                            <div className="rounded-2xl border border-border bg-background/40 p-4">
                                                <div className="flex items-center gap-2 text-muted-foreground">
                                                    <User size={16} />
                                                    <p className="font-semibold">Client</p>
                                                </div>
                                                <p className="mt-2 text-foreground font-semibold">{booking.client_name || '—'}</p>
                                                <p className="text-sm text-muted-foreground truncate">{booking.client_email || ''}</p>
                                            </div>

                                            <div className="rounded-2xl border border-border bg-background/40 p-4">
                                                <div className="flex items-center gap-2 text-muted-foreground">
                                                    <Calendar size={16} />
                                                    <p className="font-semibold">Date</p>
                                                </div>
                                                <p className="mt-2 text-foreground font-semibold">{toLocalDateLabel(booking.booking_date)}</p>
                                                <p className="text-sm text-muted-foreground">ID #{booking.id}</p>
                                            </div>

                                            <div className="rounded-2xl border border-border bg-background/40 p-4">
                                                <div className="flex items-center gap-2 text-muted-foreground">
                                                    <Clock size={16} />
                                                    <p className="font-semibold">Time</p>
                                                </div>
                                                <p className="mt-2 text-foreground font-semibold">
                                                    {booking.booking_time || 'TBD'}{booking.duration ? ` (${booking.duration}min)` : ''}
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    {(() => {
                                                        const dt = toDateTime(booking.booking_date, booking.booking_time);
                                                        if (!dt) return 'Schedule pending';
                                                        const diff = dt.getTime() - Date.now();
                                                        if (diff < 0) return 'In the past';
                                                        const hours = Math.floor(diff / (1000 * 60 * 60));
                                                        if (hours < 24) return 'Within 24 hours';
                                                        const days = Math.floor(hours / 24);
                                                        return `In ${days} day${days === 1 ? '' : 's'}`;
                                                    })()}
                                                </p>
                                            </div>
                                        </div>

                                        {booking.client_notes && (
                                            <div className="rounded-3xl border border-border bg-background/40 p-5">
                                                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">
                                                    Client Notes
                                                </p>
                                                <p className="text-foreground leading-relaxed">{booking.client_notes}</p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex flex-row lg:flex-col items-start lg:items-end justify-between lg:justify-start gap-3">
                                        <span
                                            className={`inline-flex items-center gap-2 px-3 py-2 rounded-full text-xs font-bold uppercase tracking-wider ${statusColors[booking.status]}`}
                                        >
                                            <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                                            {booking.status.toUpperCase()}
                                        </span>

                                        {booking.status === 'pending' && (
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleConfirmBooking(booking.id)}
                                                    disabled={confirmingId === booking.id}
                                                    className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-semibold transition-colors disabled:opacity-50"
                                                >
                                                    {confirmingId === booking.id && <Loader2 size={16} className="animate-spin" />}
                                                    Confirm
                                                </button>
                                                <button
                                                    onClick={() => handleCancelBooking(booking.id)}
                                                    disabled={confirmingId === booking.id}
                                                    className="px-4 py-2.5 bg-red-600/15 hover:bg-red-600/25 text-red-500 rounded-2xl font-semibold transition-colors disabled:opacity-50 border border-red-500/20"
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
