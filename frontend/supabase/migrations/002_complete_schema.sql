-- ==================== COMPLETE REMOTCYBERHELP DATABASE SCHEMA ====================
-- This migration creates all necessary tables for the RemotCyberHelp platform
-- Building upon the existing schema in 001_initial_schema.sql

-- Additional custom types
CREATE TYPE ticket_priority AS ENUM ('low', 'medium', 'high', 'urgent');
CREATE TYPE ticket_status AS ENUM ('open', 'in_progress', 'pending_customer', 'resolved', 'closed');
CREATE TYPE package_type AS ENUM ('freemium', 'basic', 'premium', 'enterprise');
CREATE TYPE government_request_status AS ENUM ('pending', 'in_progress', 'review', 'completed', 'rejected');

-- ==================== USER PROFILES TABLE ====================
-- Extended user information beyond basic auth
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    phone TEXT,
    avatar_url TEXT,
    bio TEXT,
    company TEXT,
    job_title TEXT,
    location TEXT,
    timezone TEXT DEFAULT 'Africa/Nairobi',
    preferred_language TEXT DEFAULT 'en',
    notification_preferences JSONB DEFAULT '{"email": true, "sms": false, "push": true}',
    emergency_contact JSONB,
    is_verified BOOLEAN DEFAULT false,
    last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==================== SERVICES TABLE ====================
-- Available tech support services
CREATE TABLE IF NOT EXISTS public.services (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT NOT NULL,
    short_description TEXT,
    icon TEXT,
    featured_image TEXT,
    category TEXT NOT NULL,
    base_price DECIMAL(10,2) DEFAULT 0,
    currency TEXT DEFAULT 'KES',
    estimated_duration INTEGER, -- minutes
    features TEXT[],
    requirements TEXT[],
    is_active BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    has_emergency_support BOOLEAN DEFAULT false,
    has_instant_support BOOLEAN DEFAULT false,
    sort_order INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}',
    seo_title TEXT,
    seo_description TEXT,
    seo_keywords TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==================== SERVICE PACKAGES TABLE ====================
-- Freemium and premium service tiers
CREATE TABLE IF NOT EXISTS public.service_packages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    service_id UUID REFERENCES public.services(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    description TEXT,
    package_type package_type DEFAULT 'basic',
    price DECIMAL(10,2) DEFAULT 0,
    currency TEXT DEFAULT 'KES',
    duration_minutes INTEGER,
    max_incidents INTEGER, -- null for unlimited
    response_time_hours INTEGER,
    features TEXT[],
    limitations TEXT[],
    is_popular BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(service_id, slug)
);

-- ==================== BLOG CATEGORIES TABLE ====================
-- Categorized blog sections
CREATE TABLE IF NOT EXISTS public.blog_categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    color TEXT, -- hex color
    icon TEXT,
    featured_image TEXT,
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    post_count INTEGER DEFAULT 0,
    seo_title TEXT,
    seo_description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==================== ENHANCED BLOG POSTS TABLE ====================
-- Update existing blog_posts table with additional fields
ALTER TABLE public.blog_posts 
ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES public.blog_categories(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS meta_title TEXT,
ADD COLUMN IF NOT EXISTS meta_description TEXT,
ADD COLUMN IF NOT EXISTS reading_time INTEGER, -- minutes
ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS comment_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS share_count INTEGER DEFAULT 0;

-- ==================== BLOG LIKES TABLE ====================
-- User engagement tracking
CREATE TABLE IF NOT EXISTS public.blog_likes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    post_id UUID REFERENCES public.blog_posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(post_id, user_id),
    UNIQUE(post_id, ip_address) -- Prevent multiple likes from same IP for anonymous users
);

-- ==================== BLOG VIEWS TABLE ====================
-- Analytics and view counts
CREATE TABLE IF NOT EXISTS public.blog_views (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    post_id UUID REFERENCES public.blog_posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    ip_address INET NOT NULL,
    user_agent TEXT,
    referrer TEXT,
    country TEXT,
    region TEXT,
    city TEXT,
    device_type TEXT, -- 'mobile', 'tablet', 'desktop'
    session_id TEXT,
    view_duration INTEGER, -- seconds
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==================== ENHANCED SUPPORT TICKETS TABLE ====================
-- Update existing support_tickets table
ALTER TABLE public.support_tickets 
ADD COLUMN IF NOT EXISTS ticket_number TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS service_id UUID REFERENCES public.services(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS package_id UUID REFERENCES public.service_packages(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS contact_email TEXT,
ADD COLUMN IF NOT EXISTS contact_phone TEXT,
ADD COLUMN IF NOT EXISTS urgency_level TEXT,
ADD COLUMN IF NOT EXISTS estimated_resolution TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS resolution_notes TEXT,
ADD COLUMN IF NOT EXISTS customer_rating INTEGER CHECK (customer_rating >= 1 AND customer_rating <= 5),
ADD COLUMN IF NOT EXISTS customer_feedback TEXT,
ADD COLUMN IF NOT EXISTS tags TEXT[],
ADD COLUMN IF NOT EXISTS attachments TEXT[],
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

-- Change priority and status to use new ENUM types
ALTER TABLE public.support_tickets 
ALTER COLUMN priority TYPE ticket_priority USING priority::ticket_priority,
ALTER COLUMN status TYPE ticket_status USING status::ticket_status;

-- ==================== TICKET MESSAGES TABLE ====================
-- Support conversation threads
CREATE TABLE IF NOT EXISTS public.ticket_messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    ticket_id UUID REFERENCES public.support_tickets(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    message_type TEXT DEFAULT 'message', -- 'message', 'note', 'status_change'
    is_internal BOOLEAN DEFAULT false,
    attachments TEXT[],
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==================== ENHANCED CONSULTATIONS TABLE ====================
-- Update existing consultations table
ALTER TABLE public.consultations 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS service_id UUID REFERENCES public.services(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS package_id UUID REFERENCES public.service_packages(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS consultant_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS meeting_link TEXT,
ADD COLUMN IF NOT EXISTS duration_minutes INTEGER DEFAULT 60,
ADD COLUMN IF NOT EXISTS actual_start_time TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS actual_end_time TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS notes TEXT,
ADD COLUMN IF NOT EXISTS customer_rating INTEGER CHECK (customer_rating >= 1 AND customer_rating <= 5),
ADD COLUMN IF NOT EXISTS customer_feedback TEXT,
ADD COLUMN IF NOT EXISTS consultant_notes TEXT,
ADD COLUMN IF NOT EXISTS recording_url TEXT,
ADD COLUMN IF NOT EXISTS follow_up_required BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS tags TEXT[],
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

-- ==================== CONSULTATION TIME SLOTS TABLE ====================
-- Available booking times
CREATE TABLE IF NOT EXISTS public.consultation_time_slots (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    consultant_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_available BOOLEAN DEFAULT true,
    is_blocked BOOLEAN DEFAULT false,
    block_reason TEXT,
    consultation_id UUID REFERENCES public.consultations(id) ON DELETE SET NULL,
    timezone TEXT DEFAULT 'Africa/Nairobi',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(consultant_id, date, start_time)
);

-- ==================== GOVERNMENT SERVICES TABLE ====================
-- Available government services
CREATE TABLE IF NOT EXISTS public.government_services (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    department TEXT,
    requirements TEXT[],
    required_documents TEXT[],
    estimated_duration TEXT,
    processing_time TEXT,
    government_fees JSONB,
    service_fees JSONB,
    is_active BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    complexity_level TEXT DEFAULT 'medium', -- 'simple', 'medium', 'complex'
    success_rate DECIMAL(5,2) DEFAULT 95.00,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==================== GOVERNMENT REQUESTS TABLE ====================
-- Government service assistance requests
CREATE TABLE IF NOT EXISTS public.government_requests (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    request_number TEXT UNIQUE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    service_id UUID REFERENCES public.government_services(id) ON DELETE CASCADE,
    applicant_first_name TEXT NOT NULL,
    applicant_last_name TEXT NOT NULL,
    applicant_email TEXT NOT NULL,
    applicant_phone TEXT NOT NULL,
    applicant_id_number TEXT,
    applicant_address JSONB,
    request_details JSONB NOT NULL,
    submitted_documents TEXT[],
    status government_request_status DEFAULT 'pending',
    assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    government_reference TEXT,
    estimated_completion DATE,
    actual_completion DATE,
    total_government_fees DECIMAL(10,2) DEFAULT 0,
    total_service_fees DECIMAL(10,2) DEFAULT 0,
    payment_status TEXT DEFAULT 'pending',
    payment_reference TEXT,
    progress_notes TEXT[],
    customer_rating INTEGER CHECK (customer_rating >= 1 AND customer_rating <= 5),
    customer_feedback TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==================== CONTACT FORMS TABLE ====================
-- General inquiries and leads
CREATE TABLE IF NOT EXISTS public.contact_forms (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    company TEXT,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    inquiry_type TEXT DEFAULT 'general', -- 'general', 'support', 'sales', 'partnership'
    source TEXT DEFAULT 'website',
    ip_address INET,
    user_agent TEXT,
    status TEXT DEFAULT 'new', -- 'new', 'contacted', 'qualified', 'converted', 'closed'
    assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    follow_up_date DATE,
    notes TEXT,
    lead_score INTEGER DEFAULT 0,
    tags TEXT[],
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==================== NEWSLETTERS TABLE ====================
-- Email subscription management
CREATE TABLE IF NOT EXISTS public.newsletters (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    first_name TEXT,
    last_name TEXT,
    subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    unsubscribed_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    subscription_source TEXT DEFAULT 'website', -- 'website', 'blog', 'popup', 'manual'
    preferences JSONB DEFAULT '{"frequency": "weekly", "topics": ["all"]}',
    email_verified BOOLEAN DEFAULT false,
    verification_token TEXT,
    unsubscribe_token TEXT UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
    engagement_score INTEGER DEFAULT 0,
    last_sent TIMESTAMP WITH TIME ZONE,
    bounce_count INTEGER DEFAULT 0,
    complaint_count INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==================== USER ACTIVITY TABLE ====================
-- User action tracking
CREATE TABLE IF NOT EXISTS public.user_activity (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    session_id TEXT,
    action TEXT NOT NULL,
    entity_type TEXT, -- 'blog_post', 'service', 'consultation', etc.
    entity_id UUID,
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    referrer TEXT,
    page_url TEXT,
    device_info JSONB,
    location_info JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==================== PAGE ANALYTICS TABLE ====================
-- Website analytics
CREATE TABLE IF NOT EXISTS public.page_analytics (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    page_path TEXT NOT NULL,
    page_title TEXT,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    session_id TEXT,
    ip_address INET NOT NULL,
    user_agent TEXT,
    referrer TEXT,
    utm_source TEXT,
    utm_medium TEXT,
    utm_campaign TEXT,
    utm_content TEXT,
    utm_term TEXT,
    device_type TEXT, -- 'mobile', 'tablet', 'desktop'
    browser TEXT,
    os TEXT,
    country TEXT,
    region TEXT,
    city TEXT,
    page_load_time INTEGER, -- milliseconds
    time_on_page INTEGER, -- seconds
    bounce BOOLEAN DEFAULT false,
    conversion_event TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==================== FILE UPLOADS TABLE ====================
-- Document and media management
CREATE TABLE IF NOT EXISTS public.file_uploads (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    filename TEXT NOT NULL,
    original_filename TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_size BIGINT NOT NULL,
    mime_type TEXT NOT NULL,
    file_category TEXT DEFAULT 'general', -- 'document', 'image', 'avatar', 'attachment'
    entity_type TEXT, -- 'ticket', 'consultation', 'government_request'
    entity_id UUID,
    is_public BOOLEAN DEFAULT false,
    download_count INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==================== SYSTEM SETTINGS TABLE ====================
-- Global configuration
CREATE TABLE IF NOT EXISTS public.system_settings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    key TEXT UNIQUE NOT NULL,
    value JSONB NOT NULL,
    description TEXT,
    category TEXT DEFAULT 'general',
    data_type TEXT DEFAULT 'string', -- 'string', 'number', 'boolean', 'json', 'array'
    is_public BOOLEAN DEFAULT false,
    is_required BOOLEAN DEFAULT false,
    validation_rules JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==================== CREATE INDEXES FOR PERFORMANCE ====================

-- User profiles indexes
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON public.user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_verified ON public.user_profiles(is_verified);
CREATE INDEX IF NOT EXISTS idx_user_profiles_last_active ON public.user_profiles(last_active);

-- Services indexes
CREATE INDEX IF NOT EXISTS idx_services_slug ON public.services(slug);
CREATE INDEX IF NOT EXISTS idx_services_category ON public.services(category);
CREATE INDEX IF NOT EXISTS idx_services_active ON public.services(is_active);
CREATE INDEX IF NOT EXISTS idx_services_featured ON public.services(is_featured);

-- Service packages indexes
CREATE INDEX IF NOT EXISTS idx_service_packages_service_id ON public.service_packages(service_id);
CREATE INDEX IF NOT EXISTS idx_service_packages_type ON public.service_packages(package_type);
CREATE INDEX IF NOT EXISTS idx_service_packages_active ON public.service_packages(is_active);

-- Blog categories indexes
CREATE INDEX IF NOT EXISTS idx_blog_categories_slug ON public.blog_categories(slug);
CREATE INDEX IF NOT EXISTS idx_blog_categories_active ON public.blog_categories(is_active);

-- Blog posts additional indexes
CREATE INDEX IF NOT EXISTS idx_blog_posts_category_id ON public.blog_posts(category_id);
CREATE INDEX IF NOT EXISTS idx_blog_posts_featured ON public.blog_posts(featured);
CREATE INDEX IF NOT EXISTS idx_blog_posts_views ON public.blog_posts(views);

-- Blog interactions indexes
CREATE INDEX IF NOT EXISTS idx_blog_likes_post_id ON public.blog_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_blog_likes_user_id ON public.blog_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_blog_views_post_id ON public.blog_views(post_id);
CREATE INDEX IF NOT EXISTS idx_blog_views_created_at ON public.blog_views(created_at);

-- Support tickets additional indexes
CREATE INDEX IF NOT EXISTS idx_support_tickets_number ON public.support_tickets(ticket_number);
CREATE INDEX IF NOT EXISTS idx_support_tickets_service ON public.support_tickets(service_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_priority ON public.support_tickets(priority);

-- Ticket messages indexes
CREATE INDEX IF NOT EXISTS idx_ticket_messages_ticket_id ON public.ticket_messages(ticket_id);
CREATE INDEX IF NOT EXISTS idx_ticket_messages_user_id ON public.ticket_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_ticket_messages_created_at ON public.ticket_messages(created_at);

-- Consultations additional indexes
CREATE INDEX IF NOT EXISTS idx_consultations_user_id ON public.consultations(user_id);
CREATE INDEX IF NOT EXISTS idx_consultations_service_id ON public.consultations(service_id);
CREATE INDEX IF NOT EXISTS idx_consultations_consultant_id ON public.consultations(consultant_id);

-- Consultation time slots indexes
CREATE INDEX IF NOT EXISTS idx_consultation_slots_consultant ON public.consultation_time_slots(consultant_id);
CREATE INDEX IF NOT EXISTS idx_consultation_slots_date ON public.consultation_time_slots(date);
CREATE INDEX IF NOT EXISTS idx_consultation_slots_available ON public.consultation_time_slots(is_available);

-- Government services indexes
CREATE INDEX IF NOT EXISTS idx_government_services_slug ON public.government_services(slug);
CREATE INDEX IF NOT EXISTS idx_government_services_category ON public.government_services(category);
CREATE INDEX IF NOT EXISTS idx_government_services_active ON public.government_services(is_active);

-- Government requests indexes
CREATE INDEX IF NOT EXISTS idx_government_requests_number ON public.government_requests(request_number);
CREATE INDEX IF NOT EXISTS idx_government_requests_user_id ON public.government_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_government_requests_service_id ON public.government_requests(service_id);
CREATE INDEX IF NOT EXISTS idx_government_requests_status ON public.government_requests(status);

-- Contact forms indexes
CREATE INDEX IF NOT EXISTS idx_contact_forms_email ON public.contact_forms(email);
CREATE INDEX IF NOT EXISTS idx_contact_forms_status ON public.contact_forms(status);
CREATE INDEX IF NOT EXISTS idx_contact_forms_type ON public.contact_forms(inquiry_type);
CREATE INDEX IF NOT EXISTS idx_contact_forms_created_at ON public.contact_forms(created_at);

-- Newsletter indexes
CREATE INDEX IF NOT EXISTS idx_newsletters_email ON public.newsletters(email);
CREATE INDEX IF NOT EXISTS idx_newsletters_active ON public.newsletters(is_active);
CREATE INDEX IF NOT EXISTS idx_newsletters_source ON public.newsletters(subscription_source);

-- User activity indexes
CREATE INDEX IF NOT EXISTS idx_user_activity_user_id ON public.user_activity(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_action ON public.user_activity(action);
CREATE INDEX IF NOT EXISTS idx_user_activity_entity ON public.user_activity(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_created_at ON public.user_activity(created_at);

-- Page analytics indexes
CREATE INDEX IF NOT EXISTS idx_page_analytics_path ON public.page_analytics(page_path);
CREATE INDEX IF NOT EXISTS idx_page_analytics_user_id ON public.page_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_page_analytics_created_at ON public.page_analytics(created_at);
CREATE INDEX IF NOT EXISTS idx_page_analytics_session ON public.page_analytics(session_id);

-- File uploads indexes
CREATE INDEX IF NOT EXISTS idx_file_uploads_user_id ON public.file_uploads(user_id);
CREATE INDEX IF NOT EXISTS idx_file_uploads_category ON public.file_uploads(file_category);
CREATE INDEX IF NOT EXISTS idx_file_uploads_entity ON public.file_uploads(entity_type, entity_id);

-- System settings indexes
CREATE INDEX IF NOT EXISTS idx_system_settings_key ON public.system_settings(key);
CREATE INDEX IF NOT EXISTS idx_system_settings_category ON public.system_settings(category);
CREATE INDEX IF NOT EXISTS idx_system_settings_public ON public.system_settings(is_public);

-- ==================== CREATE TRIGGERS FOR UPDATED_AT ====================

-- Add triggers for new tables
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON public.user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON public.services FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_service_packages_updated_at BEFORE UPDATE ON public.service_packages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_blog_categories_updated_at BEFORE UPDATE ON public.blog_categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_consultation_time_slots_updated_at BEFORE UPDATE ON public.consultation_time_slots FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_government_services_updated_at BEFORE UPDATE ON public.government_services FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_government_requests_updated_at BEFORE UPDATE ON public.government_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_contact_forms_updated_at BEFORE UPDATE ON public.contact_forms FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_newsletters_updated_at BEFORE UPDATE ON public.newsletters FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_file_uploads_updated_at BEFORE UPDATE ON public.file_uploads FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_system_settings_updated_at BEFORE UPDATE ON public.system_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==================== HELPER FUNCTIONS ====================

-- Function to generate ticket numbers
CREATE OR REPLACE FUNCTION generate_ticket_number()
RETURNS TEXT AS $$
DECLARE
    new_number TEXT;
    counter INTEGER;
BEGIN
    -- Get the next sequence number
    SELECT COALESCE(MAX(CAST(SUBSTRING(ticket_number FROM 4) AS INTEGER)), 0) + 1
    INTO counter
    FROM public.support_tickets
    WHERE ticket_number ~ '^RCH[0-9]+$';
    
    new_number := 'RCH' || LPAD(counter::TEXT, 6, '0');
    RETURN new_number;
END;
$$ LANGUAGE plpgsql;

-- Function to generate government request numbers
CREATE OR REPLACE FUNCTION generate_request_number()
RETURNS TEXT AS $$
DECLARE
    new_number TEXT;
    counter INTEGER;
BEGIN
    -- Get the next sequence number
    SELECT COALESCE(MAX(CAST(SUBSTRING(request_number FROM 4) AS INTEGER)), 0) + 1
    INTO counter
    FROM public.government_requests
    WHERE request_number ~ '^GOV[0-9]+$';
    
    new_number := 'GOV' || LPAD(counter::TEXT, 6, '0');
    RETURN new_number;
END;
$$ LANGUAGE plpgsql;

-- Function to auto-generate ticket number on insert
CREATE OR REPLACE FUNCTION auto_generate_ticket_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.ticket_number IS NULL THEN
        NEW.ticket_number := generate_ticket_number();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to auto-generate request number on insert
CREATE OR REPLACE FUNCTION auto_generate_request_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.request_number IS NULL THEN
        NEW.request_number := generate_request_number();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for auto-generation
CREATE TRIGGER auto_generate_ticket_number_trigger
    BEFORE INSERT ON public.support_tickets
    FOR EACH ROW EXECUTE FUNCTION auto_generate_ticket_number();

CREATE TRIGGER auto_generate_request_number_trigger
    BEFORE INSERT ON public.government_requests
    FOR EACH ROW EXECUTE FUNCTION auto_generate_request_number();

-- Function to update blog category post count
CREATE OR REPLACE FUNCTION update_category_post_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.blog_categories 
        SET post_count = post_count + 1 
        WHERE id = NEW.category_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.blog_categories 
        SET post_count = post_count - 1 
        WHERE id = OLD.category_id;
        RETURN OLD;
    ELSIF TG_OP = 'UPDATE' AND NEW.category_id != OLD.category_id THEN
        UPDATE public.blog_categories 
        SET post_count = post_count - 1 
        WHERE id = OLD.category_id;
        UPDATE public.blog_categories 
        SET post_count = post_count + 1 
        WHERE id = NEW.category_id;
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for category post count
CREATE TRIGGER update_category_post_count_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.blog_posts
    FOR EACH ROW EXECUTE FUNCTION update_category_post_count();

-- Function to create user profile on auth user creation
CREATE OR REPLACE FUNCTION public.handle_new_user_profile()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (user_id, first_name, last_name, phone)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'phone', '')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update the existing user creation trigger to also create user profile
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TRIGGER on_auth_user_profile_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_profile();

-- ==================== ROW LEVEL SECURITY POLICIES ====================

-- Enable RLS on new tables
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consultation_time_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.government_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.government_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.file_uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- User profiles policies
CREATE POLICY "Users can view own profile" ON public.user_profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON public.user_profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles" ON public.user_profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Services policies (public read, admin write)
CREATE POLICY "Anyone can view active services" ON public.services
    FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage services" ON public.services
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Service packages policies
CREATE POLICY "Anyone can view active packages" ON public.service_packages
    FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage packages" ON public.service_packages
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Blog categories policies
CREATE POLICY "Anyone can view active categories" ON public.blog_categories
    FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage categories" ON public.blog_categories
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Blog likes policies
CREATE POLICY "Users can manage own likes" ON public.blog_likes
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Anyone can insert likes" ON public.blog_likes
    FOR INSERT WITH CHECK (true);

-- Blog views policies (insert only for tracking)
CREATE POLICY "Anyone can insert views" ON public.blog_views
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view all analytics" ON public.blog_views
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Ticket messages policies
CREATE POLICY "Users can view messages on own tickets" ON public.ticket_messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.support_tickets st 
            WHERE st.id = ticket_id 
            AND st.user_id = auth.uid()
        )
        OR
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Users can create messages on own tickets" ON public.ticket_messages
    FOR INSERT WITH CHECK (
        auth.uid() = user_id AND
        EXISTS (
            SELECT 1 FROM public.support_tickets st 
            WHERE st.id = ticket_id 
            AND st.user_id = auth.uid()
        )
    );

CREATE POLICY "Admins can manage all messages" ON public.ticket_messages
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Consultation time slots policies
CREATE POLICY "Anyone can view available slots" ON public.consultation_time_slots
    FOR SELECT USING (is_available = true AND NOT is_blocked);

CREATE POLICY "Consultants can manage own slots" ON public.consultation_time_slots
    FOR ALL USING (
        auth.uid() = consultant_id OR
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Government services policies
CREATE POLICY "Anyone can view active government services" ON public.government_services
    FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage government services" ON public.government_services
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Government requests policies
CREATE POLICY "Users can view own requests" ON public.government_requests
    FOR SELECT USING (
        user_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Anyone can create requests" ON public.government_requests
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can manage all requests" ON public.government_requests
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Contact forms policies
CREATE POLICY "Anyone can submit contact forms" ON public.contact_forms
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can manage contact forms" ON public.contact_forms
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Newsletter policies
CREATE POLICY "Anyone can subscribe to newsletter" ON public.newsletters
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update own subscription" ON public.newsletters
    FOR UPDATE USING (true); -- Allow unsubscribe via token

CREATE POLICY "Admins can manage all subscriptions" ON public.newsletters
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- User activity policies
CREATE POLICY "Users can view own activity" ON public.user_activity
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Anyone can insert activity" ON public.user_activity
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view all activity" ON public.user_activity
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Page analytics policies (admin only for privacy)
CREATE POLICY "Anyone can insert page analytics" ON public.page_analytics
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view analytics" ON public.page_analytics
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- File uploads policies
CREATE POLICY "Users can view own files" ON public.file_uploads
    FOR SELECT USING (
        user_id = auth.uid() OR is_public = true OR
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Users can upload files" ON public.file_uploads
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage own files" ON public.file_uploads
    FOR ALL USING (
        user_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- System settings policies
CREATE POLICY "Anyone can view public settings" ON public.system_settings
    FOR SELECT USING (is_public = true);

CREATE POLICY "Admins can manage all settings" ON public.system_settings
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- ==================== INSERT DEFAULT DATA ====================

-- Insert default blog categories
INSERT INTO public.blog_categories (name, slug, description, color, icon, sort_order) VALUES
('Cybersecurity', 'cybersecurity', 'Security tips and threat protection guides', '#dc2626', '🔒', 1),
('Remote Work', 'remote-work', 'Home office setup and productivity tips', '#059669', '🏠', 2),
('Digital Profiles', 'digital-profiles', 'Online presence and social media management', '#2563eb', '📱', 3),
('Data Recovery', 'data-recovery', 'Backup solutions and data recovery services', '#7c3aed', '💾', 4),
('Tech Training', 'tech-training', 'Technology education and tutorials', '#ea580c', '🎓', 5),
('Government Services', 'government-services', 'Digital government service assistance', '#0891b2', '🏛️', 6),
('Device Support', 'device-support', 'Hardware troubleshooting and maintenance', '#65a30d', '🔧', 7)
ON CONFLICT (slug) DO NOTHING;

-- Insert default services
INSERT INTO public.services (name, slug, description, short_description, category, base_price, currency, estimated_duration, is_active, is_featured, has_emergency_support, has_instant_support, sort_order) VALUES
('Digital Profile Setup', 'digital-profile-setup', 'Complete digital presence setup including social media profiles, professional portfolios, and online reputation management.', 'Professional digital presence setup', 'Digital Services', 2500.00, 'KES', 120, true, true, true, true, 1),
('Device Support & Troubleshooting', 'device-support', 'Comprehensive device support for computers, smartphones, tablets, and other tech devices.', 'Complete device troubleshooting', 'Technical Support', 1500.00, 'KES', 90, true, true, true, true, 2),
('Technical Consultancy', 'technical-consultancy', 'Expert technical consulting for business technology decisions, system architecture, and digital transformation.', 'Expert technical consulting', 'Consulting', 5000.00, 'KES', 180, true, true, false, true, 3),
('Data Backup & Recovery', 'data-backup-recovery', 'Professional data backup solutions and emergency data recovery services.', 'Data protection and recovery', 'Data Services', 3000.00, 'KES', 150, true, true, true, false, 4),
('Cybersecurity Assessment', 'cybersecurity-assessment', 'Comprehensive security audits and vulnerability assessments for individuals and businesses.', 'Security audit and protection', 'Security', 4000.00, 'KES', 240, true, true, false, false, 5),
('Remote Work Setup', 'remote-work-setup', 'Complete remote work environment setup including tools, security, and productivity optimization.', 'Remote work optimization', 'Productivity', 2000.00, 'KES', 120, true, false, false, true, 6),
('Software Installation & Training', 'software-training', 'Software installation, configuration, and user training for various applications.', 'Software setup and training', 'Training', 1800.00, 'KES', 150, true, false, false, true, 7),
('Network Setup & Optimization', 'network-setup', 'Home and office network setup, WiFi optimization, and connectivity troubleshooting.', 'Network configuration', 'Infrastructure', 2500.00, 'KES', 180, true, false, true, false, 8),
('Cloud Services Migration', 'cloud-migration', 'Migration to cloud platforms, setup, and optimization of cloud-based workflows.', 'Cloud platform migration', 'Cloud Services', 4500.00, 'KES', 300, true, false, false, false, 9),
('Tech Support Training', 'tech-support-training', 'Comprehensive technology training programs for individuals and teams.', 'Technology skills training', 'Training', 3500.00, 'KES', 240, true, false, false, false, 10)
ON CONFLICT (slug) DO NOTHING;

-- Insert default government services
INSERT INTO public.government_services (name, slug, description, category, department, requirements, required_documents, estimated_duration, processing_time, government_fees, service_fees, complexity_level, success_rate) VALUES
('KRA PIN Registration', 'kra-pin', 'Kenya Revenue Authority Personal Identification Number registration for tax purposes', 'Tax Services', 'Kenya Revenue Authority', 
ARRAY['Valid National ID', 'Phone Number', 'Email Address'], 
ARRAY['National ID Copy', 'Phone verification'], 
'1-2 business days', '24-48 hours', 
'{"amount": 0, "currency": "KES", "description": "Free government service"}', 
'{"amount": 500, "currency": "KES", "description": "Service fee for assistance"}', 
'simple', 98.5),

('Passport Application', 'passport-application', 'Kenya passport application and renewal assistance', 'Identity Documents', 'Immigration Department',
ARRAY['National ID', 'Birth Certificate', 'Passport Photos', 'Previous Passport (for renewal)'],
ARRAY['National ID Copy', 'Birth Certificate Copy', '2 Passport Photos', 'Previous Passport (if renewal)'],
'2-3 weeks', '14-21 days',
'{"amount": 4550, "currency": "KES", "description": "Government passport fee"}',
'{"amount": 1500, "currency": "KES", "description": "Application assistance fee"}',
'medium', 95.2),

('Business Registration', 'business-registration', 'Business name registration and permits', 'Business Services', 'Registrar of Companies',
ARRAY['National ID', 'Business Name Search', 'Pin Certificate'],
ARRAY['National ID Copy', 'KRA PIN Certificate', 'Memorandum and Articles'],
'3-5 business days', '3-7 days',
'{"amount": 2000, "currency": "KES", "description": "Government registration fee"}',
'{"amount": 1000, "currency": "KES", "description": "Registration assistance fee"}',
'medium', 92.8),

('NHIF Registration', 'nhif-registration', 'National Health Insurance Fund registration', 'Health Services', 'NHIF',
ARRAY['National ID', 'Employment Letter or Business Registration'],
ARRAY['National ID Copy', 'Employment verification'],
'1 business day', 'Same day',
'{"amount": 0, "currency": "KES", "description": "Free registration"}',
'{"amount": 300, "currency": "KES", "description": "Registration assistance"}',
'simple', 97.5),

('NSSF Registration', 'nssf-registration', 'National Social Security Fund registration', 'Pension Services', 'NSSF',
ARRAY['National ID', 'Employment Details'],
ARRAY['National ID Copy', 'Employment letter'],
'1 business day', 'Same day',
'{"amount": 0, "currency": "KES", "description": "Free registration"}',
'{"amount": 300, "currency": "KES", "description": "Registration assistance"}',
'simple', 96.8)
ON CONFLICT (slug) DO NOTHING;

-- Insert default system settings
INSERT INTO public.system_settings (key, value, description, category, is_public) VALUES
('business_name', '"RemotCyberHelp"', 'Business name', 'general', true),
('business_phone', '"+254708798850"', 'Main business phone number', 'contact', true),
('business_email', '"support@remotcyberhelp.com"', 'Main business email', 'contact', true),
('business_address', '{"street": "", "city": "Nairobi", "country": "Kenya"}', 'Business address', 'contact', true),
('site_title', '"RemotCyberHelp - Professional Tech Support Services"', 'Website title', 'seo', true),
('site_description', '"Professional technology support services for individuals and small businesses in Kenya. Expert remote assistance, consultations, and government service help."', 'Website description', 'seo', true),
('emergency_support_available', 'true', 'Emergency support availability', 'services', true),
('instant_support_available', 'true', 'Instant support availability', 'services', true),
('consultation_booking_enabled', 'true', 'Allow consultation bookings', 'services', true),
('government_services_enabled', 'true', 'Government services assistance enabled', 'services', true),
('blog_enabled', 'true', 'Blog functionality enabled', 'features', true),
('newsletter_enabled', 'true', 'Newsletter subscription enabled', 'features', true),
('file_upload_max_size', '10485760', 'Maximum file upload size in bytes (10MB)', 'uploads', false),
('supported_file_types', '["pdf", "doc", "docx", "jpg", "jpeg", "png", "gif"]', 'Supported file upload types', 'uploads', false),
('default_timezone', '"Africa/Nairobi"', 'Default timezone', 'general', true),
('default_currency', '"KES"', 'Default currency', 'general', true),
('maintenance_mode', 'false', 'Site maintenance mode', 'system', false),
('analytics_enabled', 'true', 'Enable analytics tracking', 'analytics', false),
('contact_form_email', '"admin@remotcyberhelp.com"', 'Email for contact form submissions', 'contact', false)
ON CONFLICT (key) DO NOTHING;

-- ==================== COMMENTS ====================

COMMENT ON TABLE public.user_profiles IS 'Extended user profiles with additional information';
COMMENT ON TABLE public.services IS 'Available technology support services';
COMMENT ON TABLE public.service_packages IS 'Service packages with different tiers (freemium, basic, premium)';
COMMENT ON TABLE public.blog_categories IS 'Blog post categories for organization';
COMMENT ON TABLE public.blog_likes IS 'User likes for blog posts';
COMMENT ON TABLE public.blog_views IS 'Blog post view tracking for analytics';
COMMENT ON TABLE public.ticket_messages IS 'Messages within support tickets';
COMMENT ON TABLE public.consultation_time_slots IS 'Available time slots for consultations';
COMMENT ON TABLE public.government_services IS 'Available government services for assistance';
COMMENT ON TABLE public.government_requests IS 'Government service assistance requests';
COMMENT ON TABLE public.contact_forms IS 'Contact form submissions and inquiries';
COMMENT ON TABLE public.newsletters IS 'Newsletter subscription management';
COMMENT ON TABLE public.user_activity IS 'User activity tracking for analytics';
COMMENT ON TABLE public.page_analytics IS 'Website page analytics and visitor tracking';
COMMENT ON TABLE public.file_uploads IS 'File upload management system';
COMMENT ON TABLE public.system_settings IS 'Global application settings and configuration';