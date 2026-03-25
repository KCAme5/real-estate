import { apiClient } from './client';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Lead {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    source: 'website' | 'contact_form' | 'book_viewing' | 'saved_property' | 'whatsapp' | 'referral' | 'walk_in' | 'phone';
    // FIX: added 'viewing' and 'contacted' which were in backend but missing here
    status: 'new' | 'contacted' | 'viewing' | 'qualified' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    score: number;
    budget_min?: number;
    budget_max?: number;
    preferred_locations: string[];
    property_types: string[];
    // FIX: property is a flat FK id on the list serializer, not a nested object
    property?: number;
    property_title?: string;
    property_image?: string;
    agent?: number;
    agent_name?: string;
    notes: string;
    last_contacted?: string;
    created_at: string;
    updated_at: string;
    // FIX: these only come on detail endpoint — optional here
    activities?: LeadActivity[];
    interactions?: LeadInteraction[];
    tasks?: Task[];
    status_logs?: LeadStatusLog[];
    // NEW: computed fields from LeadListSerializer
    full_name?: string;
    is_hot?: boolean;
    days_in_stage?: number;
    last_message?: string;
    conversation_id?: number;
}

export interface LeadStatusLog {
    id: number;
    lead: number;
    from_status: string;
    to_status: string;
    changed_by: number | null;
    changed_by_name: string;
    note: string;
    created_at: string;
}

export interface LeadInteraction {
    id: number;
    lead: number;
    interaction_type: 'page_view' | 'property_click' | 'search' | 'inquiry' | 'download' | 'callback';
    property?: number;
    metadata?: Record<string, unknown>;
    timestamp: string;
}

export interface LeadActivity {
    id: number;
    lead: number;
    activity_type: 'call' | 'email' | 'meeting' | 'property_viewing' | 'whatsapp' | 'note' | 'status_change';
    description: string;
    scheduled_date?: string;
    completed_date?: string;
    agent: number;
    agent_name: string;
    created_at: string;
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
    // NEW: computed field from TaskSerializer
    is_overdue?: boolean;
    agent_name?: string;
    created_at: string;
}

export interface CRMStats {
    total_leads: number;
    new_leads: number;
    contacted: number;
    viewing: number;
    qualified_leads: number;
    proposal: number;
    negotiation: number;
    closed_won: number;
    closed_lost: number;
    avg_score: number;
    hot_leads: number;
    overdue_tasks: number;
    status_distribution: { status: string; count: number }[];
    recent_tasks: Task[];
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
        status: string;         // FIX: added — backend now returns this
        inquiries_count: number;
        is_hot: boolean;
    } | null;
    last_message: Message | null;
    unread_count: number;
    other_user: {
        id: number;
        name: string;
        type: string;
        avatar?: string | null;
        is_online?: boolean;
        is_verified?: boolean;
    };
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

// ─── Request payload types ────────────────────────────────────────────────────

export interface CreateLeadData {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    source?: Lead['source'];
    priority?: Lead['priority'];
    budget_min?: number;
    budget_max?: number;
    preferred_locations?: string[];
    property_types?: string[];
    property?: number;
    agent?: number;
    notes?: string;
}

export interface UpdateLeadStatusData {
    status: Lead['status'];
    notes?: string;
}

export interface CreateLeadActivityData {
    activity_type: LeadActivity['activity_type'];
    description: string;
    scheduled_date?: string;
    completed_date?: string;
}

export interface CreateTaskData {
    lead: number;
    title: string;
    description?: string;
    due_date: string;
    priority?: Task['priority'];
}

// ─── API ──────────────────────────────────────────────────────────────────────

export const leadsAPI = {

    // ── Leads ────────────────────────────────────────────────────────────────

    getAll: (params?: {
        status?: Lead['status'];
        priority?: Lead['priority'];
        source?: Lead['source'];
        search?: string;
    }) => apiClient.get<{ results: Lead[] } | Lead[]>('/leads/', { params }),

    getLead: (id: number) =>
        apiClient.get<Lead>(`/leads/${id}/`),

    createLead: (data: CreateLeadData) =>
        apiClient.post<Lead>('/leads/', data),

    updateLead: (id: number, data: Partial<Lead>) =>
        apiClient.patch<Lead>(`/leads/${id}/`, data),

    // NEW: dedicated status endpoint — use this for Kanban moves, not updateLead
    updateStatus: (id: number, data: UpdateLeadStatusData) =>
        apiClient.patch<Lead>(`/leads/${id}/status/`, data),

    getAgentLeads: () =>
        apiClient.get<{ results: Lead[] } | Lead[]>('/leads/my-leads/'),

    getCRMStats: () =>
        apiClient.get<CRMStats>('/leads/stats/'),

    // ── Activities ───────────────────────────────────────────────────────────

    getLeadActivities: (leadId: number) =>
        apiClient.get<LeadActivity[]>(`/leads/${leadId}/activities/`),

    createLeadActivity: (leadId: number, data: CreateLeadActivityData) =>
        apiClient.post<LeadActivity>(`/leads/${leadId}/activities/`, data),

    // ── Status log (pipeline history) ────────────────────────────────────────

    getStatusLog: (leadId: number) =>
        apiClient.get<LeadStatusLog[]>(`/leads/${leadId}/status-log/`),

    // ── Interactions (anonymous tracking) ────────────────────────────────────

    trackInteraction: (
        leadId: number,
        type: LeadInteraction['interaction_type'],
        propertyId?: number,
        metadata?: Record<string, unknown>,
    ) => apiClient.post<LeadInteraction>(`/leads/${leadId}/interactions/`, {
        lead: leadId,
        interaction_type: type,
        property: propertyId,
        metadata,
    }),

    // ── Tasks ─────────────────────────────────────────────────────────────────

    getTasks: (params?: { pending?: boolean }) =>
        apiClient.get<{ results: Task[] } | Task[]>('/leads/tasks/', { params }),

    createTask: (data: CreateTaskData) =>
        apiClient.post<Task>('/leads/tasks/', data),

    updateTask: (id: number, data: Partial<Task>) =>
        apiClient.patch<Task>(`/leads/tasks/${id}/`, data),

    deleteTask: (id: number) =>
        apiClient.delete(`/leads/tasks/${id}/`),

    // ── Conversations ─────────────────────────────────────────────────────────

    getConversations: () =>
        apiClient.get<{ results: Conversation[] } | Conversation[]>('/leads/conversations/'),

    getConversation: (id: number | string) =>
        apiClient.get<Conversation>(`/leads/conversations/${id}/`),

    createConversation: (propertyId: number | undefined, agentId: number) =>
        apiClient.post<Conversation>('/leads/conversations/', {
            property: propertyId ?? null,
            agent: agentId,
        }),

    createAgentConversation: (agentId: number) =>
        apiClient.post<Conversation>('/leads/conversations/', {
            property: null,
            agent: agentId,
        }),

    deleteConversation: (id: number | string) =>
        apiClient.delete(`/leads/conversations/${id}/delete/`),

    // ── Messages ──────────────────────────────────────────────────────────────

    getMessages: (conversationId: number | string) =>
        apiClient.get<{ results: Message[] } | Message[]>(`/leads/conversations/${conversationId}/messages/`),

    sendMessage: (conversationId: number | string, content: string) =>
        apiClient.post<Message>(`/leads/conversations/${conversationId}/messages/`, { content }),

    deleteMessage: (conversationId: number | string, messageId: number | string) =>
        apiClient.delete(`/leads/conversations/${conversationId}/messages/${messageId}/delete/`),
};