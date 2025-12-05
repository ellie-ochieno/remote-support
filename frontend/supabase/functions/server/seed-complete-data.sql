-- ==================== COMPLETE DATA SEEDING FOR REMOTCYBERHELP ====================
-- This file seeds the database with comprehensive default data

-- Function to seed all default data
CREATE OR REPLACE FUNCTION seed_complete_data()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
    -- Seed blog categories (if not exists)
    INSERT INTO public.blog_categories (name, slug, description, color, icon, sort_order) VALUES
    ('Cybersecurity', 'cybersecurity', 'Security tips and threat protection guides', '#dc2626', '🔒', 1),
    ('Remote Work', 'remote-work', 'Home office setup and productivity tips', '#059669', '🏠', 2),
    ('Digital Profiles', 'digital-profiles', 'Online presence and social media management', '#2563eb', '📱', 3),
    ('Data Recovery', 'data-recovery', 'Backup solutions and data recovery services', '#7c3aed', '💾', 4),
    ('Tech Training', 'tech-training', 'Technology education and tutorials', '#ea580c', '🎓', 5),
    ('Government Services', 'government-services', 'Digital government service assistance', '#0891b2', '🏛️', 6),
    ('Device Support', 'device-support', 'Hardware troubleshooting and maintenance', '#65a30d', '🔧', 7)
    ON CONFLICT (slug) DO NOTHING;

    -- Seed services
    INSERT INTO public.services (name, slug, description, short_description, category, base_price, currency, estimated_duration, is_active, is_featured, has_emergency_support, has_instant_support, sort_order, seo_title, seo_description) VALUES
    ('Digital Profile Setup', 'digital-profile-setup', 
     'Complete digital presence setup including social media profiles, professional portfolios, online reputation management, and digital branding. We help you establish a professional online presence across all major platforms.',
     'Professional digital presence setup and management',
     'Digital Services', 2500.00, 'KES', 120, true, true, true, true, 1,
     'Professional Digital Profile Setup Services | RemotCyberHelp',
     'Expert digital profile creation and management services. Build your professional online presence with social media setup, portfolio creation, and reputation management.'),
    
    ('Device Support & Troubleshooting', 'device-support', 
     'Comprehensive device support for computers, smartphones, tablets, printers, and other tech devices. Remote diagnostics, software troubleshooting, hardware guidance, and performance optimization.',
     'Complete device troubleshooting and technical support',
     'Technical Support', 1500.00, 'KES', 90, true, true, true, true, 2,
     'Device Support & Technical Troubleshooting | RemotCyberHelp',
     'Professional device support services for computers, smartphones, and tech devices. Remote troubleshooting and technical assistance available 24/7.'),
    
    ('Technical Consultancy', 'technical-consultancy', 
     'Expert technical consulting for business technology decisions, system architecture, digital transformation strategies, IT infrastructure planning, and technology roadmap development.',
     'Expert technical consulting and IT strategy',
     'Consulting', 5000.00, 'KES', 180, true, true, false, true, 3,
     'IT Technical Consultancy Services | RemotCyberHelp',
     'Professional IT consulting services for business technology decisions, system architecture, and digital transformation strategies.'),
    
    ('Data Backup & Recovery', 'data-backup-recovery', 
     'Professional data backup solutions, emergency data recovery services, cloud storage setup, automated backup systems, and data migration assistance.',
     'Data protection, backup, and recovery services',
     'Data Services', 3000.00, 'KES', 150, true, true, true, false, 4,
     'Data Backup & Recovery Services | RemotCyberHelp',
     'Professional data backup and recovery services. Protect your important files with automated backup solutions and emergency recovery assistance.'),
    
    ('Cybersecurity Assessment', 'cybersecurity-assessment', 
     'Comprehensive security audits, vulnerability assessments, penetration testing, security policy development, and cybersecurity training for individuals and businesses.',
     'Security audit and cyber protection services',
     'Security', 4000.00, 'KES', 240, true, true, false, false, 5,
     'Cybersecurity Assessment & Protection | RemotCyberHelp',
     'Professional cybersecurity assessment services including security audits, vulnerability testing, and protection strategy development.'),
    
    ('Remote Work Setup', 'remote-work-setup', 
     'Complete remote work environment setup including productivity tools, security configurations, collaboration platforms, and home office optimization.',
     'Remote work optimization and setup',
     'Productivity', 2000.00, 'KES', 120, true, false, false, true, 6,
     'Remote Work Setup & Optimization | RemotCyberHelp',
     'Professional remote work setup services including productivity tools, security setup, and home office optimization for maximum efficiency.'),
    
    ('Software Installation & Training', 'software-training', 
     'Software installation, configuration, user training, license management, and ongoing support for various business and personal applications.',
     'Software setup, installation, and training',
     'Training', 1800.00, 'KES', 150, true, false, false, true, 7,
     'Software Installation & Training Services | RemotCyberHelp',
     'Expert software installation and user training services. Get your applications configured correctly with comprehensive user training.'),
    
    ('Network Setup & Optimization', 'network-setup', 
     'Home and office network setup, WiFi optimization, router configuration, network security, and connectivity troubleshooting.',
     'Network configuration and optimization',
     'Infrastructure', 2500.00, 'KES', 180, true, false, true, false, 8,
     'Network Setup & WiFi Optimization | RemotCyberHelp',
     'Professional network setup and optimization services including WiFi configuration, security setup, and connectivity troubleshooting.'),
    
    ('Cloud Services Migration', 'cloud-migration', 
     'Migration to cloud platforms (Google Workspace, Microsoft 365, AWS), setup and optimization of cloud-based workflows, and cloud security configuration.',
     'Cloud platform migration and setup',
     'Cloud Services', 4500.00, 'KES', 300, true, false, false, false, 9,
     'Cloud Services Migration & Setup | RemotCyberHelp',
     'Professional cloud migration services for Google Workspace, Microsoft 365, and other cloud platforms with security and optimization.'),
    
    ('Tech Support Training', 'tech-support-training', 
     'Comprehensive technology training programs for individuals and teams including digital literacy, software training, and cybersecurity awareness.',
     'Technology skills training and education',
     'Training', 3500.00, 'KES', 240, true, false, false, false, 10,
     'Technology Training & Digital Literacy | RemotCyberHelp',
     'Comprehensive technology training programs for individuals and teams. Build digital skills with expert-led training sessions.')
    ON CONFLICT (slug) DO NOTHING;

    -- Get service IDs for package creation
    DECLARE
        digital_profile_id UUID;
        device_support_id UUID;
        consultancy_id UUID;
        data_backup_id UUID;
        cybersecurity_id UUID;
        remote_work_id UUID;
        software_training_id UUID;
        network_setup_id UUID;
        cloud_migration_id UUID;
        tech_training_id UUID;
    BEGIN
        SELECT id INTO digital_profile_id FROM public.services WHERE slug = 'digital-profile-setup';
        SELECT id INTO device_support_id FROM public.services WHERE slug = 'device-support';
        SELECT id INTO consultancy_id FROM public.services WHERE slug = 'technical-consultancy';
        SELECT id INTO data_backup_id FROM public.services WHERE slug = 'data-backup-recovery';
        SELECT id INTO cybersecurity_id FROM public.services WHERE slug = 'cybersecurity-assessment';
        SELECT id INTO remote_work_id FROM public.services WHERE slug = 'remote-work-setup';
        SELECT id INTO software_training_id FROM public.services WHERE slug = 'software-training';
        SELECT id INTO network_setup_id FROM public.services WHERE slug = 'network-setup';
        SELECT id INTO cloud_migration_id FROM public.services WHERE slug = 'cloud-migration';
        SELECT id INTO tech_training_id FROM public.services WHERE slug = 'tech-support-training';

        -- Seed service packages
        -- Digital Profile Setup packages
        INSERT INTO public.service_packages (service_id, name, slug, description, package_type, price, duration_minutes, features, is_active, sort_order) VALUES
        (digital_profile_id, 'Basic Digital Profile', 'basic-digital-profile', 'Essential social media profile setup', 'freemium', 0, 60, 
         ARRAY['LinkedIn profile setup', 'Basic profile optimization', 'Privacy settings configuration'], true, 1),
        (digital_profile_id, 'Professional Digital Presence', 'professional-digital-presence', 'Complete professional online presence', 'premium', 2500, 120,
         ARRAY['Multiple platform setup', 'Professional branding', 'Content strategy', 'SEO optimization', 'Ongoing support'], true, 2),
        (digital_profile_id, 'Enterprise Digital Branding', 'enterprise-digital-branding', 'Comprehensive digital branding solution', 'enterprise', 5000, 240,
         ARRAY['Complete brand identity', 'Multi-platform presence', 'Content creation', 'Analytics setup', 'Monthly maintenance'], true, 3);

        -- Device Support packages
        INSERT INTO public.service_packages (service_id, name, slug, description, package_type, price, duration_minutes, features, is_active, sort_order) VALUES
        (device_support_id, 'Quick Device Check', 'quick-device-check', 'Basic device diagnostics and quick fixes', 'freemium', 0, 30,
         ARRAY['Basic diagnostics', 'Simple troubleshooting', 'Performance tips'], true, 1),
        (device_support_id, 'Standard Device Support', 'standard-device-support', 'Comprehensive device troubleshooting', 'basic', 1500, 90,
         ARRAY['Complete diagnostics', 'Software troubleshooting', 'Performance optimization', 'Security scan'], true, 2),
        (device_support_id, 'Premium Device Care', 'premium-device-care', 'Complete device management and support', 'premium', 3000, 180,
         ARRAY['Full system optimization', 'Security hardening', 'Data backup', 'Preventive maintenance', '30-day follow-up'], true, 3);

        -- Technical Consultancy packages
        INSERT INTO public.service_packages (service_id, name, slug, description, package_type, price, duration_minutes, features, is_active, sort_order) VALUES
        (consultancy_id, 'IT Strategy Consultation', 'it-strategy-consultation', 'Strategic technology consulting session', 'basic', 5000, 180,
         ARRAY['Technology assessment', 'Strategic planning', 'Roadmap development', 'ROI analysis'], true, 1),
        (consultancy_id, 'Digital Transformation', 'digital-transformation', 'Comprehensive digital transformation consulting', 'premium', 10000, 360,
         ARRAY['Complete digital audit', 'Transformation strategy', 'Implementation planning', 'Change management', 'Ongoing support'], true, 2);

        -- Data Backup & Recovery packages
        INSERT INTO public.service_packages (service_id, name, slug, description, package_type, price, duration_minutes, features, is_active, sort_order) VALUES
        (data_backup_id, 'Basic Backup Setup', 'basic-backup-setup', 'Essential backup solution setup', 'freemium', 0, 60,
         ARRAY['Cloud backup setup', 'Basic automation', 'Recovery testing'], true, 1),
        (data_backup_id, 'Professional Backup Solution', 'professional-backup-solution', 'Comprehensive backup and recovery system', 'premium', 3000, 150,
         ARRAY['Multi-tier backup system', 'Automated scheduling', 'Disaster recovery plan', 'Regular testing', 'Monthly monitoring'], true, 2),
        (data_backup_id, 'Emergency Data Recovery', 'emergency-data-recovery', 'Emergency data recovery service', 'enterprise', 5000, 240,
         ARRAY['Emergency recovery', 'Advanced techniques', 'Multiple device types', 'Priority support', 'Success guarantee'], true, 3);

        -- Cybersecurity Assessment packages
        INSERT INTO public.service_packages (service_id, name, slug, description, package_type, price, duration_minutes, features, is_active, sort_order) VALUES
        (cybersecurity_id, 'Security Quick Scan', 'security-quick-scan', 'Basic security assessment', 'freemium', 0, 60,
         ARRAY['Basic vulnerability scan', 'Security recommendations', 'Quick fixes'], true, 1),
        (cybersecurity_id, 'Comprehensive Security Audit', 'comprehensive-security-audit', 'Complete security assessment and hardening', 'premium', 4000, 240,
         ARRAY['Full vulnerability assessment', 'Penetration testing', 'Security policy development', 'Implementation guidance', 'Follow-up review'], true, 2);

        -- Remote Work Setup packages  
        INSERT INTO public.service_packages (service_id, name, slug, description, package_type, price, duration_minutes, features, is_active, sort_order) VALUES
        (remote_work_id, 'Basic Remote Setup', 'basic-remote-setup', 'Essential remote work tools setup', 'freemium', 0, 60,
         ARRAY['Basic tools setup', 'Video conferencing', 'File sharing'], true, 1),
        (remote_work_id, 'Professional Remote Office', 'professional-remote-office', 'Complete remote work environment', 'premium', 2000, 120,
         ARRAY['Productivity suite setup', 'Security configuration', 'Collaboration tools', 'Workflow optimization', 'Training session'], true, 2);

        -- Software Training packages
        INSERT INTO public.service_packages (service_id, name, slug, description, package_type, price, duration_minutes, features, is_active, sort_order) VALUES
        (software_training_id, 'Software Quick Start', 'software-quick-start', 'Basic software installation and setup', 'freemium', 0, 45,
         ARRAY['Software installation', 'Basic configuration', 'Quick tutorial'], true, 1),
        (software_training_id, 'Complete Software Training', 'complete-software-training', 'Comprehensive software training program', 'premium', 1800, 150,
         ARRAY['Full installation and setup', 'Comprehensive training', 'Best practices', 'Ongoing support', 'Resource materials'], true, 2);

        -- Network Setup packages
        INSERT INTO public.service_packages (service_id, name, slug, description, package_type, price, duration_minutes, features, is_active, sort_order) VALUES
        (network_setup_id, 'Basic Network Setup', 'basic-network-setup', 'Simple home network configuration', 'freemium', 0, 90,
         ARRAY['Router setup', 'WiFi configuration', 'Basic security'], true, 1),
        (network_setup_id, 'Professional Network Solution', 'professional-network-solution', 'Advanced network setup and optimization', 'premium', 2500, 180,
         ARRAY['Advanced configuration', 'Network optimization', 'Security hardening', 'Performance monitoring', 'Documentation'], true, 2);

        -- Cloud Migration packages
        INSERT INTO public.service_packages (service_id, name, slug, description, package_type, price, duration_minutes, features, is_active, sort_order) VALUES
        (cloud_migration_id, 'Basic Cloud Setup', 'basic-cloud-setup', 'Simple cloud platform setup', 'basic', 4500, 300,
         ARRAY['Platform setup', 'Basic migration', 'User training', 'Security configuration'], true, 1),
        (cloud_migration_id, 'Enterprise Cloud Migration', 'enterprise-cloud-migration', 'Complete enterprise cloud transformation', 'enterprise', 8000, 480,
         ARRAY['Complete migration strategy', 'Data migration', 'Security implementation', 'User training', 'Ongoing optimization'], true, 2);

        -- Tech Training packages
        INSERT INTO public.service_packages (service_id, name, slug, description, package_type, price, duration_minutes, features, is_active, sort_order) VALUES
        (tech_training_id, 'Digital Literacy Basics', 'digital-literacy-basics', 'Basic technology skills training', 'freemium', 0, 120,
         ARRAY['Computer basics', 'Internet safety', 'Email setup', 'Basic troubleshooting'], true, 1),
        (tech_training_id, 'Professional Tech Training', 'professional-tech-training', 'Comprehensive technology training program', 'premium', 3500, 240,
         ARRAY['Advanced skills training', 'Software proficiency', 'Cybersecurity awareness', 'Productivity optimization', 'Certification'], true, 2);

    END;

    -- Seed government services
    INSERT INTO public.government_services (name, slug, description, category, department, requirements, required_documents, estimated_duration, processing_time, government_fees, service_fees, complexity_level, success_rate) VALUES
    ('KRA PIN Registration', 'kra-pin', 
     'Kenya Revenue Authority Personal Identification Number registration for tax purposes. Required for all Kenyan taxpayers and essential for business operations.',
     'Tax Services', 'Kenya Revenue Authority',
     ARRAY['Valid National ID', 'Phone Number', 'Email Address'], 
     ARRAY['National ID Copy', 'Phone verification'], 
     '1-2 business days', '24-48 hours', 
     '{"amount": 0, "currency": "KES", "description": "Free government service"}', 
     '{"amount": 500, "currency": "KES", "description": "Service assistance fee"}', 
     'simple', 98.5),

    ('Passport Application', 'passport-application', 
     'Kenya passport application and renewal assistance including document preparation, form filling, and submission support.',
     'Identity Documents', 'Immigration Department',
     ARRAY['National ID', 'Birth Certificate', 'Passport Photos', 'Previous Passport (for renewal)'],
     ARRAY['National ID Copy', 'Birth Certificate Copy', '2 Passport Photos', 'Previous Passport (if renewal)'],
     '2-3 weeks', '14-21 days',
     '{"amount": 4550, "currency": "KES", "description": "Government passport fee"}',
     '{"amount": 1500, "currency": "KES", "description": "Application assistance fee"}',
     'medium', 95.2),

    ('Business Registration', 'business-registration', 
     'Complete business name registration, permits, and legal documentation assistance for new businesses.',
     'Business Services', 'Registrar of Companies',
     ARRAY['National ID', 'Business Name Search', 'Pin Certificate'],
     ARRAY['National ID Copy', 'KRA PIN Certificate', 'Memorandum and Articles'],
     '3-5 business days', '3-7 days',
     '{"amount": 2000, "currency": "KES", "description": "Government registration fee"}',
     '{"amount": 1000, "currency": "KES", "description": "Registration assistance fee"}',
     'medium', 92.8),

    ('NHIF Registration', 'nhif-registration', 
     'National Health Insurance Fund registration for healthcare coverage and benefits.',
     'Health Services', 'NHIF',
     ARRAY['National ID', 'Employment Letter or Business Registration'],
     ARRAY['National ID Copy', 'Employment verification'],
     '1 business day', 'Same day',
     '{"amount": 0, "currency": "KES", "description": "Free registration"}',
     '{"amount": 300, "currency": "KES", "description": "Registration assistance"}',
     'simple', 97.5),

    ('NSSF Registration', 'nssf-registration', 
     'National Social Security Fund registration for pension and social security benefits.',
     'Pension Services', 'NSSF',
     ARRAY['National ID', 'Employment Details'],
     ARRAY['National ID Copy', 'Employment letter'],
     '1 business day', 'Same day',
     '{"amount": 0, "currency": "KES", "description": "Free registration"}',
     '{"amount": 300, "currency": "KES", "description": "Registration assistance"}',
     'simple', 96.8),

    ('Good Conduct Certificate', 'good-conduct-certificate', 
     'Certificate of Good Conduct from the Directorate of Criminal Investigations for employment and travel purposes.',
     'Legal Documents', 'Directorate of Criminal Investigations',
     ARRAY['National ID', 'Passport Photos', 'Fingerprints'],
     ARRAY['National ID Copy', '2 Passport Photos', 'Fingerprint forms'],
     '2-3 weeks', '14-21 days',
     '{"amount": 1000, "currency": "KES", "description": "Government certificate fee"}',
     '{"amount": 800, "currency": "KES", "description": "Application assistance fee"}',
     'medium', 94.0),

    ('County Business Permit', 'county-business-permit', 
     'County government business permit and license application assistance.',
     'Business Services', 'County Government',
     ARRAY['Business Registration Certificate', 'National ID', 'Location Details'],
     ARRAY['Business Certificate Copy', 'National ID Copy', 'Location map'],
     '5-7 business days', '5-10 days',
     '{"amount": 2500, "currency": "KES", "description": "County permit fee"}',
     '{"amount": 1200, "currency": "KES", "description": "Permit assistance fee"}',
     'medium', 90.5),

    ('Tax Returns Filing', 'tax-returns-filing', 
     'Annual tax returns preparation and filing assistance for individuals and businesses.',
     'Tax Services', 'Kenya Revenue Authority',
     ARRAY['P9 forms', 'Bank statements', 'Income records', 'Expense receipts'],
     ARRAY['P9 Form', 'Bank statements', 'Investment certificates', 'Expense receipts'],
     '2-3 days', '2-5 days',
     '{"amount": 0, "currency": "KES", "description": "Free filing service"}',
     '{"amount": 2000, "currency": "KES", "description": "Preparation and filing assistance"}',
     'complex', 96.2),

    ('Work Permit Application', 'work-permit-application', 
     'Work permit application assistance for foreign nationals seeking employment in Kenya.',
     'Immigration Services', 'Department of Immigration',
     ARRAY['Passport', 'Educational Certificates', 'Employment Offer', 'Medical Certificate'],
     ARRAY['Passport copy', 'Degree certificates', 'Job offer letter', 'Medical report'],
     '4-6 weeks', '30-45 days',
     '{"amount": 10000, "currency": "KES", "description": "Government work permit fee"}',
     '{"amount": 3000, "currency": "KES", "description": "Application assistance fee"}',
     'complex', 87.5),

    ('Birth Certificate Application', 'birth-certificate-application', 
     'Birth certificate application and replacement assistance for Kenyan citizens.',
     'Identity Documents', 'Civil Registration Services',
     ARRAY['Notification of Birth', 'National ID of Parents', 'Hospital Records'],
     ARRAY['Birth notification form', 'Parents ID copies', 'Hospital birth records'],
     '2-3 weeks', '14-21 days',
     '{"amount": 50, "currency": "KES", "description": "Government certificate fee"}',
     '{"amount": 500, "currency": "KES", "description": "Application assistance fee"}',
     'simple', 95.8)
    ON CONFLICT (slug) DO NOTHING;

    -- Seed system settings
    INSERT INTO public.system_settings (key, value, description, category, is_public) VALUES
    ('business_name', '"RemotCyberHelp"', 'Business name', 'general', true),
    ('business_phone', '"+254708798850"', 'Main business phone number', 'contact', true),
    ('business_email', '"support@remotcyberhelp.com"', 'Main business email', 'contact', true),
    ('business_address', '{"street": "", "city": "Nairobi", "country": "Kenya", "postal_code": ""}', 'Business address', 'contact', true),
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
    ('contact_form_email', '"admin@remotcyberhelp.com"', 'Email for contact form submissions', 'contact', false),
    ('emergency_hours', '{"enabled": true, "hours": "24/7 for critical issues"}', 'Emergency support hours', 'services', true),
    ('consultation_duration_options', '[30, 60, 90, 120]', 'Available consultation duration options in minutes', 'services', true),
    ('max_file_uploads_per_ticket', '5', 'Maximum file uploads per support ticket', 'uploads', false),
    ('ticket_auto_close_days', '7', 'Days to auto-close resolved tickets', 'tickets', false),
    ('newsletter_frequency_options', '["weekly", "monthly", "quarterly"]', 'Newsletter frequency options', 'newsletter', true)
    ON CONFLICT (key) DO NOTHING;

    -- Seed sample blog posts
    INSERT INTO public.blog_posts (title, slug, content, excerpt, author, category, tags, featured_image, published, featured, reading_time, meta_title, meta_description) 
    SELECT 
        'Top 10 Cybersecurity Tips for Small Businesses in Kenya',
        'cybersecurity-tips-small-businesses-kenya',
        'Cybersecurity is crucial for small businesses in Kenya. Here are the top 10 tips to protect your business from cyber threats...',
        'Essential cybersecurity practices every small business in Kenya should implement to protect against cyber threats and data breaches.',
        'RemotCyberHelp Team',
        'Cybersecurity',
        ARRAY['cybersecurity', 'small business', 'kenya', 'data protection'],
        NULL,
        true,
        true,
        8,
        'Top 10 Cybersecurity Tips for Small Businesses in Kenya | RemotCyberHelp',
        'Learn essential cybersecurity practices for small businesses in Kenya. Protect your business from cyber threats with expert tips and strategies.'
    WHERE NOT EXISTS (SELECT 1 FROM public.blog_posts WHERE slug = 'cybersecurity-tips-small-businesses-kenya');

    INSERT INTO public.blog_posts (title, slug, content, excerpt, author, category, tags, featured_image, published, featured, reading_time, meta_title, meta_description)
    SELECT 
        'Complete Guide to Setting Up Your Home Office for Remote Work',
        'home-office-setup-remote-work-guide',
        'Working from home requires the right setup for productivity and success. This comprehensive guide covers everything you need...',
        'Transform your home into a productive workspace with our complete guide to home office setup for remote work success.',
        'RemotCyberHelp Team',
        'Remote Work',
        ARRAY['remote work', 'home office', 'productivity', 'workspace'],
        NULL,
        true,
        false,
        12,
        'Complete Home Office Setup Guide for Remote Work | RemotCyberHelp',
        'Create the perfect home office for remote work with our comprehensive setup guide. Boost productivity with expert workspace tips.'
    WHERE NOT EXISTS (SELECT 1 FROM public.blog_posts WHERE slug = 'home-office-setup-remote-work-guide');

    RAISE NOTICE 'Complete data seeding finished successfully';

END;
$$;

-- Execute the seeding function
SELECT seed_complete_data();