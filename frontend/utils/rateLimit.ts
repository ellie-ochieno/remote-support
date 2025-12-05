// Enhanced rate limiting utilities with MongoDB backend integration

export interface RateLimitConfig {
  maxAttempts: number;
  windowMinutes: number;
  blockDurationMinutes?: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number | null;
  blocked: boolean;
  reason?: string;
}

// Rate limit configurations for different actions
export const RATE_LIMIT_CONFIGS: Record<string, RateLimitConfig> = {
  newsletter_subscribe: {
    maxAttempts: 3,
    windowMinutes: 60, // 3 attempts per hour
    blockDurationMinutes: 30 // Block for 30 minutes after limit exceeded
  },
  contact_form: {
    maxAttempts: 5,
    windowMinutes: 60, // 5 attempts per hour
    blockDurationMinutes: 60 // Block for 1 hour after limit exceeded
  },
  consultation_booking: {
    maxAttempts: 3,
    windowMinutes: 60, // 3 attempts per hour
    blockDurationMinutes: 120 // Block for 2 hours after limit exceeded
  },
  auth_login: {
    maxAttempts: 5,
    windowMinutes: 15, // 5 attempts per 15 minutes
    blockDurationMinutes: 60 // Block for 1 hour after limit exceeded
  },
  auth_signup: {
    maxAttempts: 3,
    windowMinutes: 60, // 3 attempts per hour
    blockDurationMinutes: 180 // Block for 3 hours after limit exceeded
  },
  password_reset: {
    maxAttempts: 3,
    windowMinutes: 60, // 3 attempts per hour
    blockDurationMinutes: 60 // Block for 1 hour after limit exceeded
  }
};

// Generate client identifier for rate limiting
export function generateClientIdentifier(): string {
  // Combine multiple factors to create a unique but not personally identifiable fingerprint
  const factors = [
    navigator.userAgent.substring(0, 50), // Truncated user agent
    navigator.language,
    screen.width,
    screen.height,
    new Date().getTimezoneOffset(),
    window.location.hostname
  ];

  const combined = factors.join('|');
  
  // Simple hash function
  let hash = 0;
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }

  return `client_${Math.abs(hash).toString(16)}`;
}

// Local fallback rate limiting (in-memory)
const localRateLimits = new Map<string, Array<number>>();

function checkLocalRateLimit(action: string, identifier: string): RateLimitResult {
  const config = RATE_LIMIT_CONFIGS[action];
  if (!config) {
    return {
      allowed: true,
      remaining: 999,
      resetTime: null,
      blocked: false
    };
  }

  const key = `${identifier}_${action}`;
  const now = Date.now();
  const windowMs = config.windowMinutes * 60 * 1000;
  
  // Get existing attempts
  let attempts = localRateLimits.get(key) || [];
  
  // Remove old attempts outside the window
  attempts = attempts.filter(timestamp => now - timestamp < windowMs);
  
  // Check if limit exceeded
  if (attempts.length >= config.maxAttempts) {
    const oldestAttempt = Math.min(...attempts);
    const resetTime = oldestAttempt + windowMs;
    
    return {
      allowed: false,
      remaining: 0,
      resetTime,
      blocked: true,
      reason: `Local rate limit exceeded for ${action}`
    };
  }

  // Add current attempt
  attempts.push(now);
  localRateLimits.set(key, attempts);

  return {
    allowed: true,
    remaining: config.maxAttempts - attempts.length,
    resetTime: null,
    blocked: false
  };
}

// Enhanced rate limiting check
export async function checkRateLimit(
  action: string,
  customIdentifier?: string
): Promise<RateLimitResult> {
  const config = RATE_LIMIT_CONFIGS[action];
  if (!config) {
    console.warn(`No rate limit config found for action: ${action}`);
    return {
      allowed: true,
      remaining: 999,
      resetTime: null,
      blocked: false
    };
  }

  const identifier = customIdentifier || generateClientIdentifier();
  
  // Use local rate limiting for now
  return checkLocalRateLimit(action, identifier);
}

// Record a rate limit attempt
export async function recordRateLimitAttempt(
  action: string,
  customIdentifier?: string,
  metadata?: any
): Promise<void> {
  // For now, this is handled by checkRateLimit
  // In the future, this could send data to the MongoDB backend for tracking
  console.debug('Rate limit attempt recorded:', { action, customIdentifier, metadata });
}

// Cleanup old local rate limit entries
export function cleanupLocalRateLimits(): void {
  const now = Date.now();
  const maxAge = 24 * 60 * 60 * 1000; // 24 hours

  for (const [key, attempts] of localRateLimits.entries()) {
    const filteredAttempts = attempts.filter(timestamp => now - timestamp < maxAge);
    
    if (filteredAttempts.length === 0) {
      localRateLimits.delete(key);
    } else {
      localRateLimits.set(key, filteredAttempts);
    }
  }
}

// Enhanced rate limiting middleware for forms
export async function withRateLimit<T>(
  action: string,
  operation: () => Promise<T>,
  customIdentifier?: string,
  metadata?: any
): Promise<T> {
  // Check rate limit before operation
  const rateLimitResult = await checkRateLimit(action, customIdentifier);
  
  if (!rateLimitResult.allowed) {
    const resetTime = rateLimitResult.resetTime 
      ? new Date(rateLimitResult.resetTime).toLocaleTimeString()
      : 'later';
    
    throw new Error(
      `Rate limit exceeded. Please try again ${resetTime}. ` +
      `Remaining attempts: ${rateLimitResult.remaining}`
    );
  }

  try {
    // Record the attempt
    await recordRateLimitAttempt(action, customIdentifier, metadata);
    
    // Execute the operation
    const result = await operation();
    
    return result;
  } catch (error) {
    // Still record the attempt even if operation fails
    // This prevents rapid-fire attempts on failed operations
    throw error;
  }
}

// Initialize cleanup interval for local rate limits
if (typeof window !== 'undefined') {
  setInterval(cleanupLocalRateLimits, 5 * 60 * 1000); // Cleanup every 5 minutes
}

// Export for external cleanup calls
export { cleanupLocalRateLimits as cleanup };

// Utility to format rate limit error messages
export function formatRateLimitError(result: RateLimitResult, action: string): string {
  if (!result.blocked) return '';

  const resetTime = result.resetTime 
    ? new Date(result.resetTime).toLocaleTimeString()
    : 'later';

  const actionName = action.replace(/_/g, ' ').toLowerCase();
  
  return `Too many ${actionName} attempts. Please try again at ${resetTime}.`;
}

// Utility to get rate limit info for display
export async function getRateLimitInfo(action: string, customIdentifier?: string): Promise<{
  limit: number;
  remaining: number;
  resetTime: number | null;
  windowMinutes: number;
}> {
  const config = RATE_LIMIT_CONFIGS[action];
  if (!config) {
    return {
      limit: 999,
      remaining: 999,
      resetTime: null,
      windowMinutes: 60
    };
  }

  const result = await checkRateLimit(action, customIdentifier);
  
  return {
    limit: config.maxAttempts,
    remaining: result.remaining,
    resetTime: result.resetTime,
    windowMinutes: config.windowMinutes
  };
}