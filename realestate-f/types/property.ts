export interface Property {
    slug: any;
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
    agent: any;
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

export interface Agent {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    phone_number: string;
    profile_picture?: string;
    user_type: 'agent' | 'admin' | 'client';
}

export interface AgentProfile {
    id: number;
    user: Agent;
    bio: string;
    license_number: string;
    years_of_experience: number;
    specialties: string[];
    office_address: string;
    whatsapp_number: string;
    facebook_url?: string;
    twitter_url?: string;
    linkedin_url?: string;
    instagram_url?: string;
    total_properties_sold: number;
    total_sales_value: string;
    average_rating: number;
    is_verified: boolean;
}