// This file has been removed as part of MongoDB migration
// All functionality moved to /components/api/ modules

// Deprecated compatibility exports for existing components
console.warn('lib/supabase.ts is deprecated. Use /components/api/ modules instead.');

// Newsletter service compatibility wrapper
export const newsletterService = {
  async subscribe(email: string, source: string = 'general') {
    console.warn('newsletterService from lib/supabase is deprecated. Use contact API instead.');
    
    // Use the contact API as a fallback for newsletter subscriptions
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'Newsletter Subscriber',
          email: email,
          subject: 'Newsletter Subscription',
          message: `Newsletter subscription from ${source}`,
          source: 'newsletter'
        }),
      });

      if (!response.ok) {
        throw new Error('Newsletter subscription failed');
      }

      return await response.json();
    } catch (error) {
      console.error('Newsletter subscription error:', error);
      throw error;
    }
  }
};

export default {
  newsletterService
};