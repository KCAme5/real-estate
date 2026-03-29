// lib/api/settings.ts
import { apiClient } from './client';

// User profile update
export interface ProfileUpdateData {
    first_name?: string;
    last_name?: string;
    phone_number?: string;
    bio?: string;
    avatar?: File | null;
}

// Agent profile additional fields
export interface AgentProfileData {
    bio?: string;
    specialties?: string[];
    office_address?: string;
    years_of_experience?: number;
    languages?: string[];
    license_number?: string;
}

// User preferences
export interface UserPreferences {
    locations?: string[];
    price_min?: number;
    price_max?: number;
    bedrooms?: string[];
    property_types?: string[];
    email_notifications?: boolean;
    sms_notifications?: boolean;
    new_listings_alert?: boolean;
    price_drop_alert?: boolean;
    marketing_emails?: boolean;
    weekly_summary?: boolean;
}

// Password change
export interface PasswordChangeData {
    current_password: string;
    new_password: string;
    confirm_password?: string;
}

// Agent settings API
export const agentSettingsAPI = {
    // Get agent profile
    async getProfile() {
        return apiClient.get<AgentProfileData>('/agents/profile/');
    },

    // Update agent profile
    async updateProfile(data: AgentProfileData) {
        return apiClient.patch<AgentProfileData>('/agents/profile/', data);
    },

    // Upload avatar
    async uploadAvatar(file: File) {
        const formData = new FormData();
        formData.append('avatar', file);
        return apiClient.post<{ avatar: string }>('/agents/profile/avatar/', formData);
    },

    // Update profile photo (from user profile)
    async updatePhoto(data: FormData) {
        return apiClient.patch('/auth/profile/', data);
    },

    // Change password
    async changePassword(data: PasswordChangeData) {
        return apiClient.post('/auth/change-password/', data);
    },

    // Update notification preferences
    async updateNotifications(preferences: {
        email_notifications?: boolean;
        sms_notifications?: boolean;
        new_leads_alert?: boolean;
        bookings_alert?: boolean;
        weekly_summary?: boolean;
        marketing_emails?: boolean;
    }) {
        return apiClient.patch('/accounts/preferences/', preferences);
    },

    // Get notification preferences
    async getNotifications() {
        return apiClient.get('/accounts/preferences/');
    },

    // Update contact info
    async updateContact(data: {
        phone_number?: string;
        email?: string;
    }) {
        return apiClient.patch('/auth/profile/', data);
    },

    // Get commission settings
    async getCommissionSettings() {
        return apiClient.get('/payments/commission-settings/');
    },

    // Update payment methods
    async updatePaymentMethod(data: {
        mpesa_number?: string;
        paypal_email?: string;
        bank_account?: string;
        bank_name?: string;
    }) {
        return apiClient.patch('/payments/payment-method/', data);
    },

    // Get availability settings
    async getAvailability() {
        return apiClient.get('/agents/availability/');
    },

    // Update availability
    async updateAvailability(data: {
        available_monday?: boolean;
        available_tuesday?: boolean;
        available_wednesday?: boolean;
        available_thursday?: boolean;
        available_friday?: boolean;
        available_saturday?: boolean;
        available_sunday?: boolean;
        start_time?: string;
        end_time?: string;
    }) {
        return apiClient.patch('/agents/availability/', data);
    },
};

// Client settings API
export const clientSettingsAPI = {
    // Update profile
    async updateProfile(data: ProfileUpdateData) {
        return apiClient.patch<ProfileUpdateData>('/auth/profile/', data);
    },

    // Upload avatar
    async uploadAvatar(file: File) {
        const formData = new FormData();
        formData.append('avatar', file);
        return apiClient.patch<{ avatar: string }>('/auth/profile/', formData);
    },

    // Get preferences
    async getPreferences() {
        return apiClient.get<UserPreferences>('/accounts/preferences/');
    },

    // Update preferences
    async updatePreferences(preferences: Partial<UserPreferences>) {
        return apiClient.patch<UserPreferences>('/accounts/preferences/', preferences);
    },

    // Change password
    async changePassword(data: PasswordChangeData) {
        return apiClient.post('/auth/change-password/', data);
    },

    // Update notification settings
    async updateNotifications(data: {
        email_notifications?: boolean;
        sms_notifications?: boolean;
        new_listings_alert?: boolean;
        price_drop_alert?: boolean;
        marketing_emails?: boolean;
    }) {
        return apiClient.patch('/accounts/preferences/', data);
    },

    // Get saved searches
    async getSavedSearches() {
        return apiClient.get('/properties/saved-searches/');
    },

    // Save search
    async saveSearch(data: {
        name: string;
        filters: {
            location?: string;
            price_min?: number;
            price_max?: number;
            property_type?: string;
            bedrooms?: string;
        };
    }) {
        return apiClient.post('/properties/saved-searches/', data);
    },

    // Delete saved search
    async deleteSavedSearch(id: number) {
        return apiClient.delete(`/properties/saved-searches/${id}/`);
    },

    // Export data (GDPR)
    async exportData() {
        return apiClient.get('/accounts/export-data/');
    },

    // Delete account
    async deleteAccount(data: { password: string; confirm_text: string }) {
        return apiClient.post('/accounts/delete-account/', data);
    },
};

// Management settings API
export const managementSettingsAPI = {
    // Update profile
    async updateProfile(data: ProfileUpdateData) {
        return apiClient.patch<ProfileUpdateData>('/auth/profile/', data);
    },

    // Upload logo
    async uploadLogo(file: File) {
        const formData = new FormData();
        formData.append('logo', file);
        return apiClient.patch<{ logo: string }>('/auth/profile/', formData);
    },

    // Get organization settings
    async getOrganizationSettings() {
        return apiClient.get('/accounts/organization/');
    },

    // Update organization settings
    async updateOrganizationSettings(data: {
        company_name?: string;
        description?: string;
        website?: string;
        address?: string;
        phone?: string;
        email?: string;
    }) {
        return apiClient.patch('/accounts/organization/', data);
    },

    // Get team members
    async getTeamMembers() {
        return apiClient.get('/accounts/management-agents/');
    },

    // Invite team member
    async inviteTeamMember(data: {
        email: string;
        role: 'admin' | 'manager' | 'analyst';
        first_name?: string;
        last_name?: string;
    }) {
        return apiClient.post('/accounts/invite-member/', data);
    },

    // Remove team member
    async removeTeamMember(id: number) {
        return apiClient.delete(`/accounts/management-agents/${id}/`);
    },

    // Update team member role
    async updateTeamMemberRole(id: number, role: string) {
        return apiClient.patch(`/accounts/management-agents/${id}/`, { role });
    },

    // Change password
    async changePassword(data: PasswordChangeData) {
        return apiClient.post('/auth/change-password/', data);
    },

    // Get notification settings
    async getNotifications() {
        return apiClient.get('/accounts/preferences/');
    },

    // Update notification settings
    async updateNotifications(data: {
        email_notifications?: boolean;
        system_alerts?: boolean;
        weekly_reports?: boolean;
        team_activity?: boolean;
    }) {
        return apiClient.patch('/accounts/preferences/', data);
    },

    // Get audit log
    async getAuditLog(page = 1) {
        return apiClient.get(`/accounts/audit-log/?page=${page}`);
    },

    // Get billing settings
    async getBillingSettings() {
        return apiClient.get('/payments/management-billing/');
    },

    // Update billing settings
    async updateBillingSettings(data: {
        billing_email?: string;
        billing_address?: string;
        payment_method?: string;
    }) {
        return apiClient.patch('/payments/management-billing/', data);
    },

    // Export data
    async exportData() {
        return apiClient.get('/accounts/export-data/');
    },

    // Delete account
    async deleteAccount(data: { password: string; confirm_text: string }) {
        return apiClient.post('/accounts/delete-account/', data);
    },
};

export default {
    agentSettingsAPI,
    clientSettingsAPI,
    managementSettingsAPI,
};