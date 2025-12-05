/**
 * Government Services Routes Handler
 * 
 * Handles government service requests including KRA PIN registration,
 * passport applications, tax returns filing, and other official services.
 */

import { Hono } from 'https://deno.land/x/hono@v3.4.1/mod.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

export const governmentRoutes = new Hono();

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

/**
 * @route GET /requests
 * @description Get government service requests
 */
governmentRoutes.get('/requests', async (c) => {
  try {
    const user = await requireAuth(c.req.raw);
    const status = c.req.query('status');
    const serviceType = c.req.query('service_type');
    
    // Check if user is admin
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('user_id', user.id)
      .single();
    
    const isAdmin = profile?.role === 'admin' || profile?.role === 'super_admin';
    
    let query = supabase
      .from('government_requests')
      .select(`
        *,
        user_profiles!government_requests_user_id_fkey(first_name, last_name, email),
        assigned_user:user_profiles!government_requests_assigned_to_fkey(first_name, last_name, email)
      `)
      .order('created_at', { ascending: false });
    
    if (!isAdmin) {
      query = query.eq('user_id', user.id);
    }
    
    if (status) {
      query = query.eq('status', status);
    }
    
    if (serviceType) {
      query = query.eq('service_type', serviceType);
    }
    
    const { data: requests, error } = await query;
    
    if (error) {
      console.log('Government requests fetch error:', error);
      return c.json({ error: 'Failed to fetch government requests' }, 500);
    }
    
    return c.json({ requests });
    
  } catch (error) {
    console.log('Government requests fetch error:', error);
    return c.json({ error: error.message }, 401);
  }
});

/**
 * @route POST /requests
 * @description Create a new government service request
 */
governmentRoutes.post('/requests', async (c) => {
  try {
    const user = await requireAuth(c.req.raw);
    const { 
      service_type, 
      title, 
      description, 
      priority = 'medium',
      documents_required = [],
      estimated_completion,
      metadata = {} 
    } = await c.req.json();
    
    if (!service_type || !title || !description) {
      return c.json({ error: 'Missing required fields' }, 400);
    }
    
    // Validate service type
    const validServiceTypes = [
      'kra_pin', 'passport', 'tax_returns', 'business_registration', 
      'work_permit', 'driving_license', 'id_card', 'birth_certificate'
    ];
    
    if (!validServiceTypes.includes(service_type)) {
      return c.json({ error: 'Invalid service type' }, 400);
    }
    
    const { data: request, error } = await supabase
      .from('government_requests')
      .insert({
        user_id: user.id,
        service_type,
        title,
        description,
        priority,
        documents_required,
        estimated_completion,
        status: 'submitted',
        metadata
      })
      .select(`
        *,
        user_profiles!government_requests_user_id_fkey(first_name, last_name, email)
      `)
      .single();
    
    if (error) {
      console.log('Government request creation error:', error);
      return c.json({ error: 'Failed to create government request' }, 500);
    }
    
    // Log activity
    await supabase
      .from('user_activity')
      .insert({
        user_id: user.id,
        activity_type: 'government_request_created',
        activity_data: { 
          request_id: request.id,
          service_type 
        },
        resource_type: 'government_request',
        resource_id: request.id
      });
    
    return c.json({ 
      message: 'Government service request created successfully', 
      request 
    });
    
  } catch (error) {
    console.log('Government request creation error:', error);
    return c.json({ error: error.message }, 401);
  }
});

/**
 * @route GET /services
 * @description Get available government services
 */
governmentRoutes.get('/services', async (c) => {
  const services = [
    {
      type: 'kra_pin',
      name: 'KRA PIN Registration',
      description: 'Register for Kenya Revenue Authority Personal Identification Number',
      documents: ['ID/Passport copy', 'Passport photo'],
      processing_time: '3-5 business days',
      fee: 'Free'
    },
    {
      type: 'passport',
      name: 'Passport Application',
      description: 'Apply for new passport or renewal',
      documents: ['ID copy', 'Birth certificate', 'Passport photos'],
      processing_time: '2-4 weeks',
      fee: 'KSh 4,550 (32 pages) / KSh 6,050 (48 pages) / KSh 7,550 (64 pages)'
    },
    {
      type: 'tax_returns',
      name: 'Tax Returns Filing',
      description: 'File annual tax returns with KRA',
      documents: ['P9 forms', 'Bank statements', 'Investment certificates'],
      processing_time: '1-2 business days',
      fee: 'Service fee applies'
    },
    {
      type: 'business_registration',
      name: 'Business Registration',
      description: 'Register business name and obtain certificates',
      documents: ['ID copies', 'Business name search', 'Memorandum'],
      processing_time: '5-10 business days',
      fee: 'Varies by business type'
    }
  ];
  
  return c.json({ services });
});

export default governmentRoutes;