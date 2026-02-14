'use client';

import React, { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Breadcrumb from '@/components/dashboard/Breadcrumb';
import { PropertyCardsContainer } from '@/components/dashboard/PropertyCard';
import PropertyCardSkeleton from '@/components/property/PropertyCardSkeleton';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { Search, Calendar, MessageSquare, Settings, Upload, ArrowRight, Sparkles, MapPin } from 'lucide-react';

import { propertyAPI } from '@/lib/api/properties';
import { bookingsAPI, Booking } from '@/lib/api/bookings';
import { notificationsAPI, Notification } from '@/lib/api/notifications';
import { Property } from '@/types/property';

export default function ClientDashboard() {
    const { user } = useAuth();
    const router = useRouter();
    const [properties, setProperties] = React.useState<Property[]>([]);
    const [bookings, setBookings] = React.useState<Booking[]>([]);
    const [notifications, setNotifications] = React.useState<Notification[]>([]);
    const [loading, setLoading] = React.useState(true);

    const today = new Date();
    const formattedDate = today.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [propsData, bookingsData, notifsData] = await Promise.all([
                    propertyAPI.getAll(),
                    bookingsAPI.getAll(),
                    notificationsAPI.getAll()
                ]);

                setProperties(propsData.results || propsData || []);
                setBookings(bookingsData.results || bookingsData || []);
                setNotifications(notifsData.results || notifsData || []);
            } catch (error) {
                console.error('Failed to fetch dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchData();
        }
    }, [user]);

    // Redirect agents to agent dashboard
    useEffect(() => {
        if (user && user.user_type === 'agent') {
            router.push('/dashboard/agent');
        } else if (user && user.user_type === 'management') {
            router.push('/dashboard/management');
        }
    }, [user, router]);

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 lg:p-12 bg-background/50">
            <div className="max-w-7xl mx-auto space-y-12">
                {/* Simple Header Section */}
                <div className="space-y-4">
                    <Breadcrumb />
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-1">
                            <h1 className="text-3xl md:text-4xl font-semibold text-foreground tracking-tight">
                                Welcome back, <span className="text-primary">{user.first_name}</span>
                            </h1>
                            <p className="text-sm text-muted-foreground font-medium flex items-center gap-2">
                                <Calendar size={14} className="text-primary" />
                                {formattedDate} — Discover elegant properties in Kenya
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => router.push('/properties')}
                                className="px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold shadow-md hover:bg-blue-700 transition-all flex items-center gap-2"
                            >
                                <Search size={16} />
                                Find My Dream Home
                            </button>
                        </div>
                    </div>
                </div>

                {/* Property Recommendations Section */}
                <section className="space-y-8">
                    <div className="flex items-end justify-between px-2">
                        <div className="space-y-2">
                            <div className="inline-flex items-center gap-2 bg-secondary/10 text-secondary px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-1">
                                <Sparkles size={12} />
                                Just For You
                            </div>
                            <h2 className="text-3xl font-black text-foreground tracking-tight">Recommended Listings</h2>
                            <p className="text-muted-foreground font-medium">Curated properties based on your history</p>
                        </div>
                        <Link
                            href="/properties"
                            className="group flex items-center gap-2 text-sm font-black text-primary hover:gap-4 transition-all"
                        >
                            View All Listings
                            <ArrowRight size={18} />
                        </Link>
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {[1, 2, 3].map(i => (
                                <PropertyCardSkeleton key={i} />
                            ))}
                        </div>
                    ) : (
                        <PropertyCardsContainer properties={properties.slice(0, 3)} />
                    )}
                </section>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    {/* Recent Activity */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="flex items-center justify-between px-2">
                            <h3 className="text-2xl font-black text-foreground tracking-tight">Recent Activity</h3>
                            <button
                                onClick={() => notificationsAPI.markAllRead()}
                                className="text-xs font-bold text-primary hover:underline hover:scale-105 transition-transform"
                            >
                                Mark all as read
                            </button>
                        </div>
                        <RecentActivity notifications={notifications} loading={loading} />
                    </div>

                    {/* Quick Actions */}
                    <div className="lg:col-span-1">
                        <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-[2.5rem] p-8 md:p-10 sticky top-24 shadow-sm">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary text-xl font-bold shadow-inner">
                                    ⚡
                                </div>
                                <h3 className="font-black text-2xl text-foreground tracking-tight">Quick Actions</h3>
                            </div>

                            <div className="space-y-4">
                                {[
                                    { icon: Search, label: 'Advanced Search', action: () => router.push('/properties'), bg: 'bg-primary/5', color: 'text-primary' },
                                    { icon: Calendar, label: 'Schedule Viewing', action: () => { }, bg: 'bg-secondary/5', color: 'text-secondary' },
                                    { icon: MessageSquare, label: 'Direct Messages', action: () => router.push('/dashboard/messages'), bg: 'bg-accent/5', color: 'text-accent' },
                                    { icon: Settings, label: 'Account Settings', action: () => router.push('/dashboard/settings'), bg: 'bg-muted', color: 'text-foreground' },
                                ].map((btn, i) => (
                                    <button
                                        key={i}
                                        onClick={btn.action}
                                        className={`w-full flex items-center justify-between p-5 rounded-2xl transition-all duration-300 group ${btn.bg} border border-transparent hover:border-border hover:shadow-lg`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`p-2 rounded-xl bg-background shadow-sm group-hover:scale-110 transition-transform ${btn.color}`}>
                                                <btn.icon size={20} />
                                            </div>
                                            <span className="font-bold text-foreground">{btn.label}</span>
                                        </div>
                                        <ArrowRight size={18} className="text-muted-foreground opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Upcoming Bookings */}
                <section className="space-y-8 pb-20">
                    <div className="flex items-end justify-between px-2">
                        <div className="space-y-2">
                            <h2 className="text-3xl font-black text-foreground tracking-tight">Upcoming Appointments</h2>
                            <p className="text-muted-foreground font-medium">Your scheduled viewings and meetings</p>
                        </div>
                        <Link
                            href="/dashboard/bookings"
                            className="group flex items-center gap-2 text-sm font-black text-primary hover:gap-4 transition-all"
                        >
                            View Full Schedule
                            <ArrowRight size={18} />
                        </Link>
                    </div>

                    <div className="bg-card border border-border/50 rounded-[2.5rem] overflow-hidden shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-muted/10 border-b border-border/50">
                                        <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Date & Time</th>
                                        <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Property</th>
                                        <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Agent</th>
                                        <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/30">
                                    {loading ? (
                                        [1, 2, 3].map((i) => (
                                            <tr key={i}>
                                                <td className="px-8 py-6"><Skeleton className="h-10 w-24 rounded-xl" /></td>
                                                <td className="px-8 py-6"><Skeleton className="h-10 w-48 rounded-xl" /></td>
                                                <td className="px-8 py-6"><Skeleton className="h-10 w-32 rounded-xl" /></td>
                                                <td className="px-8 py-6"><Skeleton className="h-10 w-24 rounded-xl" /></td>
                                            </tr>
                                        ))
                                    ) : (bookings.length > 0 ? (
                                        bookings.slice(0, 5).map((booking, i) => (
                                            <tr key={i} className="hover:bg-muted/10 transition-colors group">
                                                <td className="px-8 py-6">
                                                    <div className="flex flex-col">
                                                        <span className="font-black text-foreground">
                                                            {new Date(booking.booking_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                                        </span>
                                                        <span className="text-xs font-bold text-muted-foreground">{booking.booking_time}</span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="flex flex-col">
                                                        <span className="font-black text-foreground group-hover:text-primary transition-colors">{booking.property_title}</span>
                                                        <span className="text-xs font-bold text-muted-foreground flex items-center gap-1">
                                                            <MapPin size={10} />
                                                            {booking.property_location}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                                                            {booking.agent_name?.charAt(0) || 'A'}
                                                        </div>
                                                        <span className="text-sm font-bold text-muted-foreground">{booking.agent_name}</span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm ${booking.status === 'CONFIRMED'
                                                        ? 'bg-secondary/10 text-secondary'
                                                        : booking.status === 'PENDING'
                                                            ? 'bg-accent/10 text-accent'
                                                            : 'bg-destructive/10 text-destructive'
                                                        }`}>
                                                        <span className={`w-1.5 h-1.5 rounded-full ${booking.status === 'CONFIRMED' ? 'bg-secondary animate-pulse' : booking.status === 'PENDING' ? 'bg-accent animate-pulse' : 'bg-destructive'}`}></span>
                                                        {booking.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={4} className="px-8 py-12 text-center">
                                                <div className="flex flex-col items-center gap-2 grayscale opacity-50">
                                                    <Calendar size={48} className="text-muted-foreground" />
                                                    <p className="font-bold text-muted-foreground">No upcoming appointments scheduled</p>
                                                    <Link href="/properties" className="text-sm font-black text-primary hover:underline">Find a property to view</Link>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}

