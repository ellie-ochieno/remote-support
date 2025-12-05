// Form validation utilities
import { getRecaptchaSiteKey, isRecaptchaConfigured } from './env';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  firstError?: string;
}

// reCAPTCHA validation interface
export interface RecaptchaValidationResult {
  isValid: boolean;
  error?: string;
}

// reCAPTCHA validation utilities
export class RecaptchaValidator {
  private static readonly RECAPTCHA_SITE_KEY = getRecaptchaSiteKey();

  // Validate reCAPTCHA token
  static async validateRecaptcha(token: string | null): Promise<RecaptchaValidationResult> {
    // Remove Figma environment check - it's not needed for production
    if (!token) {
      return {
        isValid: false,
        error: 'reCAPTCHA verification is required. Please complete the reCAPTCHA challenge.'
      };
    }

    if (!this.RECAPTCHA_SITE_KEY) {
      console.error('reCAPTCHA site key not configured');
      return {
        isValid: false,
        error: 'reCAPTCHA configuration error. Please contact support.'
      };
    }

    try {
      // The actual verification happens on the backend
      // This is just client-side validation that token exists
      return {
        isValid: true
      };
    } catch (error) {
      console.error('reCAPTCHA validation error:', error);
      return {
        isValid: false,
        error: 'reCAPTCHA verification failed. Please try again.'
      };
    }
  }

  // Get reCAPTCHA site key
  static getSiteKey(): string | undefined {
    return this.RECAPTCHA_SITE_KEY;
  }

  // Check if reCAPTCHA is configured
  static isConfigured(): boolean {
    return !!this.RECAPTCHA_SITE_KEY;
  }
}

export class FormValidator {
  private errors: string[] = [];

  // Reset errors
  reset(): FormValidator {
    this.errors = [];
    return this;
  }

  // Add an error
  addError(error: string): FormValidator {
    this.errors.push(error);
    return this;
  }

  // Email validation
  validateEmail(email: string, fieldName: string = 'Email'): FormValidator {
    if (!email.trim()) {
      this.addError(`${fieldName} is required.`);
      return this;
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email.trim())) {
      this.addError(`${fieldName} must be a valid email address.`);
    }

    return this;
  }

  // Phone validation (Kenyan format)
  validatePhone(phone: string, fieldName: string = 'Phone number'): FormValidator {
    if (!phone.trim()) {
      this.addError(`${fieldName} is required.`);
      return this;
    }

    // Remove all non-digit characters
    const cleanPhone = phone.replace(/\D/g, '');

    // Check for various Kenyan phone formats
    const kenyanFormats = [
      /^254[17]\d{8}$/, // +254 7XXXXXXXX or +254 1XXXXXXXX (landline)
      /^0[17]\d{8}$/, // 07XXXXXXXX or 01XXXXXXXX
      /^[17]\d{8}$/, // 7XXXXXXXX or 1XXXXXXXX
    ];

    const isValidKenyan = kenyanFormats.some(format => format.test(cleanPhone));

    // Also allow international format for non-Kenyan numbers
    const internationalFormat = /^\d{10,15}$/;

    if (!isValidKenyan && !internationalFormat.test(cleanPhone)) {
      this.addError(`${fieldName} must be a valid phone number (e.g., +254 7XX XXX XXX or 07XX XXX XXX).`);
    }

    if (cleanPhone.length < 9) {
      this.addError(`${fieldName} is too short.`);
    }

    return this;
  }

  // Required field validation
  validateRequired(value: string, fieldName: string): FormValidator {
    if (!value || !value.trim()) {
      this.addError(`${fieldName} is required.`);
    }
    return this;
  }

  // Minimum length validation
  validateMinLength(value: string, minLength: number, fieldName: string): FormValidator {
    if (value.trim().length < minLength) {
      this.addError(`${fieldName} must be at least ${minLength} characters long.`);
    }
    return this;
  }

  // Maximum length validation
  validateMaxLength(value: string, maxLength: number, fieldName: string): FormValidator {
    if (value.trim().length > maxLength) {
      this.addError(`${fieldName} must be no more than ${maxLength} characters long.`);
    }
    return this;
  }

  // Name validation
  validateName(name: string, fieldName: string = 'Name'): FormValidator {
    this.validateRequired(name, fieldName);

    if (name.trim().length > 0) {
      this.validateMinLength(name, 2, fieldName);
      this.validateMaxLength(name, 50, fieldName);

      // Check for valid characters (letters, spaces, hyphens, apostrophes)
      const nameRegex = /^[a-zA-Z\s\-'\.]+$/;
      if (!nameRegex.test(name.trim())) {
        this.addError(`${fieldName} can only contain letters, spaces, hyphens, and apostrophes.`);
      }
    }

    return this;
  }

  // Password validation
  validatePassword(password: string, fieldName: string = 'Password'): FormValidator {
    this.validateRequired(password, fieldName);

    if (password.length > 0) {
      this.validateMinLength(password, 8, fieldName);

      // Check for at least one uppercase, lowercase, number, and special character
      const hasUpperCase = /[A-Z]/.test(password);
      const hasLowerCase = /[a-z]/.test(password);
      const hasNumbers = /\d/.test(password);
      const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

      if (!hasUpperCase) {
        this.addError(`${fieldName} must contain at least one uppercase letter.`);
      }
      if (!hasLowerCase) {
        this.addError(`${fieldName} must contain at least one lowercase letter.`);
      }
      if (!hasNumbers) {
        this.addError(`${fieldName} must contain at least one number.`);
      }
      if (!hasSpecialChar) {
        this.addError(`${fieldName} must contain at least one special character.`);
      }
    }

    return this;
  }

  // URL validation
  validateUrl(url: string, fieldName: string = 'URL'): FormValidator {
    if (url.trim()) {
      try {
        new URL(url);
      } catch {
        this.addError(`${fieldName} must be a valid URL.`);
      }
    }
    return this;
  }

  // Age validation
  validateAge(age: string | number, minAge: number = 0, maxAge: number = 120, fieldName: string = 'Age'): FormValidator {
    const ageNum = typeof age === 'string' ? parseInt(age) : age;

    if (isNaN(ageNum)) {
      this.addError(`${fieldName} must be a valid number.`);
      return this;
    }

    if (ageNum < minAge || ageNum > maxAge) {
      this.addError(`${fieldName} must be between ${minAge} and ${maxAge}.`);
    }

    return this;
  }

  // Date validation
  validateDate(dateString: string, fieldName: string = 'Date'): FormValidator {
    if (!dateString.trim()) {
      this.addError(`${fieldName} is required.`);
      return this;
    }

    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      this.addError(`${fieldName} must be a valid date.`);
    }

    return this;
  }

  // Future date validation
  validateFutureDate(dateString: string, fieldName: string = 'Date'): FormValidator {
    this.validateDate(dateString, fieldName);

    if (dateString.trim()) {
      const date = new Date(dateString);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (date <= today) {
        this.addError(`${fieldName} must be in the future.`);
      }
    }

    return this;
  }

  // Get validation result
  getResult(): ValidationResult {
    return {
      isValid: this.errors.length === 0,
      errors: [...this.errors],
      firstError: this.errors.length > 0 ? this.errors[0] : undefined
    };
  }
}

// Helper function for quick validation
export function validateForm(): FormValidator {
  return new FormValidator();
}

// Common validation patterns
export const ValidationPatterns = {
  email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  kenyanPhone: /^(\+254|254|0)?[17]\d{8}$/,
  strongPassword: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/,
  url: /^https?:\/\/.+\..+/,
  name: /^[a-zA-Z\s\-'\.]+$/,
  alphanumeric: /^[a-zA-Z0-9]+$/,
  numeric: /^\d+$/,
  alphanumericWithSpaces: /^[a-zA-Z0-9\s]+$/
};

// Sanitization functions
export class FormSanitizer {
  // Remove HTML tags and script content
  static sanitizeHtml(input: string): string {
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<[^>]*>/g, '')
      .trim();
  }

  // Sanitize email
  static sanitizeEmail(email: string): string {
    return email.toLowerCase().trim();
  }

  // Sanitize phone number
  static sanitizePhone(phone: string): string {
    // Remove all non-digit characters except +
    return phone.replace(/[^\d+]/g, '');
  }

  // Sanitize name (capitalize first letters)
  static sanitizeName(name: string): string {
    return name
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
      .trim();
  }

  // General text sanitization
  static sanitizeText(text: string, maxLength?: number): string {
    let sanitized = this.sanitizeHtml(text);
    if (maxLength && sanitized.length > maxLength) {
      sanitized = sanitized.substring(0, maxLength);
    }
    return sanitized;
  }
}

// Helper functions for specific validation scenarios
export function validateContactForm(data: {
  name: string;
  email: string;
  phone?: string;
  message: string;
  recaptchaToken?: string | null;
}): ValidationResult {
  const validator = validateForm()
    .validateName(data.name, 'Name')
    .validateEmail(data.email, 'Email')
    .validateRequired(data.message, 'Message')
    .validateMaxLength(data.message, 1000, 'Message');

  if (data.phone) {
    validator.validatePhone(data.phone, 'Phone number');
  }

  // reCAPTCHA validation
  if (!data.recaptchaToken) {
    validator.addError('reCAPTCHA verification is required.');
  }

  return validator.getResult();
}

export function validateRegistrationForm(data: {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  recaptchaToken?: string | null;
}): ValidationResult {
  const validator = validateForm()
    .validateName(data.firstName, 'First name')
    .validateName(data.lastName, 'Last name')
    .validateEmail(data.email, 'Email')
    .validatePhone(data.phone, 'Phone number')
    .validatePassword(data.password, 'Password');

  if (data.password !== data.confirmPassword) {
    validator.addError('Passwords do not match.');
  }

  // reCAPTCHA validation removed - handled by backend

  return validator.getResult();
}

export function validateLoginForm(data: {
  email: string;
  password: string;
  recaptchaToken?: string | null;
}): ValidationResult {
  const validator = validateForm()
    .validateEmail(data.email, 'Email')
    .validateRequired(data.password, 'Password');

  // reCAPTCHA validation removed - handled by backend

  return validator.getResult();
}

export function validateSupportForm(data: {
  name: string;
  email?: string;
  phone: string;
  issue: string;
  recaptchaToken?: string | null;
}): ValidationResult {
  const validator = validateForm()
    .validateName(data.name, 'Name')
    .validatePhone(data.phone, 'Phone number')
    .validateRequired(data.issue, 'Issue description')
    .validateMaxLength(data.issue, 500, 'Issue description');

  // Email is optional - validate only if provided
  if (data.email) {
    validator.validateEmail(data.email, 'Email');
  }

  // reCAPTCHA validation removed - handled by backend

  return validator.getResult();
}

export function validateSubscriptionForm(data: {
  email: string;
  recaptchaToken?: string | null;
}): ValidationResult {
  const validator = validateForm()
    .validateEmail(data.email, 'Email');

  // reCAPTCHA validation
  if (!data.recaptchaToken) {
    validator.addError('reCAPTCHA verification is required.');
  }

  return validator.getResult();
}

// Additional validation functions for forms with reCAPTCHA
export function validateConsultationForm(data: {
  firstName: string;
  lastName: string;
  email?: string;
  phone: string;
  businessType: string;
  consultationType: string;
  description: string;
  recaptchaToken?: string | null;
}): ValidationResult {
  const validator = validateForm()
    .validateName(data.firstName, 'First name')
    .validateName(data.lastName, 'Last name')
    .validatePhone(data.phone, 'Phone number')
    .validateRequired(data.businessType, 'Business type')
    .validateRequired(data.consultationType, 'Consultation type')
    .validateRequired(data.description, 'Description')
    .validateMinLength(data.description, 20, 'Description')
    .validateMaxLength(data.description, 2000, 'Description');

  // Email is optional - validate only if provided
  if (data.email) {
    validator.validateEmail(data.email, 'Email');
  }

  // reCAPTCHA validation removed - handled by backend

  return validator.getResult();
}

export function validateEmergencyForm(data: {
  name: string;
  email?: string;
  phone: string;
  issue: string;
  description: string;
  recaptchaToken?: string | null;
}): ValidationResult {
  const validator = validateForm()
    .validateName(data.name, 'Name')
    .validatePhone(data.phone, 'Phone number')
    .validateRequired(data.issue, 'Issue type')
    .validateRequired(data.description, 'Description')
    .validateMinLength(data.description, 10, 'Description')
    .validateMaxLength(data.description, 1000, 'Description');

  // Email is optional - validate only if provided
  if (data.email) {
    validator.validateEmail(data.email, 'Email');
  }

  // reCAPTCHA validation removed - handled by backend

  return validator.getResult();
}

export function validateInstantSupportForm(data: {
  name: string;
  email?: string;
  phone: string;
  supportType: string;
  description: string;
  recaptchaToken?: string | null;
}): ValidationResult {
  const validator = validateForm()
    .validateName(data.name, 'Name')
    .validatePhone(data.phone, 'Phone number')
    .validateRequired(data.supportType, 'Support type')
    .validateRequired(data.description, 'Description')
    .validateMinLength(data.description, 10, 'Description')
    .validateMaxLength(data.description, 1000, 'Description');

  // Email is optional - validate only if provided
  if (data.email) {
    validator.validateEmail(data.email, 'Email');
  }

  // reCAPTCHA validation removed - handled by backend

  return validator.getResult();
}
