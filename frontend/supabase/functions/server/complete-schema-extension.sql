-- ==================== NEWSLETTER SUBSCRIPTION TABLE ====================

-- Function to create newsletter table
CREATE OR REPLACE FUNCTION create_newsletter_table()
RETURNS void
LANGUAGE sql
AS $$
  -- Newsletter subscription table
  CREATE TABLE IF NOT EXISTS newsletters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    unsubscribed_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    preferences JSONB DEFAULT '{}',
    source VARCHAR(100), -- 'footer', 'popup', 'blog'
    metadata JSONB DEFAULT '{}'
  );

  -- Create indexes
  CREATE INDEX IF NOT EXISTS idx_newsletters_email ON newsletters(email);
  CREATE INDEX IF NOT EXISTS idx_newsletters_active ON newsletters(is_active);
  CREATE INDEX IF NOT EXISTS idx_newsletters_source ON newsletters(source);

  -- Enable RLS
  ALTER TABLE newsletters ENABLE ROW LEVEL SECURITY;

  -- Create RLS policies
  DO $$ BEGIN
    -- Anyone can subscribe
    CREATE POLICY "Anyone can subscribe to newsletter" ON newsletters
      FOR INSERT WITH CHECK (true);
  EXCEPTION
    WHEN duplicate_object THEN null;
  END $$;

  DO $$ BEGIN
    -- Users can update their own subscription
    CREATE POLICY "Users can update own subscription" ON newsletters
      FOR UPDATE USING (email = current_setting('request.jwt.claims', true)::json->>'email');
  EXCEPTION
    WHEN duplicate_object THEN null;
  END $$;

  DO $$ BEGIN
    -- Admins can manage all newsletters
    CREATE POLICY "Admins can manage all newsletters" ON newsletters
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

-- ==================== SERVICE PACKAGES TABLE ====================

-- Function to create service packages table
CREATE OR REPLACE FUNCTION create_service_packages_table()
RETURNS void
LANGUAGE sql
AS $$
  -- Service packages table
  CREATE TABLE IF NOT EXISTS service_packages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_id UUID REFERENCES services(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) DEFAULT 0,
    currency VARCHAR(3) DEFAULT 'KES',
    duration_minutes INTEGER,
    features TEXT[],
    is_freemium BOOLEAN DEFAULT false,
    active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(service_id, slug)
  );

  -- Create indexes
  CREATE INDEX IF NOT EXISTS idx_service_packages_service_id ON service_packages(service_id);
  CREATE INDEX IF NOT EXISTS idx_service_packages_active ON service_packages(active);
  CREATE INDEX IF NOT EXISTS idx_service_packages_freemium ON service_packages(is_freemium);

  -- Enable RLS
  ALTER TABLE service_packages ENABLE ROW LEVEL SECURITY;

  -- Create RLS policies
  DO $$ BEGIN
    -- Anyone can view active packages
    CREATE POLICY "Anyone can view active packages" ON service_packages
      FOR SELECT USING (active = true);
  EXCEPTION
    WHEN duplicate_object THEN null;
  END $$;

  DO $$ BEGIN
    -- Admins can manage all packages
    CREATE POLICY "Admins can manage all packages" ON service_packages
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
    CREATE TRIGGER update_service_packages_updated_at 
      BEFORE UPDATE ON service_packages 
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  EXCEPTION
    WHEN duplicate_object THEN null;
  END $$;
$$;

-- ==================== BLOG CATEGORIES TABLE ====================

-- Function to create blog categories table
CREATE OR REPLACE FUNCTION create_blog_categories_table()
RETURNS void
LANGUAGE sql
AS $$
  -- Blog categories table
  CREATE TABLE IF NOT EXISTS blog_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    color VARCHAR(7), -- hex color
    icon VARCHAR(50),
    active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );

  -- Create indexes
  CREATE INDEX IF NOT EXISTS idx_blog_categories_active ON blog_categories(active);
  CREATE INDEX IF NOT EXISTS idx_blog_categories_slug ON blog_categories(slug);
  CREATE INDEX IF NOT EXISTS idx_blog_categories_sort ON blog_categories(sort_order);

  -- Enable RLS
  ALTER TABLE blog_categories ENABLE ROW LEVEL SECURITY;

  -- Create RLS policies
  DO $$ BEGIN
    -- Anyone can view active categories
    CREATE POLICY "Anyone can view active categories" ON blog_categories
      FOR SELECT USING (active = true);
  EXCEPTION
    WHEN duplicate_object THEN null;
  END $$;

  DO $$ BEGIN
    -- Admins can manage all categories
    CREATE POLICY "Admins can manage all categories" ON blog_categories
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

  -- Insert default blog categories
  INSERT INTO blog_categories (name, slug, description, color, icon, sort_order)
  VALUES 
    ('Cybersecurity', 'cybersecurity', 'Security tips and threat protection', '#dc2626', '🔒', 1),
    ('Remote Work', 'remote-work', 'Home office setup and productivity', '#059669', '🏠', 2),
    ('Digital Profiles', 'digital-profiles', 'Online presence and social media', '#2563eb', '📱', 3),
    ('Data Recovery', 'data-recovery', 'Backup and recovery solutions', '#7c3aed', '💾', 4),
    ('Tech Training', 'tech-training', 'Technology education and tutorials', '#ea580c', '🎓', 5),
    ('Government Services', 'government-services', 'Digital government assistance', '#0891b2', '🏛️', 6),
    ('Device Support', 'device-support', 'Hardware and device troubleshooting', '#65a30d', '🔧', 7)
  ON CONFLICT (slug) DO NOTHING;
$$;

-- ==================== SYSTEM SETTINGS TABLE ====================

-- Function to create system settings table
CREATE OR REPLACE FUNCTION create_system_settings_table()
RETURNS void
LANGUAGE sql
AS $$
  -- System settings table
  CREATE TABLE IF NOT EXISTS system_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key VARCHAR(255) UNIQUE NOT NULL,
    value JSONB NOT NULL,
    description TEXT,
    category VARCHAR(100),
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );

  -- Create indexes
  CREATE INDEX IF NOT EXISTS idx_system_settings_key ON system_settings(key);
  CREATE INDEX IF NOT EXISTS idx_system_settings_category ON system_settings(category);
  CREATE INDEX IF NOT EXISTS idx_system_settings_public ON system_settings(is_public);

  -- Enable RLS
  ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

  -- Create RLS policies
  DO $$ BEGIN
    -- Anyone can view public settings
    CREATE POLICY "Anyone can view public settings" ON system_settings
      FOR SELECT USING (is_public = true);
  EXCEPTION
    WHEN duplicate_object THEN null;
  END $$;

  DO $$ BEGIN
    -- Admins can manage all settings
    CREATE POLICY "Admins can manage all settings" ON system_settings
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
    CREATE TRIGGER update_system_settings_updated_at 
      BEFORE UPDATE ON system_settings 
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  EXCEPTION
    WHEN duplicate_object THEN null;
  END $$;

  -- Insert default system settings
  INSERT INTO system_settings (key, value, description, category, is_public)
  VALUES 
    ('business_phone', '"+254708798850"', 'Main business phone number', 'contact', true),
    ('business_email', '"support@remotcyberhelp.com"', 'Main business email', 'contact', true),
    ('business_name', '"RemotCyberHelp"', 'Business name', 'general', true),
    ('site_title', '"RemotCyberHelp - Professional Tech Support"', 'Website title', 'seo', true),
    ('site_description', '"Professional technology support for individuals and small businesses"', 'Website description', 'seo', true),
    ('emergency_available', 'true', 'Emergency support availability', 'services', true),
    ('instant_support_available', 'true', 'Instant support availability', 'services', true),
    ('max_consultation_duration', '120', 'Maximum consultation duration in minutes', 'services', false),
    ('default_timezone', '"Africa/Nairobi"', 'Default timezone for scheduling', 'general', true)
  ON CONFLICT (key) DO NOTHING;
$$;

-- ==================== GOVERNMENT SERVICES TABLE ====================

-- Function to create government services table
CREATE OR REPLACE FUNCTION create_government_services_table()
RETURNS void
LANGUAGE sql
AS $$
  -- Government services table
  CREATE TABLE IF NOT EXISTS government_services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    requirements TEXT[],
    estimated_duration VARCHAR(50),
    fees JSONB,
    active BOOLEAN DEFAULT true,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );

  -- Create indexes
  CREATE INDEX IF NOT EXISTS idx_government_services_category ON government_services(category);
  CREATE INDEX IF NOT EXISTS idx_government_services_active ON government_services(active);
  CREATE INDEX IF NOT EXISTS idx_government_services_slug ON government_services(slug);

  -- Enable RLS
  ALTER TABLE government_services ENABLE ROW LEVEL SECURITY;

  -- Create RLS policies
  DO $$ BEGIN
    -- Anyone can view active government services
    CREATE POLICY "Anyone can view active government services" ON government_services
      FOR SELECT USING (active = true);
  EXCEPTION
    WHEN duplicate_object THEN null;
  END $$;

  DO $$ BEGIN
    -- Admins can manage all government services
    CREATE POLICY "Admins can manage all government services" ON government_services
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

  -- Insert default government services
  INSERT INTO government_services (name, slug, description, category, requirements, estimated_duration, fees)
  VALUES 
    ('KRA PIN Registration', 'kra-pin', 'Kenya Revenue Authority PIN registration assistance', 'tax', ARRAY['National ID', 'Phone number'], '1-2 days', '{"government": 0, "service": 500}'),
    ('Passport Application', 'passport', 'Kenya passport application assistance', 'identity', ARRAY['National ID', 'Birth certificate', 'Photos'], '2-3 weeks', '{"government": 4550, "service": 1500}'),
    ('Business Permit', 'business-permit', 'County business permit application', 'business', ARRAY['Business registration', 'National ID'], '3-5 days', '{"government": 2000, "service": 1000}'),
    ('Tax Returns Filing', 'tax-returns', 'Annual tax returns preparation and filing', 'tax', ARRAY['P9 forms', 'Bank statements'], '2-3 days', '{"government": 0, "service": 2000}'),
    ('NHIF Registration', 'nhif', 'National Health Insurance Fund registration', 'health', ARRAY['National ID', 'Employment letter'], '1 day', '{"government": 0, "service": 300}')
  ON CONFLICT (slug) DO NOTHING;
$$;

-- ==================== ADDITIONAL HELPER TABLES ====================

-- Function to create ticket messages table
CREATE OR REPLACE FUNCTION create_ticket_messages_table()
RETURNS void
LANGUAGE sql
AS $$
  -- Ticket messages table
  CREATE TABLE IF NOT EXISTS ticket_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID REFERENCES support_tickets(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    is_internal BOOLEAN DEFAULT false,
    attachments TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );

  -- Create indexes
  CREATE INDEX IF NOT EXISTS idx_ticket_messages_ticket ON ticket_messages(ticket_id);
  CREATE INDEX IF NOT EXISTS idx_ticket_messages_user ON ticket_messages(user_id);
  CREATE INDEX IF NOT EXISTS idx_ticket_messages_date ON ticket_messages(created_at);

  -- Enable RLS
  ALTER TABLE ticket_messages ENABLE ROW LEVEL SECURITY;

  -- Create RLS policies
  DO $$ BEGIN
    -- Users can view messages on their tickets
    CREATE POLICY "Users can view messages on own tickets" ON ticket_messages
      FOR SELECT USING (
        EXISTS (
          SELECT 1 FROM support_tickets st 
          WHERE st.id = ticket_id 
          AND st.user_id = auth.uid()
        )
      );
  EXCEPTION
    WHEN duplicate_object THEN null;
  END $$;

  DO $$ BEGIN
    -- Users can create messages on their tickets
    CREATE POLICY "Users can create messages on own tickets" ON ticket_messages
      FOR INSERT WITH CHECK (
        auth.uid() = user_id AND
        EXISTS (
          SELECT 1 FROM support_tickets st 
          WHERE st.id = ticket_id 
          AND st.user_id = auth.uid()
        )
      );
  EXCEPTION
    WHEN duplicate_object THEN null;
  END $$;

  DO $$ BEGIN
    -- Admins can manage all messages
    CREATE POLICY "Admins can manage all messages" ON ticket_messages
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

-- Function to create consultation time slots table
CREATE OR REPLACE FUNCTION create_consultation_time_slots_table()
RETURNS void
LANGUAGE sql
AS $$
  -- Consultation time slots table
  CREATE TABLE IF NOT EXISTS consultation_time_slots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    consultant_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_available BOOLEAN DEFAULT true,
    consultation_id UUID REFERENCES consultations(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(consultant_id, date, start_time)
  );

  -- Create indexes
  CREATE INDEX IF NOT EXISTS idx_consultation_slots_consultant ON consultation_time_slots(consultant_id);
  CREATE INDEX IF NOT EXISTS idx_consultation_slots_date ON consultation_time_slots(date);
  CREATE INDEX IF NOT EXISTS idx_consultation_slots_available ON consultation_time_slots(is_available);

  -- Enable RLS
  ALTER TABLE consultation_time_slots ENABLE ROW LEVEL SECURITY;

  -- Create RLS policies
  DO $$ BEGIN
    -- Anyone can view available slots
    CREATE POLICY "Anyone can view available slots" ON consultation_time_slots
      FOR SELECT USING (is_available = true);
  EXCEPTION
    WHEN duplicate_object THEN null;
  END $$;

  DO $$ BEGIN
    -- Consultants can manage their slots
    CREATE POLICY "Consultants can manage own slots" ON consultation_time_slots
      FOR ALL USING (auth.uid() = consultant_id);
  EXCEPTION
    WHEN duplicate_object THEN null;
  END $$;

  DO $$ BEGIN
    -- Admins can manage all slots
    CREATE POLICY "Admins can manage all slots" ON consultation_time_slots
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

-- ==================== MASTER INITIALIZATION FUNCTION ====================

-- Function to initialize complete database schema
CREATE OR REPLACE FUNCTION initialize_complete_schema()
RETURNS void
LANGUAGE sql
AS $$
  -- Create custom types first
  SELECT create_custom_types();
  
  -- Create all tables in dependency order
  SELECT create_users_table();
  SELECT create_services_table();
  SELECT create_service_packages_table();
  SELECT create_blog_posts_table();
  SELECT create_blog_categories_table();
  SELECT create_blog_interactions_table();
  SELECT create_support_tickets_table();
  SELECT create_ticket_messages_table();
  SELECT create_consultations_table();
  SELECT create_consultation_time_slots_table();
  SELECT create_government_requests_table();
  SELECT create_government_services_table();
  SELECT create_contact_forms_table();
  SELECT create_newsletter_table();
  SELECT create_working_hours_table();
  SELECT create_user_activity_table();
  SELECT create_system_settings_table();
$$;