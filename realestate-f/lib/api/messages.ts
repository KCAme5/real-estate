// lib/api/messages.ts
import { apiClient } from './client';

export const messagesAPI = {
    // Get all conversations
    getConversations: async () => {
        return apiClient.get('/leads/conversations/');
    },

    // Get messages for a specific conversation
    getMessages: async (conversationId: string | number) => {
        return apiClient.get(`/leads/conversations/${conversationId}/messages/`);
    },

    // Send a message
    sendMessage: async (conversationId: string | number, text: string) => {
        return apiClient.post(`/leads/conversations/${conversationId}/messages/`, { text });
    },

    // Delete a conversation (and all its messages)
    deleteConversation: async (conversationId: string | number) => {
        return apiClient.delete(`/leads/conversations/${conversationId}/delete/`);
    },

    // Delete a specific message
    deleteMessage: async (conversationId: string | number, messageId: string | number) => {
        return apiClient.delete(`/leads/conversations/${conversationId}/messages/${messageId}/delete/`);
    }
};
