/**
 * Backward compatibility API file
 * 
 * Re-exports main APIs from the new MongoDB API modules
 * Types are also available here for compatibility
 */

// Re-export main APIs for backward compatibility
export { authAPI } from '../components/api/auth';
export { contactAPI } from '../components/api/contact';
export { consultationAPI } from '../components/api/consultation';

// Database types for TypeScript - moved to components/models/types.ts
export interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  service: string;
  urgency: string;
  message: string;
  createdAt: string;
  status: 'pending' | 'in_progress' | 'resolved' | 'closed';
}

export interface Consultation {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  businessType: string;
  consultationType: string;
  preferredDate: string;
  preferredTime: string;
  description: string;
  urgency: string;
  packageId: string;
  createdAt: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: 'user' | 'admin';
  createdAt: string;
  updatedAt: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  author: string;
  category: string;
  tags: string[];
  featuredImage?: string;
  published: boolean;
  views: number;
  likes: number;
  createdAt: string;
  updatedAt: string;
}