import { Property } from './property';

/**
 * Agent represents a real estate agent with their full profile
 * This is the main agent interface used throughout the application
 */
export interface Agent {
  id: number;
  slug: string;
  user: number; // User ID
  user_name: string;
  user_email: string;
  user_avatar: string | null;
  user_phone?: string;
  years_of_experience: number;
  specialties: string[];
  average_rating: number | string;
  total_properties_sold: number;
  active_properties?: number;
  is_verified: boolean;
  bio?: string;
  license_number?: string;
  office_address?: string;
  whatsapp_number?: string;
  facebook_url?: string;
  twitter_url?: string;
  linkedin_url?: string;
  instagram_url?: string;
  reviews?: AgentReview[];
  properties?: Property[];
  location?: string;
}

/**
 * AgentReference is used in other entities like Property
 * It contains basic agent identification fields
 */
export interface AgentReference {
  id: number;
  username: string;
  user_name?: string;
  email?: string;
  user_email?: string;
  first_name?: string;
  last_name?: string;
  phone_number?: string;
  user_phone?: string;
  profile_picture?: string;
  user_avatar?: string;
  user_type: 'agent' | 'admin' | 'client';
  is_verified?: boolean;
  specialties?: string[];
  years_of_experience?: number;
  average_rating?: number;
}

export interface AgentReview {
  id: number;
  client_name: string;
  rating: number;
  review_text: string;
  created_at: string;
}

export interface AgentFilters {
  specialty?: string;
  location?: string;
}
