-- ==================== CUSTOM TYPES ====================

-- Function to create custom types
CREATE OR REPLACE FUNCTION create_custom_types()
RETURNS void
LANGUAGE sql
AS $$
  -- User roles enum
  DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('user', 'admin', 'super_admin');
  EXCEPTION
    WHEN duplicate_object THEN null;
  END $$;

  -- User status enum
  DO $$ BEGIN
    CREATE TYPE user_status AS ENUM ('active', 'inactive', 'suspended');
  EXCEPTION
    WHEN duplicate_object THEN null;
  END $$;

  -- Support ticket status enum
  DO $$ BEGIN
    CREATE TYPE ticket_status AS ENUM ('open', 'in_progress', 'resolved', 'closed');
  EXCEPTION
    WHEN duplicate_object THEN null;
  END $$;

  -- Support ticket priority enum
  DO $$ BEGIN
    CREATE TYPE ticket_priority AS ENUM ('low', 'medium', 'high', 'critical');
  EXCEPTION
    WHEN duplicate_object THEN null;
  END $$;

  -- Consultation status enum
  DO $$ BEGIN
    CREATE TYPE consultation_status AS ENUM ('scheduled', 'completed', 'cancelled', 'rescheduled');
  EXCEPTION
    WHEN duplicate_object THEN null;
  END $$;

  -- Government request status enum
  DO $$ BEGIN
    CREATE TYPE gov_request_status AS ENUM ('submitted', 'in_progress', 'completed', 'rejected');
  EXCEPTION
    WHEN duplicate_object THEN null;
  END $$;
$$;

-- ==================== USERS TABLE ====================

-- Function to create users table
CREATE OR REPLACE FUNCTION create_users_table()
RETURNS void
LANGUAGE sql
AS $$
  -- User profiles table
  CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role user_role DEFAULT 'user',
    status user_status DEFAULT 'active',
    avatar_url TEXT,
    phone VARCHAR(20),
    location VARCHAR(255),
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE
  );

  -- Create indexes
  CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
  CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
  CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);
  CREATE INDEX IF NOT EXISTS idx_user_profiles_status ON user_profiles(status);

  -- Enable RLS
  ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

  -- Create RLS policies
  DO $$ BEGIN
    -- Users can view their own profile
    CREATE POLICY "Users can view own profile" ON user_profiles
      FOR SELECT USING (auth.uid() = user_id);
  EXCEPTION
    WHEN duplicate_object THEN null;
  END $$;

  DO $$ BEGIN
    -- Users can update their own profile
    CREATE POLICY "Users can update own profile" ON user_profiles
      FOR UPDATE USING (auth.uid() = user_id);
  EXCEPTION
    WHEN duplicate_object THEN null;
  END $$;

  DO $$ BEGIN
    -- Admins can view all profiles
    CREATE POLICY "Admins can view all profiles" ON user_profiles
      FOR SELECT USING (
        EXISTS (
          SELECT 1 FROM user_profiles up 
          WHERE up.user_id = auth.uid() 
          AND up.role IN ('admin', 'super_admin')
        )
      );
  EXCEPTION
    WHEN duplicate_object THEN null;
  END $$;

  -- Create trigger for updated_at
  CREATE OR REPLACE FUNCTION update_updated_at_column()
  RETURNS TRIGGER AS $$
  BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
  END;
  $$ language 'plpgsql';

  DO $$ BEGIN
    CREATE TRIGGER update_user_profiles_updated_at 
      BEFORE UPDATE ON user_profiles 
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  EXCEPTION
    WHEN duplicate_object THEN null;
  END $$;
$$;

-- ==================== BLOG TABLES ====================

-- Function to create blog posts table
CREATE OR REPLACE FUNCTION create_blog_posts_table()
RETURNS void
LANGUAGE sql
AS $$
  -- Blog posts table
  CREATE TABLE IF NOT EXISTS blog_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE,
    content TEXT NOT NULL,
    excerpt TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    featured BOOLEAN DEFAULT false,
    published BOOLEAN DEFAULT false,
    author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    image_url TEXT,
    meta_description TEXT,
    tags TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    published_at TIMESTAMP WITH TIME ZONE
  );

  -- Create indexes
  CREATE INDEX IF NOT EXISTS idx_blog_posts_category ON blog_posts(category);
  CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON blog_posts(published);
  CREATE INDEX IF NOT EXISTS idx_blog_posts_featured ON blog_posts(featured);
  CREATE INDEX IF NOT EXISTS idx_blog_posts_author ON blog_posts(author_id);
  CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);

  -- Enable RLS
  ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

  -- Create RLS policies
  DO $$ BEGIN
    -- Anyone can view published posts
    CREATE POLICY "Anyone can view published posts" ON blog_posts
      FOR SELECT USING (published = true);
  EXCEPTION
    WHEN duplicate_object THEN null;
  END $$;

  DO $$ BEGIN
    -- Admins can manage all posts
    CREATE POLICY "Admins can manage all posts" ON blog_posts
      FOR ALL USING (
        EXISTS (
          SELECT 1 FROM user_profiles up 
          WHERE up.user_id = auth.uid() 
          AND up.role IN ('admin', 'super_admin')
        )
      );
  EXCEPTION
    WHEN duplicate_object THEN null;
  END $$;

  -- Create trigger for updated_at
  DO $$ BEGIN
    CREATE TRIGGER update_blog_posts_updated_at 
      BEFORE UPDATE ON blog_posts 
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  EXCEPTION
    WHEN duplicate_object THEN null;
  END $$;

  -- Function to generate slug
  CREATE OR REPLACE FUNCTION generate_slug_from_title()
  RETURNS TRIGGER AS $$
  BEGIN
    IF NEW.slug IS NULL OR NEW.slug = '' THEN
      NEW.slug := LOWER(REGEXP_REPLACE(NEW.title, '[^a-zA-Z0-9]+', '-', 'g'));
      NEW.slug := TRIM(BOTH '-' FROM NEW.slug);
    END IF;
    RETURN NEW;
  END;
  $$ language 'plpgsql';

  DO $$ BEGIN
    CREATE TRIGGER generate_blog_post_slug 
      BEFORE INSERT OR UPDATE ON blog_posts 
      FOR EACH ROW EXECUTE FUNCTION generate_slug_from_title();
  EXCEPTION
    WHEN duplicate_object THEN null;
  END $$;
$$;

-- Function to create blog interactions tables
CREATE OR REPLACE FUNCTION create_blog_interactions_table()
RETURNS void
LANGUAGE sql
AS $$
  -- Blog likes table
  CREATE TABLE IF NOT EXISTS blog_likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID REFERENCES blog_posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(post_id, user_id)
  );

  -- Blog views table
  CREATE TABLE IF NOT EXISTS blog_views (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID REFERENCES blog_posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );

  -- Create indexes
  CREATE INDEX IF NOT EXISTS idx_blog_likes_post ON blog_likes(post_id);
  CREATE INDEX IF NOT EXISTS idx_blog_likes_user ON blog_likes(user_id);
  CREATE INDEX IF NOT EXISTS idx_blog_views_post ON blog_views(post_id);
  CREATE INDEX IF NOT EXISTS idx_blog_views_date ON blog_views(created_at);

  -- Enable RLS
  ALTER TABLE blog_likes ENABLE ROW LEVEL SECURITY;
  ALTER TABLE blog_views ENABLE ROW LEVEL SECURITY;

  -- Create RLS policies for likes
  DO $$ BEGIN
    CREATE POLICY "Users can manage own likes" ON blog_likes
      FOR ALL USING (auth.uid() = user_id);
  EXCEPTION
    WHEN duplicate_object THEN null;
  END $$;

  DO $$ BEGIN
    CREATE POLICY "Anyone can view like counts" ON blog_likes
      FOR SELECT USING (true);
  EXCEPTION
    WHEN duplicate_object THEN null;
  END $$;

  -- Create RLS policies for views
  DO $$ BEGIN
    CREATE POLICY "Anyone can create views" ON blog_views
      FOR INSERT WITH CHECK (true);
  EXCEPTION
    WHEN duplicate_object THEN null;
  END $$;

  DO $$ BEGIN
    CREATE POLICY "Anyone can view counts" ON blog_views
      FOR SELECT USING (true);
  EXCEPTION
    WHEN duplicate_object THEN null;
  END $$;
$$;

-- ==================== SUPPORT TICKETS TABLE ====================

-- Function to create support tickets table
CREATE OR REPLACE FUNCTION create_support_tickets_table()
RETURNS void
LANGUAGE sql
AS $$
  -- Support tickets table
  CREATE TABLE IF NOT EXISTS support_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_number VARCHAR(20) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    priority ticket_priority DEFAULT 'medium',
    status ticket_status DEFAULT 'open',
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    resolution_notes TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE,
    closed_at TIMESTAMP WITH TIME ZONE
  );

  -- Create indexes
  CREATE INDEX IF NOT EXISTS idx_support_tickets_user ON support_tickets(user_id);
  CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON support_tickets(status);
  CREATE INDEX IF NOT EXISTS idx_support_tickets_priority ON support_tickets(priority);
  CREATE INDEX IF NOT EXISTS idx_support_tickets_category ON support_tickets(category);
  CREATE INDEX IF NOT EXISTS idx_support_tickets_assigned ON support_tickets(assigned_to);
  CREATE UNIQUE INDEX IF NOT EXISTS idx_support_tickets_number ON support_tickets(ticket_number);

  -- Enable RLS
  ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;

  -- Create RLS policies
  DO $$ BEGIN
    -- Users can view their own tickets
    CREATE POLICY "Users can view own tickets" ON support_tickets
      FOR SELECT USING (auth.uid() = user_id);
  EXCEPTION
    WHEN duplicate_object THEN null;
  END $$;

  DO $$ BEGIN
    -- Users can create their own tickets
    CREATE POLICY "Users can create tickets" ON support_tickets
      FOR INSERT WITH CHECK (auth.uid() = user_id);
  EXCEPTION
    WHEN duplicate_object THEN null;
  END $$;

  DO $$ BEGIN
    -- Admins can manage all tickets
    CREATE POLICY "Admins can manage all tickets" ON support_tickets
      FOR ALL USING (
        EXISTS (
          SELECT 1 FROM user_profiles up 
          WHERE up.user_id = auth.uid() 
          AND up.role IN ('admin', 'super_admin')
        )
      );
  EXCEPTION
    WHEN duplicate_object THEN null;
  END $$;

  -- Function to generate ticket number
  CREATE OR REPLACE FUNCTION generate_ticket_number()
  RETURNS TRIGGER AS $$
  BEGIN
    IF NEW.ticket_number IS NULL OR NEW.ticket_number = '' THEN
      NEW.ticket_number := 'ST-' || LPAD(EXTRACT(epoch FROM NOW())::INTEGER::TEXT, 10, '0');
    END IF;
    RETURN NEW;
  END;
  $$ language 'plpgsql';

  DO $$ BEGIN
    CREATE TRIGGER generate_support_ticket_number 
      BEFORE INSERT ON support_tickets 
      FOR EACH ROW EXECUTE FUNCTION generate_ticket_number();
  EXCEPTION
    WHEN duplicate_object THEN null;
  END $$;

  -- Create trigger for updated_at
  DO $$ BEGIN
    CREATE TRIGGER update_support_tickets_updated_at 
      BEFORE UPDATE ON support_tickets 
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  EXCEPTION
    WHEN duplicate_object THEN null;
  END $$;
$$;

-- ==================== SERVICES TABLE ====================

-- Function to create services table
CREATE OR REPLACE FUNCTION create_services_table()
RETURNS void
LANGUAGE sql
AS $$
  -- Services table
  CREATE TABLE IF NOT EXISTS services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT NOT NULL,
    short_description TEXT,
    category VARCHAR(100) NOT NULL,
    icon VARCHAR(10),
    features TEXT[],
    benefits TEXT[],
    pricing JSONB,
    active BOOLEAN DEFAULT true,
    featured BOOLEAN DEFAULT false,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );

  -- Create indexes
  CREATE INDEX IF NOT EXISTS idx_services_category ON services(category);
  CREATE INDEX IF NOT EXISTS idx_services_active ON services(active);
  CREATE INDEX IF NOT EXISTS idx_services_featured ON services(featured);
  CREATE UNIQUE INDEX IF NOT EXISTS idx_services_slug ON services(slug);

  -- Enable RLS
  ALTER TABLE services ENABLE ROW LEVEL SECURITY;

  -- Create RLS policies
  DO $$ BEGIN
    -- Anyone can view active services
    CREATE POLICY "Anyone can view active services" ON services
      FOR SELECT USING (active = true);
  EXCEPTION
    WHEN duplicate_object THEN null;
  END $$;

  DO $$ BEGIN
    -- Admins can manage all services
    CREATE POLICY "Admins can manage all services" ON services
      FOR ALL USING (
        EXISTS (
          SELECT 1 FROM user_profiles up 
          WHERE up.user_id = auth.uid() 
          AND up.role IN ('admin', 'super_admin')
        )
      );
  EXCEPTION
    WHEN duplicate_object THEN null;
  END $$;

  -- Create trigger for updated_at
  DO $$ BEGIN
    CREATE TRIGGER update_services_updated_at 
      BEFORE UPDATE ON services 
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  EXCEPTION
    WHEN duplicate_object THEN null;
  END $$;
$$;

-- ==================== CONSULTATIONS TABLE ====================

-- Function to create consultations table
CREATE OR REPLACE FUNCTION create_consultations_table()
RETURNS void
LANGUAGE sql
AS $$
  -- Consultations table
  CREATE TABLE IF NOT EXISTS consultations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    consultation_number VARCHAR(20) UNIQUE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    service_type VARCHAR(100) NOT NULL,
    consultation_type VARCHAR(50) NOT NULL, -- 'scheduled', 'instant', 'emergency'
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    status consultation_status DEFAULT 'scheduled',
    scheduled_at TIMESTAMP WITH TIME ZONE,
    duration_minutes INTEGER DEFAULT 60,
    meeting_link TEXT,
    consultant_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    notes TEXT,
    follow_up_required BOOLEAN DEFAULT false,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    feedback TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
  );

  -- Create indexes
  CREATE INDEX IF NOT EXISTS idx_consultations_user ON consultations(user_id);
  CREATE INDEX IF NOT EXISTS idx_consultations_status ON consultations(status);
  CREATE INDEX IF NOT EXISTS idx_consultations_type ON consultations(consultation_type);
  CREATE INDEX IF NOT EXISTS idx_consultations_scheduled ON consultations(scheduled_at);
  CREATE INDEX IF NOT EXISTS idx_consultations_consultant ON consultations(consultant_id);
  CREATE UNIQUE INDEX IF NOT EXISTS idx_consultations_number ON consultations(consultation_number);

  -- Enable RLS
  ALTER TABLE consultations ENABLE ROW LEVEL SECURITY;

  -- Create RLS policies
  DO $$ BEGIN
    -- Users can view their own consultations
    CREATE POLICY "Users can view own consultations" ON consultations
      FOR SELECT USING (auth.uid() = user_id);
  EXCEPTION
    WHEN duplicate_object THEN null;
  END $$;

  DO $$ BEGIN
    -- Users can create their own consultations
    CREATE POLICY "Users can create consultations" ON consultations
      FOR INSERT WITH CHECK (auth.uid() = user_id);
  EXCEPTION
    WHEN duplicate_object THEN null;
  END $$;

  DO $$ BEGIN
    -- Consultants can view assigned consultations
    CREATE POLICY "Consultants can view assigned consultations" ON consultations
      FOR SELECT USING (auth.uid() = consultant_id);
  EXCEPTION
    WHEN duplicate_object THEN null;
  END $$;

  DO $$ BEGIN
    -- Admins can manage all consultations
    CREATE POLICY "Admins can manage all consultations" ON consultations
      FOR ALL USING (
        EXISTS (
          SELECT 1 FROM user_profiles up 
          WHERE up.user_id = auth.uid() 
          AND up.role IN ('admin', 'super_admin')
        )
      );
  EXCEPTION
    WHEN duplicate_object THEN null;
  END $$;

  -- Function to generate consultation number
  CREATE OR REPLACE FUNCTION generate_consultation_number()
  RETURNS TRIGGER AS $$
  BEGIN
    IF NEW.consultation_number IS NULL OR NEW.consultation_number = '' THEN
      NEW.consultation_number := 'CON-' || LPAD(EXTRACT(epoch FROM NOW())::INTEGER::TEXT, 10, '0');
    END IF;
    RETURN NEW;
  END;
  $$ language 'plpgsql';

  DO $$ BEGIN
    CREATE TRIGGER generate_consultation_number_trigger 
      BEFORE INSERT ON consultations 
      FOR EACH ROW EXECUTE FUNCTION generate_consultation_number();
  EXCEPTION
    WHEN duplicate_object THEN null;
  END $$;

  -- Create trigger for updated_at
  DO $$ BEGIN
    CREATE TRIGGER update_consultations_updated_at 
      BEFORE UPDATE ON consultations 
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  EXCEPTION
    WHEN duplicate_object THEN null;
  END $$;
$$;

-- ==================== GOVERNMENT REQUESTS TABLE ====================

-- Function to create government requests table
CREATE OR REPLACE FUNCTION create_government_requests_table()
RETURNS void
LANGUAGE sql
AS $$
  -- Government requests table
  CREATE TABLE IF NOT EXISTS government_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_number VARCHAR(20) UNIQUE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    service_type VARCHAR(100) NOT NULL, -- 'kra_pin', 'passport', 'tax_returns', etc.
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    status gov_request_status DEFAULT 'submitted',
    priority ticket_priority DEFAULT 'medium',
    assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    documents_required TEXT[],
    documents_provided TEXT[],
    government_reference VARCHAR(100),
    estimated_completion DATE,
    completion_notes TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
  );

  -- Create indexes
  CREATE INDEX IF NOT EXISTS idx_government_requests_user ON government_requests(user_id);
  CREATE INDEX IF NOT EXISTS idx_government_requests_status ON government_requests(status);
  CREATE INDEX IF NOT EXISTS idx_government_requests_type ON government_requests(service_type);
  CREATE INDEX IF NOT EXISTS idx_government_requests_assigned ON government_requests(assigned_to);
  CREATE UNIQUE INDEX IF NOT EXISTS idx_government_requests_number ON government_requests(request_number);

  -- Enable RLS
  ALTER TABLE government_requests ENABLE ROW LEVEL SECURITY;

  -- Create RLS policies
  DO $$ BEGIN
    -- Users can view their own requests
    CREATE POLICY "Users can view own government requests" ON government_requests
      FOR SELECT USING (auth.uid() = user_id);
  EXCEPTION
    WHEN duplicate_object THEN null;
  END $$;

  DO $$ BEGIN
    -- Users can create their own requests
    CREATE POLICY "Users can create government requests" ON government_requests
      FOR INSERT WITH CHECK (auth.uid() = user_id);
  EXCEPTION
    WHEN duplicate_object THEN null;
  END $$;

  DO $$ BEGIN
    -- Admins can manage all requests
    CREATE POLICY "Admins can manage all government requests" ON government_requests
      FOR ALL USING (
        EXISTS (
          SELECT 1 FROM user_profiles up 
          WHERE up.user_id = auth.uid() 
          AND up.role IN ('admin', 'super_admin')
        )
      );
  EXCEPTION
    WHEN duplicate_object THEN null;
  END $$;

  -- Function to generate request number
  CREATE OR REPLACE FUNCTION generate_government_request_number()
  RETURNS TRIGGER AS $$
  BEGIN
    IF NEW.request_number IS NULL OR NEW.request_number = '' THEN
      NEW.request_number := 'GOV-' || LPAD(EXTRACT(epoch FROM NOW())::INTEGER::TEXT, 10, '0');
    END IF;
    RETURN NEW;
  END;
  $$ language 'plpgsql';

  DO $$ BEGIN
    CREATE TRIGGER generate_government_request_number_trigger 
      BEFORE INSERT ON government_requests 
      FOR EACH ROW EXECUTE FUNCTION generate_government_request_number();
  EXCEPTION
    WHEN duplicate_object THEN null;
  END $$;

  -- Create trigger for updated_at
  DO $$ BEGIN
    CREATE TRIGGER update_government_requests_updated_at 
      BEFORE UPDATE ON government_requests 
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  EXCEPTION
    WHEN duplicate_object THEN null;
  END $$;
$$;

-- ==================== CONTACT FORMS TABLE ====================

-- Function to create contact forms table
CREATE OR REPLACE FUNCTION create_contact_forms_table()
RETURNS void
LANGUAGE sql
AS $$
  -- Contact forms table
  CREATE TABLE IF NOT EXISTS contact_forms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    company VARCHAR(255),
    subject VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    inquiry_type VARCHAR(100), -- 'general', 'support', 'sales', 'partnership'
    status VARCHAR(50) DEFAULT 'new', -- 'new', 'responded', 'closed'
    responded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    response_notes TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    responded_at TIMESTAMP WITH TIME ZONE
  );

  -- Create indexes
  CREATE INDEX IF NOT EXISTS idx_contact_forms_email ON contact_forms(email);
  CREATE INDEX IF NOT EXISTS idx_contact_forms_status ON contact_forms(status);
  CREATE INDEX IF NOT EXISTS idx_contact_forms_type ON contact_forms(inquiry_type);
  CREATE INDEX IF NOT EXISTS idx_contact_forms_date ON contact_forms(created_at);

  -- Enable RLS
  ALTER TABLE contact_forms ENABLE ROW LEVEL SECURITY;

  -- Create RLS policies
  DO $$ BEGIN
    -- Anyone can create contact forms
    CREATE POLICY "Anyone can create contact forms" ON contact_forms
      FOR INSERT WITH CHECK (true);
  EXCEPTION
    WHEN duplicate_object THEN null;
  END $$;

  DO $$ BEGIN
    -- Admins can manage all contact forms
    CREATE POLICY "Admins can manage all contact forms" ON contact_forms
      FOR ALL USING (
        EXISTS (
          SELECT 1 FROM user_profiles up 
          WHERE up.user_id = auth.uid() 
          AND up.role IN ('admin', 'super_admin')
        )
      );
  EXCEPTION
    WHEN duplicate_object THEN null;
  END $$;

  -- Create trigger for updated_at
  DO $$ BEGIN
    CREATE TRIGGER update_contact_forms_updated_at 
      BEFORE UPDATE ON contact_forms 
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  EXCEPTION
    WHEN duplicate_object THEN null;
  END $$;
$$;

-- ==================== WORKING HOURS TABLE ====================

-- Function to create working hours table
CREATE OR REPLACE FUNCTION create_working_hours_table()
RETURNS void
LANGUAGE sql
AS $$
  -- Working hours table
  CREATE TABLE IF NOT EXISTS working_hours (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0 = Sunday
    day_name VARCHAR(10) NOT NULL,
    is_working_day BOOLEAN DEFAULT true,
    standard_start_time TIME,
    standard_end_time TIME,
    emergency_start_time TIME,
    emergency_end_time TIME,
    notes TEXT,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(day_of_week)
  );

  -- Create indexes
  CREATE INDEX IF NOT EXISTS idx_working_hours_day ON working_hours(day_of_week);
  CREATE INDEX IF NOT EXISTS idx_working_hours_active ON working_hours(active);

  -- Enable RLS
  ALTER TABLE working_hours ENABLE ROW LEVEL SECURITY;

  -- Create RLS policies
  DO $$ BEGIN
    -- Anyone can view working hours
    CREATE POLICY "Anyone can view working hours" ON working_hours
      FOR SELECT USING (active = true);
  EXCEPTION
    WHEN duplicate_object THEN null;
  END $$;

  DO $$ BEGIN
    -- Admins can manage working hours
    CREATE POLICY "Admins can manage working hours" ON working_hours
      FOR ALL USING (
        EXISTS (
          SELECT 1 FROM user_profiles up 
          WHERE up.user_id = auth.uid() 
          AND up.role IN ('admin', 'super_admin')
        )
      );
  EXCEPTION
    WHEN duplicate_object THEN null;
  END $$;

  -- Insert default working hours
  INSERT INTO working_hours (day_of_week, day_name, is_working_day, standard_start_time, standard_end_time, emergency_start_time, emergency_end_time, notes)
  VALUES 
    (1, 'Monday', true, '08:00:00', '18:00:00', '18:00:00', '21:00:00', 'Standard weekday hours'),
    (2, 'Tuesday', true, '08:00:00', '18:00:00', '18:00:00', '21:00:00', 'Standard weekday hours'),
    (3, 'Wednesday', true, '08:00:00', '18:00:00', '18:00:00', '21:00:00', 'Standard weekday hours'),
    (4, 'Thursday', true, '08:00:00', '18:00:00', '18:00:00', '21:00:00', 'Standard weekday hours'),
    (5, 'Friday', true, '08:00:00', '18:00:00', '18:00:00', '21:00:00', 'Standard weekday hours'),
    (6, 'Saturday', true, '09:00:00', '13:00:00', '13:00:00', '17:00:00', 'Weekend hours'),
    (0, 'Sunday', false, null, null, '09:00:00', '17:00:00', 'Rest day with emergency on-call')
  ON CONFLICT (day_of_week) DO NOTHING;

  -- Create trigger for updated_at
  DO $$ BEGIN
    CREATE TRIGGER update_working_hours_updated_at 
      BEFORE UPDATE ON working_hours 
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  EXCEPTION
    WHEN duplicate_object THEN null;
  END $$;
$$;

-- ==================== USER ACTIVITY TABLE ====================

-- Function to create user activity table
CREATE OR REPLACE FUNCTION create_user_activity_table()
RETURNS void
LANGUAGE sql
AS $$
  -- User activity table
  CREATE TABLE IF NOT EXISTS user_activity (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    activity_type VARCHAR(50) NOT NULL, -- 'login', 'logout', 'blog_like', 'ticket_create', etc.
    activity_data JSONB DEFAULT '{}',
    resource_type VARCHAR(50), -- 'blog_post', 'support_ticket', etc.
    resource_id UUID,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );

  -- Create indexes
  CREATE INDEX IF NOT EXISTS idx_user_activity_user ON user_activity(user_id);
  CREATE INDEX IF NOT EXISTS idx_user_activity_type ON user_activity(activity_type);
  CREATE INDEX IF NOT EXISTS idx_user_activity_date ON user_activity(created_at);
  CREATE INDEX IF NOT EXISTS idx_user_activity_resource ON user_activity(resource_type, resource_id);

  -- Enable RLS
  ALTER TABLE user_activity ENABLE ROW LEVEL SECURITY;

  -- Create RLS policies
  DO $$ BEGIN
    -- Users can view their own activity
    CREATE POLICY "Users can view own activity" ON user_activity
      FOR SELECT USING (auth.uid() = user_id);
  EXCEPTION
    WHEN duplicate_object THEN null;
  END $$;

  DO $$ BEGIN
    -- System can create activity records
    CREATE POLICY "System can create activity" ON user_activity
      FOR INSERT WITH CHECK (true);
  EXCEPTION
    WHEN duplicate_object THEN null;
  END $$;

  DO $$ BEGIN
    -- Admins can view all activity
    CREATE POLICY "Admins can view all activity" ON user_activity
      FOR SELECT USING (
        EXISTS (
          SELECT 1 FROM user_profiles up 
          WHERE up.user_id = auth.uid() 
          AND up.role IN ('admin', 'super_admin')
        )
      );
  EXCEPTION
    WHEN duplicate_object THEN null;
  END $$;
$$;

-- ==================== NOTIFICATIONS TABLE ====================

-- Function to create notifications table
CREATE OR REPLACE FUNCTION create_notifications_table()
RETURNS void
LANGUAGE sql
AS $$
  -- Notifications table
  CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'info', 'success', 'warning', 'error'
    category VARCHAR(50), -- 'ticket_update', 'blog_notification', 'system_alert'
    read BOOLEAN DEFAULT false,
    action_url TEXT,
    metadata JSONB DEFAULT '{}',
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    read_at TIMESTAMP WITH TIME ZONE
  );

  -- Create indexes
  CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
  CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
  CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
  CREATE INDEX IF NOT EXISTS idx_notifications_category ON notifications(category);
  CREATE INDEX IF NOT EXISTS idx_notifications_date ON notifications(created_at);

  -- Enable RLS
  ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

  -- Create RLS policies
  DO $$ BEGIN
    -- Users can view their own notifications
    CREATE POLICY "Users can view own notifications" ON notifications
      FOR SELECT USING (auth.uid() = user_id);
  EXCEPTION
    WHEN duplicate_object THEN null;
  END $$;

  DO $$ BEGIN
    -- Users can update their own notifications (mark as read)
    CREATE POLICY "Users can update own notifications" ON notifications
      FOR UPDATE USING (auth.uid() = user_id);
  EXCEPTION
    WHEN duplicate_object THEN null;
  END $$;

  DO $$ BEGIN
    -- System can create notifications
    CREATE POLICY "System can create notifications" ON notifications
      FOR INSERT WITH CHECK (true);
  EXCEPTION
    WHEN duplicate_object THEN null;
  END $$;

  DO $$ BEGIN
    -- Admins can manage all notifications
    CREATE POLICY "Admins can manage all notifications" ON notifications
      FOR ALL USING (
        EXISTS (
          SELECT 1 FROM user_profiles up 
          WHERE up.user_id = auth.uid() 
          AND up.role IN ('admin', 'super_admin')
        )
      );
  EXCEPTION
    WHEN duplicate_object THEN null;
  END $$;
$$;