-- ==================== SERVICES DATA SEEDING ====================

-- Function to seed all services and packages
CREATE OR REPLACE FUNCTION seed_services_and_packages()
RETURNS void
LANGUAGE sql
AS $$
  -- Insert services with comprehensive details
  INSERT INTO services (name, slug, description, short_description, category, icon, features, benefits, pricing, active, featured, metadata)
  VALUES 
    -- Digital Profiles & Government Services
    (
      'Digital Profiles & Government Services',
      'digital-profiles',
      'Professional account setup, security configurations, government document processing, and official registration services including KRA PIN, passport applications, and tax filing assistance.',
      'Account setup, security configs, and government document assistance',
      'Government & Identity',
      '👤',
      ARRAY[
        'Secure account creation & 2FA setup',
        'Social media profile optimization', 
        'Passport application assistance',
        'KRA PIN registration & iTax setup',
        'Tax returns filing support',
        'Government form completion',
        'Digital identity verification',
        'Account security audits'
      ],
      ARRAY[
        'Enhanced online security',
        'Professional digital presence',
        'Government compliance',
        'Time-saving document processing',
        'Expert guidance through bureaucracy',
        'Reduced application errors'
      ],
      '{
        "freemium": {
          "name": "Basic Digital Profile",
          "price": 0,
          "currency": "KES",
          "features": ["Basic account setup", "Security checklist", "Simple profile optimization"],
          "limitations": ["1 platform only", "Basic security setup", "Email support only"]
        },
        "premium": {
          "name": "Complete Digital & Government Package", 
          "price": 2500,
          "currency": "KES",
          "features": ["Full account setup", "Advanced 2FA configuration", "Government document assistance", "Tax filing support", "Priority support"],
          "billing": "per_service"
        }
      }',
      true,
      true,
      '{"service_duration": "2-4 hours", "complexity": "medium", "government_partnerships": true}'
    ),
    
    -- Virtual Communication Support
    (
      'Virtual Communication Support',
      'virtual-communication', 
      'Master virtual meetings and collaboration tools for seamless remote communication including video conferencing setup, screen sharing optimization, and collaboration platform integration.',
      'Video meetings, collaboration tools, and remote communication mastery',
      'Communication & Collaboration',
      '📹',
      ARRAY[
        'Video conferencing setup (Zoom, Teams, Meet)',
        'Screen sharing optimization',
        'Audio/video troubleshooting', 
        'Collaboration tools integration',
        'Virtual background configuration',
        'Meeting recording setup',
        'Bandwidth optimization',
        'Security settings configuration'
      ],
      ARRAY[
        'Professional meeting presence',
        'Improved communication quality',
        'Reduced technical issues',
        'Enhanced productivity',
        'Better remote collaboration',
        'Time-efficient meetings'
      ],
      '{
        "freemium": {
          "name": "Basic Video Setup",
          "price": 0,
          "currency": "KES", 
          "features": ["Basic Zoom/Teams setup", "Audio test", "Simple troubleshooting"],
          "limitations": ["1 platform only", "30-minute session", "No recording setup"]
        },
        "premium": {
          "name": "Complete Communication Suite",
          "price": 1800,
          "currency": "KES",
          "features": ["Multi-platform setup", "Advanced features config", "Recording & sharing setup", "Security optimization", "Follow-up support"],
          "billing": "per_session"
        }
      }',
      true,
      false,
      '{"session_duration": "1-2 hours", "platforms_supported": ["zoom", "teams", "meet", "webex"], "includes_training": true}'
    ),
    
    -- Device Support & Troubleshooting  
    (
      'Device Support & Troubleshooting',
      'device-support',
      'Comprehensive device maintenance, software support, and printer services for optimal performance including installation, updates, and network configuration.',
      'Software support, hardware troubleshooting, and printer setup services',
      'Hardware & Software',
      '🔧',
      ARRAY[
        'Software installation & updates',
        'Performance optimization',
        'Virus/malware removal', 
        'Printer setup & troubleshooting',
        'Network printing configuration',
        'Driver installation',
        'System cleanup & maintenance',
        'Hardware diagnostics'
      ],
      ARRAY[
        'Improved system performance',
        'Reliable printing solutions', 
        'Enhanced security',
        'Reduced downtime',
        'Extended device lifespan',
        'Cost-effective maintenance'
      ],
      '{
        "freemium": {
          "name": "Basic Device Checkup",
          "price": 0,
          "currency": "KES",
          "features": ["System scan", "Basic cleanup", "Performance check"],
          "limitations": ["Surface-level diagnosis", "No software installation", "15-minute session"]
        },
        "premium": {
          "name": "Complete Device Optimization",
          "price": 2200,
          "currency": "KES", 
          "features": ["Full system optimization", "Software installation", "Printer setup", "Security configuration", "Performance tuning"],
          "billing": "per_device"
        }
      }',
      true,
      true,
      '{"service_duration": "1-3 hours", "remote_access_required": true, "includes_software": true}'
    ),
    
    -- Technical Consultancy
    (
      'Technical Consultancy',
      'technical-consultancy',
      'Expert guidance on technology decisions, project planning, budget optimization, and strategic technology roadmaps for individuals and small businesses.',
      'Technology planning, budget guidance, and strategic tech decisions',
      'Consulting & Strategy',
      '💡',
      ARRAY[
        'Technology needs assessment',
        'Budget planning & cost optimization',
        'Vendor selection & comparison',
        'Implementation roadmaps',
        'Risk assessment & mitigation',
        'ROI analysis',
        'Future-proofing strategies',
        'Compliance requirements review'
      ],
      ARRAY[
        'Informed technology decisions',
        'Cost-effective solutions',
        'Reduced implementation risks',
        'Strategic advantage',
        'Future-ready planning',
        'Expert recommendations'
      ],
      '{
        "freemium": {
          "name": "Basic Tech Consultation",
          "price": 0,
          "currency": "KES",
          "features": ["30-minute consultation", "Basic needs assessment", "General recommendations"],
          "limitations": ["No detailed planning", "No documentation", "Email follow-up only"]
        },
        "premium": {
          "name": "Comprehensive Tech Strategy",
          "price": 4500,
          "currency": "KES",
          "features": ["Detailed needs analysis", "Budget planning", "Implementation roadmap", "Vendor recommendations", "Written report", "Follow-up sessions"],
          "billing": "per_consultation"
        }
      }',
      true,
      false,
      '{"consultation_duration": "1-4 hours", "includes_report": true, "follow_up_included": true}'
    ),
    
    -- Data Backup & Recovery
    (
      'Data Backup & Recovery', 
      'data-backup-recovery',
      'Secure data protection and recovery solutions including cloud backup setup, automated scheduling, and disaster recovery planning to safeguard your critical information.',
      'Cloud backup, data recovery, and protection solutions',
      'Data & Security',
      '💾',
      ARRAY[
        'Automated backup setup',
        'Cloud storage configuration (Google Drive, OneDrive, Dropbox)',
        'Data recovery services',
        'Disaster recovery planning',
        'Backup verification & testing',
        'File synchronization setup',
        'Version control configuration',
        'Encrypted backup solutions'
      ],
      ARRAY[
        'Protected against data loss',
        'Peace of mind',
        'Quick data recovery',
        'Automated protection',
        'Accessible from anywhere',
        'Compliance with data regulations'
      ],
      '{
        "freemium": {
          "name": "Basic Backup Setup",
          "price": 0,
          "currency": "KES",
          "features": ["Simple cloud backup setup", "Basic file selection", "Manual backup process"],
          "limitations": ["5GB backup limit", "Manual process only", "Basic support"]
        },
        "premium": {
          "name": "Complete Data Protection Suite",
          "price": 2800,
          "currency": "KES",
          "features": ["Automated multi-cloud backup", "Disaster recovery plan", "Encrypted backups", "Recovery testing", "Unlimited storage setup", "Priority recovery support"],
          "billing": "per_setup"
        }
      }',
      true,
      false,
      '{"setup_duration": "2-3 hours", "cloud_providers": ["google", "microsoft", "dropbox"], "includes_testing": true}'
    ),
    
    -- Network Troubleshooting
    (
      'Network Troubleshooting',
      'network-troubleshooting',
      'Optimize your Wi-Fi and network performance for reliable connectivity including speed optimization, security configuration, and router management.',
      'Wi-Fi optimization, network security, and connectivity solutions',
      'Network & Connectivity', 
      '📡',
      ARRAY[
        'Wi-Fi optimization & range extension',
        'Network security configuration',
        'Internet speed testing & optimization',
        'Router configuration & firmware updates',
        'VPN setup & configuration',
        'Network troubleshooting & diagnostics',
        'Bandwidth management',
        'Guest network setup'
      ],
      ARRAY[
        'Faster internet speeds',
        'Enhanced security',
        'Reliable connectivity',
        'Better coverage',
        'Optimized performance',
        'Secure guest access'
      ],
      '{
        "freemium": {
          "name": "Basic Network Check",
          "price": 0,
          "currency": "KES",
          "features": ["Speed test", "Basic diagnostics", "Simple troubleshooting tips"],
          "limitations": ["No configuration changes", "Basic recommendations only", "15-minute session"]
        },
        "premium": {
          "name": "Complete Network Optimization",
          "price": 2000,
          "currency": "KES",
          "features": ["Full network optimization", "Security configuration", "Router setup", "VPN configuration", "Speed optimization", "Ongoing support"],
          "billing": "per_network"
        }
      }',
      true,
      false,
      '{"service_duration": "1-2 hours", "router_access_required": true, "security_focus": true}'
    ),
    
    -- Customized Tech Training
    (
      'Customized Tech Training',
      'tech-training',
      'Digital skills and cybersecurity training tailored for individuals and small businesses including online safety, digital marketing basics, and essential tech skills.',
      'Digital skills, cybersecurity training, and online safety education',
      'Education & Training',
      '🎓', 
      ARRAY[
        'Cybersecurity fundamentals & best practices',
        'Digital marketing basics & social media',
        'Remote work tools & productivity apps',
        'Essential tech skills for business',
        'Online safety & privacy protection',
        'Cloud services training',
        'Microsoft Office/Google Workspace training',
        'Mobile device security'
      ],
      ARRAY[
        'Improved digital literacy',
        'Enhanced cybersecurity awareness',
        'Increased productivity',
        'Better online presence',
        'Reduced security risks',
        'Confidence with technology'
      ],
      '{
        "freemium": {
          "name": "Basic Digital Skills",
          "price": 0,
          "currency": "KES", 
          "features": ["1-hour training session", "Basic cybersecurity tips", "Essential skills overview"],
          "limitations": ["Group session only", "No personalized content", "No materials provided"]
        },
        "premium": {
          "name": "Comprehensive Tech Training Program",
          "price": 3500,
          "currency": "KES",
          "features": ["Personalized training program", "Multiple sessions", "Custom materials", "Hands-on practice", "Certification", "Follow-up support"],
          "billing": "per_program"
        }
      }',
      true,
      true,
      '{"program_duration": "4-8 hours", "certification_available": true, "custom_content": true}'
    ),
    
    -- IoT Device Setup
    (
      'IoT Device Setup & Support', 
      'iot-setup',
      'Smart device integration and management for your connected environment including home automation, device security, and seamless connectivity setup.',
      'Smart home setup, IoT integration, and connected device management',
      'IoT & Smart Devices',
      '🏠',
      ARRAY[
        'Smart device installation & configuration',
        'Home automation setup (Alexa, Google Home)',
        'IoT device integration & management',
        'Smart security system setup',
        'Network optimization for IoT devices',
        'Device security configuration',
        'Voice assistant setup',
        'Smart lighting & climate control'
      ],
      ARRAY[
        'Convenient home automation',
        'Enhanced security monitoring',
        'Energy efficiency',
        'Remote control capabilities',
        'Streamlined daily routines',
        'Future-ready smart home'
      ],
      '{
        "freemium": {
          "name": "Basic Smart Device Setup",
          "price": 0,
          "currency": "KES",
          "features": ["1 device setup", "Basic configuration", "Connection assistance"],
          "limitations": ["1 device only", "No automation setup", "Basic support"]
        },
        "premium": {
          "name": "Complete Smart Home Integration",
          "price": 3200,
          "currency": "KES",
          "features": ["Multiple device setup", "Home automation configuration", "Security setup", "Network optimization", "Voice assistant integration", "Ongoing support"],
          "billing": "per_home"
        }
      }',
      true,
      false,
      '{"setup_duration": "2-4 hours", "device_compatibility_check": true, "automation_included": true}'
    ),
    
    -- Digital Marketing Assistance
    (
      'Digital Marketing Assistance',
      'digital-marketing', 
      'Build your online presence and reach more customers effectively with social media optimization, content strategy, and digital marketing fundamentals.',
      'Social media setup, online presence, and digital marketing basics',
      'Marketing & Business',
      '📈',
      ARRAY[
        'Social media profile setup & optimization',
        'Content strategy development',
        'SEO basics & website optimization',
        'Google My Business setup',
        'Social media scheduling & automation',
        'Analytics setup & interpretation',
        'Online advertising guidance',
        'Brand consistency across platforms'
      ],
      ARRAY[
        'Increased online visibility',
        'Better customer engagement',
        'Professional brand presence',
        'Improved search rankings',
        'Higher conversion rates',
        'Measurable results'
      ],
      '{
        "freemium": {
          "name": "Basic Online Presence",
          "price": 0,
          "currency": "KES",
          "features": ["1 social media profile setup", "Basic optimization tips", "Simple content guidelines"],
          "limitations": ["1 platform only", "No strategy document", "Basic guidance only"]
        },
        "premium": {
          "name": "Complete Digital Marketing Setup",
          "price": 2800,
          "currency": "KES",
          "features": ["Multi-platform setup", "Content strategy", "SEO optimization", "Analytics setup", "Advertising guidance", "Monthly review sessions"],
          "billing": "per_business"
        }
      }',
      true,
      false,
      '{"setup_duration": "3-5 hours", "platforms_included": ["facebook", "instagram", "linkedin", "twitter"], "strategy_included": true}'
    ),
    
    -- Remote Hardware Support
    (
      'Remote Hardware Support',
      'hardware-support',
      'Expert hardware diagnostics and repair guidance for all your devices including performance troubleshooting, upgrade recommendations, and maintenance guidance.',
      'Hardware diagnostics, repair guidance, and performance optimization',
      'Hardware & Maintenance',
      '🖥️',
      ARRAY[
        'Hardware diagnostics & health checks',
        'Performance troubleshooting',
        'Upgrade recommendations & compatibility',
        'Repair guidance & tutorials',
        'Preventive maintenance schedules',
        'Temperature monitoring & cooling solutions',
        'Storage optimization',
        'Hardware lifecycle planning'
      ],
      ARRAY[
        'Extended hardware lifespan',
        'Improved performance',
        'Cost-effective upgrades',
        'Preventive maintenance',
        'Expert recommendations',
        'Reduced hardware failures'
      ],
      '{
        "freemium": {
          "name": "Basic Hardware Diagnosis",
          "price": 0,
          "currency": "KES",
          "features": ["System health check", "Basic performance assessment", "General recommendations"],
          "limitations": ["Surface-level diagnosis only", "No detailed analysis", "15-minute session"]
        },
        "premium": {
          "name": "Comprehensive Hardware Assessment",
          "price": 2500,
          "currency": "KES", 
          "features": ["Detailed hardware analysis", "Performance optimization", "Upgrade roadmap", "Maintenance plan", "Repair guidance", "Follow-up support"],
          "billing": "per_system"
        }
      }',
      true,
      false,
      '{"assessment_duration": "1-2 hours", "detailed_report": true, "upgrade_planning": true}'
    )
  ON CONFLICT (slug) DO NOTHING;

  -- Insert service packages for each service
  INSERT INTO service_packages (service_id, name, slug, description, price, currency, duration_minutes, features, is_freemium, active, sort_order, metadata)
  SELECT 
    s.id,
    'Freemium Package',
    'freemium',
    'Basic service package with essential features to get you started',
    0.00,
    'KES', 
    30,
    ARRAY['Basic setup', 'Email support', 'Getting started guide'],
    true,
    true,
    1,
    '{"type": "freemium", "support_level": "basic"}'
  FROM services s
  WHERE s.active = true
  ON CONFLICT (service_id, slug) DO NOTHING;

  INSERT INTO service_packages (service_id, name, slug, description, price, currency, duration_minutes, features, is_freemium, active, sort_order, metadata)
  SELECT 
    s.id,
    'Standard Package',
    'standard', 
    'Comprehensive service package with full features and priority support',
    CASE s.slug
      WHEN 'digital-profiles' THEN 2500.00
      WHEN 'virtual-communication' THEN 1800.00
      WHEN 'device-support' THEN 2200.00
      WHEN 'technical-consultancy' THEN 4500.00
      WHEN 'data-backup-recovery' THEN 2800.00
      WHEN 'network-troubleshooting' THEN 2000.00
      WHEN 'tech-training' THEN 3500.00
      WHEN 'iot-setup' THEN 3200.00
      WHEN 'digital-marketing' THEN 2800.00
      WHEN 'hardware-support' THEN 2500.00
      ELSE 2000.00
    END,
    'KES',
    CASE s.slug
      WHEN 'technical-consultancy' THEN 240
      WHEN 'tech-training' THEN 300
      WHEN 'iot-setup' THEN 180
      WHEN 'digital-marketing' THEN 240
      ELSE 120
    END,
    ARRAY['Complete setup', 'Priority support', 'Follow-up sessions', 'Documentation', 'Phone support'],
    false,
    true,
    2,
    '{"type": "standard", "support_level": "priority"}'
  FROM services s
  WHERE s.active = true
  ON CONFLICT (service_id, slug) DO NOTHING;

  INSERT INTO service_packages (service_id, name, slug, description, price, currency, duration_minutes, features, is_freemium, active, sort_order, metadata)  
  SELECT 
    s.id,
    'Premium Package',
    'premium',
    'Premium service package with advanced features, extended support, and ongoing maintenance',
    CASE s.slug
      WHEN 'digital-profiles' THEN 4000.00
      WHEN 'virtual-communication' THEN 3000.00
      WHEN 'device-support' THEN 3500.00
      WHEN 'technical-consultancy' THEN 7500.00
      WHEN 'data-backup-recovery' THEN 4500.00
      WHEN 'network-troubleshooting' THEN 3200.00
      WHEN 'tech-training' THEN 5500.00
      WHEN 'iot-setup' THEN 5000.00
      WHEN 'digital-marketing' THEN 4500.00
      WHEN 'hardware-support' THEN 4000.00
      ELSE 3500.00
    END,
    'KES',
    CASE s.slug
      WHEN 'technical-consultancy' THEN 360
      WHEN 'tech-training' THEN 480
      WHEN 'iot-setup' THEN 300
      WHEN 'digital-marketing' THEN 360
      ELSE 180
    END,
    ARRAY['Advanced configuration', 'VIP support', 'Multiple sessions', 'Custom training', 'Ongoing maintenance', '24/7 support'],
    false,
    true,
    3,
    '{"type": "premium", "support_level": "vip"}'
  FROM services s
  WHERE s.active = true
  ON CONFLICT (service_id, slug) DO NOTHING;
$$;

-- Function to seed sample blog posts
CREATE OR REPLACE FUNCTION seed_sample_blog_posts()
RETURNS void
LANGUAGE sql
AS $$
  -- Insert sample blog posts
  INSERT INTO blog_posts (title, slug, content, excerpt, category, featured, published, image_url, meta_description, tags, published_at)
  VALUES 
    (
      '10 Essential Cybersecurity Tips for Small Businesses in Kenya',
      '10-essential-cybersecurity-tips-kenya',
      'Cybersecurity is crucial for small businesses in Kenya. This comprehensive guide covers the most important security measures you should implement to protect your business from cyber threats. From password management to employee training, we cover it all...',
      'Protect your Kenyan small business from cyber threats with these 10 essential cybersecurity tips including password security, employee training, and threat prevention.',
      'Cybersecurity',
      true,
      true,
      'https://images.unsplash.com/photo-1563986768609-322da13575f3',
      'Essential cybersecurity tips for small businesses in Kenya - protect your business from cyber threats',
      ARRAY['cybersecurity', 'small business', 'kenya', 'data protection'],
      NOW() - INTERVAL '7 days'
    ),
    (
      'Complete Guide to KRA iTax System Setup and Tax Filing',
      'kra-itax-setup-tax-filing-guide',
      'Navigate the KRA iTax system with confidence. This step-by-step guide walks you through account creation, PIN registration, and filing your tax returns online. Perfect for individuals and small business owners...',
      'Master KRA iTax system setup and online tax filing with this comprehensive guide covering PIN registration, account setup, and return submission.',
      'Government Services',
      true,
      true,
      'https://images.unsplash.com/photo-1554224155-6726b3ff858f',
      'Complete KRA iTax setup and tax filing guide for Kenya - step by step instructions',
      ARRAY['kra', 'itax', 'tax filing', 'government', 'kenya'],
      NOW() - INTERVAL '5 days'
    ),
    (
      'Setting Up Your Remote Work Office: Essential Tools and Tips',
      'remote-work-office-setup-tools-tips',
      'Create the perfect remote work environment with the right tools, ergonomic setup, and productivity strategies. Learn about essential software, hardware recommendations, and work-from-home best practices...',
      'Build an effective remote work setup with essential tools, ergonomic furniture, productivity apps, and work-from-home best practices.',
      'Remote Work',
      false,
      true,
      'https://images.unsplash.com/photo-1586953208448-b95a79798f07',
      'Complete remote work office setup guide - tools, tips, and best practices for working from home',
      ARRAY['remote work', 'home office', 'productivity', 'work from home'],
      NOW() - INTERVAL '3 days'
    ),
    (
      'Protecting Your Data: Cloud Backup Solutions for Small Businesses',
      'cloud-backup-solutions-small-businesses',
      'Data loss can be devastating for small businesses. Learn about the best cloud backup solutions, automated backup strategies, and disaster recovery planning to keep your business data safe...',
      'Comprehensive guide to cloud backup solutions and data protection strategies for small businesses including automated backups and disaster recovery.',
      'Data Recovery',
      false,
      true,
      'https://images.unsplash.com/photo-1451187580459-43490279c0fa',
      'Cloud backup solutions and data protection for small businesses - comprehensive guide',
      ARRAY['cloud backup', 'data protection', 'small business', 'disaster recovery'],
      NOW() - INTERVAL '2 days'
    ),
    (
      'Digital Marketing Basics: Building Your Online Presence in Kenya',
      'digital-marketing-basics-online-presence-kenya',
      'Establish a strong online presence for your business with digital marketing fundamentals. Learn about social media marketing, SEO basics, Google My Business optimization, and content creation strategies...',
      'Learn digital marketing basics and build a strong online presence for your Kenyan business with social media, SEO, and content marketing strategies.',
      'Digital Profiles',
      false,
      true,
      'https://images.unsplash.com/photo-1432888622747-4eb9a8efeb07',
      'Digital marketing basics and online presence building guide for Kenyan businesses',
      ARRAY['digital marketing', 'online presence', 'social media', 'kenya', 'seo'],
      NOW() - INTERVAL '1 day'
    )
  ON CONFLICT (slug) DO NOTHING;
$$;

-- Execute seeding functions
SELECT seed_services_and_packages();
SELECT seed_sample_blog_posts();