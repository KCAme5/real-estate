// realestate-f/lib/api/payments.ts
import { apiClient } from './client';

// Types
export interface PaymentPlan {
  id: number;
  name: string;
  plan_type: string;
  price_kes: string;
  price_usd: string | null;
  description: string;
  features: string[];
  property_listings: number;
  featured_days: number;
  validity_days: number;
  is_active: boolean;
  created_at: string;
}

export interface AgentSubscription {
  id: number;
  agent: number;
  plan: number;
  plan_name: string;
  plan_features: string[];
  status: string;
  start_date: string;
  end_date: string;
  auto_renew: boolean;
  properties_listed: number;
  properties_featured: number;
  days_remaining: number;
  created_at: string;
}

export interface MpesaTransaction {
  id: number;
  transaction_type: string;
  amount: string;
  currency: string;
  description: string;
  merchant_request_id: string;
  checkout_request_id: string;
  mpesa_receipt_number: string;
  phone_number: string;
  account_reference: string;
  transaction_date: string | null;
  status: string;
  status_message: string;
  user: number;
  user_name: string;
  subscription: number | null;
  property: number | null;
  created_at: string;
  updated_at: string;
}

export interface MpesaPaymentRequest {
  phone_number: string;
  amount: string;
  transaction_type: string;
  account_reference: string;
  description: string;
}

// API Functions - following the same pattern as other API files
export const paymentsAPI = {
  /**
   * Get all available payment plans
   */
  getPaymentPlans: async () => {
    return apiClient.get<PaymentPlan[]>('/payments/plans/');
  },

  /**
   * Get current agent's subscription
   */
  getAgentSubscription: async () => {
    return apiClient.get<AgentSubscription>('/payments/subscription/');
  },

  /**
   * Get user's M-Pesa transactions
   */
  getMpesaTransactions: async () => {
    return apiClient.get<MpesaTransaction[]>('/payments/transactions/');
  },

  /**
   * Initiate M-Pesa payment (STK Push)
   */
  initiateMpesaPayment: async (data: MpesaPaymentRequest) => {
    return apiClient.post('/payments/mpesa/initiate/', data);
  },
};