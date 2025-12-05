/**
 * Contact Form Routes Handler
 * 
 * Handles contact form submissions and management for RemotCyberHelp.
 */

import { Hono } from 'https://deno.land/x/hono@v3.4.1/mod.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

export const contactRoutes = new Hono();

async function requireRole(request: Request, requiredRoles: string[]) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Unauthorized');
  }
  
  const token = authHeader.substring(7);
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) {
    throw new Error('Unauthorized');
  }
  
  const { data: profile, error: profileError } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('user_id', user.id)
    .single();
    
  if (profileError || !profile || !requiredRoles.includes(profile.role)) {
    throw new Error('Insufficient permissions');
  }
  
  return { user, profile };
}

/**
 * @route POST /
 * @description Submit a contact form
 */
contactRoutes.post('/', async (c) => {
  try {
    const { 
      name, 
      email, 
      phone, 
      company, 
      subject, 
      message, 
      inquiry_type = 'general' 
    } = await c.req.json();
    
    if (!name || !email || !subject || !message) {
      return c.json({ error: 'Missing required fields' }, 400);
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return c.json({ error: 'Invalid email format' }, 400);
    }
    
    const { data: contactForm, error } = await supabase
      .from('contact_forms')
      .insert({
        name,
        email,
        phone,
        company,
        subject,
        message,
        inquiry_type,
        status: 'new'
      })
      .select()
      .single();
    
    if (error) {
      console.log('Contact form creation error:', error);
      return c.json({ error: 'Failed to submit contact form' }, 500);
    }
    
    // Send notification email (if email service is configured)
    try {
      await sendNotificationEmail(contactForm);
    } catch (emailError) {
      console.log('Email notification error:', emailError);
      // Don't fail the request if email fails
    }
    
    return c.json({ 
      message: 'Contact form submitted successfully. We will get back to you within 24 hours.',
      id: contactForm.id
    });
    
  } catch (error) {
    console.log('Contact form submission error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

/**
 * @route GET /admin/contact-forms
 * @description Get all contact forms (admin only)
 */
contactRoutes.get('/admin/contact-forms', async (c) => {
  try {
    await requireRole(c.req.raw, ['admin', 'super_admin']);
    
    const status = c.req.query('status');
    const inquiryType = c.req.query('inquiry_type');
    const limit = parseInt(c.req.query('limit') || '50');
    const offset = parseInt(c.req.query('offset') || '0');
    
    let query = supabase
      .from('contact_forms')
      .select(`
        *,
        responded_by_user:user_profiles!contact_forms_responded_by_fkey(first_name, last_name, email)
      `)
      .order('created_at', { ascending: false });
    
    if (status) {
      query = query.eq('status', status);
    }
    
    if (inquiryType) {
      query = query.eq('inquiry_type', inquiryType);
    }
    
    query = query.range(offset, offset + limit - 1);
    
    const { data: contactForms, error } = await query;
    
    if (error) {
      console.log('Contact forms fetch error:', error);
      return c.json({ error: 'Failed to fetch contact forms' }, 500);
    }
    
    return c.json({ contactForms });
    
  } catch (error) {
    console.log('Contact forms fetch error:', error);
    return c.json({ error: error.message }, 403);
  }
});

/**
 * Send notification email for new contact form
 */
async function sendNotificationEmail(contactForm: any) {
  // This would integrate with your email service (SMTP, SendGrid, etc.)
  // For now, we'll just log it
  console.log('New contact form received:', {
    name: contactForm.name,
    email: contactForm.email,
    subject: contactForm.subject,
    inquiry_type: contactForm.inquiry_type
  });
}

export default contactRoutes;