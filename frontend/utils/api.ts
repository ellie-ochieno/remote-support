/**
 * API utilities and helpers for MongoDB backend integration
 */

// Re-export main API configuration
export * from '../components/api/config';

// Re-export specific API modules
export { authAPI } from '../components/api/auth';
export { contactAPI } from '../components/api/contact';
export { consultationAPI } from '../components/api/consultation';

// Central API error handling
export class APIError extends Error {
  constructor(
    message: string,
    public status?: number,
    public data?: any
  ) {
    super(message);
    this.name = 'APIError';
  }
}

// API response handler with error handling
export async function handleAPIResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
    
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorMessage;
      throw new APIError(errorMessage, response.status, errorData);
    } catch (parseError) {
      // If response is not JSON, use the HTTP status message
      throw new APIError(errorMessage, response.status);
    }
  }

  try {
    return await response.json();
  } catch (parseError) {
    throw new APIError('Invalid JSON response from server', response.status);
  }
}

// Generic API request function with error handling
export async function apiRequest<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    return await handleAPIResponse<T>(response);
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }
    
    // Handle network errors or other fetch errors
    throw new APIError(
      error instanceof Error ? error.message : 'Network request failed'
    );
  }
}