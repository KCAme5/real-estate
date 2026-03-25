'use client';

import React from 'react';
import { Calendar, Clock, User, CheckCircle, AlertCircle } from 'lucide-react';

interface BookingItemProps {
    id: number;
    date: string;
    time: string;
    propertyTitle: string;
    agentName: string;
    status: 'confirmed' | 'pending' | 'cancelled';
}

export function BookingItem({ id, date, time, propertyTitle, agentName, status }: BookingItemProps) {
    const statusConfig = {
        confirmed: { bg: 'bg-success/10', text: 'text-success', icon: CheckCircle, label: 'Confirmed' },
        pending: { bg: 'bg-warning/10', text: 'text-warning', icon: AlertCircle, label: 'Pending' },
        cancelled: { bg: 'bg-error/10', text: 'text-error', icon: AlertCircle, label: 'Cancelled' },
    };

    const config = statusConfig[status];
    const StatusIcon = config.icon;

    return (
        <div className="p-4 bg-base-50 border border-base-200 rounded-lg hover:bg-base-100 transition-colors">
            <div className="flex items-start justify-between mb-3">
                <div>
                    <h4 className="font-semibold">{propertyTitle}</h4>
                    <p className="text-sm text-base-content/70 flex items-center gap-2 mt-1">
                        <User size={14} />
                        Agent: {agentName}
                    </p>
                </div>
                <div className={`${config.bg} ${config.text} px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1`}>
                    <StatusIcon size={14} />
                    {config.label}
                </div>
            </div>
            <div className="flex gap-4 text-sm text-base-content/70">
                <div className="flex items-center gap-1">
                    <Calendar size={14} />
                    {date}
                </div>
                <div className="flex items-center gap-1">
                    <Clock size={14} />
                    {time}
                </div>
            </div>
        </div>
    );
}

interface BookingsListProps {
    bookings?: BookingItemProps[];
}

export function BookingsList({ bookings = [] }: BookingsListProps) {
    const defaultBookings: BookingItemProps[] = [
        {
            id: 1,
            date: 'Jan 10',
            time: '10:00 AM',
            propertyTitle: 'Riverside Apartment',
            agentName: 'Sarah K.',
            status: 'confirmed',
        },
        {
            id: 2,
            date: 'Jan 12',
            time: '2:30 PM',
            propertyTitle: 'Westlands Villa',
            agentName: 'Michael J.',
            status: 'pending',
        },
        {
            id: 3,
            date: 'Jan 15',
            time: '11:00 AM',
            propertyTitle: 'Kilimani Penthouse',
            agentName: 'Sarah K.',
            status: 'confirmed',
        },
    ];

    const displayBookings = bookings.length > 0 ? bookings : defaultBookings;

    return (
        <div className="space-y-3">
            {displayBookings.map((booking) => (
                <BookingItem key={booking.id} {...booking} />
            ))}
        </div>
    );
}
