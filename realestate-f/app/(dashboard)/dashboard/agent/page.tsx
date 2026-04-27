'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowRight,
  Calendar,
  Clock,
  Home,
  MessageSquare,
  Plus,
  TrendingUp,
  Users,
} from 'lucide-react';

import { useAuth } from '@/hooks/useAuth';
import Breadcrumb from '@/components/dashboard/Breadcrumb';
import { AgentStatsCards } from '@/components/dashboard/Charts';
import { PropertyCardsContainer } from '@/components/dashboard/PropertyCard';

import { analyticsAPI } from '@/lib/api/analytics';
import { bookingsAPI, Booking } from '@/lib/api/bookings';
import { propertyAPI } from '@/lib/api/properties';
import { leadsAPI } from '@/lib/api/leads';

function pad2(n: number) {
  return String(n).padStart(2, '0');
}

function localYYYYMMDD(d: Date) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function toDateTime(dateString?: string, timeString?: string) {
  if (!dateString) return null;
  const t = (timeString || '').trim();
  const iso = t ? `${dateString}T${t}` : dateString;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d;
}

const bookingStatusColors: Record<string, string> = {
  pending: 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300',
  confirmed: 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300',
  cancelled: 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300',
  completed: 'bg-slate-100 dark:bg-slate-900/20 text-slate-800 dark:text-slate-300',
};

export default function AgentDashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [stats, setStats] = useState<any>(null);
  const [properties, setProperties] = useState<any[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const [conversations, setConversations] = useState<any[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  const formattedDate = useMemo(() => {
    const today = new Date();
    return today.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, propsData, leadsData, convsData, bookingsData] = await Promise.all([
          analyticsAPI.getDashboardStats(),
          propertyAPI.getAgentProperties(),
          leadsAPI.getAll(),
          leadsAPI.getConversations(),
          bookingsAPI.getAll(),
        ]);

    setStats(statsData);
    setProperties(Array.isArray(propsData) ? propsData : []);
    setLeads(Array.isArray(leadsData) ? leadsData : []);
    setConversations(Array.isArray(convsData) ? convsData : []);
    setBookings(Array.isArray(bookingsData) ? bookingsData : []);
      } catch (error) {
        console.error('Failed to fetch agent dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user && user.user_type === 'agent') {
      fetchData();
    }
  }, [user]);

  useEffect(() => {
    if (!authLoading && user && user.user_type !== 'agent') {
      router.push('/dashboard');
    }
  }, [user, authLoading, router]);

  const unreadMessages = useMemo(
    () => conversations.reduce((acc, c) => acc + (c?.unread_count || 0), 0),
    [conversations],
  );

  const todayKey = useMemo(() => localYYYYMMDD(new Date()), []);

  const todaysBookings = useMemo(() => {
    return (bookings || [])
      .filter((b) => (b.booking_date || b.date) === todayKey)
      .map((b) => ({ booking: b, dt: toDateTime(b.booking_date || b.date, b.booking_time) }))
      .sort((a, b) => (a.dt?.getTime() ?? 0) - (b.dt?.getTime() ?? 0))
      .slice(0, 6);
  }, [bookings, todayKey]);

  const upcomingBookings = useMemo(() => {
    return (bookings || [])
      .map((b) => ({ booking: b, dt: toDateTime(b.booking_date || b.date, b.booking_time) }))
      .filter((x) => x.dt && x.dt.getTime() >= Date.now())
      .sort((a, b) => a.dt!.getTime() - b.dt!.getTime())
      .slice(0, 6);
  }, [bookings]);

  const topProperties = useMemo(() => {
    return (properties || [])
      .slice()
      .sort((a, b) => (b?.views || 0) - (a?.views || 0))
      .slice(0, 5);
  }, [properties]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-8 lg:p-10">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="h-6 w-40 rounded-lg bg-muted animate-pulse" />
          <div className="rounded-3xl border border-border bg-card p-6">
            <div className="h-8 w-72 rounded-xl bg-muted animate-pulse" />
            <div className="mt-3 h-4 w-96 rounded-lg bg-muted animate-pulse" />
            <div className="mt-6 grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="rounded-2xl border border-border bg-background/40 p-5">
                  <div className="h-3 w-24 rounded bg-muted animate-pulse" />
                  <div className="mt-4 h-7 w-16 rounded bg-muted animate-pulse" />
                </div>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
            <div className="xl:col-span-8 rounded-3xl border border-border bg-card p-6">
              <div className="h-5 w-52 rounded bg-muted animate-pulse" />
              <div className="mt-6 space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-16 rounded-2xl bg-muted animate-pulse" />
                ))}
              </div>
            </div>
            <div className="xl:col-span-4 rounded-3xl border border-border bg-card p-6">
              <div className="h-5 w-40 rounded bg-muted animate-pulse" />
              <div className="mt-6 space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-14 rounded-2xl bg-muted animate-pulse" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user || user.user_type !== 'agent') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground font-medium">Redirecting to your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 lg:p-10">
      <div className="max-w-7xl mx-auto space-y-8">
        <Breadcrumb />

        <section className="rounded-3xl border border-border bg-card overflow-hidden relative">
          <div className="absolute -top-32 -right-24 w-96 h-96 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute -bottom-40 -left-24 w-96 h-96 rounded-full bg-emerald-500/10 blur-3xl" />

          <div className="relative p-6 md:p-8 space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
              <div className="space-y-1">
                <h1 className="text-2xl md:text-3xl font-semibold text-foreground tracking-tight">
                  Welcome back{user.first_name ? `, ${user.first_name}` : ''}
                </h1>
                <p className="text-sm text-muted-foreground font-medium">
                  {formattedDate} — here’s what’s happening with your listings.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Link
                  href="/dashboard/agent/properties/new"
                  className="inline-flex items-center gap-2 rounded-2xl bg-primary text-primary-foreground px-4 py-2.5 font-semibold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-colors"
                >
                  <Plus size={16} />
                  New Property
                </Link>
                <Link
                  href="/dashboard/agent/bookings"
                  className="inline-flex items-center gap-2 rounded-2xl border border-border bg-background/40 px-4 py-2.5 font-semibold text-foreground hover:bg-muted/40 transition-colors"
                >
                  <Calendar size={16} />
                  Bookings
                </Link>
                <Link
                  href="/dashboard/agent/leads"
                  className="inline-flex items-center gap-2 rounded-2xl border border-border bg-background/40 px-4 py-2.5 font-semibold text-foreground hover:bg-muted/40 transition-colors"
                >
                  <Users size={16} />
                  Leads
                </Link>
                <Link
                  href="/dashboard/agent/messages"
                  className="inline-flex items-center gap-2 rounded-2xl border border-border bg-background/40 px-4 py-2.5 font-semibold text-foreground hover:bg-muted/40 transition-colors"
                >
                  <MessageSquare size={16} />
                  Messages
                  {unreadMessages > 0 && (
                    <span className="ml-1 inline-flex items-center justify-center rounded-full bg-rose-500/15 text-rose-500 border border-rose-500/20 px-2 py-0.5 text-xs font-bold tabular-nums">
                      {unreadMessages}
                    </span>
                  )}
                </Link>
              </div>
            </div>

            <AgentStatsCards stats={stats} />
          </div>
        </section>

        <section className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          <div className="xl:col-span-8 space-y-6">
            <div className="rounded-3xl border border-border bg-card overflow-hidden">
              <div className="p-6 flex items-end justify-between gap-4 border-b border-border bg-muted/10">
                <div>
                  <h2 className="text-xl font-semibold text-foreground tracking-tight">Recent leads</h2>
                  <p className="text-sm text-muted-foreground">Newest inquiries assigned to you</p>
                </div>
                <Link
                  href="/dashboard/agent/leads"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:gap-3 transition-all"
                >
                  View all
                  <ArrowRight size={16} />
                </Link>
              </div>

              <div className="p-6">
                {leads.length === 0 ? (
                  <div className="rounded-3xl border border-border bg-background/40 p-10 text-center">
                    <div className="mx-auto w-12 h-12 rounded-2xl bg-primary/10 border border-primary/15 text-primary flex items-center justify-center mb-4">
                      <Users size={18} />
                    </div>
                    <p className="text-foreground font-semibold">No leads yet</p>
                    <p className="text-muted-foreground mt-2">When clients inquire, they’ll show up here.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {leads.slice(0, 6).map((lead: any) => (
                      <div
                        key={lead.id}
                        className="rounded-3xl border border-border bg-background/40 p-5 hover:bg-muted/20 transition-colors"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                          <div className="min-w-0">
                            <p className="font-semibold text-foreground truncate">
                              {lead.full_name || lead.name || 'Anonymous'}
                            </p>
                            <p className="text-sm text-muted-foreground mt-1">
                              {lead.preferred_location || lead.location || 'Location not specified'}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-bold text-muted-foreground">
                              <TrendingUp size={14} className="text-primary" />
                              {lead.property_type || lead.bedrooms || 'Inquiry'}
                            </span>
                            {(lead.budget || lead.budget_min || lead.budget_max) && (
                              <span className="inline-flex items-center rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-xs font-bold text-emerald-400">
                                {typeof lead.budget === 'number'
                                  ? `KES ${lead.budget.toLocaleString()}`
                                  : lead.budget || 'Budget set'}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-3xl border border-border bg-card overflow-hidden">
              <div className="p-6 flex items-end justify-between gap-4 border-b border-border bg-muted/10">
                <div>
                  <h2 className="text-xl font-semibold text-foreground tracking-tight">Active listings</h2>
                  <p className="text-sm text-muted-foreground">Managing {properties.length} total properties</p>
                </div>
                <Link
                  href="/dashboard/agent/properties"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:gap-3 transition-all"
                >
                  Manage
                  <ArrowRight size={16} />
                </Link>
              </div>
              <div className="p-6">
                <PropertyCardsContainer properties={properties} />
              </div>
            </div>
          </div>

          <div className="xl:col-span-4 space-y-6">
            <div className="rounded-3xl border border-border bg-card overflow-hidden">
              <div className="p-6 border-b border-border bg-muted/10 flex items-end justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-foreground tracking-tight">Today</h2>
                  <p className="text-sm text-muted-foreground">Appointments & quick glance</p>
                </div>
                <Link
                  href="/dashboard/agent/bookings"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:gap-3 transition-all"
                >
                  Schedule
                  <ArrowRight size={16} />
                </Link>
              </div>

              <div className="p-6 space-y-3">
                {todaysBookings.length === 0 ? (
                  <div className="rounded-3xl border border-border bg-background/40 p-8 text-center">
                    <div className="mx-auto w-12 h-12 rounded-2xl bg-primary/10 border border-primary/15 text-primary flex items-center justify-center mb-4">
                      <Calendar size={18} />
                    </div>
                    <p className="text-foreground font-semibold">No appointments today</p>
                    <p className="text-muted-foreground mt-2">Upcoming bookings will appear here.</p>
                  </div>
                ) : (
                  todaysBookings.map(({ booking, dt }) => {
                    const timeLabel = dt
                      ? dt.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
                      : 'TBD';
                    const status = (booking.status || 'pending').toLowerCase();
                    return (
                      <div
                        key={booking.id}
                        className="rounded-3xl border border-border bg-background/40 p-4 hover:bg-muted/20 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="font-semibold text-foreground truncate">
                              {booking.property_title || 'Property viewing'}
                            </p>
                            <p className="text-sm text-muted-foreground mt-1 truncate">
                              {booking.client_name || 'Client'} • {booking.property_location || 'Location TBD'}
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-2 shrink-0">
                            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-bold text-muted-foreground tabular-nums">
                              <Clock size={14} className="text-primary" />
                              {timeLabel}
                            </span>
                            <span
                              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${bookingStatusColors[status] || bookingStatusColors.pending}`}
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                              {status.toUpperCase()}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}

                {upcomingBookings.length > 0 && (
                  <div className="pt-2">
                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Next up</p>
                    <div className="space-y-2">
                      {upcomingBookings.slice(0, 3).map(({ booking, dt }) => (
                        <div
                          key={booking.id}
                          className="rounded-2xl border border-border bg-background/30 px-4 py-3 flex items-center justify-between gap-3"
                        >
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-foreground truncate">
                              {booking.property_title || 'Viewing'}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">{booking.client_name || 'Client'}</p>
                          </div>
                          <span className="text-xs font-bold text-muted-foreground tabular-nums">
                            {dt ? dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'TBD'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-3xl border border-border bg-card overflow-hidden">
              <div className="p-6 border-b border-border bg-muted/10">
                <h2 className="text-xl font-semibold text-foreground tracking-tight">Top listings</h2>
                <p className="text-sm text-muted-foreground">Most viewed properties</p>
              </div>

              <div className="p-6 space-y-3">
                {topProperties.length === 0 ? (
                  <div className="rounded-3xl border border-border bg-background/40 p-8 text-center">
                    <div className="mx-auto w-12 h-12 rounded-2xl bg-primary/10 border border-primary/15 text-primary flex items-center justify-center mb-4">
                      <Home size={18} />
                    </div>
                    <p className="text-foreground font-semibold">No properties yet</p>
                    <p className="text-muted-foreground mt-2">Create a listing to start tracking performance.</p>
                  </div>
                ) : (
                  topProperties.map((p) => (
                    <div
                      key={p.id}
                      className="rounded-3xl border border-border bg-background/40 p-4 hover:bg-muted/20 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-semibold text-foreground truncate">{p.title || 'Property'}</p>
                          <p className="text-sm text-muted-foreground mt-1 truncate">
                            {p.location_name || p.location?.name || 'Location TBD'}
                          </p>
                        </div>
                        <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-bold text-muted-foreground tabular-nums">
                          <TrendingUp size={14} className="text-primary" />
                          {p.views || 0}
                        </span>
                      </div>
                      <div className="mt-3 h-2 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full bg-primary/60 rounded-full"
                          style={{
                            width: `${Math.min(((p.views || 0) / Math.max((topProperties[0]?.views || 1), 1)) * 100, 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </section>

        <div className="pb-16" />
      </div>
    </div>
  );
}

