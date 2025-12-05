import { toast } from "sonner";

// Toast notification utilities
export class ToastManager {
  // Success notifications
  static success(message: string, options?: {
    description?: string;
    duration?: number;
    action?: {
      label: string;
      onClick: () => void;
    };
  }) {
    return toast.success(message, {
      description: options?.description,
      duration: options?.duration || 4000,
      action: options?.action ? {
        label: options.action.label,
        onClick: options.action.onClick
      } : undefined
    });
  }

  // Error notifications
  static error(message: string, options?: {
    description?: string;
    duration?: number;
    action?: {
      label: string;
      onClick: () => void;
    };
  }) {
    return toast.error(message, {
      description: options?.description,
      duration: options?.duration || 6000,
      action: options?.action ? {
        label: options.action.label,
        onClick: options.action.onClick
      } : undefined
    });
  }

  // Warning notifications
  static warning(message: string, options?: {
    description?: string;
    duration?: number;
    action?: {
      label: string;
      onClick: () => void;
    };
  }) {
    return toast.warning(message, {
      description: options?.description,
      duration: options?.duration || 5000,
      action: options?.action ? {
        label: options.action.label,
        onClick: options.action.onClick
      } : undefined
    });
  }

  // Info notifications
  static info(message: string, options?: {
    description?: string;
    duration?: number;
    action?: {
      label: string;
      onClick: () => void;
    };
  }) {
    return toast.info(message, {
      description: options?.description,
      duration: options?.duration || 4000,
      action: options?.action ? {
        label: options.action.label,
        onClick: options.action.onClick
      } : undefined
    });
  }

  // Loading notifications
  static loading(message: string, options?: {
    description?: string;
  }) {
    return toast.loading(message, {
      description: options?.description
    });
  }

  // Promise notifications - Fixed version
  static promise<T>(
    promise: Promise<T>,
    options: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: any) => string);
      description?: {
        loading?: string;
        success?: string | ((data: T) => string);
        error?: string | ((error: any) => string);
      };
    }
  ) {
    return toast.promise(promise, {
      loading: options.loading + (options.description?.loading ? `\n${options.description.loading}` : ''),
      success: (data: T) => {
        const successMessage = typeof options.success === 'function' ? options.success(data) : options.success;
        const successDescription = options.description?.success
          ? (typeof options.description.success === 'function'
             ? options.description.success(data)
             : options.description.success)
          : '';

        return successDescription ? `${successMessage}\n${successDescription}` : successMessage;
      },
      error: (error: any) => {
        const errorMessage = typeof options.error === 'function' ? options.error(error) : options.error;
        const errorDescription = options.description?.error
          ? (typeof options.description.error === 'function'
             ? options.description.error(error)
             : options.description.error)
          : '';

        return errorDescription ? `${errorMessage}\n${errorDescription}` : errorMessage;
      }
    });
  }

  // Dismiss specific toast
  static dismiss(toastId?: string | number) {
    toast.dismiss(toastId);
  }

  // Dismiss all toasts
  static dismissAll() {
    toast.dismiss();
  }

  // Custom toast with rich content - Fixed version
  static custom(jsx: React.ReactNode, options?: {
    duration?: number;
  }) {
    // For custom toasts, we need to handle the ReactNode directly
    // Sonner's custom toast expects a function that returns ReactElement
    const renderToast = () => {
      return jsx as React.ReactElement;
    };

    return toast.custom(renderToast, {
      duration: options?.duration || 4000
    });
  }
}

// Specialized toast methods for common use cases
export class AppToasts {
  // Form submission toasts
  static formSubmissionSuccess(formType: string, options?: {
    nextSteps?: string;
    contactInfo?: string;
  }) {
    return ToastManager.success(
      `${formType} submitted successfully!`,
      {
        description: options?.nextSteps || 'We will get back to you shortly.',
        action: options?.contactInfo ? {
          label: 'Call Now',
          onClick: () => window.open(`tel:${options.contactInfo}`, '_self')
        } : undefined
      }
    );
  }

  static formSubmissionError(formType: string, error?: string) {
    return ToastManager.error(
      `Failed to submit ${formType.toLowerCase()}`,
      {
        description: error || 'Please check your information and try again.',
        action: {
          label: 'Retry',
          onClick: () => window.location.reload()
        }
      }
    );
  }

  // Authentication toasts
  static signInSuccess(userName?: string) {
    return ToastManager.success(
      `Welcome back${userName ? `, ${userName}` : ''}!`,
      {
        description: 'You have been signed in successfully.'
      }
    );
  }

  static signInError(error?: string) {
    return ToastManager.error(
      'Sign in failed',
      {
        description: error || 'Please check your credentials and try again.'
      }
    );
  }

  static signUpSuccess() {
    return ToastManager.success(
      'Account created successfully!',
      {
        description: 'Please check your email to verify your account.'
      }
    );
  }

  static signUpError(error?: string) {
    return ToastManager.error(
      'Failed to create account',
      {
        description: error || 'Please check your information and try again.'
      }
    );
  }

  static signOutSuccess() {
    return ToastManager.info(
      'You have been signed out',
      {
        description: 'Thank you for using RemotCyberHelp!'
      }
    );
  }

  // Data operation toasts
  static saveSuccess(itemType: string) {
    return ToastManager.success(
      `${itemType} saved successfully!`,
      {
        description: 'Your changes have been saved.'
      }
    );
  }

  static saveError(itemType: string, error?: string) {
    return ToastManager.error(
      `Failed to save ${itemType.toLowerCase()}`,
      {
        description: error || 'Please try again.'
      }
    );
  }

  static deleteSuccess(itemType: string) {
    return ToastManager.success(
      `${itemType} deleted successfully!`,
      {
        description: 'The item has been permanently removed.'
      }
    );
  }

  static deleteError(itemType: string, error?: string) {
    return ToastManager.error(
      `Failed to delete ${itemType.toLowerCase()}`,
      {
        description: error || 'Please try again.'
      }
    );
  }

  // Network toasts
  static networkError() {
    return ToastManager.error(
      'Network error',
      {
        description: 'Please check your internet connection and try again.',
        action: {
          label: 'Retry',
          onClick: () => window.location.reload()
        }
      }
    );
  }

  static serverError() {
    return ToastManager.error(
      'Server error',
      {
        description: 'Our servers are experiencing issues. Please try again later.',
        action: {
          label: 'Contact Support',
          onClick: () => window.open('tel:+254708798850', '_self')
        }
      }
    );
  }

  // Permission toasts
  static permissionDenied() {
    return ToastManager.error(
      'Permission denied',
      {
        description: 'You do not have permission to perform this action.'
      }
    );
  }

  static loginRequired() {
    return ToastManager.warning(
      'Login required',
      {
        description: 'Please sign in to access this feature.',
        action: {
          label: 'Sign In',
          onClick: () => {
            // This would trigger the auth modal or redirect to login
            const event = new CustomEvent('open-auth-modal', { detail: { mode: 'signin' } });
            window.dispatchEvent(event);
          }
        }
      }
    );
  }

  // Emergency/Support toasts
  static emergencySubmitted() {
    return ToastManager.success(
      'Emergency request submitted!',
      {
        description: 'You will be contacted immediately. Our emergency line: +254708798850',
        duration: 8000,
        action: {
          label: 'Call Now',
          onClick: () => window.open('tel:+254708798850', '_self')
        }
      }
    );
  }

  static instantSupportSubmitted() {
    return ToastManager.success(
      'Instant support request submitted!',
      {
        description: 'We will contact you within 15 minutes.',
        duration: 6000
      }
    );
  }

  // Consultation toasts
  static consultationBooked(date: string, time: string) {
    return ToastManager.success(
      'Consultation booked successfully!',
      {
        description: `Scheduled for ${date} at ${time}. Confirmation email sent.`,
        duration: 6000
      }
    );
  }

  static consultationConflict() {
    return ToastManager.warning(
      'Time slot not available',
      {
        description: 'Please select a different time slot.',
        duration: 5000
      }
    );
  }

  // Blog interaction toasts
  static blogLiked() {
    return ToastManager.success(
      'Thanks for the feedback!',
      {
        description: 'Your like has been recorded.',
        duration: 2000
      }
    );
  }

  // Copy to clipboard toast
  static copiedToClipboard(content?: string) {
    return ToastManager.success(
      'Copied to clipboard!',
      {
        description: content ? `Copied: ${content}` : undefined,
        duration: 2000
      }
    );
  }

  // Working hours toasts
  static businessClosed(nextOpenTime?: string) {
    return ToastManager.info(
      'We are currently closed',
      {
        description: nextOpenTime
          ? `Next available: ${nextOpenTime}. Emergency support: +254708798850`
          : 'Emergency support available: +254708798850',
        duration: 6000,
        action: {
          label: 'Emergency Contact',
          onClick: () => window.open('tel:+254708798850', '_self')
        }
      }
    );
  }

  static businessOpen(closingTime?: string) {
    return ToastManager.success(
      'We are currently open!',
      {
        description: closingTime ? `Open until ${closingTime}` : 'Contact us for immediate assistance.',
        duration: 4000
      }
    );
  }
}

// Legacy showToast object for backwards compatibility
export const showToast = {
  // Basic toast methods
  success: (message: string, description?: string) => ToastManager.success(message, { description }),
  error: (message: string, description?: string) => ToastManager.error(message, { description }),
  warning: (message: string, description?: string) => ToastManager.warning(message, { description }),
  info: (message: string, description?: string) => ToastManager.info(message, { description }),

  // Form-specific methods
  formSubmitted: (formType: string) => AppToasts.formSubmissionSuccess(formType),
  formError: (formType: string, error?: string) => AppToasts.formSubmissionError(formType, error),
  validationError: (message: string) => ToastManager.error('Validation Error', { description: message }),

  // Emergency methods
  emergencySubmitted: () => AppToasts.emergencySubmitted(),
  instantSupportSubmitted: () => AppToasts.instantSupportSubmitted(),
  supportTicketCreated: () => ToastManager.success('Support ticket created!', { description: 'Your request has been submitted successfully.' }),

  // Auth methods
  signInSuccess: (userName?: string) => AppToasts.signInSuccess(userName),
  signInError: (error?: string) => AppToasts.signInError(error),
  signUpSuccess: () => AppToasts.signUpSuccess(),
  signUpError: (error?: string) => AppToasts.signUpError(error),
  signOutSuccess: () => AppToasts.signOutSuccess(),

  // Data operation methods
  saveSuccess: (itemType: string) => AppToasts.saveSuccess(itemType),
  saveError: (itemType: string, error?: string) => AppToasts.saveError(itemType, error),
  deleteSuccess: (itemType: string) => AppToasts.deleteSuccess(itemType),
  deleteError: (itemType: string, error?: string) => AppToasts.deleteError(itemType, error),

  // Network methods
  networkError: () => AppToasts.networkError(),
  serverError: () => AppToasts.serverError(),

  // Permission methods
  permissionDenied: () => AppToasts.permissionDenied(),
  loginRequired: () => AppToasts.loginRequired(),

  // Consultation methods
  consultationBooked: (date: string, time: string) => AppToasts.consultationBooked(date, time),
  consultationConflict: () => AppToasts.consultationConflict(),

  // Blog methods
  blogLiked: () => AppToasts.blogLiked(),

  // Copy methods
  copiedToClipboard: (content?: string) => AppToasts.copiedToClipboard(content),

  // Working hours methods
  businessClosed: (nextOpenTime?: string) => AppToasts.businessClosed(nextOpenTime),
  businessOpen: (closingTime?: string) => AppToasts.businessOpen(closingTime)
};

// Export the main ToastManager as default
export default ToastManager;
