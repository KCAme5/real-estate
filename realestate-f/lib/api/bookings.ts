// lib/api/bookings.ts
import { apiClient } from './client';

export interface Booking {
    id: number;
    property: number;
    property_title: string;
    property_location: string;
    agent: number;
    agent_name: string;
    client: number;
    client_name: string;
    booking_date: string;
    booking_time: string;
    status: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
    notes?: string;
    created_at: string;
}

export const bookingsAPI = {
    // Get user bookings
    getAll: async () => {
        return apiClient.get('/bookings/');
    },

    // Get booking by ID
    getById: async (id: number) => {
        return apiClient.get(`/bookings/${id}/`);
    },

    // Create a new booking
    create: async (data: any) => {
        return apiClient.post('/bookings/', data);
    },

    // Update booking
    update: async (id: number, data: any) => {
        return apiClient.patch(`/bookings/${id}/`, data);
    }
};
