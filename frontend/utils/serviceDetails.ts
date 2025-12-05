/**
 * Service details utility for providing essential information about each service
 * utils/serviceDetails.ts
 */

 export interface ServiceDetails {
   overview: string;
   requirements: string[];
   includes: string[];
   deliveryTime: string;
 }

export const getServiceDetailsByCategory = (category: string): ServiceDetails => {
  const detailsMap: { [key: string]: ServiceDetails } = {
    // Digital Profiles & Government Services
    // KRA Services (Individual Services)
    "KRA PIN Registration": {
      overview: "Complete KRA PIN registration service including iTax account setup, PIN generation, and activation. We handle the entire process ensuring your PIN is correctly linked to your ID and delivered via email.",
      requirements: ["National ID or Passport", "Email address", "Phone number"],
      includes: [
        "iTax account setup and verification",
        "PIN generation and activation",
        "Linking to individual ID details",
        "Email delivery of PIN certificate",
        "Guidance on tax obligations"
      ],
      deliveryTime: "Within 1 hour"
    },
    "KRA NIL Returns": {
      overview: "KRA NIL returns filing service for individuals with no taxable income. We assist with iTax login, period selection, and filing submission with confirmation receipt.",
      requirements: ["KRA PIN", "iTax credentials", "Filing period information"],
      includes: [
        "iTax login assistance",
        "Period selection and NIL filing",
        "Confirmation receipt download",
        "Filing proof submission",
        "Annual filing reminder setup"
      ],
      deliveryTime: "Within 1 hour"
    },
    "KRA P9 Returns": {
      overview: "Professional P9 tax returns filing service. We handle data entry, validation, and submission through iTax portal with complete filing documentation.",
      requirements: ["KRA PIN", "P9 form from employer", "iTax credentials"],
      includes: [
        "P9 form data entry and validation",
        "Tax summary verification",
        "Filing via iTax and receipt generation",
        "Assistance with refund claim (if applicable)",
        "Filing confirmation sent to client"
      ],
      deliveryTime: "Smae day"
    },
    "KRA Returns with Withholding Certificate": {
      overview: "Comprehensive tax returns filing service using withholding certificates. Includes data entry, tax calculation, form upload, and complete filing documentation.",
      requirements: ["KRA PIN", "Withholding certificate(s)", "iTax credentials", "Supporting documents"],
      includes: [
        "Data entry from withholding certificate(s)",
        "Calculation of tax balance",
        "Form upload on iTax portal",
        "Acknowledgment receipt generation",
        "Filing record documentation"
      ],
      deliveryTime: "Smae day"
    },
    "Tax Compliance Certificate": {
      overview: "Tax Compliance Certificate (TCC) application and acquisition service. We verify past returns, submit application, track approval, and deliver the certificate.",
      requirements: ["KRA PIN", "Up-to-date tax returns", "iTax credentials"],
      includes: [
        "Verification of past returns",
        "TCC application on iTax portal",
        "Status tracking and approval follow-up",
        "Certificate download and delivery",
        "Renewal reminder setup"
      ],
      deliveryTime: "Smae day"
    },
    "Tax Compliance Certificate (TCC)": {
      overview: "Tax Compliance Certificate (TCC) application and acquisition service. We verify past returns, submit application, track approval, and deliver the certificate.",
      requirements: ["KRA PIN", "Up-to-date tax returns", "iTax credentials"],
      includes: [
        "Verification of past returns",
        "TCC application on iTax portal",
        "Status tracking and approval follow-up",
        "Certificate download and delivery",
        "Renewal reminder setup"
      ],
      deliveryTime: "Smae day"
    },

    // NTSA Services (Individual Services)
    "Smart DL Application / Renewal": {
      overview: "Smart Driving License application and renewal service through NTSA TIMS portal. Includes account verification, form completion, appointment scheduling, and application tracking.",
      requirements: ["National ID", "Current license (for renewal)", "Passport photo", "Medical certificate (if required)"],
      includes: [
        "TIMS account login & verification",
        "Form completion for new/renewal",
        "Appointment scheduling assistance",
        "Photo, signature & biometrics guidance",
        "Application submission & tracking"
      ],
      deliveryTime: "Smae day"
    },
    "Vehicle Transfer & Ownership": {
      overview: "Complete vehicle ownership transfer service. We handle TIMS account linking for both parties, document uploads, approval tracking, and confirmation of ownership change.",
      requirements: ["Vehicle logbook", "Seller and buyer IDs", "TIMS accounts", "Transfer documents"],
      includes: [
        "Seller and buyer TIMS account linking",
        "Upload of vehicle logbook & ID",
        "Approval process follow-up",
        "Confirmation of ownership change",
        "Certificate delivery update"
      ],
      deliveryTime: "Smae day"
    },
    "Duplicate Logbook Application": {
      overview: "Duplicate vehicle logbook application service for lost or damaged logbooks. Includes police report assistance, TIMS application, document uploads, and delivery tracking.",
      requirements: ["National ID", "Vehicle details", "Police abstract", "Affidavit of loss"],
      includes: [
        "Report of lost logbook assistance",
        "NTSA TIMS duplicate form filing",
        "Document uploads (ID, affidavit, police abstract)",
        "Application submission",
        "Delivery notification tracking"
      ],
      deliveryTime: "Smae day"
    },
    "Motor Vehicle Inspection Booking": {
      overview: "Motor vehicle inspection booking service through NTSA TIMS. Includes station selection, payment assistance, appointment confirmation, and certificate retrieval.",
      requirements: ["Vehicle registration number", "TIMS account", "Payment method"],
      includes: [
        "Inspection booking via TIMS",
        "Station selection guidance",
        "Payment assistance",
        "Appointment confirmation printout",
        "Inspection certificate retrieval"
      ],
      deliveryTime: "Smae day"
    },

    // Business Services (Individual Services)
    "Business Name Search & Reservation": {
      overview: "Business name search and reservation service through eCitizen BRS portal. We verify name availability, process reservation, and deliver confirmation code.",
      requirements: ["Preferred business names (3 options)", "National ID", "eCitizen account", "Payment method"],
      includes: [
        "eCitizen login setup",
        "Business name search",
        "Reservation application submission",
        "Payment processing assistance",
        "Reservation confirmation and code delivery"
      ],
      deliveryTime: "Smae day"
    },
    "Business Registration": {
      overview: "Complete business registration service through eCitizen BRS portal. Includes form filling, document uploads, payment processing, and certificate delivery.",
      requirements: ["Reserved business name", "National ID", "Business details", "Physical address"],
      includes: [
        "eCitizen registration under BRS portal",
        "Form entry for business details",
        "Upload of ID and supporting documents",
        "Payment processing",
        "Certificate of registration download"
      ],
      deliveryTime: "Smae day"
    },
    "Annual Business Renewal": {
      overview: "Annual business registration renewal service. We verify renewal status, submit application, process payment, and deliver updated certificate.",
      requirements: ["Business registration number", "eCitizen credentials", "Payment method"],
      includes: [
        "Renewal status verification",
        "Renewal application submission",
        "Payment of applicable fees",
        "Updated certificate download",
        "Record update confirmation"
      ],
      deliveryTime: "Smae day"
    },

    // Education Services (Individual Services)
    "KUCCPS Course Application": {
      overview: "KUCCPS course application service for university placement. Includes portal login, program guidance, course selection, and submission confirmation.",
      requirements: ["KCSE index number", "KUCCPS account", "Course preferences", "Payment method"],
      includes: [
        "Portal login assistance",
        "Program and institution guidance",
        "Course code selection",
        "Payment processing",
        "Submission confirmation"
      ],
      deliveryTime: "Smae day"
    },
    "HELB Application": {
      overview: "HELB student loan application service. Complete portal registration, form filling, document attachment, and application submission with status tracking.",
      requirements: ["Student ID or admission letter", "National ID", "Academic documents", "Parent/guardian details"],
      includes: [
        "HELB portal registration",
        "Form filling assistance",
        "Attachment and verification support",
        "Submission confirmation",
        "Tracking loan status update"
      ],
      deliveryTime: "Smae day"
    },
    "TSC Registration": {
      overview: "Teachers Service Commission online registration service. Includes account setup, document uploads, form validation, and submission confirmation.",
      requirements: ["National ID", "Academic certificates", "TSC documents", "Email address"],
      includes: [
        "TSC online registration",
        "Document uploads",
        "Form validation check",
        "Submission confirmation",
        "Status tracking"
      ],
      deliveryTime: "Smae day"
    },
    "KNEC Exam Query Services": {
      overview: "KNEC exam results verification and query services. Assistance with result checking, query submission, response tracking, and document printing.",
      requirements: ["Exam index number", "Identification documents", "KNEC portal access"],
      includes: [
        "Exam results verification assistance",
        "Query submission on KNEC portal",
        "Response tracking",
        "Result document printing"
      ],
      deliveryTime: "Smae day"
    },

    // Personal Services (Individual Services)
    "Good Conduct Certificate": {
      overview: "Certificate of Good Conduct application service through eCitizen DCI portal. Complete process including registration, appointment booking, payment, tracking, and collection notification.",
      requirements: ["National ID", "Passport photos", "Email address", "Payment method"],
      includes: [
        "eCitizen DCI registration",
        "Appointment booking assistance",
        "Payment verification",
        "Application tracking",
        "Result collection notification"
      ],
      deliveryTime: "Smae day"
    },
    "Passport Application": {
      overview: "Passport application service through eCitizen immigration portal. Includes registration, form filling, photo verification, appointment scheduling, and application tracking.",
      requirements: ["National ID", "Birth certificate", "Passport photos", "Previous passport (for renewal)", "Payment method"],
      includes: [
        "eCitizen registration and login",
        "Form filling and document upload",
        "Passport photo verification guidance",
        "Appointment scheduling assistance",
        "Application tracking"
      ],
      deliveryTime: "Smae day"
    },
    "ID Replacement / Update": {
      overview: "National ID replacement or update service. Assistance with application form preparation, details verification, Huduma Centre submission guidance, and tracking setup.",
      requirements: ["Current ID (if available)", "Birth certificate", "Notification slip or police abstract", "Huduma Centre access"],
      includes: [
        "Application form preparation",
        "ID details verification",
        "Submission guidance at Huduma Centre",
        "SMS tracking setup"
      ],
      deliveryTime: "Smae day"
    },

    // Original Category Entries (for backward compatibility)
    "KRA Services": {
      overview: "Professional KRA tax services including PIN registration, returns filing, and compliance certificates. Our experts handle all KRA-related processes ensuring compliance with Kenya Revenue Authority requirements.",
      requirements: ["National ID or Passport", "Email address", "Phone number", "Relevant tax documents (if applicable)"],
      includes: [
        "KRA PIN certificate (new registration or replacement)",
        "iTax portal account setup with login credentials",
        "Tax compliance certificate acquisition",
        "Tax returns filing (monthly, quarterly, or annual)",
        "PIN verification letter for official use",
        "Email confirmation of completed registration",
        "30-day post-service KRA support"
      ],
      deliveryTime: "Smae day"
    },
    "Government & Licensing Services": {
      overview: "Comprehensive government services including certificates, registrations, and account setups. We handle e-Citizen, eCitizen portal registrations, and various government licensing requirements with professional expertise.",
      requirements: ["Valid identification", "Supporting documents", "Email address", "Phone number"],
      includes: [
        "e-Citizen portal account creation and verification",
        "Certificate processing (birth, marriage, clearance)",
        "Business permit and trade license application",
        "Good conduct certificate from DCI",
        "Application fee payment and receipt",
        "Digital and physical document delivery",
        "90-day follow-up assistance"
      ],
      deliveryTime: "Smae day"
    },
    "NTSA Services": {
      overview: "NTSA and TIMS services for driving licenses, accounts, and vehicle-related documentation. We handle all NTSA portal processes including license applications, renewals, and TIMS account management.",
      requirements: ["National ID", "Current license (for renewals)", "Passport photo", "Email address", "Medical certificate (if required)"],
      includes: [
        "TIMS account creation with secure login",
        "Driving license application or renewal processing",
        "Digital driving license (DDL) activation",
        "NTSA appointment booking and confirmation",
        "License delivery tracking and updates",
        "Smart card license activation support",
        "60-day license-related queries support"
      ],
      deliveryTime: "Smae day"
    },
    "Business & Company Services": {
      overview: "Complete business registration and company formation services. We handle business name search, registration, KRA PIN acquisition, and all compliance requirements for startups and established businesses.",
      requirements: ["Directors' details and IDs", "Business name preferences", "Physical address", "Email address", "Business activity description"],
      includes: [
        "Business name search and reservation certificate",
        "Certificate of incorporation for limited companies",
        "Business registration certificate for sole proprietors",
        "Company KRA PIN and tax registration",
        "Memorandum and Articles of Association",
        "CR12 certificate (company particulars)",
        "6-month compliance and renewal reminders"
      ],
      deliveryTime: "Smae day"
    },
    "Education & Student Services": {
      overview: "Student services including HELB, KUCCPS, and educational institution applications. We assist with loan applications, university placements, and student portal management.",
      requirements: ["Student ID or Admission letter", "National ID", "Email address", "Academic documents", "Parent/Guardian details (if required)"],
      includes: [
        "HELB portal account and loan application",
        "HELB clearance certificate for graduates",
        "KUCCPS account setup and course selection",
        "University placement revision requests",
        "Student portal registration and setup",
        "Scholarship application assistance",
        "Academic year-long support access"
      ],
      deliveryTime: "Smae day"
    },
    "Personal & Identification Services": {
      overview: "Personal identification services including passports, good conduct certificates, and e-Citizen account management. Expert assistance with all personal documentation needs.",
      requirements: ["National ID", "Passport photos", "Birth certificate", "Email address", "Previous documents (for renewals)"],
      includes: [
        "Passport application (new, renewal, or replacement)",
        "Immigration appointment booking and confirmation",
        "Certificate of good conduct processing",
        "National ID correction or replacement",
        "Huduma card application support",
        "Express processing for urgent cases",
        "Document collection and delivery coordination"
      ],
      deliveryTime: "Smae day"
    },
    "Document & Printing Services": {
      overview: "Professional document services including printing, formatting, and consultation. High-quality printing with various finishing options for business and personal documents.",
      requirements: ["Document files (PDF, Word, etc.)", "Delivery address (if applicable)", "Specific requirements (color, binding, etc.)"],
      includes: [
        "Professional document formatting and layout",
        "High-quality color or black & white printing",
        "Binding services (spiral, thermal, or hardcover)",
        "Lamination for important documents",
        "Business cards and letterhead printing",
        "Same-day turnaround for urgent orders",
        "Free delivery within Nairobi CBD"
      ],
      deliveryTime: "2-3 Business Days"
    },
    "Branded Stationery": {
      overview: "Custom branded envelopes in various sizes and materials. Professional design and printing for businesses, organizations, and personal branding needs.",
      requirements: ["Brand logo/design files", "Color preferences", "Size specifications", "Delivery address", "Quantity needed"],
      includes: [
        "Custom envelope design with your branding",
        "Multiple size options (DL, C4, C5, custom)",
        "Professional color printing and matching",
        "Premium paper quality selection",
        "Digital proofs for approval before printing",
        "Minimum 100 pieces per order",
        "Bulk discounts for large quantities"
      ],
      deliveryTime: "3-5 Business Days"
    },
    "Credit & Verification": {
      overview: "Credit reference bureau certificate for financial verification. Official CRB reports from licensed credit bureaus for loan applications, employment, and personal credit checks.",
      requirements: ["National ID", "Email address", "Phone number", "Payment confirmation"],
      includes: [
        "Official CRB certificate from licensed bureau",
        "Comprehensive credit score (0-900 scale)",
        "5-year detailed credit history report",
        "Active loans and credit facilities list",
        "PDF and certified printed certificate",
        "Credit score interpretation and guidance",
        "24-48 hour express processing"
      ],
      deliveryTime: "1-3 Business Days"
    },

    // Device Support
    // Device Support & Troubleshooting (Individual Services)

    // 2.1 Device Diagnostics & Repair
    "Computer Diagnostics & Repair": {
      overview: "Full hardware and software diagnostics to detect performance or compatibility issues, with comprehensive repair services for computers and laptops.",
      requirements: ["Computer model and specifications", "Description of issues", "Error messages", "System accessibility"],
      includes: [
        "System Health Assessment — full hardware and software diagnostics to detect performance or compatibility issues",
        "Computer Repair & Maintenance — troubleshooting system crashes, boot failures, and hardware malfunctions",
        "Mobile Device Support — resolving mobile OS errors, app crashes, and connectivity issues",
        "Battery & Power Testing — diagnosing charging and power-related problems for laptops and mobile devices",
        "Hardware Replacement Guidance — identifying faulty components (RAM, SSD, motherboard) and providing replacement options",
        "Device Cleaning & Dust Removal — preventive cleaning for improved cooling and system longevity",
        "Performance Reporting — providing diagnostic summaries and repair recommendations"
      ],
      deliveryTime: "1-3 Business Days"
    },
    "Computer & Laptop Support": {
      overview: "Comprehensive computer and laptop repair, maintenance, and optimization services. Our certified technicians diagnose and resolve hardware failures, software issues, and performance problems.",
      requirements: ["Device details and model", "Description of issue", "Any error messages", "Device accessibility"],
      includes: [
        "Complete hardware and software diagnostics",
        "Virus/malware removal and system cleaning",
        "Operating system repair and optimization",
        "Data backup before repairs (up to 100GB)",
        "Hardware component repair or replacement",
        "90-day warranty on all repairs",
        "Detailed service report with recommendations"
      ],
      deliveryTime: "1-3 Business Days"
    },
    "Smartphone & Tablet Support": {
      overview: "Expert support for all mobile devices including repairs, setup, and troubleshooting. We handle iPhone, Android, and tablet issues with manufacturer-grade service.",
      requirements: ["Device type and model", "Issue description", "Device password/PIN", "Backup of important data"],
      includes: [
        "Screen replacement with quality parts",
        "Battery replacement and optimization",
        "Charging port and button repairs",
        "Water damage assessment and repair",
        "Data recovery from damaged devices",
        "Original or certified replacement parts",
        "60-day parts and labor warranty"
      ],
      deliveryTime: "1-3 Business Days"
    },
    "Mobile Device Support": {
      overview: "Complete mobile device support including OS updates, troubleshooting, data management, and hardware support for Android and iOS devices.",
      requirements: ["Device type and model", "OS version", "Issue description", "Device backup status"],
      includes: [
        "System Health Assessment — full hardware and software diagnostics to detect performance or compatibility issues",
        "Computer Repair & Maintenance — troubleshooting system crashes, boot failures, and hardware malfunctions",
        "Mobile Device Support — resolving mobile OS errors, app crashes, and connectivity issues",
        "Battery & Power Testing — diagnosing charging and power-related problems for laptops and mobile devices",
        "Hardware Replacement Guidance — identifying faulty components (RAM, SSD, motherboard) and providing replacement options",
        "Device Cleaning & Dust Removal — preventive cleaning for improved cooling and system longevity",
        "Performance Reporting — providing diagnostic summaries and repair recommendations"
      ],
      deliveryTime: "1-3 Business Days"
    },

    // 2.2 Software & System Support
    "OS Installation / Reinstallation (Windows/Linux)": {
      overview: "Professional operating system installation and reinstallation service with proper partitioning and activation for Windows, Linux, or macOS.",
      requirements: ["Computer specifications", "OS preference", "Product keys (if applicable)", "Backup confirmation"],
      includes: [
        "OS Installation / Reinstallation — setup of Windows, Linux, or macOS with proper partitioning and activation",
        "Software Installation & Update — secure installation of productivity, creative, and technical applications",
        "Driver Installation & Configuration — ensuring all hardware components run on the latest stable drivers",
        "Dual Boot & System Migration — setup of dual OS environments and safe data migration between systems",
        "Application Compatibility Testing — verifying software functionality post-installation",
        "Remote Desktop Configuration — enabling secure remote access and session management",
        "Boot Issue Resolution — fixing boot errors, corrupted MBR, and recovery environment setup"
      ],
      deliveryTime: "1-3 Business Days"
    },
    "Software Installation / Update": {
      overview: "Secure installation and updates of productivity, creative, and technical applications with proper configuration.",
      requirements: ["Software requirements list", "License keys", "System specifications", "Internet connection"],
      includes: [
        "OS Installation / Reinstallation — setup of Windows, Linux, or macOS with proper partitioning and activation",
        "Software Installation & Update — secure installation of productivity, creative, and technical applications",
        "Driver Installation & Configuration — ensuring all hardware components run on the latest stable drivers",
        "Dual Boot & System Migration — setup of dual OS environments and safe data migration between systems",
        "Application Compatibility Testing — verifying software functionality post-installation",
        "Remote Desktop Configuration — enabling secure remote access and session management",
        "Boot Issue Resolution — fixing boot errors, corrupted MBR, and recovery environment setup"
      ],
      deliveryTime: "1-3 Business Days"
    },
    "Drivers Installation": {
      overview: "Comprehensive driver installation and configuration ensuring all hardware components run on the latest stable drivers.",
      requirements: ["Device model information", "Hardware specifications", "Current driver status", "Admin access"],
      includes: [
        "OS Installation / Reinstallation — setup of Windows, Linux, or macOS with proper partitioning and activation",
        "Software Installation & Update — secure installation of productivity, creative, and technical applications",
        "Driver Installation & Configuration — ensuring all hardware components run on the latest stable drivers",
        "Dual Boot & System Migration — setup of dual OS environments and safe data migration between systems",
        "Application Compatibility Testing — verifying software functionality post-installation",
        "Remote Desktop Configuration — enabling secure remote access and session management",
        "Boot Issue Resolution — fixing boot errors, corrupted MBR, and recovery environment setup"
      ],
      deliveryTime: "1-3 Business Days"
    },
    "Dual Boot System Setup": {
      overview: "Setup of dual OS environments allowing you to run multiple operating systems on a single machine with safe data management.",
      requirements: ["Storage space (50GB+ recommended)", "OS installation media", "Backup of existing data", "BIOS/UEFI access"],
      includes: [
        "OS Installation / Reinstallation — setup of Windows, Linux, or macOS with proper partitioning and activation",
        "Software Installation & Update — secure installation of productivity, creative, and technical applications",
        "Driver Installation & Configuration — ensuring all hardware components run on the latest stable drivers",
        "Dual Boot & System Migration — setup of dual OS environments and safe data migration between systems",
        "Application Compatibility Testing — verifying software functionality post-installation",
        "Remote Desktop Configuration — enabling secure remote access and session management",
        "Boot Issue Resolution — fixing boot errors, corrupted MBR, and recovery environment setup"
      ],
      deliveryTime: "1-3 Business Days"
    },
    "System Migration Assistance": {
      overview: "Safe data migration between systems ensuring all your files, settings, and applications are properly transferred.",
      requirements: ["Source and destination systems", "Storage space availability", "Data backup", "Admin credentials"],
      includes: [
        "OS Installation / Reinstallation — setup of Windows, Linux, or macOS with proper partitioning and activation",
        "Software Installation & Update — secure installation of productivity, creative, and technical applications",
        "Driver Installation & Configuration — ensuring all hardware components run on the latest stable drivers",
        "Dual Boot & System Migration — setup of dual OS environments and safe data migration between systems",
        "Application Compatibility Testing — verifying software functionality post-installation",
        "Remote Desktop Configuration — enabling secure remote access and session management",
        "Boot Issue Resolution — fixing boot errors, corrupted MBR, and recovery environment setup"
      ],
      deliveryTime: "1-3 Business Days"
    },
    "Application Compatibility Testing": {
      overview: "Thorough testing to verify software functionality post-installation ensuring optimal performance and compatibility.",
      requirements: ["Application list", "System specifications", "Test scenarios", "Performance benchmarks"],
      includes: [
        "OS Installation / Reinstallation — setup of Windows, Linux, or macOS with proper partitioning and activation",
        "Software Installation & Update — secure installation of productivity, creative, and technical applications",
        "Driver Installation & Configuration — ensuring all hardware components run on the latest stable drivers",
        "Dual Boot & System Migration — setup of dual OS environments and safe data migration between systems",
        "Application Compatibility Testing — verifying software functionality post-installation",
        "Remote Desktop Configuration — enabling secure remote access and session management",
        "Boot Issue Resolution — fixing boot errors, corrupted MBR, and recovery environment setup"
      ],
      deliveryTime: "1-3 Business Days"
    },
    "Remote Desktop Configuration": {
      overview: "Enabling secure remote access and session management for working from anywhere with full system control.",
      requirements: ["Internet connection", "Admin credentials", "Remote access requirements", "Security preferences"],
      includes: [
        "OS Installation / Reinstallation — setup of Windows, Linux, or macOS with proper partitioning and activation",
        "Software Installation & Update — secure installation of productivity, creative, and technical applications",
        "Driver Installation & Configuration — ensuring all hardware components run on the latest stable drivers",
        "Dual Boot & System Migration — setup of dual OS environments and safe data migration between systems",
        "Application Compatibility Testing — verifying software functionality post-installation",
        "Remote Desktop Configuration — enabling secure remote access and session management",
        "Boot Issue Resolution — fixing boot errors, corrupted MBR, and recovery environment setup"
      ],
      deliveryTime: "1-3 Business Days"
    },
    "Boot Issue Resolution": {
      overview: "Expert fixing of boot errors, corrupted MBR, and recovery environment setup to get your system running again.",
      requirements: ["System details", "Error messages", "Recovery media access", "Backup status"],
      includes: [
        "OS Installation / Reinstallation — setup of Windows, Linux, or macOS with proper partitioning and activation",
        "Software Installation & Update — secure installation of productivity, creative, and technical applications",
        "Driver Installation & Configuration — ensuring all hardware components run on the latest stable drivers",
        "Dual Boot & System Migration — setup of dual OS environments and safe data migration between systems",
        "Application Compatibility Testing — verifying software functionality post-installation",
        "Remote Desktop Configuration — enabling secure remote access and session management",
        "Boot Issue Resolution — fixing boot errors, corrupted MBR, and recovery environment setup"
      ],
      deliveryTime: "1-3 Business Days"
    },

    // 2.3 Performance & Security
    "Virus/Malware Scan & Removal": {
      overview: "Comprehensive scanning and removal of malicious threats including viruses, malware, and spyware with protection setup.",
      requirements: ["System access", "Admin credentials", "Internet connection", "Backup confirmation"],
      includes: [
        "Full System Optimization — cleanup of unnecessary files, startup apps, and registry errors",
        "Virus/Malware Detection & Removal — scanning and removal of malicious threats",
        "Firewall Configuration — setup and monitoring of network firewalls for enhanced protection",
        "Storage Cleanup & Defragmentation — reclaiming storage space and improving read/write speed",
        "Privacy & Security Settings Optimization — hardening user profiles and permissions",
        "Advanced Threat Mitigation — identifying and neutralizing ransomware or phishing risks",
        "Startup Program Management — controlling background services to boost boot speed"
      ],
      deliveryTime: "1-3 Business Days"
    },
    "System Optimization & Speed Boost": {
      overview: "Complete system optimization including cleanup of unnecessary files, startup apps, and registry errors for maximum performance.",
      requirements: ["System information", "Admin access", "Backup status", "Performance issues description"],
      includes: [
        "Full System Optimization — cleanup of unnecessary files, startup apps, and registry errors",
        "Virus/Malware Detection & Removal — scanning and removal of malicious threats",
        "Firewall Configuration — setup and monitoring of network firewalls for enhanced protection",
        "Storage Cleanup & Defragmentation — reclaiming storage space and improving read/write speed",
        "Privacy & Security Settings Optimization — hardening user profiles and permissions",
        "Advanced Threat Mitigation — identifying and neutralizing ransomware or phishing risks",
        "Startup Program Management — controlling background services to boost boot speed"
      ],
      deliveryTime: "1-3 Business Days"
    },
    "Storage Cleanup & Defragmentation": {
      overview: "Reclaiming storage space and improving read/write speed through comprehensive cleanup and defragmentation.",
      requirements: ["Storage device access", "Admin credentials", "Backup status", "Storage capacity information"],
      includes: [
        "Full System Optimization — cleanup of unnecessary files, startup apps, and registry errors",
        "Virus/Malware Detection & Removal — scanning and removal of malicious threats",
        "Firewall Configuration — setup and monitoring of network firewalls for enhanced protection",
        "Storage Cleanup & Defragmentation — reclaiming storage space and improving read/write speed",
        "Privacy & Security Settings Optimization — hardening user profiles and permissions",
        "Advanced Threat Mitigation — identifying and neutralizing ransomware or phishing risks",
        "Startup Program Management — controlling background services to boost boot speed"
      ],
      deliveryTime: "1-3 Business Days"
    },
    "Advanced Threat Removal": {
      overview: "Specialized service for identifying and neutralizing advanced threats including ransomware and phishing attacks.",
      requirements: ["System access", "Threat description", "Security logs", "Admin credentials"],
      includes: [
        "Full System Optimization — cleanup of unnecessary files, startup apps, and registry errors",
        "Virus/Malware Detection & Removal — scanning and removal of malicious threats",
        "Firewall Configuration — setup and monitoring of network firewalls for enhanced protection",
        "Storage Cleanup & Defragmentation — reclaiming storage space and improving read/write speed",
        "Privacy & Security Settings Optimization — hardening user profiles and permissions",
        "Advanced Threat Mitigation — identifying and neutralizing ransomware or phishing risks",
        "Startup Program Management — controlling background services to boost boot speed"
      ],
      deliveryTime: "1-5 Business Days"
    },
    "Firewall Configuration & Management": {
      overview: "Setup and monitoring of network firewalls for enhanced protection against unauthorized access and threats.",
      requirements: ["Network details", "Admin access", "Security requirements", "Current firewall status"],
      includes: [
        "Full System Optimization — cleanup of unnecessary files, startup apps, and registry errors",
        "Virus/Malware Detection & Removal — scanning and removal of malicious threats",
        "Firewall Configuration — setup and monitoring of network firewalls for enhanced protection",
        "Storage Cleanup & Defragmentation — reclaiming storage space and improving read/write speed",
        "Privacy & Security Settings Optimization — hardening user profiles and permissions",
        "Advanced Threat Mitigation — identifying and neutralizing ransomware or phishing risks",
        "Startup Program Management — controlling background services to boost boot speed"
      ],
      deliveryTime: "1-3 Business Days"
    },
    "Privacy Settings Optimization": {
      overview: "Hardening user profiles and permissions to protect your privacy and secure your personal data.",
      requirements: ["User account details", "Privacy preferences", "Admin credentials", "Security requirements"],
      includes: [
        "Full System Optimization — cleanup of unnecessary files, startup apps, and registry errors",
        "Virus/Malware Detection & Removal — scanning and removal of malicious threats",
        "Firewall Configuration — setup and monitoring of network firewalls for enhanced protection",
        "Storage Cleanup & Defragmentation — reclaiming storage space and improving read/write speed",
        "Privacy & Security Settings Optimization — hardening user profiles and permissions",
        "Advanced Threat Mitigation — identifying and neutralizing ransomware or phishing risks",
        "Startup Program Management — controlling background services to boost boot speed"
      ],
      deliveryTime: "1-3 Business Days"
    },
    "Startup Program Management": {
      overview: "Controlling background services and startup programs to boost boot speed and improve system performance.",
      requirements: ["System details", "Admin access", "Performance goals", "Current startup programs list"],
      includes: [
        "Full System Optimization — cleanup of unnecessary files, startup apps, and registry errors",
        "Virus/Malware Detection & Removal — scanning and removal of malicious threats",
        "Firewall Configuration — setup and monitoring of network firewalls for enhanced protection",
        "Storage Cleanup & Defragmentation — reclaiming storage space and improving read/write speed",
        "Privacy & Security Settings Optimization — hardening user profiles and permissions",
        "Advanced Threat Mitigation — identifying and neutralizing ransomware or phishing risks",
        "Startup Program Management — controlling background services to boost boot speed"
      ],
      deliveryTime: "1-3 Business Days"
    },
    "Registry Cleaning & Repair": {
      overview: "Restoring OS stability through registry optimization, cleaning errors, and repairing corrupted entries.",
      requirements: ["System access", "Admin credentials", "Backup status", "Registry issues description"],
      includes: [
        "Full System Optimization — cleanup of unnecessary files, startup apps, and registry errors",
        "Virus/Malware Detection & Removal — scanning and removal of malicious threats",
        "Firewall Configuration — setup and monitoring of network firewalls for enhanced protection",
        "Storage Cleanup & Defragmentation — reclaiming storage space and improving read/write speed",
        "Privacy & Security Settings Optimization — hardening user profiles and permissions",
        "Advanced Threat Mitigation — identifying and neutralizing ransomware or phishing risks",
        "Registry Cleaning & Repair — restoring OS stability through registry optimization"
      ],
      deliveryTime: "1-3 Business Days"
    },

    // 2.4 Peripheral Devices
    "Webcam / Microphone Configuration": {
      overview: "Configuring and testing webcams and microphones for online meeting compatibility and optimal performance.",
      requirements: ["Device model", "Meeting platform", "Audio/video requirements", "Operating system"],
      includes: [
        "Printer Installation & Setup — driver installation, network printing setup, and printer sharing configuration",
        "Scanner Configuration — installing scanning utilities, testing ADF, and setting scan-to-email functions",
        "Webcam / Microphone Setup — configuring and testing for online meeting compatibility",
        "Multi-Monitor & Display Setup — calibration and arrangement of multiple screens for productivity",
        "External Storage Device Setup — mounting, formatting, and troubleshooting external drives",
        "Bluetooth & Wireless Device Pairing — pairing speakers, headsets, or smart accessories",
        "Gaming Peripheral Support — configuring gamepads, headsets, and drivers for compatibility"
      ],
      deliveryTime: "1-3 Business Days"
    },
    "Multi-monitor Setup": {
      overview: "Calibration and arrangement of multiple screens for enhanced productivity and optimal display configuration.",
      requirements: ["Monitor specifications", "Graphics card details", "Connection types", "Display preferences"],
      includes: [
        "Printer Installation & Setup — driver installation, network printing setup, and printer sharing configuration",
        "Scanner Configuration — installing scanning utilities, testing ADF, and setting scan-to-email functions",
        "Webcam / Microphone Setup — configuring and testing for online meeting compatibility",
        "Multi-Monitor & Display Setup — calibration and arrangement of multiple screens for productivity",
        "External Storage Device Setup — mounting, formatting, and troubleshooting external drives",
        "Bluetooth & Wireless Device Pairing — pairing speakers, headsets, or smart accessories",
        "Gaming Peripheral Support — configuring gamepads, headsets, and drivers for compatibility"
      ],
      deliveryTime: "1-4 Business Days"
    },
    "External Storage Device Setup": {
      overview: "Mounting, formatting, and troubleshooting external drives for reliable data storage and transfer.",
      requirements: ["Storage device type", "Capacity", "File system preference", "Operating system"],
      includes: [
        "Printer Installation & Setup — driver installation, network printing setup, and printer sharing configuration",
        "Scanner Configuration — installing scanning utilities, testing ADF, and setting scan-to-email functions",
        "Webcam / Microphone Setup — configuring and testing for online meeting compatibility",
        "Multi-Monitor & Display Setup — calibration and arrangement of multiple screens for productivity",
        "External Storage Device Setup — mounting, formatting, and troubleshooting external drives",
        "Bluetooth & Wireless Device Pairing — pairing speakers, headsets, or smart accessories",
        "Gaming Peripheral Support — configuring gamepads, headsets, and drivers for compatibility"
      ],
      deliveryTime: "1-3 Business Days"
    },
    "Gaming Peripherals Configuration": {
      overview: "Configuring gamepads, gaming headsets, and specialized drivers for optimal gaming compatibility and performance.",
      requirements: ["Device model", "Gaming platform", "Driver requirements", "Performance preferences"],
      includes: [
        "Printer Installation & Setup — driver installation, network printing setup, and printer sharing configuration",
        "Scanner Configuration — installing scanning utilities, testing ADF, and setting scan-to-email functions",
        "Webcam / Microphone Setup — configuring and testing for online meeting compatibility",
        "Multi-Monitor & Display Setup — calibration and arrangement of multiple screens for productivity",
        "External Storage Device Setup — mounting, formatting, and troubleshooting external drives",
        "Bluetooth & Wireless Device Pairing — pairing speakers, headsets, or smart accessories",
        "Gaming Peripheral Support — configuring gamepads, headsets, and drivers for compatibility"
      ],
      deliveryTime: "2-5 Business Days"
    },
    "Bluetooth Device Pairing": {
      overview: "Pairing Bluetooth speakers, headsets, keyboards, and other smart accessories with your devices.",
      requirements: ["Device type", "Bluetooth version", "Operating system", "Device model"],
      includes: [
        "Printer Installation & Setup — driver installation, network printing setup, and printer sharing configuration",
        "Scanner Configuration — installing scanning utilities, testing ADF, and setting scan-to-email functions",
        "Webcam / Microphone Setup — configuring and testing for online meeting compatibility",
        "Multi-Monitor & Display Setup — calibration and arrangement of multiple screens for productivity",
        "External Storage Device Setup — mounting, formatting, and troubleshooting external drives",
        "Bluetooth & Wireless Device Pairing — pairing speakers, headsets, or smart accessories",
        "Gaming Peripheral Support — configuring gamepads, headsets, and drivers for compatibility"
      ],
      deliveryTime: "1-3 Business Days"
    },
    "Drawing Tablet Setup": {
      overview: "Complete setup and configuration of drawing tablets for digital art, design, and creative work.",
      requirements: ["Tablet model", "Software requirements", "Pressure sensitivity preferences", "Operating system"],
      includes: [
        "Printer Installation & Setup — driver installation, network printing setup, and printer sharing configuration",
        "Scanner Configuration — installing scanning utilities, testing ADF, and setting scan-to-email functions",
        "Webcam / Microphone Setup — configuring and testing for online meeting compatibility",
        "Multi-Monitor & Display Setup — calibration and arrangement of multiple screens for productivity",
        "External Storage Device Setup — mounting, formatting, and troubleshooting external drives",
        "Bluetooth & Wireless Device Pairing — pairing speakers, headsets, or smart accessories",
        "Smart Device Integration — connecting devices like drawing tablets and IoT peripherals"
      ],
      deliveryTime: "1-3 Business Days"
    },
    "Smart Device Integration": {
      overview: "Connecting smart devices including drawing tablets, IoT peripherals, and other intelligent accessories to your system.",
      requirements: ["Device type and model", "Connectivity requirements", "Software/app needs", "Network details"],
      includes: [
        "Printer Installation & Setup — driver installation, network printing setup, and printer sharing configuration",
        "Scanner Configuration — installing scanning utilities, testing ADF, and setting scan-to-email functions",
        "Webcam / Microphone Setup — configuring and testing for online meeting compatibility",
        "Multi-Monitor & Display Setup — calibration and arrangement of multiple screens for productivity",
        "External Storage Device Setup — mounting, formatting, and troubleshooting external drives",
        "Bluetooth & Wireless Device Pairing — pairing speakers, headsets, or smart accessories",
        "Smart Device Integration — connecting devices like drawing tablets and IoT peripherals"
      ],
      deliveryTime: "2-5 Business Days"
    },

    // Hardware Support
    "Hardware Installation": {
      overview: "Professional installation of computer hardware components and peripherals. RAM upgrades, SSD installation, graphics cards, and peripheral setup with expert configuration.",
      requirements: ["Hardware specifications", "Computer model", "Installation location", "Power source availability"],
      includes: [
        "RAM, SSD, or HDD installation and upgrade",
        "Graphics card installation and driver setup",
        "BIOS/UEFI configuration and optimization",
        "Component compatibility verification",
        "Performance benchmarking after installation",
        "Cable management and airflow optimization",
        "90-day installation warranty"
      ],
      deliveryTime: "3-5 Business Days"
    },
    "Hardware Repair": {
      overview: "Expert repair services for damaged or malfunctioning hardware components. Motherboard repairs, power supply fixes, cooling system repairs, and more.",
      requirements: ["Component details", "Issue description", "Warranty information", "Device accessibility"],
      includes: [
        "Motherboard and circuit board repairs",
        "Power supply unit testing and repair",
        "USB, HDMI, and audio port repairs",
        "Keyboard and touchpad repairs",
        "Cooling system fan replacement",
        "Component-level soldering and fixes",
        "90-day repair warranty with quality guarantee"
      ],
      deliveryTime: "2-5 Business Days"
    },

    // Data Backup & Recovery

    // 3.1 Backup Solutions (Category Level)
    "Backup Solutions": {
      overview: "Reliable backup solutions to protect and restore valuable data covering cloud, local, and hybrid systems for individuals and enterprises.",
      requirements: ["Storage device or cloud account", "List of files to backup", "Backup schedule preferences", "System credentials"],
      includes: [
        "Local & Cloud Backup Setup — configuring automated backup schedules to external or cloud storage",
        "Incremental Backup Strategy — efficient backups capturing only modified data",
        "Cross-Platform Sync Setup — ensuring data consistency across devices and platforms",
        "Backup Verification & Testing — confirming data integrity and restorability",
        "Disaster Recovery Planning — defining recovery workflows for hardware or data loss events",
        "Version Control Setup — maintaining file version history and rollback points",
        "Encryption & Secure Transfer — applying encryption standards for sensitive backup data",
        "Automated Notifications — alerting users upon backup completion or failure"
      ],
      deliveryTime: "2-3 Business Days"
    },

    // Individual Backup Services
    "Local Drive Backup Setup": {
      overview: "Configure automated backup schedules to external hard drives or local storage devices for secure data protection.",
      requirements: ["External storage device", "Backup preferences", "System access", "Storage capacity"],
      includes: [
        "Local & Cloud Backup Setup — configuring automated backup schedules to external or cloud storage",
        "Incremental Backup Strategy — efficient backups capturing only modified data",
        "Cross-Platform Sync Setup — ensuring data consistency across devices and platforms",
        "Backup Verification & Testing — confirming data integrity and restorability",
        "Disaster Recovery Planning — defining recovery workflows for hardware or data loss events",
        "Version Control Setup — maintaining file version history and rollback points",
        "Encryption & Secure Transfer — applying encryption standards for sensitive backup data",
        "Automated Notifications — alerting users upon backup completion or failure"
      ],
      deliveryTime: "1-3 Business Days"
    },
    "Cloud Backup Configuration": {
      overview: "Professional cloud backup setup with automated synchronization to services like Google Drive, OneDrive, or Dropbox.",
      requirements: ["Cloud service credentials", "Internet connection", "Storage plan", "Backup preferences"],
      includes: [
        "Local & Cloud Backup Setup — configuring automated backup schedules to external or cloud storage",
        "Incremental Backup Strategy — efficient backups capturing only modified data",
        "Cross-Platform Sync Setup — ensuring data consistency across devices and platforms",
        "Backup Verification & Testing — confirming data integrity and restorability",
        "Disaster Recovery Planning — defining recovery workflows for hardware or data loss events",
        "Version Control Setup — maintaining file version history and rollback points",
        "Encryption & Secure Transfer — applying encryption standards for sensitive backup data",
        "Automated Notifications — alerting users upon backup completion or failure"
      ],
      deliveryTime: "2-5 Business Days"
    },
    "Scheduled/Automated Backup Setup": {
      overview: "Setup of automated backup schedules to ensure your data is continuously protected without manual intervention.",
      requirements: ["Backup destination", "Schedule preferences", "System access", "Storage allocation"],
      includes: [
        "Local & Cloud Backup Setup — configuring automated backup schedules to external or cloud storage",
        "Incremental Backup Strategy — efficient backups capturing only modified data",
        "Cross-Platform Sync Setup — ensuring data consistency across devices and platforms",
        "Backup Verification & Testing — confirming data integrity and restorability",
        "Disaster Recovery Planning — defining recovery workflows for hardware or data loss events",
        "Version Control Setup — maintaining file version history and rollback points",
        "Encryption & Secure Transfer — applying encryption standards for sensitive backup data",
        "Automated Notifications — alerting users upon backup completion or failure"
      ],
      deliveryTime: "2-5 Business Days"
    },
    "Incremental Backup Strategy": {
      overview: "Efficient backup strategy capturing only modified data to save time, bandwidth, and storage space.",
      requirements: ["Primary backup location", "Incremental backup preferences", "Storage capacity", "Backup schedule"],
      includes: [
        "Local & Cloud Backup Setup — configuring automated backup schedules to external or cloud storage",
        "Incremental Backup Strategy — efficient backups capturing only modified data",
        "Cross-Platform Sync Setup — ensuring data consistency across devices and platforms",
        "Backup Verification & Testing — confirming data integrity and restorability",
        "Disaster Recovery Planning — defining recovery workflows for hardware or data loss events",
        "Version Control Setup — maintaining file version history and rollback points",
        "Encryption & Secure Transfer — applying encryption standards for sensitive backup data",
        "Automated Notifications — alerting users upon backup completion or failure"
      ],
      deliveryTime: "2-5 Business Days"
    },
    "Cross-platform Sync Setup": {
      overview: "Ensuring data consistency across multiple devices and platforms with seamless synchronization.",
      requirements: ["Multiple devices", "Sync service account", "Internet connection", "Storage allocation"],
      includes: [
        "Local & Cloud Backup Setup — configuring automated backup schedules to external or cloud storage",
        "Incremental Backup Strategy — efficient backups capturing only modified data",
        "Cross-Platform Sync Setup — ensuring data consistency across devices and platforms",
        "Backup Verification & Testing — confirming data integrity and restorability",
        "Disaster Recovery Planning — defining recovery workflows for hardware or data loss events",
        "Version Control Setup — maintaining file version history and rollback points",
        "Encryption & Secure Transfer — applying encryption standards for sensitive backup data",
        "Automated Notifications — alerting users upon backup completion or failure"
      ],
      deliveryTime: "2-5 Business Days"
    },
    "Backup Verification & Testing": {
      overview: "Confirming data integrity and restorability through comprehensive backup testing and verification procedures.",
      requirements: ["Existing backup", "Test environment", "Verification criteria", "System access"],
      includes: [
        "Local & Cloud Backup Setup — configuring automated backup schedules to external or cloud storage",
        "Incremental Backup Strategy — efficient backups capturing only modified data",
        "Cross-Platform Sync Setup — ensuring data consistency across devices and platforms",
        "Backup Verification & Testing — confirming data integrity and restorability",
        "Disaster Recovery Planning — defining recovery workflows for hardware or data loss events",
        "Version Control Setup — maintaining file version history and rollback points",
        "Encryption & Secure Transfer — applying encryption standards for sensitive backup data",
        "Automated Notifications — alerting users upon backup completion or failure"
      ],
      deliveryTime: "2-5 Business Days"
    },
    "Disaster Recovery Planning": {
      overview: "Defining comprehensive recovery workflows for hardware or data loss events to minimize downtime and data loss.",
      requirements: ["Business requirements", "Critical systems inventory", "Recovery time objectives", "Budget allocation"],
      includes: [
        "Local & Cloud Backup Setup — configuring automated backup schedules to external or cloud storage",
        "Incremental Backup Strategy — efficient backups capturing only modified data",
        "Cross-Platform Sync Setup — ensuring data consistency across devices and platforms",
        "Backup Verification & Testing — confirming data integrity and restorability",
        "Disaster Recovery Planning — defining recovery workflows for hardware or data loss events",
        "Version Control Setup — maintaining file version history and rollback points",
        "Encryption & Secure Transfer — applying encryption standards for sensitive backup data",
        "Automated Notifications — alerting users upon backup completion or failure"
      ],
      deliveryTime: "2-5 Business Days"
    },
    "Version Control System Setup": {
      overview: "Maintaining file version history and rollback points to recover previous versions of files and documents.",
      requirements: ["File system access", "Version control requirements", "Storage capacity", "Retention policies"],
      includes: [
        "Local & Cloud Backup Setup — configuring automated backup schedules to external or cloud storage",
        "Incremental Backup Strategy — efficient backups capturing only modified data",
        "Cross-Platform Sync Setup — ensuring data consistency across devices and platforms",
        "Backup Verification & Testing — confirming data integrity and restorability",
        "Disaster Recovery Planning — defining recovery workflows for hardware or data loss events",
        "Version Control Setup — maintaining file version history and rollback points",
        "Encryption & Secure Transfer — applying encryption standards for sensitive backup data",
        "Automated Notifications — alerting users upon backup completion or failure"
      ],
      deliveryTime: "2-5 Business Days"
    },

    // 3.2 Data Recovery (Category Level)
    "Data Recovery": {
      overview: "Professional data recovery solutions to restore valuable data from deleted files, damaged drives, corrupted databases, and system failures.",
      requirements: ["Affected storage device", "Description of data loss", "Last backup information", "Device condition"],
      includes: [
        "Deleted File Recovery — restoring accidentally deleted files and folders",
        "External Drive Recovery — data retrieval from drives with logical damage (non-physical)",
        "Partition & RAID Recovery — rebuilding damaged or deleted partitions",
        "Corrupted File Repair — fixing corrupted documents, images, and databases",
        "System Restore / Disk Image Creation — reimaging systems to restore lost configurations",
        "Email Database Recovery — repairing corrupted Outlook PST or MBOX files",
        "Database Restoration — restoring SQL, MySQL, or MongoDB backups",
        "Data Loss Prevention Advisory — guidance on safe storage and regular backups"
      ],
      deliveryTime: "2-5 Business Days"
    },

    // Individual Data Recovery Services
    "Deleted File Recovery": {
      overview: "Restoring accidentally deleted files and folders from various storage devices and file systems.",
      requirements: ["Storage device", "File deletion timeframe", "File system type", "Device condition"],
      includes: [
        "Deleted File Recovery — restoring accidentally deleted files and folders",
        "External Drive Recovery — data retrieval from drives with logical damage (non-physical)",
        "Partition & RAID Recovery — rebuilding damaged or deleted partitions",
        "Corrupted File Repair — fixing corrupted documents, images, and databases",
        "System Restore / Disk Image Creation — reimaging systems to restore lost configurations",
        "Email Database Recovery — repairing corrupted Outlook PST or MBOX files",
        "Database Restoration — restoring SQL, MySQL, or MongoDB backups",
        "Data Loss Prevention Advisory — guidance on safe storage and regular backups"
      ],
      deliveryTime: "2-5 Business Days"
    },
    "External Drive Recovery (non-physical damage)": {
      overview: "Data retrieval from external drives with logical damage such as file system corruption or accidental formatting.",
      requirements: ["External drive", "Drive type and capacity", "Damage description", "Connection type"],
      includes: [
        "Deleted File Recovery — restoring accidentally deleted files and folders",
        "External Drive Recovery — data retrieval from drives with logical damage (non-physical)",
        "Partition & RAID Recovery — rebuilding damaged or deleted partitions",
        "Corrupted File Repair — fixing corrupted documents, images, and databases",
        "System Restore / Disk Image Creation — reimaging systems to restore lost configurations",
        "Email Database Recovery — repairing corrupted Outlook PST or MBOX files",
        "Database Restoration — restoring SQL, MySQL, or MongoDB backups",
        "Data Loss Prevention Advisory — guidance on safe storage and regular backups"
      ],
      deliveryTime: "2-5 Business Days"
    },
    "System Restore / Disk Image Creation": {
      overview: "Reimaging systems to restore lost configurations and creating complete system backups for future recovery.",
      requirements: ["System specifications", "Storage device for images", "Operating system", "Recovery requirements"],
      includes: [
        "Deleted File Recovery — restoring accidentally deleted files and folders",
        "External Drive Recovery — data retrieval from drives with logical damage (non-physical)",
        "Partition & RAID Recovery — rebuilding damaged or deleted partitions",
        "Corrupted File Repair — fixing corrupted documents, images, and databases",
        "System Restore / Disk Image Creation — reimaging systems to restore lost configurations",
        "Email Database Recovery — repairing corrupted Outlook PST or MBOX files",
        "Database Restoration — restoring SQL, MySQL, or MongoDB backups",
        "Data Loss Prevention Advisory — guidance on safe storage and regular backups"
      ],
      deliveryTime: "2-5 Business Days"
    },
    "Corrupted File Repair": {
      overview: "Fixing corrupted documents, images, videos, and database files to restore accessibility and data integrity.",
      requirements: ["Corrupted file", "File type", "Corruption description", "Original file location"],
      includes: [
        "Deleted File Recovery — restoring accidentally deleted files and folders",
        "External Drive Recovery — data retrieval from drives with logical damage (non-physical)",
        "Partition & RAID Recovery — rebuilding damaged or deleted partitions",
        "Corrupted File Repair — fixing corrupted documents, images, and databases",
        "System Restore / Disk Image Creation — reimaging systems to restore lost configurations",
        "Email Database Recovery — repairing corrupted Outlook PST or MBOX files",
        "Database Restoration — restoring SQL, MySQL, or MongoDB backups",
        "Data Loss Prevention Advisory — guidance on safe storage and regular backups"
      ],
      deliveryTime: "2-5 Business Days"
    },
    "RAID Array Recovery": {
      overview: "Rebuilding damaged or deleted RAID partitions and recovering data from failed RAID arrays.",
      requirements: ["RAID configuration details", "Number of drives", "RAID level", "Failure description"],
      includes: [
        "Deleted File Recovery — restoring accidentally deleted files and folders",
        "External Drive Recovery — data retrieval from drives with logical damage (non-physical)",
        "Partition & RAID Recovery — rebuilding damaged or deleted partitions",
        "Corrupted File Repair — fixing corrupted documents, images, and databases",
        "System Restore / Disk Image Creation — reimaging systems to restore lost configurations",
        "Email Database Recovery — repairing corrupted Outlook PST or MBOX files",
        "Database Restoration — restoring SQL, MySQL, or MongoDB backups",
        "Data Loss Prevention Advisory — guidance on safe storage and regular backups"
      ],
      deliveryTime: "2-5 Business Days"
    },
    "Email Database Recovery": {
      overview: "Repairing corrupted Outlook PST, MBOX, or other email database files to restore email communications and attachments.",
      requirements: ["Email client type", "Database file location", "Corruption symptoms", "Email account details"],
      includes: [
        "Deleted File Recovery — restoring accidentally deleted files and folders",
        "External Drive Recovery — data retrieval from drives with logical damage (non-physical)",
        "Partition & RAID Recovery — rebuilding damaged or deleted partitions",
        "Corrupted File Repair — fixing corrupted documents, images, and databases",
        "System Restore / Disk Image Creation — reimaging systems to restore lost configurations",
        "Email Database Recovery — repairing corrupted Outlook PST or MBOX files",
        "Database Restoration — restoring SQL, MySQL, or MongoDB backups",
        "Data Loss Prevention Advisory — guidance on safe storage and regular backups"
      ],
      deliveryTime: "2-5 Business Days"
    },
    "Partition Recovery": {
      overview: "Rebuilding damaged or accidentally deleted partitions to restore access to lost data and file systems.",
      requirements: ["Drive specifications", "Partition details", "Data loss description", "Operating system"],
      includes: [
        "Deleted File Recovery — restoring accidentally deleted files and folders",
        "External Drive Recovery — data retrieval from drives with logical damage (non-physical)",
        "Partition & RAID Recovery — rebuilding damaged or deleted partitions",
        "Corrupted File Repair — fixing corrupted documents, images, and databases",
        "System Restore / Disk Image Creation — reimaging systems to restore lost configurations",
        "Email Database Recovery — repairing corrupted Outlook PST or MBOX files",
        "Database Restoration — restoring SQL, MySQL, or MongoDB backups",
        "Data Loss Prevention Advisory — guidance on safe storage and regular backups"
      ],
      deliveryTime: "2-5 Business Days"
    },
    "Database Backup Restoration": {
      overview: "Restoring SQL, MySQL, MongoDB, or other database backups to recover critical business data and applications.",
      requirements: ["Database type", "Backup files", "Server specifications", "Restoration requirements"],
      includes: [
        "Deleted File Recovery — restoring accidentally deleted files and folders",
        "External Drive Recovery — data retrieval from drives with logical damage (non-physical)",
        "Partition & RAID Recovery — rebuilding damaged or deleted partitions",
        "Corrupted File Repair — fixing corrupted documents, images, and databases",
        "System Restore / Disk Image Creation — reimaging systems to restore lost configurations",
        "Email Database Recovery — repairing corrupted Outlook PST or MBOX files",
        "Database Restoration — restoring SQL, MySQL, or MongoDB backups",
        "Data Loss Prevention Advisory — guidance on safe storage and regular backups"
      ],
      deliveryTime: "2-5 Business Days"
    },

    // Legacy entries for backward compatibility
    "Data Backup Solutions": {
      overview: "Reliable backup solutions to protect and restore valuable data covering cloud, local, and hybrid systems for individuals and enterprises.",
      requirements: ["Storage device or cloud account", "List of files to backup", "Backup schedule preferences", "System credentials"],
      includes: [
        "Local & Cloud Backup Setup — configuring automated backup schedules to external or cloud storage",
        "Incremental Backup Strategy — efficient backups capturing only modified data",
        "Cross-Platform Sync Setup — ensuring data consistency across devices and platforms",
        "Backup Verification & Testing — confirming data integrity and restorability",
        "Disaster Recovery Planning — defining recovery workflows for hardware or data loss events",
        "Version Control Setup — maintaining file version history and rollback points",
        "Encryption & Secure Transfer — applying encryption standards for sensitive backup data",
        "Automated Notifications — alerting users upon backup completion or failure"
      ],
      deliveryTime: "2-5 Business Days"
    },
    "Data Recovery Services": {
      overview: "Professional data recovery solutions to restore valuable data from deleted files, damaged drives, corrupted databases, and system failures.",
      requirements: ["Affected storage device", "Description of data loss", "Last backup information", "Device condition"],
      includes: [
        "Deleted File Recovery — restoring accidentally deleted files and folders",
        "External Drive Recovery — data retrieval from drives with logical damage (non-physical)",
        "Partition & RAID Recovery — rebuilding damaged or deleted partitions",
        "Corrupted File Repair — fixing corrupted documents, images, and databases",
        "System Restore / Disk Image Creation — reimaging systems to restore lost configurations",
        "Email Database Recovery — repairing corrupted Outlook PST or MBOX files",
        "Database Restoration — restoring SQL, MySQL, or MongoDB backups",
        "Data Loss Prevention Advisory — guidance on safe storage and regular backups"
      ],
      deliveryTime: "2-5 Business Days"
    },

    // Network Troubleshooting
    "Network Configuration": {
      overview: "Professional setup and configuration of home and office networks. Router setup, WiFi optimization, network security, and device connectivity.",
      requirements: ["Router/modem access", "Network requirements", "Number of devices", "Internet service provider details"],
      includes: [
        "Router and modem installation with ISP setup",
        "WiFi network creation (2.4GHz and 5GHz bands)",
        "Network security with WPA3 encryption",
        "Guest network setup and device isolation",
        "Quality of Service (QoS) configuration",
        "Network printer and device sharing setup",
        "Complete network documentation and diagram"
      ],
      deliveryTime: "2-5 Business Days"
    },
    "Network Security": {
      overview: "Enhanced network security implementation and monitoring services. Firewall setup, VPN configuration, intrusion detection, and security audits.",
      requirements: ["Network access", "Current security setup", "Security requirements", "Admin credentials"],
      includes: [
        "Network security audit and vulnerability scan",
        "Firewall configuration and rule setup",
        "VPN setup for secure remote access",
        "Network segmentation with VLAN configuration",
        "Intrusion detection and prevention setup",
        "WiFi security with WPA3 and MAC filtering",
        "Security monitoring and incident response plan"
      ],
      deliveryTime: "2-5 Business Days"
    },

    // Remote Support
    "Remote Diagnostics": {
      overview: "Quick remote troubleshooting and issue identification via secure connection. Instant diagnosis and fixes for software issues without leaving your location.",
      requirements: ["Stable internet connection", "Remote access permission", "Device availability", "Issue description"],
      includes: [
        "Secure remote desktop connection setup",
        "Real-time system diagnostics and analysis",
        "Error message troubleshooting and fixes",
        "Performance analysis and optimization",
        "Malware scan and removal",
        "Detailed diagnosis report with recommendations",
        "7-day follow-up support"
      ],
      deliveryTime: "2-5 Business Days"
    },
    "Remote Software Support": {
      overview: "Software installation, updates, and configuration via remote access. Expert help with any software from operating systems to specialized applications.",
      requirements: ["Internet connection", "Admin rights", "Software licenses (if needed)", "Remote access approval"],
      includes: [
        "Operating system installation (Windows, macOS, Linux)",
        "Software installation (Office, Adobe, antivirus, etc.)",
        "Software updates and security patches",
        "License activation and validation",
        "Configuration and optimization",
        "User training on installed software",
        "14-day post-installation support"
      ],
      deliveryTime: "2-5 Business Days"
    },

    // Tech Training
    "Computer Basics Training": {
      overview: "Foundational computer skills training for beginners and seniors. Learn essential computer operations, internet usage, and basic applications.",
      requirements: ["Computer access", "Internet connection", "Training schedule preferences", "Learning objectives"],
      includes: [
        "One-on-one personalized training sessions",
        "Basic computer operations and navigation",
        "Internet browsing and email usage",
        "Microsoft Office basics (Word, Excel)",
        "File management and organization",
        "6-8 sessions with practice materials",
        "Certificate of completion with 30-day support"
      ],
      deliveryTime: "5-10 Business Days"
    },
    "Software Application Training": {
      overview: "Specialized training for specific software applications and tools. Master Microsoft Office, Adobe Creative Suite, QuickBooks, and other business applications.",
      requirements: ["Software access", "Skill level assessment", "Training goals", "Available time slots"],
      includes: [
        "Customized training for your software needs",
        "Excel advanced (formulas, pivot tables, macros)",
        "Adobe Photoshop, Illustrator, or Premiere Pro",
        "QuickBooks or accounting software",
        "Hands-on exercises with real projects",
        "Training manuals and video tutorials",
        "Professional certificate with 60-day support"
      ],
      deliveryTime: "5-10 Business Days"
    },

    // IoT Setup
    "Smart Home Setup": {
      overview: "Complete smart home device installation and automation setup. Transform your home with smart lights, thermostats, cameras, and voice assistants.",
      requirements: ["Smart devices list", "WiFi network", "Smartphone or tablet", "Installation access"],
      includes: [
        "Smart speaker setup (Alexa, Google Home)",
        "Smart lighting installation and scenes",
        "Smart thermostat installation and scheduling",
        "Security camera and doorbell setup",
        "Smart lock and sensor installation",
        "Voice command and automation setup",
        "Mobile app configuration and user training"
      ],
      deliveryTime: "2-5 Business Days"
    },
    "IoT Device Integration": {
      overview: "Integration of IoT devices into existing systems and networks. Connect and manage multiple smart devices for seamless automation.",
      requirements: ["Device specifications", "Network details", "Integration requirements", "Access credentials"],
      includes: [
        "Multi-brand device integration and compatibility",
        "Smart home hub setup (SmartThings, Home Assistant)",
        "Zigbee and Z-Wave network configuration",
        "Custom automation and scene creation",
        "Voice assistant integration (Alexa, Google, Siri)",
        "Dashboard and monitoring app setup",
        "60-day integration support and optimization"
      ],
      deliveryTime: "2-5 Business Days"
    },

    // Virtual Communication
    // Virtual Communication Support (Individual Services)
    "Video Conferencing Assistance": {
      overview: "Comprehensive video conferencing assistance including setup, configuration, and troubleshooting for all major platforms. Complete training and ongoing support for virtual meetings.",
      requirements: ["Platform preferences (Zoom, Google Meet, Microsoft Teams, etc.)", "Device details", "Internet speed", "Meeting requirements"],
      includes: [
        "Setup, configuration, and troubleshooting of platforms (Zoom, Google Meet, Microsoft Teams, etc.)",
        "Training users on effective use of conferencing tools",
        "Managing meeting recordings, cloud storage, and access control",
        "Integration of conferencing tools with project management systems",
        "Ensuring optimal audio/video performance during meetings"
      ],
      deliveryTime: "2-5 Business Days"
    },
    "Video Conferencing Setup": {
      overview: "Professional setup and optimization of video conferencing platforms. Perfect video/audio quality for meetings, webinars, and online events.",
      requirements: ["Platform preferences (Zoom, Teams, etc.)", "Device details", "Internet speed", "Account credentials"],
      includes: [
        "Platform account setup (Zoom, Teams, Meet, Webex)",
        "HD camera and microphone optimization",
        "Professional audio setup and testing",
        "Virtual backgrounds and green screen config",
        "Screen sharing and presentation setup",
        "Recording and cloud storage configuration",
        "Host training with quick reference guide"
      ],
      deliveryTime: "2-5 Business Days"
    },
    "Virtual Meeting Support": {
      overview: "Technical support for virtual meetings, webinars, and online events. Ensure your important events run smoothly with professional tech support.",
      requirements: ["Meeting platform", "Number of participants", "Special requirements", "Event schedule"],
      includes: [
        "Pre-event platform setup and testing",
        "Registration system and email confirmations",
        "Rehearsal session with speakers",
        "Live technical support during event",
        "Breakout rooms and polling setup",
        "Recording management and distribution",
        "Post-event analytics and 7-day support"
      ],
      deliveryTime: "2-5 Business Days"
    },

    // Cloud Services
    "Cloud Storage Setup & Management": {
      overview: "Professional cloud storage account setup and management services. Includes account creation, folder organization, file synchronization, and secure sharing permissions setup for Google Drive, OneDrive, or Dropbox.",
      requirements: ["Storage needs assessment", "Platform preferences (Google Drive/OneDrive/Dropbox)", "Account credentials", "File organization requirements"],
      includes: [
        "Account setup for Google Drive / OneDrive / Dropbox",
        "Folder structure design and organization",
        "File synchronization across devices",
        "Access and sharing permission setup",
        "Backup schedule creation",
        "Data recovery and sync troubleshooting"
      ],
      deliveryTime: "2-5 Business Days"
    },
    "Cloud Application Deployment": {
      overview: "Expert cloud application deployment services for AWS, GCP, or Azure. Complete setup including deployment pipeline, environment configuration, CI/CD integration, and monitoring for scalable applications.",
      requirements: ["App environment requirements (AWS, GCP, Azure)", "Application specifications", "Deployment requirements", "Admin credentials"],
      includes: [
        "Setup of app environment (AWS, GCP, Azure)",
        "Deployment pipeline configuration",
        "Environment variables and secrets management",
        "CI/CD integration setup",
        "App monitoring and error logging",
        "Scalability and load balancing configuration"
      ],
      deliveryTime: "2-5 Business Days"
    },
    "Multi-cloud Strategy Consultation": {
      overview: "Comprehensive multi-cloud architecture consultation services. Evaluation of current cloud usage, hybrid/multi-cloud design, vendor-neutral recommendations, and security compliance assessment.",
      requirements: ["Current cloud usage details", "Business objectives", "Budget information", "Compliance requirements"],
      includes: [
        "Evaluation of current cloud usage",
        "Design of a hybrid/multi-cloud architecture",
        "Integration of on-premise systems",
        "Vendor-neutral deployment recommendations",
        "Security and compliance assessment",
        "Performance and cost benchmarking"
      ],
      deliveryTime: "2-5 Business Days"
    },
    "Cloud Cost Optimization": {
      overview: "Professional cloud cost optimization services to reduce spending and maximize resource efficiency. Analysis of usage patterns, identification of idle resources, rightsizing recommendations, and automated billing alerts.",
      requirements: ["Cloud provider access", "Billing information", "Current resource usage", "Optimization goals"],
      includes: [
        "Analysis of cloud spending patterns",
        "Identification of idle or underused resources",
        "Rightsizing of compute/storage resources",
        "Cost forecast and optimization strategies",
        "Billing alerts setup and automation",
        "Documentation of savings recommendations"
      ],
      deliveryTime: "2-5 Business Days"
    },
    "Cloud Backup Strategy": {
      overview: "Comprehensive cloud backup strategy design and implementation. Includes backup scheduling (daily, weekly, incremental), secure storage setup, versioning policies, automated monitoring, and restoration testing.",
      requirements: ["Data backup requirements", "Storage preferences", "Recovery time objectives", "Retention policies"],
      includes: [
        "Data backup design (daily, weekly, incremental)",
        "Choice of secure backup storage",
        "Versioning and recovery policies setup",
        "Automated script or service configuration",
        "Backup monitoring dashboard",
        "Test restoration for data reliability"
      ],
      deliveryTime: "2-5 Business Days"
    },
    "SaaS Application Integration": {
      overview: "Expert SaaS application integration services for seamless connectivity. Integration of tools like Slack, CRM, Asana, with API connections, SSO configuration, database sync, and workflow automation.",
      requirements: ["SaaS applications list", "Integration requirements", "API credentials", "User access details"],
      includes: [
        "Integration of tools (Slack, CRM, Asana, etc.)",
        "API connection setup",
        "Single Sign-On (SSO) configuration",
        "Sync between databases and SaaS apps",
        "Access control management",
        "Workflow automation setup"
      ],
      deliveryTime: "2-5 Business Days"
    },
    "Cloud Security Configuration": {
      overview: "Comprehensive cloud security configuration services. IAM setup, MFA and access policies, network security rules, encryption implementation, logging and monitoring, with complete security audit report.",
      requirements: ["Cloud platform access", "Security requirements", "Compliance needs", "Admin credentials"],
      includes: [
        "IAM user and role configuration",
        "MFA and access key policies",
        "Network and firewall rules setup",
        "Encryption in-transit and at-rest",
        "Logging and monitoring configuration",
        "Security audit report generation"
      ],
      deliveryTime: "2-5 Business Days"
    },
    "Cloud Migration Support": {
      overview: "Professional cloud migration support services for safe and seamless transition. Complete migration planning, execution with minimal downtime, validation testing, user reconfiguration, and comprehensive documentation.",
      requirements: ["Source environment details", "Target cloud platform", "Data size estimate", "Migration timeline"],
      includes: [
        "Source and target environment assessment",
        "Data and application migration planning",
        "Downtime minimization strategy",
        "Migration execution (live or staged)",
        "Post-migration validation and testing",
        "User reconfiguration and documentation"
      ],
      deliveryTime: "2-5 Business Days"
    },

    // Mobile Device Support
    "Smartphone Optimization & Cleanup": {
      overview: "Complete smartphone optimization service to improve performance and free up storage. Remove junk files, optimize battery usage, and enhance overall device responsiveness.",
      requirements: ["Device model and OS version", "Current storage usage", "Device backup", "List of performance issues"],
      includes: [
        "Removal of junk, cache, and residual files",
        "Background app usage optimization",
        "Battery usage diagnostics and tune-up",
        "System updates and patch installation",
        "Removal of unused apps and bloatware",
        "Optimization of RAM and storage performance",
        "Recommendations for app performance improvement"
      ],
      deliveryTime: "1-2 Business Days"
    },
    "App Installation & Configuration": {
      overview: "Professional app installation and configuration service for productivity and utility applications. Secure setup with proper permissions and synchronization.",
      requirements: ["Device access", "App preferences", "Account credentials", "Specific app requirements"],
      includes: [
        "Installation of essential productivity and utility apps",
        "Secure setup and permissions management",
        "Account sign-in and synchronization",
        "Push notification customization",
        "Backup of app data before configuration",
        "Google Play or App Store verification",
        "App-specific training and usage tips"
      ],
      deliveryTime: "1-2 Business Days"
    },
    "Mobile Security Setup": {
      overview: "Comprehensive mobile device security configuration. Protect your smartphone from malware, theft, and unauthorized access with multi-layered security measures.",
      requirements: ["Device access", "Security preferences", "Account information", "Biometric data enrollment"],
      includes: [
        "Installation of antivirus or anti-malware apps",
        "Configuration of screen locks and biometric authentication",
        "Activation of Find My Device / iCloud protection",
        "Setup of app permissions for privacy",
        "Encryption of device storage and backups",
        "Secure Wi-Fi and hotspot configuration",
        "Privacy settings and security audit"
      ],
      deliveryTime: "1-2 Business Days"
    },
    "Data Transfer Between Devices": {
      overview: "Seamless data migration between mobile devices. Transfer all your contacts, photos, apps, and settings from your old device to new device with zero data loss.",
      requirements: ["Both devices available", "Device passwords/PINs", "Sufficient storage on new device", "Backup of current device"],
      includes: [
        "Migration of contacts, SMS, and call logs",
        "Transfer of photos, videos, and media files",
        "App data and settings migration (Android ↔ Android / iOS)",
        "Backup before transfer initiation",
        "Post-transfer verification and cleanup",
        "Setup of cloud-based sync (Google Drive/iCloud)",
        "Old device secure data wipe option"
      ],
      deliveryTime: "1-2 Business Days"
    },
    "Battery Optimization": {
      overview: "Comprehensive battery health analysis and optimization service. Extend your phone's battery life with expert diagnostics and performance tuning.",
      requirements: ["Device model", "Battery health report", "Current charging habits", "App usage patterns"],
      includes: [
        "Battery health analysis and calibration",
        "Adjustment of brightness and background sync",
        "App usage tracking for battery drainers",
        "Optimization of charging cycles",
        "Setup of power-saving modes",
        "Replacement or service recommendation if required",
        "Battery maintenance guide and tips"
      ],
      deliveryTime: "1-2 Business Days"
    },
    "Mobile Backup Setup": {
      overview: "Professional mobile backup configuration to protect your important data. Automated cloud and local backup setup with verification and restoration testing.",
      requirements: ["Cloud storage account", "Device access", "Storage space requirements", "Backup preferences"],
      includes: [
        "Google Drive / iCloud backup configuration",
        "Contacts, photos, and message sync setup",
        "Scheduled automatic backup setup",
        "Local backup to SD card or PC",
        "Backup verification and restoration test",
        "Data recovery guide for future access",
        "Backup monitoring and notifications"
      ],
      deliveryTime: "1-2 Business Days"
    },
    "Parental Controls Configuration": {
      overview: "Complete parental control setup for children's devices. Monitor and manage screen time, app usage, and online content to ensure safe digital experience.",
      requirements: ["Parent device info", "Child device access", "Age of child", "Control preferences"],
      includes: [
        "Setup of Google Family Link / Screen Time",
        "Restriction of app downloads and in-app purchases",
        "Setting screen time limits",
        "Content filtering and safe search setup",
        "Activity report configuration for guardians",
        "Security PIN setup for parental control access",
        "Remote monitoring and management training"
      ],
      deliveryTime: "1-2 Business Days"
    },
    "Mobile Payment System Setup": {
      overview: "Secure mobile payment system configuration for digital wallets and contactless payments. Safe setup of M-PESA, PayPal, Google Pay, and other payment platforms.",
      requirements: ["Valid ID", "Bank account/card details", "Phone number", "Email address"],
      includes: [
        "Registration of mobile wallets (M-PESA, PayPal, Google Pay)",
        "Linking of bank cards or accounts",
        "Setup of transaction notifications",
        "Two-factor authentication activation",
        "Security & fraud-prevention setup",
        "User guide on safe mobile payments",
        "Transaction limit configuration and monitoring"
      ],
      deliveryTime: "1-2 Business Days"
    },
    "Mobile OS Optimization": {
      overview: "Optimization and performance enhancement for mobile operating systems. Speed up slow phones, fix battery drain, and resolve software issues.",
      requirements: ["Device model", "OS version", "Performance issues", "Device backup"],
      includes: [
        "Complete device performance analysis",
        "Storage cleanup and optimization",
        "Battery drain analysis and fixes",
        "App management and optimization",
        "OS update to latest stable version",
        "System speed and responsiveness tuning",
        "Performance maintenance tips and 7-day monitoring"
      ],
      deliveryTime: "1-2 Business Days"
    },

    // Technical Consultancy
    "IT Strategy Consultation": {
      overview: "Strategic IT planning and technology roadmap development. Expert guidance for businesses on technology investments and digital transformation.",
      requirements: ["Business overview", "Current IT setup", "Budget range", "Future goals"],
      includes: [
        "Comprehensive IT infrastructure assessment",
        "3-5 year technology strategic roadmap",
        "Budget planning and ROI projections",
        "Cloud adoption and digital transformation strategy",
        "Cybersecurity and risk mitigation plan",
        "Detailed written report (30-50 pages)",
        "Follow-up consultations and quarterly reviews"
      ],
      deliveryTime: "2-7 Business Days"
    },
    "Technology Assessment": {
      overview: "Comprehensive evaluation of current technology infrastructure. Identify inefficiencies, security risks, and improvement opportunities.",
      requirements: ["System access", "IT documentation", "Business objectives", "Assessment timeline"],
      includes: [
        "Complete IT environment audit and discovery",
        "Hardware, software, and network assessment",
        "Security vulnerability scan and evaluation",
        "Performance and capacity analysis",
        "Cost optimization opportunities identification",
        "Prioritized recommendations report (40-60 pages)",
        "Implementation planning and Q&A session"
      ],
      deliveryTime: "2-7 Business Days"
    },

    // Virtual Communication Support

    // 1.1 Communication Platform Setup (Category Level)
    "Communication Platform Setup": {
      overview: "Professional setup of virtual communication platforms including video conferencing, email, messaging, and collaboration tools for seamless remote communication.",
      requirements: ["Platform preferences", "Device information", "Internet connection", "Account credentials"],
      includes: [
        "Account creation and verification",
        "Profile optimization and security settings",
        "Meeting scheduling and calendar integration",
        "Recording and transcription setup",
        "Mobile and desktop app installation"
      ],
      deliveryTime: "1-2 Business Days"
    },

    // Individual Communication Platform Setup Services
    "Zoom / Google Meet / Microsoft Teams Account Setup": {
      overview: "Complete setup of video conferencing platforms for professional virtual meetings and webinars.",
      requirements: ["Platform preference", "Email address", "Device type", "Internet speed"],
      includes: [
        "Account creation and verification",
        "Profile optimization and security settings",
        "Meeting scheduling and calendar integration",
        "Recording and transcription setup",
        "Mobile and desktop app installation"
      ],
      deliveryTime: "1-2 Business Days"
    },
    "Email Setup (Gmail, Outlook, Yahoo)": {
      overview: "Professional email account setup with security configuration, client installation, and synchronization.",
      requirements: ["Email provider preference", "Device information", "Recovery information", "Synchronization requirements"],
      includes: [
        "Account creation and security configuration",
        "Email client installation and setup",
        "Signature and folder organization",
        "Spam protection configuration",
        "Mobile device synchronization"
      ],
      deliveryTime: "1-2 Business Days"
    },
    "WhatsApp Business / Telegram Web Setup": {
      overview: "Business messaging platform setup with automation and professional profile configuration.",
      requirements: ["Business information", "Phone number", "Profile images", "Automation requirements"],
      includes: [
        "Business account creation and verification",
        "Profile optimization with business info",
        "Automated message configuration",
        "Desktop and web app installation",
        "Backup and chat transfer setup"
      ],
      deliveryTime: "1-2 Business Days"
    },
    "Video Conferencing Hardware Integration": {
      overview: "Professional integration and optimization of video conferencing hardware for optimal meeting quality.",
      requirements: ["Hardware specifications", "Meeting platform", "Room setup", "Performance goals"],
      includes: [
        "Camera and microphone compatibility testing",
        "Audio/video quality optimization",
        "Multiple display configuration",
        "Speaker and headset setup",
        "Performance testing and optimization"
      ],
      deliveryTime: "1-2 Business Days"
    },
    "Collaboration Tool Setup (Slack, Asana, Trello)": {
      overview: "Complete workspace setup for team collaboration and project management tools.",
      requirements: ["Team size", "Tool preferences", "Workflow requirements", "Integration needs"],
      includes: [
        "Workspace creation and team onboarding",
        "Channel and project structure setup",
        "Integration with other tools",
        "Notification configuration",
        "Mobile app setup"
      ],
      deliveryTime: "1-2 Business Days"
    },
    "Virtual PBX System Configuration": {
      overview: "Professional virtual phone system setup with call routing, voicemail, and business hours configuration.",
      requirements: ["Phone number requirements", "Business hours", "Call routing needs", "Team structure"],
      includes: [
        "Phone number setup and IVR configuration",
        "Call routing and forwarding rules",
        "Voicemail setup and transcription",
        "Business hours configuration",
        "Mobile app setup"
      ],
      deliveryTime: "1-2 Business Days"
    },
    "Webinar Platform Setup (GoToWebinar, Webex)": {
      overview: "Complete webinar platform configuration for professional online events and presentations.",
      requirements: ["Platform preference", "Event requirements", "Presenter details", "Recording needs"],
      includes: [
        "Account creation and plan selection",
        "Webinar template creation",
        "Registration page setup",
        "Presenter management",
        "Recording configuration"
      ],
      deliveryTime: "1-2 Business Days"
    },
    "CRM Integration with Communication Tools": {
      overview: "Seamless integration of CRM systems with communication platforms for automated logging and tracking.",
      requirements: ["CRM system details", "Communication tools", "Integration requirements", "User access"],
      includes: [
        "CRM system setup",
        "Contact import and synchronization",
        "Meeting and call logging automation",
        "Email tracking setup",
        "Mobile access configuration"
      ],
      deliveryTime: "1-2 Business Days"
    },

    // 1.2 Communication Troubleshooting (Category Level)
    "Communication Troubleshooting": {
      overview: "Expert troubleshooting for audio/video issues, connectivity problems, and platform integration challenges in virtual communication.",
      requirements: ["Issue description", "Platform details", "Device information", "Error messages"],
      includes: [
        "Connection quality diagnosis",
        "Hardware compatibility checking",
        "Bandwidth optimization",
        "Driver and software updates",
        "Alternative platform setup"
      ],
      deliveryTime: "1-2 Business Days"
    },

    // Individual Communication Troubleshooting Services
    "Audio/Video Issue Troubleshooting": {
      overview: "Professional diagnosis and resolution of audio and video quality issues in virtual meetings.",
      requirements: ["Platform used", "Device specifications", "Internet speed", "Issue details"],
      includes: [
        "Connection quality diagnosis",
        "Hardware compatibility checking",
        "Bandwidth optimization",
        "Driver and software updates",
        "Alternative platform setup"
      ],
      deliveryTime: "1-2 Business Days"
    },
    "Screen Sharing / Connection Support": {
      overview: "Expert support for screen sharing, permissions, and multi-monitor optimization.",
      requirements: ["Platform details", "Monitor setup", "Permission issues", "Use case"],
      includes: [
        "Permission configuration",
        "Multi-monitor setup optimization",
        "Bandwidth management",
        "Annotation tools setup",
        "Cross-platform compatibility"
      ],
      deliveryTime: "1-2 Business Days"
    },
    "Virtual Meeting Scheduling & Management": {
      overview: "Comprehensive support for meeting scheduling, calendar integration, and participant management.",
      requirements: ["Calendar system", "Meeting platforms", "Team structure", "Scheduling needs"],
      includes: [
        "Calendar integration troubleshooting",
        "Time zone configuration",
        "Waiting room management",
        "Co-host permissions",
        "Follow-up procedures"
      ],
      deliveryTime: "1-2 Business Days"
    },
    "Recording & Transcription Setup": {
      overview: "Professional setup of meeting recording and automatic transcription services.",
      requirements: ["Platform details", "Storage preferences", "Quality requirements", "Access needs"],
      includes: [
        "Storage location configuration",
        "Quality optimization",
        "Automatic transcription setup",
        "Sharing access control",
        "Backup procedures"
      ],
      deliveryTime: "1-2 Business Days"
    },
    "Chat & File Sharing Support": {
      overview: "Expert support for chat functionality and secure file sharing in communication platforms.",
      requirements: ["Platform details", "File size needs", "Security requirements", "Integration needs"],
      includes: [
        "File size optimization",
        "Security and encryption setup",
        "Version control configuration",
        "Integration with cloud services",
        "Mobile access setup"
      ],
      deliveryTime: "1-2 Business Days"
    },
    "Mobile App Synchronization": {
      overview: "Seamless synchronization setup for communication apps across multiple devices.",
      requirements: ["Devices list", "Apps to sync", "Account details", "Notification preferences"],
      includes: [
        "Cross-device compatibility",
        "Notification configuration",
        "Offline capability setup",
        "Security authentication",
        "Backup procedures"
      ],
      deliveryTime: "1-2 Business Days"
    },
    "Bandwidth Optimization for Video Calls": {
      overview: "Network optimization for smooth video calls with quality-of-service configuration.",
      requirements: ["Internet speed", "Network setup", "Number of users", "Quality requirements"],
      includes: [
        "Network speed testing",
        "Quality of Service configuration",
        "Background application management",
        "Video resolution optimization",
        "Emergency low-bandwidth setup"
      ],
      deliveryTime: "1-2 Business Days"
    },
    "Multi-platform Integration Support": {
      overview: "Expert integration support for connecting multiple communication platforms seamlessly.",
      requirements: ["Platforms list", "Integration goals", "Security requirements", "User access"],
      includes: [
        "Cross-platform compatibility testing",
        "Single sign-on configuration",
        "Data synchronization",
        "Security access management",
        "Performance monitoring"
      ],
      deliveryTime: "1-2 Business Days"
    },

    // Legacy entries for backward compatibility
    "Email & Messaging Configuration": {
      overview: "Professional email and messaging platform setup for business and personal communications. Complete account setup, synchronization, and integration across all your devices.",
      requirements: ["Email accounts", "Device information", "Platform preferences", "Current email setup"],
      includes: [
        "Account creation and security configuration",
        "Email client installation and setup",
        "Signature and folder organization",
        "Spam protection configuration",
        "Mobile device synchronization"
      ],
      deliveryTime: "1-2 Business Days"
    },
    "Virtual Office Setup": {
      overview: "Complete virtual workspace deployment with collaborative tools and cloud-based systems for remote teams and businesses. Full setup for productive remote operations.",
      requirements: ["Team size", "Business requirements", "Platform preferences", "Budget range"],
      includes: [
        "Deployment of collaborative workspaces (Google Workspace, Microsoft 365)",
        "Configuration of cloud-based document sharing and version control",
        "Setting up user roles and access permissions",
        "Implementing automation for virtual workflows",
        "Security and privacy management for remote operations"
      ],
      deliveryTime: "1-2 Business Days"
    },

    // Device Support - Additional Categories
    "Peripheral Device Support": {
      overview: "Complete support for printers, scanners, webcams, and other peripheral devices. Professional installation, troubleshooting, network configuration, and maintenance.",
      requirements: ["Device type and model", "Connection method", "Operating system", "Network details"],
      includes: [
        "Printer, scanner, and webcam installation and troubleshooting",
        "Driver and firmware updates",
        "Bluetooth and USB connectivity issue resolution",
        "Peripheral sharing in network environments",
        "Calibration and testing for device accuracy"
      ],
      deliveryTime: "1-2 Business Days"
    },
    "Printer Service": {
      overview: "Professional printer service including installation, network setup, maintenance, and repair. Complete support for all printer types and brands.",
      requirements: ["Printer model", "Connection type", "Operating system", "Network setup"],
      includes: [
        "Driver Installation & Configuration – Installing or updating printer drivers for compatibility with operating systems",
        "Network & Wireless Setup – Connecting printers to LAN or Wi-Fi networks for shared or remote access",
        "Paper Jam & Feed Mechanism Repair – Clearing paper jams and servicing rollers or feed trays",
        "Toner/Ink Cartridge Replacement & Calibration – Replacing consumables and adjusting print alignment or color balance"
      ],
      deliveryTime: "1-3 Business Days"
    },
    "Scanner Service": {
      overview: "Complete scanner service including installation, troubleshooting, maintenance, and cloud integration. Expert support for all scanner types.",
      requirements: ["Scanner model", "Connection type", "Operating system", "Integration requirements"],
      includes: [
        "Driver & Software Installation – Installing scanner drivers and image management software",
        "Scan Quality Troubleshooting – Fixing issues like streaks, faded scans, or color inconsistencies",
        "ADF (Automatic Document Feeder) Maintenance – Cleaning or repairing rollers and sensors in the feeder mechanism",
        "Connectivity & Integration Support – Configuring scanners for USB, Wi-Fi, or network use, and integrating with cloud or document management systems"
      ],
      deliveryTime: "1-3 Business Days"
    },

    // Data Security Management
    "Data Security Management": {
      overview: "Comprehensive data protection and security management. Implementation of access controls, encryption, and data loss prevention strategies.",
      requirements: ["Current security setup", "Data sensitivity level", "Compliance requirements", "System access"],
      includes: [
        "Data access control implementation",
        "Encryption and decryption configuration",
        "Secure drive wiping before disposal",
        "Backup success rate monitoring and auditing",
        "Data loss prevention strategy consultation",
        "Security policy documentation",
        "Regular security compliance reviews"
      ],
      deliveryTime: "1-3 Business Days"
    },

    // Network Diagnostics
    "Network Diagnostics": {
      overview: "In-depth network analysis and troubleshooting to identify and resolve connectivity, speed, and performance issues.",
      requirements: ["Network equipment details", "Internet service provider", "Current issues", "Network diagram if available"],
      includes: [
        "Comprehensive speed and latency testing",
        "Connectivity drop issue identification",
        "Cable and port integrity testing",
        "Wireless signal optimization",
        "DNS and IP conflict resolution",
        "Network performance analysis report",
        "Optimization recommendations"
      ],
      deliveryTime: "1-3 Business Days"
    },
    "Internet Security & Monitoring": {
      overview: "Advanced network security implementation with firewall, intrusion detection, and traffic monitoring for home and business networks.",
      requirements: ["Network access", "Security requirements", "Devices to protect", "Admin credentials"],
      includes: [
        "Firewall setup and configuration",
        "IDS/IPS intrusion detection guidance",
        "Parental control and web filtering setup",
        "VPN-based browsing and encryption",
        "Network traffic logging and reporting",
        "Security incident response planning",
        "Regular security audit and updates"
      ],
      deliveryTime: "1-3 Business Days"
    },

    // Technical Consultancy - Additional Services
    "Process Automation & Optimization": {
      overview: "Workflow analysis and automation implementation to improve business efficiency and reduce manual tasks.",
      requirements: ["Current workflows", "Business processes", "System access", "Automation goals"],
      includes: [
        "Comprehensive workflow efficiency analysis",
        "Automation script and bot deployment",
        "API integration for cross-platform data exchange",
        "Task scheduling and monitoring setup",
        "Post-deployment performance evaluation",
        "Staff training on automated systems",
        "Ongoing optimization and support"
      ],
      deliveryTime: "1-3 Business Days"
    },
    "IT Policy & Compliance Advisory": {
      overview: "Development of IT policies and compliance frameworks to meet regulatory requirements and industry standards.",
      requirements: ["Business details", "Compliance requirements", "Current policies", "Industry regulations"],
      includes: [
        "IT usage and data security policy formulation",
        "GDPR, ISO, and local data law compliance",
        "Employee awareness and training programs",
        "Audit documentation and internal controls",
        "Periodic policy review and updates",
        "Compliance monitoring framework",
        "Incident response procedures"
      ],
      deliveryTime: "1-3 Business Days"
    },

    // IoT - Cloud Integration
    "Cloud & Dashboard Integration": {
      overview: "Integration of IoT devices with cloud platforms and creation of custom dashboards for real-time monitoring and control.",
      requirements: ["IoT devices list", "Cloud platform preference", "Dashboard requirements", "API access"],
      includes: [
        "IoT device linking to cloud (AWS IoT, Azure, ThingSpeak)",
        "Custom data visualization dashboard creation",
        "Real-time alert and notification systems",
        "Remote monitoring interface configuration",
        "API-based data export (CSV, Excel, JSON)",
        "Mobile app integration",
        "Cloud platform optimization and scaling"
      ],
      deliveryTime: "1-3 Business Days"
    },
    "Smart System Deployment": {
      overview: "End-to-end deployment of smart systems for homes, farms, and industrial applications using IoT devices and sensors.",
      requirements: ["System requirements", "Location details", "Device specifications", "Power and connectivity"],
      includes: [
        "Smart home, farm, and industrial IoT installations",
        "NodeMCU, ESP32, Arduino firmware configuration",
        "End-to-end system communication testing",
        "Connectivity and sensor anomaly troubleshooting",
        "System documentation and user manuals",
        "On-site training and handover",
        "Ongoing maintenance and support"
      ],
      deliveryTime: "1-3 Business Days"
    },

    // Remote Hardware Support - Additional
    "Firmware & BIOS Configuration": {
      overview: "Expert firmware and BIOS configuration services for optimal hardware performance and security.",
      requirements: ["Hardware model", "Current firmware version", "Issue description", "System backup"],
      includes: [
        "BIOS updates and security configuration",
        "Firmware patching for embedded systems",
        "Safe mode and recovery setup",
        "Peripheral firmware upgrades",
        "Configuration backup and restoration",
        "Performance optimization settings",
        "Remote guidance and verification"
      ],
      deliveryTime: "1-3 Business Days"
    },
    "Component Replacement Guidance": {
      overview: "Step-by-step remote guidance for safe hardware component replacement and upgrade.",
      requirements: ["Component details", "Replacement parts", "Technical skill level", "Tools available"],
      includes: [
        "Detailed RAM, HDD/SSD, battery replacement instructions",
        "Hardware compatibility verification",
        "ESD (Electrostatic Discharge) safety training",
        "Remote installation validation",
        "Post-replacement troubleshooting",
        "Performance testing and verification",
        "Warranty and return policy guidance"
      ],
      deliveryTime: "1-3 Business Days"
    },

    // Customized Tech Training & Digital Skills
    // 7.1 Digital Literacy
    "Computer Basics (Word, Excel, PowerPoint) – per session": {
      overview: "Comprehensive training on Microsoft Office applications including Word, Excel, and PowerPoint. Master document creation, spreadsheet management, and professional presentations.",
      requirements: ["Computer access", "Basic computer literacy", "Willingness to learn", "2-hour availability"],
      includes: [
        "Interface navigation",
        "Document creation",
        "Template usage",
        "Collaboration features",
        "File management"
      ],
      deliveryTime: "2-5 Business Days"
    },
    "Internet & Email Skills Training – per session": {
      overview: "Essential internet and email skills for modern communication. Learn browser navigation, email management, and online collaboration tools.",
      requirements: ["Internet access", "Email account", "Basic computer skills", "2-hour availability"],
      includes: [
        "Browser navigation",
        "Search techniques",
        "Email composition",
        "Security awareness",
        "Cloud integration"
      ],
      deliveryTime: "2-5 Business Days"
    },
    "Social Media Management Training": {
      overview: "Professional social media management training covering platform selection, content creation, and audience engagement strategies.",
      requirements: ["Social media accounts", "Content ideas", "Target audience info", "2-hour availability"],
      includes: [
        "Platform selection",
        "Content creation",
        "Audience engagement",
        "Analytics tracking",
        "Advertising basics"
      ],
      deliveryTime: "2-5 Business Days"
    },
    "Online Safety & Privacy Basics": {
      overview: "Critical online safety and privacy training covering password management, two-factor authentication, and secure browsing practices.",
      requirements: ["Internet access", "Email accounts", "Online accounts list", "2-hour availability"],
      includes: [
        "Password management",
        "Two-factor authentication",
        "Privacy settings",
        "Phishing recognition",
        "Secure browsing"
      ],
      deliveryTime: "2-5 Business Days"
    },
    "Mobile Device Mastery": {
      overview: "Complete mobile device training covering interface customization, app management, and security configuration for smartphones and tablets.",
      requirements: ["Mobile device", "Device password", "App store access", "2-hour availability"],
      includes: [
        "Interface customization",
        "App management",
        "Security configuration",
        "Battery optimization",
        "Data usage"
      ],
      deliveryTime: "2-5 Business Days"
    },
    "Cloud Storage & File Management": {
      overview: "Comprehensive cloud storage training covering service selection, file organization, sharing setup, and security controls.",
      requirements: ["Internet access", "Email account", "Files to organize", "2-hour availability"],
      includes: [
        "Service selection",
        "File organization",
        "Sharing setup",
        "Version history",
        "Security controls"
      ],
      deliveryTime: "2-5 Business Days"
    },
    "Digital Payment Systems": {
      overview: "Training on digital payment platforms including M-Pesa, PayPal, and online banking. Learn transaction procedures and fraud prevention.",
      requirements: ["Phone number", "ID documents", "Bank account info", "2-hour availability"],
      includes: [
        "Platform selection",
        "Account security",
        "Transaction procedures",
        "Fraud prevention",
        "Record management"
      ],
      deliveryTime: "2-5 Business Days"
    },
    "Basic Graphic Design Tools": {
      overview: "Introduction to graphic design tools including Canva, Adobe Express, and design principles for non-designers.",
      requirements: ["Computer access", "Internet connection", "Design ideas", "2-hour availability"],
      includes: [
        "Software selection",
        "Design principles",
        "Template customization",
        "Image editing",
        "Export optimization"
      ],
      deliveryTime: "2-5 Business Days"
    },
    "Basic use of AI tools": {
      overview: "Introduction to modern AI tools including ChatGPT, Gemini, and other AI assistants. Learn prompt engineering and ethical AI usage.",
      requirements: ["Internet access", "Email account", "Use cases", "2-hour availability"],
      includes: [
        "Tool selection",
        "Account setup",
        "Prompt engineering",
        "Content generation",
        "Ethical usage"
      ],
      deliveryTime: "2-5 Business Days"
    },

    // 7.2 Advanced Training
    "Computer programming fundamentals": {
      overview: "Foundation programming course covering language selection, environment setup, and basic syntax for aspiring developers.",
      requirements: ["Computer access", "Programming interest", "Problem-solving aptitude", "2-hour availability"],
      includes: [
        "Language selection",
        "Environment setup",
        "Basic syntax",
        "Problem-solving",
        "Debugging techniques"
      ],
      deliveryTime: "2-5 Business Days"
    },
    "Coding for Kids": {
      overview: "Age-appropriate coding introduction using visual programming platforms like Scratch. Develop logic and creative thinking skills.",
      requirements: ["Computer/tablet access", "Age 7-14", "Parent supervision", "2-hour availability"],
      includes: [
        "Age-appropriate platforms",
        "Visual programming",
        "Logic development",
        "Creative projects",
        "Safe environment"
      ],
      deliveryTime: "5-10 Business Days"
    },
    "IoT & Coding for Beginners": {
      overview: "Introduction to Internet of Things and coding using beginner-friendly microcontrollers and sensors.",
      requirements: ["Basic computer skills", "Electronics interest", "IoT kit (recommended)", "2-hour availability"],
      includes: [
        "Electronics introduction",
        "Sensor programming",
        "Data collection",
        "Automation concepts",
        "Safety practices"
      ],
      deliveryTime: "5-10 Business Days"
    },
    "IoT & Coding for Intermediate": {
      overview: "Intermediate IoT training covering advanced sensors, data analysis, cloud connectivity, and mobile integration.",
      requirements: ["Basic programming knowledge", "IoT fundamentals", "IoT kit", "2-hour availability"],
      includes: [
        "Advanced sensors",
        "Data analysis",
        "Cloud connectivity",
        "Mobile integration",
        "Security considerations"
      ],
      deliveryTime: "5-10 Business Days"
    },
    "IoT & Coding for Kids – per session": {
      overview: "Fun and educational IoT coding sessions for kids using beginner-friendly platforms and safe electronics.",
      requirements: ["Computer access", "Age 7-14", "Parent supervision", "2-hour availability"],
      includes: [
        "Age-appropriate platforms",
        "Visual programming",
        "Logic development",
        "Creative projects",
        "Safe environment"
      ],
      deliveryTime: "5-10 Business Days"
    },
    "Web Development Basics – per session": {
      overview: "Introduction to web development covering HTML, CSS, JavaScript, and responsive design principles.",
      requirements: ["Computer access", "Text editor", "Web browser", "2-hour availability"],
      includes: [
        "HTML/CSS/JavaScript",
        "Development environment",
        "Responsive design",
        "Basic hosting",
        "Version control"
      ],
      deliveryTime: "5-10 Business Days"
    },
    "AI / Robotics Introductory Training – per session": {
      overview: "Introduction to artificial intelligence and robotics concepts including machine learning basics and automation programming.",
      requirements: ["Technical interest", "Basic programming", "Computer access", "2-hour availability"],
      includes: [
        "AI concepts",
        "Machine learning basics",
        "Platform setup",
        "Automation programming",
        "Ethical considerations"
      ],
      deliveryTime: "5-10 Business Days"
    },
    "Cybersecurity Awareness Training – per session": {
      overview: "Essential cybersecurity training covering threat overview, security practices, and incident response procedures.",
      requirements: ["Computer/device access", "Online accounts", "Security interest", "2-hour availability"],
      includes: [
        "Threat overview",
        "Security practices",
        "Network fundamentals",
        "Incident response",
        "Compliance requirements"
      ],
      deliveryTime: "5-10 Business Days"
    },
    "Data Analytics Fundamentals – per session": {
      overview: "Introduction to data analytics covering data collection, analysis tools, statistical concepts, and visualization techniques.",
      requirements: ["Computer access", "Excel/spreadsheet skills", "Data interest", "2-hour availability"],
      includes: [
        "Data collection",
        "Analysis tools",
        "Statistical concepts",
        "Visualization techniques",
        "Quality assessment"
      ],
      deliveryTime: "5-10 Business Days"
    },
    "Digital Marketing Essentials – per session": {
      overview: "Comprehensive digital marketing training covering strategy development, content optimization, and SEO fundamentals.",
      requirements: ["Business/marketing interest", "Social media accounts", "Website access", "2-hour availability"],
      includes: [
        "Strategy development",
        "Content optimization",
        "Social media techniques",
        "SEO fundamentals",
        "Budget management"
      ],
      deliveryTime: "5-10 Business Days"
    },
    "Cloud Computing Introduction – per session": {
      overview: "Introduction to cloud computing covering service models, infrastructure setup, and security management.",
      requirements: ["Technical background", "Internet access", "Cloud interest", "2-hour availability"],
      includes: [
        "Service models",
        "Infrastructure setup",
        "Storage services",
        "Security management",
        "Cost optimization"
      ],
      deliveryTime: "5-10 Business Days"
    },
    "Automation Tools Training – per session": {
      overview: "Training on automation tools and workflow optimization covering platform selection, workflow design, and system integration.",
      requirements: ["Technical aptitude", "Process documentation", "Tool access", "2-hour availability"],
      includes: [
        "Platform selection",
        "Workflow design",
        "Tool configuration",
        "System integration",
        "Security considerations"
      ],
      deliveryTime: "5-10 Business Days"
    },

    // 7.3 Mentorship & Bootcamps
    "One-on-One Mentorship (per session)": {
      overview: "Personalized technology mentorship providing skills assessment, learning path development, and career guidance.",
      requirements: ["Learning goals", "Current skill level", "Time commitment", "Specific interests"],
      includes: [
        "Skills assessment",
        "Learning path development",
        "Progress reviews",
        "Career guidance",
        "Project-based learning"
      ],
      deliveryTime: "5-10 Business Days"
    },
    "Group Virtual Session (per participant)": {
      overview: "Interactive group training sessions with curriculum development, peer collaboration, and progress tracking.",
      requirements: ["Group size", "Learning objectives", "Technical level", "Available schedule"],
      includes: [
        "Curriculum development",
        "Interactive activities",
        "Peer collaboration",
        "Progress tracking",
        "Technical support"
      ],
      deliveryTime: "5-10 Business Days"
    },
    "Career Transition Tech Coaching (per participant)": {
      overview: "Specialized coaching for career transitions into tech covering skills gap analysis, learning roadmap, and interview preparation.",
      requirements: ["Career goals", "Current background", "Target role", "Time availability"],
      includes: [
        "Skills gap analysis",
        "Learning roadmap",
        "Portfolio building",
        "Interview preparation",
        "Job search strategy"
      ],
      deliveryTime: "5-10 Business Days"
    },
    "Small Business Digital Transformation (per participant)": {
      overview: "Digital transformation consulting for small businesses including current assessment, technology recommendations, and implementation planning.",
      requirements: ["Business details", "Current systems", "Transformation goals", "Budget range"],
      includes: [
        "Current assessment",
        "Technology recommendations",
        "Implementation planning",
        "Staff training",
        "Performance monitoring"
      ],
      deliveryTime: "5-10 Business Days"
    },
    "Remote Work Setup Consultation (per participant)": {
      overview: "Complete remote work setup consultation covering home office assessment, technology requirements, and productivity systems.",
      requirements: ["Work requirements", "Current setup", "Space availability", "Budget"],
      includes: [
        "Home office assessment",
        "Technology requirements",
        "Security setup",
        "Communication tools",
        "Productivity systems"
      ],
      deliveryTime: "5-10 Business Days"
    },
    "Tech Skill Assessment & Roadmap (per participant)": {
      overview: "Comprehensive tech skill assessment with personalized learning roadmap, resource recommendations, and progress tracking.",
      requirements: ["Current skills", "Career goals", "Learning preferences", "Time commitment"],
      includes: [
        "Skills inventory",
        "Industry analysis",
        "Gap identification",
        "Resource recommendations",
        "Progress tracking"
      ],
      deliveryTime: "5-10 Business Days"
    },
    "Certification Preparation Support (per participant)": {
      overview: "Certification exam preparation support including certification selection, study plan development, and practice tests.",
      requirements: ["Target certification", "Current knowledge", "Exam timeline", "Study materials"],
      includes: [
        "Certification selection",
        "Study plan development",
        "Practice tests",
        "Exam strategies",
        "Application assistance"
      ],
      deliveryTime: "5-10 Business Days"
    },
    "Project-based Learning Programs (per participant)": {
      overview: "Hands-on project-based learning programs with project selection, milestone planning, and portfolio development.",
      requirements: ["Project ideas", "Technical level", "Time commitment", "Portfolio goals"],
      includes: [
        "Project selection",
        "Milestone planning",
        "Technical guidance",
        "Quality assurance",
        "Portfolio development"
      ],
      deliveryTime: "5-10 Business Days"
    },

    // Category-level entries for Tech Training
    "Digital Literacy (Session: 2Hrs)": {
      overview: "Foundational digital skills training covering essential computer operations, internet usage, and online safety. Perfect for beginners and those looking to enhance their basic tech skills.",
      requirements: ["Computer/mobile device access", "Internet connection", "Willingness to learn", "2-hour session availability"],
      includes: [
        "Computer basics and office applications",
        "Internet and email proficiency",
        "Social media management fundamentals",
        "Online safety and privacy practices",
        "Cloud storage and digital payments"
      ],
      deliveryTime: "5-10 Business Days"
    },
    "Advanced Training (Session: 2Hrs)": {
      overview: "Advanced technology training covering programming, web development, IoT, AI, cybersecurity, and data analytics. For those ready to take their tech skills to the next level.",
      requirements: ["Basic computer literacy", "Technical aptitude", "Learning commitment", "2-hour session availability"],
      includes: [
        "Programming fundamentals and web development",
        "IoT and robotics for various skill levels",
        "Cybersecurity awareness training",
        "Data analytics and digital marketing",
        "Cloud computing and automation tools"
      ],
      deliveryTime: "5-10 Business Days"
    },
    "Mentorship & Bootcamps": {
      overview: "Personalized mentorship and intensive bootcamp programs designed to accelerate your tech career or business digital transformation. One-on-one and group sessions available.",
      requirements: ["Clear learning goals", "Time commitment", "Specific focus area", "Progress tracking willingness"],
      includes: [
        "Personalized mentorship and group sessions",
        "Career transition and tech coaching",
        "Business digital transformation consulting",
        "Tech skill assessment and certification prep",
        "Project-based learning and portfolio building"
      ],
      deliveryTime: "5-10 Business Days"
    }
  };

  return detailsMap[category] || {
    overview: "Professional service delivery with expert guidance and support. Our experienced team ensures quality service and customer satisfaction.",
    requirements: ["Valid identification", "Contact information", "Service-specific details"],
    includes: [
      "Expert professional assistance",
      "Quality service delivery",
      "Progress tracking and updates",
      "Complete documentation",
      "Post-service support",
      "Customer satisfaction guarantee",
      "Timely completion"
    ],
    deliveryTime: "5-10 Business Days"
  };
};
