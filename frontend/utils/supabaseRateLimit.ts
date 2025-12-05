// This file has been removed as part of MongoDB migration
// Rate limiting is now handled at the backend level
console.warn('supabaseRateLimit.ts is deprecated. Rate limiting is now handled in the backend.');

// Deprecated compatibility exports
export const withRateLimit = async (
  operationType: string,
  operation: () => Promise<void>,
  clientId?: string,
  metadata?: any
) => {
  console.warn('withRateLimit from supabaseRateLimit is deprecated. Rate limiting is now handled in the backend.');
  // Execute the operation directly since rate limiting is now in backend
  return await operation();
};

export const rateLimit = {
  // Deprecated - use backend rate limiting instead
  checkLimit: () => true,
  updateLimit: () => {},
  getRemainingAttempts: () => 999
};

export default rateLimit;