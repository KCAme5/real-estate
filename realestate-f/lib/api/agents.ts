import { apiClient } from './client';
import { Agent } from '@/types/agent';

export const agentsAPI = {
    getAll: async () => {
        return apiClient.get('/agents/');
    },

    getBySlugOrId: async (identifier: string | number) => {
        return apiClient.get(`/agents/${identifier}/`);
    },

    getById: (id: number) => {
        return apiClient.get(`/agents/${id}`);
    },

    // Potential future methods
    // getReviews: (id: string) => apiClient.get(`/agents/${id}/reviews/`),

    // Management
    // Management
    getManagementAgents: async () => {
        return apiClient.get('/auth/management-agents/');
    },

    getManagementAgentById: async (id: string | number) => {
        return apiClient.get(`/auth/management-agents/${id}/`);
    },

    updateManagementAgent: async (id: number, data: any) => {
        return apiClient.patch(`/auth/management-agents/${id}/`, data);
    },

    deleteManagementAgent: async (id: number) => {
        return apiClient.delete(`/auth/management-agents/${id}/`);
    },

    verifyAgent: async (id: number) => {
        return apiClient.patch(`/auth/management-agents/${id}/`, { is_verified: true });
    }
};
