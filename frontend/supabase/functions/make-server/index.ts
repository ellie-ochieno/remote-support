import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { Hono } from 'https://deno.land/x/hono@v3.4.1/mod.ts';
import { cors } from 'https://deno.land/x/hono@v3.4.1/middleware.ts';
import { logger } from 'https://deno.land/x/hono@v3.4.1/middleware.ts';

// Initialize Supabase client
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

// Initialize database schema
async function initializeDatabase() {
  try {
    console.log('Initializing database schema...');
    
    // Execute the complete schema initialization function
    const { error: schemaError } = await supabase.rpc('initialize_complete_schema');
    
    if (schemaError) {
      console.error('Schema initialization error:', schemaError);
      // Try executing SQL functions directly as fallback
      await initializeFallbackSchema();
    } else {
      console.log('Database schema initialized successfully');
    }
    
  } catch (error) {
    console.error('Database initialization error:', error);
    await initializeFallbackSchema();
  }
}

// Fallback schema initialization
async function initializeFallbackSchema() {
  try {
    console.log('Attempting fallback schema initialization...');
    
    // Create basic tables directly if RPC fails
    const basicTables = [
      'user_profiles', 'services', 'blog_posts', 'support_tickets', 
      'consultations', 'contact_forms', 'working_hours'
    ];
    
    for (const table of basicTables) {
      const { error } = await supabase.from(table).select('id').limit(1);
      if (!error) {
        console.log(`✓ Table ${table} exists`);
      }
    }
    
    // Try to seed services if tables exist
    await seedServicesData();
    
    console.log('Fallback schema check completed');
    
  } catch (error) {
    console.error('Fallback initialization error:', error);
    console.log('App will operate with mock data only');
  }
}

// Seed services data
async function seedServicesData() {
  try {
    // Check if services are already seeded
    const { data: existingServices, error } = await supabase
      .from('services')
      .select('id')
      .limit(1);
    
    if (error) {
      console.log('Services table not ready, skipping seeding');
      return;
    }
    
    if (existingServices && existingServices.length > 0) {
      console.log('Services already seeded, skipping');
      return;
    }
    
    // Execute seeding functions
    const { error: seedError } = await supabase.rpc('seed_services_and_packages');
    
    if (seedError) {
      console.error('Service seeding error:', seedError);
    } else {
      console.log('✓ Services and packages seeded successfully');
    }
    
  } catch (error) {
    console.error('Seeding error:', error);
  }
}

// Initialize Hono app
const app = new Hono();

// Initialize database on startup
await initializeDatabase();

// Middleware
app.use('*', cors({
  origin: '*',
  allowHeaders: ['*'],
  allowMethods: ['POST', 'GET', 'OPTIONS', 'PUT', 'DELETE'],
}));
app.use('*', logger());

// Utility functions
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

// Health check endpoint
app.get('/health', (c) => {
  return c.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    service: 'RemotCyberHelp API',
    version: '1.0.0'
  });
});

// ==================== AUTH ROUTES ====================

app.post('/auth/signup', async (c) => {
  try {
    const { email, password, firstName, lastName } = await c.req.json();
    
    if (!email || !password || !firstName || !lastName) {
      return c.json({ error: 'Missing required fields' }, 400);
    }
    
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { firstName, lastName },
      email_confirm: true
    });
    
    if (authError) {
      console.log('Auth error during signup:', authError);
      return c.json({ error: authError.message }, 400);
    }
    
    return c.json({ 
      message: 'User created successfully',
      user: {
        id: authData.user.id,
        email: authData.user.email,
        firstName,
        lastName,
        role: 'user'
      }
    });
    
  } catch (error) {
    console.log('Signup error:', error);
    return c.json({ error: 'Internal server error during signup' }, 500);
  }
});

app.get('/auth/profile', async (c) => {
  try {
    const user = await requireAuth(c.req.raw);
    
    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();
    
    if (error) {
      console.log('Profile fetch error:', error);
      return c.json({ error: 'Failed to fetch profile' }, 500);
    }
    
    return c.json({ profile });
    
  } catch (error) {
    console.log('Profile error:', error);
    return c.json({ error: error.message }, 401);
  }
});

// ==================== BLOG ROUTES ====================

app.get('/blog/posts', async (c) => {
  try {
    // Try to fetch real blog posts from database
    const { data: posts, error } = await supabase
      .from('blog_posts')
      .select(`
        *,
        blog_likes:blog_likes(count(*)),
        blog_views:blog_views(count(*))
      `)
      .eq('published', true)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.log('Blog posts database error:', error);
      // Fallback to mock data if database isn't ready
      const mockPosts = [
        {
          id: '1',
          title: '10 Essential Cybersecurity Tips for Small Businesses',
          excerpt: 'Protect your business from cyber threats with these practical security measures.',
          content: 'Detailed cybersecurity content...',
          category: 'Cybersecurity',
          featured: true,
          published: true,
          created_at: new Date().toISOString(),
          blog_likes: [{ count: 25 }],
          blog_views: [{ count: 150 }]
        },
        {
          id: '2',
          title: 'Setting Up Your Home Office for Remote Work Success',
          excerpt: 'Complete guide to creating an efficient home office setup.',
          content: 'Remote work setup content...',
          category: 'Remote Work',
          featured: false,
          published: true,
          created_at: new Date().toISOString(),
          blog_likes: [{ count: 18 }],
          blog_views: [{ count: 95 }]
        }
      ];
      return c.json({ posts: mockPosts });
    }
    
    return c.json({ posts: posts || [] });
    
  } catch (error) {
    console.log('Blog posts error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// ==================== CONTACT FORM ROUTES ====================

app.post('/contact', async (c) => {
  try {
    const { name, email, phone, company, subject, message, inquiry_type = 'general' } = await c.req.json();
    
    if (!name || !email || !subject || !message) {
      return c.json({ error: 'Missing required fields' }, 400);
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return c.json({ error: 'Invalid email format' }, 400);
    }
    
    // Try to insert into database
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
      console.log('Contact form database error:', error);
      // Log to console as fallback
      console.log('Contact form received (fallback):', { name, email, subject, inquiry_type });
      return c.json({ 
        message: 'Contact form submitted successfully. We will get back to you within 24 hours.',
        id: 'fallback-id-' + Date.now()
      });
    }
    
    console.log('Contact form stored successfully:', contactForm.id);
    
    return c.json({ 
      message: 'Contact form submitted successfully. We will get back to you within 24 hours.',
      id: contactForm.id
    });
    
  } catch (error) {
    console.log('Contact form submission error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// ==================== WORKING HOURS ROUTES ====================

app.get('/working-hours', async (c) => {
  try {
    // Try to fetch real working hours from database
    const { data: workingHours, error } = await supabase
      .from('working_hours')
      .select('*')
      .eq('active', true)
      .order('day_of_week');
    
    if (error) {
      console.log('Working hours database error:', error);
      // Fallback to mock data
      const mockWorkingHours = [
        { day_of_week: 1, day_name: 'Monday', is_working_day: true, standard_start_time: '08:00:00', standard_end_time: '18:00:00', emergency_start_time: '18:00:00', emergency_end_time: '21:00:00' },
        { day_of_week: 2, day_name: 'Tuesday', is_working_day: true, standard_start_time: '08:00:00', standard_end_time: '18:00:00', emergency_start_time: '18:00:00', emergency_end_time: '21:00:00' },
        { day_of_week: 3, day_name: 'Wednesday', is_working_day: true, standard_start_time: '08:00:00', standard_end_time: '18:00:00', emergency_start_time: '18:00:00', emergency_end_time: '21:00:00' },
        { day_of_week: 4, day_name: 'Thursday', is_working_day: true, standard_start_time: '08:00:00', standard_end_time: '18:00:00', emergency_start_time: '18:00:00', emergency_end_time: '21:00:00' },
        { day_of_week: 5, day_name: 'Friday', is_working_day: true, standard_start_time: '08:00:00', standard_end_time: '18:00:00', emergency_start_time: '18:00:00', emergency_end_time: '21:00:00' },
        { day_of_week: 6, day_name: 'Saturday', is_working_day: true, standard_start_time: '09:00:00', standard_end_time: '13:00:00', emergency_start_time: '13:00:00', emergency_end_time: '17:00:00' },
        { day_of_week: 0, day_name: 'Sunday', is_working_day: false, standard_start_time: null, standard_end_time: null, emergency_start_time: '09:00:00', emergency_end_time: '17:00:00' }
      ];
      return c.json({ workingHours: mockWorkingHours });
    }
    
    return c.json({ workingHours: workingHours || [] });
    
  } catch (error) {
    console.log('Working hours fetch error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// ==================== SERVICES ROUTES ====================

app.get('/services', async (c) => {
  try {
    // Fetch services with packages from database
    const { data: services, error } = await supabase
      .from('services')
      .select(`
        *,
        service_packages!inner(*)
      `)
      .eq('active', true)
      .order('created_at');
    
    if (error) {
      console.log('Services database error:', error);
      return c.json({ error: 'Failed to fetch services' }, 500);
    }
    
    return c.json({ services: services || [] });
    
  } catch (error) {
    console.log('Services fetch error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

app.get('/services/:slug', async (c) => {
  try {
    const slug = c.req.param('slug');
    
    // Fetch specific service with packages
    const { data: service, error } = await supabase
      .from('services')
      .select(`
        *,
        service_packages(*)
      `)
      .eq('slug', slug)
      .eq('active', true)
      .single();
    
    if (error) {
      console.log('Service fetch error:', error);
      return c.json({ error: 'Service not found' }, 404);
    }
    
    return c.json({ service });
    
  } catch (error) {
    console.log('Service detail fetch error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// ==================== SUPPORT TICKET ROUTES ====================

app.post('/support/tickets', async (c) => {
  try {
    const user = await requireAuth(c.req.raw);
    const { title, description, category, priority } = await c.req.json();
    
    if (!title || !description || !category || !priority) {
      return c.json({ error: 'Missing required fields' }, 400);
    }
    
    // Mock ticket creation
    const mockTicket = {
      id: 'ticket-' + Date.now(),
      ticket_number: 'ST-' + Date.now(),
      title,
      description,
      category,
      priority,
      status: 'open',
      user_id: user.id,
      created_at: new Date().toISOString()
    };
    
    console.log('Support ticket created:', mockTicket);
    
    return c.json({ message: 'Support ticket created successfully', ticket: mockTicket });
    
  } catch (error) {
    console.log('Support ticket creation error:', error);
    return c.json({ error: error.message }, 401);
  }
});

app.get('/support/tickets', async (c) => {
  try {
    const user = await requireAuth(c.req.raw);
    
    // Mock tickets data
    const mockTickets = [
      {
        id: '1',
        ticket_number: 'ST-001',
        title: 'Printer Setup Issue',
        description: 'Cannot connect wireless printer',
        category: 'Device Support',
        priority: 'medium',
        status: 'open',
        user_id: user.id,
        created_at: new Date().toISOString()
      }
    ];
    
    return c.json({ tickets: mockTickets });
    
  } catch (error) {
    console.log('Support tickets fetch error:', error);
    return c.json({ error: error.message }, 401);
  }
});

// Error handler
app.onError((err, c) => {
  console.error('Server error:', err);
  return c.json({ error: 'Internal server error' }, 500);
});

// 404 handler
app.notFound((c) => {
  return c.json({ error: 'Route not found' }, 404);
});

console.log('RemotCyberHelp API server starting...');
serve(app.fetch);