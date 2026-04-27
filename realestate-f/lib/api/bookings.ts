// lib/api/bookings.ts
import { apiClient, normalizeResponse } from './client';

export interface Booking {
    id: number;
    property: number;
    property_title: string;
    property_location: string;
    agent: number;
    agent_name: string;
    client: number;
    client_name: string;
    client_email?: string;
    booking_date: string;
    booking_time: string;
    date: string;
    duration: number;
    status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
    client_notes?: string;
    agent_notes?: string;
    created_at: string;
}

export interface BookingCreatePayload {
    property: number;
    date: string;
    duration?: number;
    client_notes?: string;
    lead?: number;
}

export interface BookingUpdatePayload {
    status?: Booking['status'];
    agent_notes?: string;
}

export const bookingsAPI = {
  // Get user bookings
  getAll: async () => {
    const response = await apiClient.get('/bookings/');
    return normalizeResponse(response);
  },

    // Get booking by ID
    getById: async (id: number) => {
        return apiClient.get(`/bookings/${id}/`);
    },

    // Create a new booking
    create: async (data: BookingCreatePayload) => {
        return apiClient.post('/bookings/', data);
    },

    // Update booking
    update: async (id: number, data: BookingUpdatePayload) => {
        return apiClient.patch(`/bookings/${id}/`, data);
    }
};
