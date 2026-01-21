// lib/api/messages.ts
import { apiClient } from './client';

export const messagesAPI = {
    // Get all conversations
    getConversations: async () => {
        return apiClient.get('/notifications/conversations/');
    },

    // Get messages for a specific conversation
    getMessages: async (conversationId: string | number) => {
        return apiClient.get(`/notifications/conversations/${conversationId}/messages/`);
    },

    // Send a message
    sendMessage: async (conversationId: string | number, text: string) => {
        return apiClient.post(`/notifications/conversations/${conversationId}/messages/`, { text });
    }
};
