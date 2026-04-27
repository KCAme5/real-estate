import type { AgentReference } from './agent';

export interface Property {
  slug: string;
  id: number;
  title: string;
  price: number;
  description: string;
  location: {
    name: string;
    county: string;
  };
  property_type: string;
  main_image: string;
  main_image_url: string;
  images: Array<{
    id: number;
    image: string;
    is_primary: boolean;
    caption: string;
    created_at: string;
  }>;
  bedrooms: number;
  bathrooms: number;
  square_feet: number;
  address: string;
  agent: AgentReference | number | null;
  features: string[];
  year_built: number;
  is_featured: boolean;
  currency: string;
  plot_size?: number;
  status: string;
  created_at: string;
  views: number;
  is_verified: boolean;
  price_display: string;
  latitude?: string;
  longitude?: string;
  video_url?: string;
  listing_type: 'rent' | 'sale';
  agent_profile_id?: number;
  gallery?: Array<{
    id: number;
    image: string;
    image_url: string;
    is_primary: boolean;
    caption: string;
    created_at: string;
  }>;
  is_saved?: boolean;
}

export interface SavedProperty {
  id: number;
  property: number;
  saved_at: string;
  notes?: string;
}

export interface ContactForm {
  name: string;
  email: string;
  phone: string;
  message: string;
  preferredContact: 'phone' | 'email';
}

export interface Location {
  id: number;
  name: string;
  county: string;
  slug: string;
  latitude?: string;
  longitude?: string;
}

// Re-export for backward compatibility
export type { AgentReference as Agent };
