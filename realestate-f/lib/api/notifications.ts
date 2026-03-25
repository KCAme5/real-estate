// lib/api/notifications.ts
import { apiClient } from './client';

export interface Notification {
    id: number;
    user: number;
    title: string;
    message: string;
    notification_type: 'MESSAGE' | 'BOOKING' | 'PROPERTY' | 'SYSTEM';
    is_read: boolean;
    created_at: string;
}

export const notificationsAPI = {
    // Get all notifications
    getAll: async () => {
        return apiClient.get('/notifications/');
    },

    // Mark as read
    markRead: async (id: number) => {
        return apiClient.post(`/notifications/${id}/read/`, {});
    },

    // Mark all as read
    markAllRead: async () => {
        return apiClient.post('/notifications/mark-all-read/', {});
    }
};
