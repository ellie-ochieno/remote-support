/**
 * Safe fetch wrapper with timeout and error handling
 * Prevents Figma environment conflicts and provides better error messages
 */

export interface SafeFetchOptions extends RequestInit {
  timeout?: number;
}

export interface SafeFetchError extends Error {
  status?: number;
  statusText?: string;
  data?: any;
}

/**
 * Creates a fetch request with timeout support
 */
export async function safeFetch(
  url: string,
  options: SafeFetchOptions = {}
): Promise<Response> {
  const { timeout = 30000, ...fetchOptions } = options;

  // Create abort controller for timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal
    });

    clearTimeout(timeoutId);
    return response;
  } catch (error: any) {
    clearTimeout(timeoutId);

    // Handle abort/timeout errors
    if (error.name === 'AbortError') {
      const timeoutError = new Error(
        'Request timeout. Please check your connection and try again.'
      ) as SafeFetchError;
      timeoutError.name = 'TimeoutError';
      throw timeoutError;
    }

    // Handle network errors
    if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
      const networkError = new Error(
        'Network error. Please check your internet connection.'
      ) as SafeFetchError;
      networkError.name = 'NetworkError';
      throw networkError;
    }

    // Re-throw other errors
    throw error;
  }
}

/**
 * Safe fetch with JSON parsing
 */
export async function safeFetchJSON<T = any>(
  url: string,
  options: SafeFetchOptions = {}
): Promise<T> {
  try {
    const response = await safeFetch(url, options);

    // Check if response is ok
    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        errorData = { error: response.statusText };
      }

      const error = new Error(
        errorData.error || errorData.message || `HTTP ${response.status}: ${response.statusText}`
      ) as SafeFetchError;
      error.status = response.status;
      error.statusText = response.statusText;
      error.data = errorData;
      error.name = 'HTTPError';

      throw error;
    }

    // Parse JSON response
    const data = await response.json();
    return data;
  } catch (error) {
    // Re-throw if it's already our custom error
    if (error instanceof Error && ['TimeoutError', 'NetworkError', 'HTTPError'].includes(error.name)) {
      throw error;
    }

    // Wrap other errors
    const wrappedError = new Error(
      error instanceof Error ? error.message : 'An unexpected error occurred'
    ) as SafeFetchError;
    wrappedError.name = 'FetchError';
    throw wrappedError;
  }
}

/**
 * Get user-friendly error message
 */
export function getFetchErrorMessage(error: any): string {
  if (!error) return 'An unknown error occurred';

  // Handle our custom error types
  if (error.name === 'TimeoutError') {
    return 'Request timeout. Please check your connection and try again.';
  }

  if (error.name === 'NetworkError') {
    return 'Network error. Please check your internet connection.';
  }

  if (error.name === 'HTTPError') {
    if (error.status === 429) {
      return 'Too many requests. Please try again later.';
    }
    if (error.status === 401) {
      return 'Authentication required. Please sign in.';
    }
    if (error.status === 403) {
      return 'Access denied. You do not have permission.';
    }
    if (error.status === 404) {
      return 'Resource not found.';
    }
    if (error.status >= 500) {
      return 'Server error. Please try again later.';
    }
  }

  // Return the error message if available
  if (error.message) {
    return error.message;
  }

  return 'An unexpected error occurred. Please try again.';
}

/**
 * Check if error is a timeout error
 */
export function isTimeoutError(error: any): boolean {
  return error?.name === 'TimeoutError' || error?.name === 'AbortError';
}

/**
 * Check if error is a network error
 */
export function isNetworkError(error: any): boolean {
  return error?.name === 'NetworkError' || error?.message === 'Failed to fetch';
}

/**
 * Check if error is a server error (5xx)
 */
export function isServerError(error: any): boolean {
  return error?.status >= 500 && error?.status < 600;
}

/**
 * Check if error is a client error (4xx)
 */
export function isClientError(error: any): boolean {
  return error?.status >= 400 && error?.status < 500;
}
