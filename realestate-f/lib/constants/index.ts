// lib/constants/index.ts
// Magic strings and constants for the application

export const USER_TYPE = {
  CLIENT: 'client',
  AGENT: 'agent',
  MANAGEMENT: 'management',
} as const;

export const PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
} as const;

export const SOURCE = {
  CONTACT_FORM: 'contact_form',
  BOOK_VIEWING: 'book_viewing',
  SAVED_PROPERTY: 'saved_property',
} as const;

export const LISTING_TYPE = {
  RENT: 'rent',
  SALE: 'sale',
} as const;

export const PROPERTY_TYPE = {
  HOUSE: 'house',
  APARTMENT: 'apartment',
  LAND: 'land',
  COMMERCIAL: 'commercial',
  BED_SITTER: 'bed_sitter',
} as const;

export const BOOKING_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  CANCELLED: 'cancelled',
  COMPLETED: 'completed',
} as const;

export const VERIFICATION_STATUS = {
  PENDING: 'pending',
  VERIFIED: 'verified',
  REJECTED: 'rejected',
} as const;

export const TIME_SLOTS = {
  MORNING: 'Morning (9AM - 12PM)',
  AFTERNOON: 'Afternoon (12PM - 4PM)',
  EVENING: 'Evening (4PM - 7PM)',
} as const;

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login/',
    LOGOUT: '/auth/logout/',
    REGISTER: '/auth/register/',
    REFRESH: '/auth/refresh/',
    USER: '/auth/user/',
  },
  PROPERTIES: {
    LIST: '/properties/',
    CREATE: '/properties/create/',
    DETAIL: (id: string | number) => `/properties/${id}/`,
    DELETE: (id: number) => `/properties/delete-property/${id}/`,
    SAVE: '/properties/saved/',
    SAVED_DETAIL: (id: number) => `/properties/saved/${id}/`,
    FEATURED: '/properties/featured/',
    RECOMMENDATIONS: '/properties/recommendations/',
    SEARCH: '/properties/search/',
    MY_PROPERTIES: '/properties/my-properties/',
    MANAGEMENT_PROPERTIES: '/properties/management-properties/',
    APPROVE: (id: number) => `/properties/approve-property/${id}/`,
    REJECT: (id: number) => `/properties/reject-property/${id}/`,
    TOGGLE_FEATURED: (id: number) => `/properties/toggle-featured/${id}/`,
    VALUATION: '/properties/valuation/',
    LOCATIONS: '/properties/locations/',
    DELETE_IMAGE: (id: number) => `/properties/images/${id}/`,
  },
  LEADS: {
    LIST: '/leads/',
    CREATE: '/leads/create/',
    DETAIL: (id: number) => `/leads/${id}/`,
    DELETE: (id: number) => `/leads/${id}/`,
    TRACK_INTERACTION: (id: number) => `/leads/${id}/track/`,
    CONVERSATIONS: '/leads/conversations/',
    CONVERSATION_BY_AGENT: (agentId: number) => `/leads/conversations/agent/${agentId}/`,
    CONVERSATION_BY_PROPERTY: (propertyId: number) => `/leads/conversations/property/${propertyId}/`,
  },
  BOOKINGS: {
    LIST: '/bookings/',
    CREATE: '/bookings/create/',
    DETAIL: (id: number) => `/bookings/${id}/`,
    UPDATE: (id: number) => `/bookings/${id}/`,
    DELETE: (id: number) => `/bookings/${id}/`,
    MY_BOOKINGS: '/bookings/my-bookings/',
  },
  AGENTS: {
    LIST: '/agents/',
    DETAIL: (slug: string) => `/agents/${slug}/`,
    PROFILE: '/agents/profile/',
    UPDATE_PROFILE: '/agents/profile/update/',
  },
  MESSAGES: {
    LIST: '/messages/',
    CREATE: '/messages/create/',
    CONVERSATION: '/messages/conversation/',
    MARK_READ: (conversationId: number) => `/messages/${conversationId}/mark-read/`,
  },
  ANALYTICS: {
    DASHBOARD_STATS: '/analytics/dashboard-stats/',
    AGENT_STATS: (agentId: number) => `/analytics/agent/${agentId}/`,
    PROPERTY_STATS: (propertyId: number) => `/analytics/property/${propertyId}/`,
  },
  SETTINGS: {
    GET: '/settings/',
    UPDATE: '/settings/',
  },
  NOTIFICATIONS: {
    LIST: '/notifications/',
    MARK_READ: (id: number) => `/notifications/${id}/mark-read/`,
    MARK_ALL_READ: '/notifications/mark-all-read/',
  },
} as const;

export const NAVIGATION = {
  CLIENT: {
    DASHBOARD: '/dashboard',
    SAVED_PROPERTIES: '/dashboard/saved',
    BOOKINGS: '/dashboard/bookings',
    MESSAGES: '/dashboard/messages',
    SETTINGS: '/dashboard/settings',
  },
  AGENT: {
    DASHBOARD: '/dashboard/agent',
    PROPERTIES: '/dashboard/agent/properties',
    LEADS: '/dashboard/agent/leads',
    BOOKINGS: '/dashboard/agent/bookings',
    MESSAGES: '/dashboard/agent/messages',
    ANALYTICS: '/dashboard/agent/analytics',
    BILLING: '/dashboard/agent/billing',
    SETTINGS: '/dashboard/agent/settings',
  },
  MANAGEMENT: {
    DASHBOARD: '/dashboard/management',
    PROPERTIES: '/dashboard/management/properties',
    AGENTS: '/dashboard/management/agents',
    ANALYTICS: '/dashboard/management/analytics',
    SETTINGS: '/dashboard/management/settings',
  },
} as const;

export const DATE_FORMATS = {
  DISPLAY: 'en-US',
  DATE: 'YYYY-MM-DD',
  DATETIME: "YYYY-MM-DD'T'HH:mm:ss",
  DISPLAY_DATE: {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  },
} as const;

export const CURRENCY = {
  KES: 'KES',
  USD: 'USD',
} as const;

export const IMAGE_SIZES = {
  THUMBNAIL: '400x300',
  CARD: '600x400',
  DETAIL: '1200x800',
  HERO: '1920x1080',
} as const;

export const CACHE = {
  STALE_TIME: {
    SHORT: 30 * 1000, // 30 seconds
    MEDIUM: 5 * 60 * 1000, // 5 minutes
    LONG: 15 * 60 * 1000, // 15 minutes
  },
  GC_TIME: {
    SHORT: 60 * 1000, // 1 minute
    MEDIUM: 10 * 60 * 1000, // 10 minutes
    LONG: 30 * 60 * 1000, // 30 minutes
  },
} as const;

export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
  AUTH_TOKEN: 'auth_token',
  THEME: 'tugai-theme',
  REDIRECT_AFTER_LOGIN: 'redirect_after_login',
} as const;
