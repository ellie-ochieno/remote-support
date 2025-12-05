// API Configuration for frontend
export const API_CONFIG = {
  BASE_URL: process.env.NODE_ENV === 'production' 
    ? 'https://api.remotcyberhelp.com' 
    : 'http://localhost:5000',
  
  ENDPOINTS: {
    // Authentication
    AUTH: {
      SIGNUP: '/api/auth/signup',
      SIGNIN: '/api/auth/signin',
      SIGNOUT: '/api/auth/signout',
      ME: '/api/auth/me',
      PROFILE: '/api/auth/profile',
      FORGOT_PASSWORD: '/api/auth/forgot-password',
      RESET_PASSWORD: '/api/auth/reset-password',
      CHANGE_PASSWORD: '/api/auth/change-password',
      STATS: '/api/auth/stats'
    },

    // Contact
    CONTACT: {
      CREATE: '/api/contact',
      GET_BY_ID: (id: string) => `/api/contact/${id}`,
      GET_ALL: '/api/contact',
      UPDATE_STATUS: (id: string) => `/api/contact/${id}/status`,
      ASSIGN: (id: string) => `/api/contact/${id}/assign`,
      ADD_RESPONSE: (id: string) => `/api/contact/${id}/response`,
      DELETE: (id: string) => `/api/contact/${id}`,
      STATS: '/api/contact/admin/stats',
      ATTENTION: '/api/contact/admin/attention',
      MARK_EMERGENCY: (id: string) => `/api/contact/${id}/emergency`,
      EMERGENCY_SUPPORT: '/api/contact/emergency-support',
      INSTANT_SUPPORT: '/api/contact/instant-support'
    },

    // Consultation
    CONSULTATION: {
      CREATE: '/api/consultation',
      GET_BY_ID: (id: string) => `/api/consultation/${id}`,
      GET_ALL: '/api/consultation',
      UPDATE_STATUS: (id: string) => `/api/consultation/${id}/status`,
      RESCHEDULE: (id: string) => `/api/consultation/${id}/reschedule`,
      CANCEL: (id: string) => `/api/consultation/${id}/cancel`,
      ASSIGN: (id: string) => `/api/consultation/${id}/assign`,
      ADD_NOTES: (id: string) => `/api/consultation/${id}/notes`,
      DELETE: (id: string) => `/api/consultation/${id}`,
      STATS: '/api/consultation/admin/stats',
      TODAY: '/api/consultation/admin/today',
      UPCOMING: '/api/consultation/admin/upcoming',
      AVAILABILITY: (date: string) => `/api/consultation/availability/${date}`
    },

    // Blog
    BLOG: {
      GET_ALL: '/api/blog',
      GET_ADMIN: '/api/blog/admin',
      GET_BY_SLUG: (slug: string) => `/api/blog/${slug}`,
      CREATE: '/api/blog',
      UPDATE: (id: string) => `/api/blog/${id}`,
      TOGGLE_PUBLISH: (id: string) => `/api/blog/${id}/publish`,
      LIKE: (id: string) => `/api/blog/${id}/like`,
      DELETE: (id: string) => `/api/blog/${id}`,
      CATEGORIES: '/api/blog/meta/categories',
      TAGS: '/api/blog/meta/tags',
      POPULAR: '/api/blog/meta/popular',
      RELATED: (id: string) => `/api/blog/${id}/related`,
      SEARCH: '/api/blog/meta/search',
      STATS: '/api/blog/admin/stats',
      RECENT: '/api/blog/meta/recent'
    },

    // Support
    SUPPORT: {
      CREATE_TICKET: '/api/support/ticket',
      GET_TICKET: (id: string) => `/api/support/ticket/${id}`,
      GET_TICKET_BY_NUMBER: (ticketNumber: string) => `/api/support/ticket/number/${ticketNumber}`,
      GET_ALL_TICKETS: '/api/support/tickets',
      UPDATE_STATUS: (id: string) => `/api/support/ticket/${id}/status`,
      ADD_RESPONSE: (id: string) => `/api/support/ticket/${id}/response`,
      ASSIGN: (id: string) => `/api/support/ticket/${id}/assign`,
      ESCALATE: (id: string) => `/api/support/ticket/${id}/escalate`,
      DELETE: (id: string) => `/api/support/ticket/${id}`,
      STATS: '/api/support/admin/stats',
      ATTENTION: '/api/support/admin/attention',
      ASSIGNED: (adminId: string) => `/api/support/admin/assigned/${adminId}`,
      REQUEST_TECHNICAL_SUPPORT: '/api/support/request-technical-support'
    },

    // Admin
    ADMIN: {
      DASHBOARD: '/api/admin/dashboard',
      USERS: '/api/admin/users',
      UPDATE_USER_ROLE: (id: string) => `/api/admin/users/${id}/role`,
      DELETE_USER: (id: string) => `/api/admin/users/${id}`,
      ANALYTICS: '/api/admin/analytics',
      ACTIVITY: '/api/admin/activity',
      REPORTS: (type: string) => `/api/admin/reports/${type}`,
      BROADCAST: '/api/admin/broadcast',
      SYSTEM_HEALTH: '/api/admin/system-health',
      MAINTENANCE: '/api/admin/maintenance'
    },

    // Working Hours
    WORKING_HOURS: {
      GET: '/api/working-hours',
      GET_FORMATTED: '/api/working-hours/formatted',
      GET_STATUS: '/api/working-hours/status',
      UPDATE: '/api/working-hours',
      ADD_HOLIDAY: '/api/working-hours/holiday',
      ADD_SPECIAL: '/api/working-hours/special',
      AVAILABILITY: (date: string) => `/api/working-hours/availability/${date}`,
      HISTORY: '/api/working-hours/admin/history',
      NEXT_AVAILABLE: '/api/working-hours/next-available',
      EMERGENCY_OVERRIDE: '/api/working-hours/emergency-override',
      TIMEZONE_INFO: '/api/working-hours/timezone-info'
    },

    // Government Services
    GOVERNMENT: {
      SERVICE_REQUEST: '/api/government/service-request',
      GET_SERVICES: '/api/government/services',
      GET_SERVICE_DETAILS: (serviceId: string) => `/api/government/services/${serviceId}`,
      GET_DOCUMENT_TYPES: '/api/government/document-types',
      GET_REQUIREMENTS: (serviceType: string) => `/api/government/requirements/${serviceType}`,
      GET_FEES: '/api/government/fees',
      DOCUMENT_CHECK: '/api/government/document-check',
      GET_OFFICES: '/api/government/offices'
    }
  },

  // Request timeout in milliseconds
  TIMEOUT: 30000,

  // Default headers
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },

  // Status codes
  STATUS_CODES: {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    UNPROCESSABLE_ENTITY: 422,
    TOO_MANY_REQUESTS: 429,
    INTERNAL_SERVER_ERROR: 500
  }
};

// Helper function to build full URL
export const buildApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

// Helper function to build URL with query parameters
export const buildUrlWithParams = (endpoint: string, params: Record<string, any>): string => {
  const url = buildApiUrl(endpoint);
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      if (Array.isArray(value)) {
        searchParams.append(key, value.join(','));
      } else {
        searchParams.append(key, String(value));
      }
    }
  });

  const queryString = searchParams.toString();
  return queryString ? `${url}?${queryString}` : url;
};

// API response interface
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: Array<{
    field: string;
    message: string;
    value?: any;
  }>;
  pagination?: {
    page: number;
    limit: number;
    total: number;
  };
}

// Error response interface
export interface ApiError {
  success: false;
  message: string;
  errors?: Array<{
    field: string;
    message: string;
    value?: any;
  }>;
}

// Pagination parameters
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  searchTerm?: string;
}

// Filter parameters for different endpoints
export interface ContactFilters extends PaginationParams {
  status?: 'pending' | 'in_progress' | 'resolved' | 'closed';
  service?: string;
  urgency?: 'low' | 'medium' | 'high' | 'critical';
}

export interface ConsultationFilters extends PaginationParams {
  status?: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  consultationType?: string;
  urgency?: 'low' | 'medium' | 'high' | 'critical';
  startDate?: string;
  endDate?: string;
}

export interface BlogFilters extends PaginationParams {
  published?: boolean;
  category?: string;
  tags?: string[];
  author?: string;
}

export interface SupportTicketFilters extends PaginationParams {
  status?: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority?: 'low' | 'medium' | 'high' | 'critical';
  category?: string;
  assignedTo?: string;
}