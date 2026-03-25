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
    average_rating: number | string; // strings might come from DecimalField in JSON
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
    properties?: any[]; // We'll use a more specific type if we have one, but any[] is safer for now to avoid circular issues
    location?: string; // used by some frontend components
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
