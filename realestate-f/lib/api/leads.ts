import { apiClient } from './client';

export interface Lead {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    source: 'website' | 'whatsapp' | 'referral' | 'walk_in' | 'phone';
    status: 'new' | 'contacted' | 'qualified' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    score: number;
    budget_min?: number;
    budget_max?: number;
    preferred_locations: string[];
    property_types: string[];
    property?: {
        id: number;
        title: string;
    };
    agent?: {
        id: number;
        username: string;
        get_full_name: string;
    };
    notes: string;
    created_at: string;
    updated_at: string;
    activities?: LeadActivity[];
    interactions?: LeadInteraction[];
    tasks?: Task[];
    agent_name?: string;
    property_title?: string;
    property_image?: string;
}

export interface LeadInteraction {
    id: number;
    lead: number;
    interaction_type: 'page_view' | 'property_click' | 'search' | 'inquiry' | 'download' | 'callback';
    property_id?: number;
    metadata?: any;
    timestamp: string;
}

export interface Task {
    id: number;
    lead: number;
    agent: number;
    title: string;
    description: string;
    due_date: string;
    is_completed: boolean;
    priority: 'low' | 'medium' | 'high';
    created_at: string;
}

export interface CRMStats {
    total_leads: number;
    new_leads: number;
    qualified_leads: number;
    closed_won: number;
    avg_score: number;
    status_distribution: { status: string; count: number }[];
    recent_tasks: Task[];
}

export interface LeadActivity {
    id: number;
    lead: number;
    activity_type: 'call' | 'email' | 'meeting' | 'property_viewing' | 'whatsapp' | 'note';
    description: string;
    scheduled_date?: string;
    completed_date?: string;
    agent: {
        id: number;
        username: string;
    };
    agent_name: string;
    created_at: string;
}

export interface Message {
    id: number;
    conversation: number;
    sender: number;
    sender_name: string;
    sender_type: string;
    content: string;
    is_read: boolean;
    created_at: string;
}

export interface Conversation {
    id: number;
    property?: number;
    property_title?: string;
    property_image?: string | null;
    client: number;
    agent: number;
    lead?: number;
    lead_details?: {
        id: number;
        score: number;
        priority: string;
        inquiries_count: number;
        is_hot: boolean;
    };
    last_message: Message | null;
    unread_count: number;
    other_user: {
        id: number;
        name: string;
        type: string;
        avatar?: string | null;
        is_verified?: boolean;
        is_online?: boolean;
    };
    updated_at: string;
}

export interface CreateLeadData {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    source?: string;
    budget_min?: number;
    budget_max?: number;
    preferred_locations?: string[];
    property_types?: string[];
    property?: number;
    notes?: string;
}

export interface CreateLeadActivityData {
    lead: number;
    activity_type: string;
    description: string;
    scheduled_date?: string;
}

export const leadsAPI = {
    // Leads
    getLeads: (params?: { status?: string; agent?: number }) =>
        apiClient.get('/leads/', { params }),

    getAll: (params?: { status?: string; agent?: number }) =>
        apiClient.get('/leads/', { params }),

    getLead: (id: number) =>
        apiClient.get(`/leads/${id}/`),

    createLead: (data: CreateLeadData) =>
        apiClient.post('/leads/', data),

    updateLead: (id: number, data: Partial<Lead>) =>
        apiClient.patch(`/leads/${id}/`, data),

    getAgentLeads: () =>
        apiClient.get('/leads/agent-leads/'),

    getCRMStats: () =>
        apiClient.get('/leads/stats/'),

    // Lead Interactions
    trackInteraction: (leadId: number, type: LeadInteraction['interaction_type'], propertyId?: number, metadata?: any) =>
        apiClient.post(`/leads/${leadId}/interactions/`, { lead: leadId, interaction_type: type, property: propertyId, metadata }),

    // Lead Activities
    getLeadActivities: (leadId: number) =>
        apiClient.get(`/leads/${leadId}/activities/`),

    createLeadActivity: (leadId: number, data: CreateLeadActivityData) =>
        apiClient.post(`/leads/${leadId}/activities/`, data),

    // Tasks
    getTasks: () =>
        apiClient.get('/leads/tasks/'),

    createTask: (data: Partial<Task>) =>
        apiClient.post('/leads/tasks/', data),

    updateTask: (id: number, data: Partial<Task>) =>
        apiClient.patch(`/leads/tasks/${id}/`, data),

    // Conversations
    getConversations: async () => {
        return apiClient.get('/leads/conversations/');
    },

    createConversation: async (propertyId: number | undefined, agentId: number) => {
        return apiClient.post('/leads/conversations/', {
            property: propertyId || null,
            agent: agentId
        });
    },

    createAgentConversation: async (agentId: number) => {
        return apiClient.post('/leads/conversations/', {
            agent: agentId,
            property: null
        });
    },

    getConversation: async (id: string | number) => {
        return apiClient.get(`/leads/conversations/${id}/`);
    },

    // Messages
    getConversationMessages: async (conversationId: string | number) => {
        return apiClient.get(`/leads/conversations/${conversationId}/messages/`);
    },

    getMessages: async (conversationId: string | number) => {
        return apiClient.get(`/leads/conversations/${conversationId}/messages/`);
    },

    sendMessage: async (conversationId: string | number, content: string) => {
        return apiClient.post(`/leads/conversations/${conversationId}/messages/`, { content });
    },
};
