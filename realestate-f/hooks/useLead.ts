// hooks/useLead.ts
import { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/toast';
import { leadsAPI } from '@/lib/api/leads';
import { bookingsAPI } from '@/lib/api/bookings';

interface LeadData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  source: 'contact_form' | 'book_viewing' | 'saved_property';
  priority: 'low' | 'medium' | 'high';
  property: number;
}

interface UseLeadReturn {
  createLeadAndConversation: (
    property: any,
    source: LeadData['source'],
    priority: LeadData['priority'],
    openChat?: boolean
  ) => Promise<{ lead: any; conversation: any } | null>;
  createLeadAndBooking: (
    property: any,
    source: LeadData['source'],
    priority: LeadData['priority'],
    leadId: number
  ) => Promise<{ lead: any; booking: any } | null>;
  createSilentLead: (
    property: any,
    source: LeadData['source'],
    priority: LeadData['priority']
  ) => Promise<any>;
}

export function useLead(): UseLeadReturn {
  const { user } = useAuth();
  const router = useRouter();
  const { success, error: showError } = useToast();

  const createLeadAndConversation = useCallback(
    async (
      property: any,
      source: LeadData['source'],
      priority: LeadData['priority'],
      openChat = true
    ) => {
      if (!user) {
        sessionStorage.setItem('redirect_after_login', window.location.pathname);
        router.push('/login');
        return null;
      }

      try {
        const leadData: LeadData = {
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
          phone: user.phone_number || '',
          source,
          priority,
          property: property.id,
        };

        const lead = await leadsAPI.createLead(leadData);

        if (openChat) {
          const conversation = await leadsAPI.createConversation(
            property.id,
            property.agent.id
          );
          return { lead, conversation };
        }

        return { lead, conversation: null };
      } catch (error) {
        console.error('Error creating lead:', error);
        return null;
      }
    },
    [user, router]
  );

  const createLeadAndBooking = useCallback(
    async (
      property: any,
      source: LeadData['source'],
      priority: LeadData['priority'],
      leadId: number
    ) => {
      if (!user) {
        sessionStorage.setItem('redirect_after_login', window.location.pathname);
        router.push('/login');
        return null;
      }

      try {
        const leadData: LeadData = {
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
          phone: user.phone_number || '',
          source,
          priority,
          property: property.id,
        };

        const lead = await leadsAPI.createLead(leadData);

        // Create booking with the lead ID
        const booking = await bookingsAPI.create({
          property: property.id,
          lead: lead.id,
          date: new Date().toISOString(), // Default to current time
          duration: 30,
          client_notes: `Phone: ${user.phone_number || ''}\nEmail: ${user.email}`,
        });

        return { lead, booking };
      } catch (error) {
        console.error('Error creating lead and booking:', error);
        return null;
      }
    },
    [user, router]
  );

  const createSilentLead = useCallback(
    async (
      property: any,
      source: LeadData['source'],
      priority: LeadData['priority']
    ) => {
      if (!user) {
        return null;
      }

      try {
        const leadData: LeadData = {
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
          phone: user.phone_number || '',
          source,
          priority,
          property: property.id,
        };

        const lead = await leadsAPI.createLead(leadData);

        // Track interaction for saved properties
        if (source === 'saved_property') {
          await leadsAPI.trackInteraction(
            lead.id,
            'property_click',
            property.id,
            { saved: true }
          );
        }

        return lead;
      } catch (error) {
        console.error('Error creating silent lead:', error);
        return null;
      }
    },
    [user]
  );

  return {
    createLeadAndConversation,
    createLeadAndBooking,
    createSilentLead,
  };
}
