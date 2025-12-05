/**
 * Consultation Routes Handler
 * 
 * Handles all consultation-related API endpoints including scheduling,
 * management, and tracking of consultations between users and consultants.
 */

import { Hono } from 'https://deno.land/x/hono@v3.4.1/mod.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

export const consultationRoutes = new Hono();

// Utility functions for auth
async function requireAuth(request: Request) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Unauthorized');
  }
  
  const token = authHeader.substring(7);
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) {
    throw new Error('Unauthorized');
  }
  return user;
}

async function requireRole(request: Request, requiredRoles: string[]) {
  const user = await requireAuth(request);
  
  const { data: profile, error } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('user_id', user.id)
    .single();
    
  if (error || !profile || !requiredRoles.includes(profile.role)) {
    throw new Error('Insufficient permissions');
  }
  
  return { user, profile };
}

/**
 * @route GET /consultations
 * @description Get consultations (user sees own, admin sees all)
 */
consultationRoutes.get('/', async (c) => {
  try {
    const user = await requireAuth(c.req.raw);
    const status = c.req.query('status');
    const consultationType = c.req.query('type');
    
    // Check if user is admin
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('user_id', user.id)
      .single();
    
    const isAdmin = profile?.role === 'admin' || profile?.role === 'super_admin';
    
    let query = supabase
      .from('consultations')
      .select(`
        *,
        user_profiles!consultations_user_id_fkey(first_name, last_name, email),
        consultant:user_profiles!consultations_consultant_id_fkey(first_name, last_name, email)
      `)
      .order('created_at', { ascending: false });
    
    if (!isAdmin) {
      // Users can see their own consultations or ones they're consulting
      query = query.or(`user_id.eq.${user.id},consultant_id.eq.${user.id}`);
    }
    
    if (status) {
      query = query.eq('status', status);
    }
    
    if (consultationType) {
      query = query.eq('consultation_type', consultationType);
    }
    
    const { data: consultations, error } = await query;
    
    if (error) {
      console.log('Consultations fetch error:', error);
      return c.json({ error: 'Failed to fetch consultations' }, 500);
    }
    
    return c.json({ consultations });
    
  } catch (error) {
    console.log('Consultations fetch error:', error);
    return c.json({ error: error.message }, 401);
  }
});

/**
 * @route POST /consultations
 * @description Create a new consultation
 */
consultationRoutes.post('/', async (c) => {
  try {
    const user = await requireAuth(c.req.raw);
    const { 
      service_type, 
      consultation_type, 
      title, 
      description, 
      scheduled_at, 
      duration_minutes = 60,
      metadata = {} 
    } = await c.req.json();
    
    if (!service_type || !consultation_type || !title || !description) {
      return c.json({ error: 'Missing required fields' }, 400);
    }
    
    // Validate consultation_type
    const validTypes = ['scheduled', 'instant', 'emergency'];
    if (!validTypes.includes(consultation_type)) {
      return c.json({ error: 'Invalid consultation type' }, 400);
    }
    
    // For scheduled consultations, require scheduled_at
    if (consultation_type === 'scheduled' && !scheduled_at) {
      return c.json({ error: 'Scheduled consultations require a scheduled_at time' }, 400);
    }
    
    const { data: consultation, error } = await supabase
      .from('consultations')
      .insert({
        user_id: user.id,
        service_type,
        consultation_type,
        title,
        description,
        scheduled_at,
        duration_minutes,
        status: 'scheduled',
        metadata
      })
      .select(`
        *,
        user_profiles!consultations_user_id_fkey(first_name, last_name, email)
      `)
      .single();
    
    if (error) {
      console.log('Consultation creation error:', error);
      return c.json({ error: 'Failed to create consultation' }, 500);
    }
    
    // Log activity
    await supabase
      .from('user_activity')
      .insert({
        user_id: user.id,
        activity_type: 'consultation_created',
        activity_data: { 
          consultation_id: consultation.id,
          consultation_type,
          service_type 
        },
        resource_type: 'consultation',
        resource_id: consultation.id
      });
    
    return c.json({ 
      message: 'Consultation created successfully', 
      consultation 
    });
    
  } catch (error) {
    console.log('Consultation creation error:', error);
    return c.json({ error: error.message }, 401);
  }
});

/**
 * @route PUT /consultations/:id
 * @description Update a consultation
 */
consultationRoutes.put('/:id', async (c) => {
  try {
    const user = await requireAuth(c.req.raw);
    const consultationId = c.req.param('id');
    const updates = await c.req.json();
    
    // Get existing consultation to check permissions
    const { data: existingConsultation, error: fetchError } = await supabase
      .from('consultations')
      .select('user_id, consultant_id, status')
      .eq('id', consultationId)
      .single();
    
    if (fetchError || !existingConsultation) {
      return c.json({ error: 'Consultation not found' }, 404);
    }
    
    // Check permissions
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('user_id', user.id)
      .single();
    
    const isAdmin = profile?.role === 'admin' || profile?.role === 'super_admin';
    const isOwner = existingConsultation.user_id === user.id;
    const isConsultant = existingConsultation.consultant_id === user.id;
    
    if (!isAdmin && !isOwner && !isConsultant) {
      return c.json({ error: 'Access denied' }, 403);
    }
    
    // Regular users can only update certain fields
    let allowedUpdates = updates;
    if (!isAdmin && !isConsultant) {
      allowedUpdates = {
        title: updates.title,
        description: updates.description,
        scheduled_at: updates.scheduled_at,
        duration_minutes: updates.duration_minutes,
        rating: updates.rating,
        feedback: updates.feedback
      };
      // Remove undefined values
      Object.keys(allowedUpdates).forEach(key => 
        allowedUpdates[key] === undefined && delete allowedUpdates[key]
      );
    }
    
    const { data: consultation, error } = await supabase
      .from('consultations')
      .update(allowedUpdates)
      .eq('id', consultationId)
      .select(`
        *,
        user_profiles!consultations_user_id_fkey(first_name, last_name, email),
        consultant:user_profiles!consultations_consultant_id_fkey(first_name, last_name, email)
      `)
      .single();
    
    if (error) {
      console.log('Consultation update error:', error);
      return c.json({ error: 'Failed to update consultation' }, 500);
    }
    
    return c.json({ 
      message: 'Consultation updated successfully', 
      consultation 
    });
    
  } catch (error) {
    console.log('Consultation update error:', error);
    return c.json({ error: error.message }, 401);
  }
});

export default consultationRoutes;