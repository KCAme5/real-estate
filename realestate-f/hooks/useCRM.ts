'use client';

import { useCallback, useEffect } from 'react';
import { useAuth } from './useAuth';
import { leadsAPI, LeadInteraction } from '@/lib/api/leads';

export function useCRM() {
    const { user } = useAuth();

    const trackInteraction = useCallback(async (
        type: LeadInteraction['interaction_type'],
        propertyId?: number,
        metadata?: any
    ) => {
        if (!user) return;

        try {
            // First, find if the user has a lead record
            // If they are logged in, we can try to find their lead record or create one
            // For now, assume they might already have one if they've interacted before
            // In a real scenario, we might have a 'get_my_lead' endpoint

            // To simplify, we'll use a lead record associated with the user
            // This requires the backend to have a way to find a lead by user
            // Let's assume the backend handles lookup by user if leadId is not provided
            // or we fetch it once on mount

            // Fetch lead ID on mount if possible, or use a specific endpoint
            const res = await leadsAPI.getLeads({ agent: undefined }); // This is not ideal
            const lead = res.results?.find((l: any) => l.user === user.id);

            if (lead) {
                await leadsAPI.trackInteraction(lead.id, type, propertyId, metadata);
            }
        } catch (error) {
            console.error('Failed to track CRM interaction:', error);
        }
    }, [user]);

    return { trackInteraction };
}

// Global Interaction Tracker Component
export function CRMTracker({ propertyId }: { propertyId?: number }) {
    const { trackInteraction } = useCRM();

    useEffect(() => {
        if (propertyId) {
            trackInteraction('page_view', propertyId);
        }
    }, [propertyId, trackInteraction]);

    return null;
}
