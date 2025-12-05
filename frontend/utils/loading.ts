import { useState, useCallback } from 'react';

// Global loading state management
export interface LoadingState {
  isLoading: boolean;
  message?: string;
  progress?: number;
}

// Hook for managing individual component loading states
export function useLoading(initialState: boolean = false) {
  const [isLoading, setIsLoading] = useState(initialState);
  const [message, setMessage] = useState<string>('');
  const [progress, setProgress] = useState<number>(0);

  const startLoading = useCallback((loadingMessage?: string, initialProgress?: number) => {
    setIsLoading(true);
    if (loadingMessage) setMessage(loadingMessage);
    if (initialProgress !== undefined) setProgress(initialProgress);
  }, []);

  const updateProgress = useCallback((newProgress: number, newMessage?: string) => {
    setProgress(newProgress);
    if (newMessage) setMessage(newMessage);
  }, []);

  const stopLoading = useCallback((delay: number = 0) => {
    if (delay > 0) {
      setTimeout(() => {
        setIsLoading(false);
        setMessage('');
        setProgress(0);
      }, delay);
    } else {
      setIsLoading(false);
      setMessage('');
      setProgress(0);
    }
  }, []);

  return {
    isLoading,
    message,
    progress,
    startLoading,
    updateProgress,
    stopLoading,
    setIsLoading,
    setMessage,
    setProgress
  };
}

// Utility for handling async operations with loading states
export async function withLoading<T>(
  asyncFn: () => Promise<T>,
  loadingControls: ReturnType<typeof useLoading>,
  message?: string
): Promise<T> {
  try {
    loadingControls.startLoading(message);
    const result = await asyncFn();
    loadingControls.stopLoading(300);
    return result;
  } catch (error) {
    loadingControls.stopLoading();
    throw error;
  }
}

// Simulate loading progress for better UX
export function simulateProgress(
  updateFn: (progress: number) => void,
  duration: number = 2000,
  finalProgress: number = 90
) {
  let progress = 0;
  const increment = finalProgress / (duration / 100);
  
  const interval = setInterval(() => {
    progress += increment * (Math.random() * 0.5 + 0.5); // Add some randomness
    
    if (progress >= finalProgress) {
      progress = finalProgress;
      clearInterval(interval);
    }
    
    updateFn(Math.min(progress, finalProgress));
  }, 100);

  return () => clearInterval(interval);
}

// Loading messages for different operations
export const LOADING_MESSAGES = {
  // General
  LOADING: 'Loading...',
  PROCESSING: 'Processing...',
  SAVING: 'Saving...',
  DELETING: 'Deleting...',
  UPDATING: 'Updating...',
  
  // Authentication
  SIGNING_IN: 'Signing in...',
  SIGNING_OUT: 'Signing out...',
  SIGNING_UP: 'Creating account...',
  VERIFYING: 'Verifying...',
  
  // Data operations
  FETCHING_DATA: 'Fetching data...',
  UPLOADING: 'Uploading...',
  DOWNLOADING: 'Downloading...',
  SYNCING: 'Syncing...',
  
  // Form operations
  SUBMITTING_FORM: 'Submitting form...',
  VALIDATING: 'Validating...',
  
  // API calls
  CONTACTING_SERVER: 'Contacting server...',
  PROCESSING_REQUEST: 'Processing request...',
  
  // File operations
  UPLOADING_FILE: 'Uploading file...',
  PROCESSING_FILE: 'Processing file...',
  
  // Page navigation
  LOADING_PAGE: 'Loading page...',
  PREPARING_CONTENT: 'Preparing content...',
  
  // Services specific
  SCHEDULING_CONSULTATION: 'Scheduling consultation...',
  SUBMITTING_SUPPORT_REQUEST: 'Submitting support request...',
  PROCESSING_PAYMENT: 'Processing payment...',
  SENDING_MESSAGE: 'Sending message...',
  CREATING_TICKET: 'Creating support ticket...',
  BOOKING_SERVICE: 'Booking service...',
} as const;

// Loading configuration presets
export const LOADING_CONFIGS = {
  QUICK: { duration: 300, showProgress: false },
  NORMAL: { duration: 800, showProgress: true },
  SLOW: { duration: 1500, showProgress: true },
  UPLOAD: { duration: 3000, showProgress: true },
} as const;

// Debounce loading states to prevent flickering
export function useDebounceLoading(delay: number = 200) {
  const [isLoading, setIsLoading] = useState(false);
  const [debouncedIsLoading, setDebouncedIsLoading] = useState(false);

  const startLoading = useCallback(() => {
    setIsLoading(true);
    setDebouncedIsLoading(true);
  }, []);

  const stopLoading = useCallback(() => {
    setIsLoading(false);
    const timer = setTimeout(() => {
      setDebouncedIsLoading(false);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  return {
    isLoading,
    debouncedIsLoading,
    startLoading,
    stopLoading
  };
}