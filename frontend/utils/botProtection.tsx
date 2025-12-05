// Bot protection utilities for forms
export class BotProtection {
  private static readonly HONEYPOT_FIELD_NAME = 'website_url'; // Common spam bot target
  private static readonly MIN_FORM_TIME = 3000; // Minimum 3 seconds to fill form
  private static readonly MAX_FORM_TIME = 1800000; // Maximum 30 minutes for form

  // Generate bot protection data for forms
  static generateProtectionData(): {
    honeypot: string;
    timestamp: number;
    verification: string;
  } {
    const timestamp = Date.now();
    const verification = this.generateVerificationToken(timestamp);

    return {
      honeypot: '', // Should remain empty for legitimate users
      timestamp,
      verification
    };
  }

  // Generate verification token based on timestamp
  private static generateVerificationToken(timestamp: number): string {
    // Simple hash based on timestamp and a secret pattern
    const secret = 'RemotCyberHelp2024'; // In production, use environment variable
    const combined = `${timestamp}${secret}`;

    // Simple hash function (in production, use a proper crypto library)
    let hash = 0;
    for (let i = 0; i < combined.length; i++) {
      const char = combined.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }

    return Math.abs(hash).toString(16);
  }

  // Validate bot protection data
  static validateProtectionData(data: {
    honeypot: string;
    timestamp: number;
    verification: string;
  }): {
    isValid: boolean;
    reason?: string;
  } {
    // Check honeypot field (should be empty)
    if (data.honeypot && data.honeypot.trim() !== '') {
      return {
        isValid: false,
        reason: 'Honeypot field filled - likely bot'
      };
    }

    // Check timestamp validity
    const now = Date.now();
    const formTime = now - data.timestamp;

    if (formTime < this.MIN_FORM_TIME) {
      return {
        isValid: false,
        reason: 'Form submitted too quickly - likely bot'
      };
    }

    if (formTime > this.MAX_FORM_TIME) {
      return {
        isValid: false,
        reason: 'Form session expired'
      };
    }

    // Verify token
    const expectedToken = this.generateVerificationToken(data.timestamp);
    if (data.verification !== expectedToken) {
      return {
        isValid: false,
        reason: 'Invalid verification token'
      };
    }

    return { isValid: true };
  }

  // Rate limiting check (simple in-memory implementation)
  private static submissionCounts = new Map<string, { count: number; firstSubmission: number }>();
  private static readonly MAX_SUBMISSIONS_PER_HOUR = 5;
  private static readonly RATE_LIMIT_WINDOW = 3600000; // 1 hour in milliseconds

  static checkRateLimit(identifier: string): {
    isAllowed: boolean;
    reason?: string;
    remainingAttempts?: number;
    resetTime?: number;
  } {
    const now = Date.now();
    const existing = this.submissionCounts.get(identifier);

    if (!existing) {
      // First submission
      this.submissionCounts.set(identifier, {
        count: 1,
        firstSubmission: now
      });
      return {
        isAllowed: true,
        remainingAttempts: this.MAX_SUBMISSIONS_PER_HOUR - 1
      };
    }

    // Check if window has expired
    if (now - existing.firstSubmission > this.RATE_LIMIT_WINDOW) {
      // Reset counter
      this.submissionCounts.set(identifier, {
        count: 1,
        firstSubmission: now
      });
      return {
        isAllowed: true,
        remainingAttempts: this.MAX_SUBMISSIONS_PER_HOUR - 1
      };
    }

    // Check if limit exceeded
    if (existing.count >= this.MAX_SUBMISSIONS_PER_HOUR) {
      const resetTime = existing.firstSubmission + this.RATE_LIMIT_WINDOW;
      return {
        isAllowed: false,
        reason: 'Rate limit exceeded',
        remainingAttempts: 0,
        resetTime
      };
    }

    // Increment counter
    existing.count++;
    return {
      isAllowed: true,
      remainingAttempts: this.MAX_SUBMISSIONS_PER_HOUR - existing.count
    };
  }

  // Clean up old entries (should be called periodically)
  static cleanupRateLimitData(): void {
    const now = Date.now();
    for (const [identifier, data] of this.submissionCounts.entries()) {
      if (now - data.firstSubmission > this.RATE_LIMIT_WINDOW) {
        this.submissionCounts.delete(identifier);
      }
    }
  }

  // Generate client fingerprint for rate limiting
  static generateClientFingerprint(): string {
    // Combine various browser characteristics
    const characteristics = [
      navigator.userAgent,
      navigator.language,
      screen.width,
      screen.height,
      new Date().getTimezoneOffset(),
      navigator.platform
    ];

    const combined = characteristics.join('|');

    // Simple hash
    let hash = 0;
    for (let i = 0; i < combined.length; i++) {
      const char = combined.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }

    return Math.abs(hash).toString(16);
  }

  // Validate user behavior patterns
  static validateUserBehavior(behaviorData: {
    mouseMovements?: number;
    keystrokes?: number;
    focusEvents?: number;
    scrollEvents?: number;
    timeOnPage?: number;
  }): {
    isHumanLike: boolean;
    score: number;
    reasons: string[];
  } {
    let score = 0;
    const reasons: string[] = [];
    const maxScore = 100;

    // Mouse movements (humans typically move mouse)
    if (behaviorData.mouseMovements !== undefined) {
      if (behaviorData.mouseMovements > 10) {
        score += 25;
      } else if (behaviorData.mouseMovements === 0) {
        reasons.push('No mouse movements detected');
      }
    }

    // Keystroke patterns (humans have varied typing speeds)
    if (behaviorData.keystrokes !== undefined) {
      if (behaviorData.keystrokes > 5) {
        score += 20;
      }
    }

    // Focus events (humans typically focus/unfocus fields)
    if (behaviorData.focusEvents !== undefined) {
      if (behaviorData.focusEvents > 2) {
        score += 15;
      }
    }

    // Scroll events (humans often scroll)
    if (behaviorData.scrollEvents !== undefined) {
      if (behaviorData.scrollEvents > 0) {
        score += 15;
      }
    }

    // Time on page (humans take time to read and fill forms)
    if (behaviorData.timeOnPage !== undefined) {
      if (behaviorData.timeOnPage > 10000) { // More than 10 seconds
        score += 25;
      } else if (behaviorData.timeOnPage < 3000) { // Less than 3 seconds
        reasons.push('Extremely short time on page');
      }
    }

    const isHumanLike = score >= 40; // Threshold for human-like behavior

    return {
      isHumanLike,
      score: Math.min(score, maxScore),
      reasons
    };
  }

  // Challenge-response system (simple math captcha)
  static generateMathChallenge(): {
    question: string;
    answer: number;
    challengeId: string;
  } {
    // Generate random numbers with better distribution
    const operations = ['+', '-', '*'];
    const operation = operations[Math.floor(Math.random() * operations.length)];

    let question: string;
    let answer: number;

    try {
      switch (operation) {
        case '+':
          const num1 = Math.floor(Math.random() * 15) + 1; // 1-15
          const num2 = Math.floor(Math.random() * 15) + 1; // 1-15
          question = `${num1} + ${num2}`;
          answer = num1 + num2;
          break;
        case '-':
          // Ensure positive result and reasonable numbers
          const larger = Math.floor(Math.random() * 20) + 10; // 10-29
          const smaller = Math.floor(Math.random() * Math.min(larger, 10)) + 1; // 1-10 or 1-larger
          question = `${larger} - ${smaller}`;
          answer = larger - smaller;
          break;
        case '*':
          // Use smaller numbers for multiplication to keep answers reasonable
          const smallNum1 = Math.floor(Math.random() * 8) + 2; // 2-9
          const smallNum2 = Math.floor(Math.random() * 8) + 2; // 2-9
          question = `${smallNum1} × ${smallNum2}`;
          answer = smallNum1 * smallNum2;
          break;
        default:
          // Fallback to simple addition
          const fallback1 = Math.floor(Math.random() * 10) + 1;
          const fallback2 = Math.floor(Math.random() * 10) + 1;
          question = `${fallback1} + ${fallback2}`;
          answer = fallback1 + fallback2;
      }

      // Generate challenge ID with better randomness
      const challengeId = Math.random().toString(36).substring(2, 15) + Date.now().toString(36);

      // Validate that answer is a finite number
      if (!isFinite(answer) || isNaN(answer)) {
        throw new Error('Invalid answer generated');
      }

      // Store the answer
      this.storeChallengeAnswer(challengeId, answer);

      return {
        question,
        answer,
        challengeId
      };
    } catch (error) {
      console.error('Error generating math challenge:', error);
      // Fallback to simple addition if anything goes wrong
      const fallback1 = Math.floor(Math.random() * 10) + 1;
      const fallback2 = Math.floor(Math.random() * 10) + 1;
      const fallbackId = Math.random().toString(36).substring(2, 15);
      const fallbackAnswer = fallback1 + fallback2;

      this.storeChallengeAnswer(fallbackId, fallbackAnswer);

      return {
        question: `${fallback1} + ${fallback2}`,
        answer: fallbackAnswer,
        challengeId: fallbackId
      };
    }
  }

  // Store challenge answers (simple in-memory storage)
  private static challengeAnswers = new Map<string, { answer: number; timestamp: number }>();
  private static readonly CHALLENGE_EXPIRY = 300000; // 5 minutes

  private static storeChallengeAnswer(challengeId: string, answer: number): void {
    this.challengeAnswers.set(challengeId, {
      answer,
      timestamp: Date.now()
    });
  }

  static validateChallengeAnswer(challengeId: string, userAnswer: number): {
    isValid: boolean;
    reason?: string;
  } {
    try {
      // Input validation
      if (!challengeId || typeof challengeId !== 'string') {
        return {
          isValid: false,
          reason: 'Invalid challenge ID'
        };
      }

      if (typeof userAnswer !== 'number' || !isFinite(userAnswer) || isNaN(userAnswer)) {
        return {
          isValid: false,
          reason: 'Invalid answer format'
        };
      }

      const stored = this.challengeAnswers.get(challengeId);

      if (!stored) {
        return {
          isValid: false,
          reason: 'Challenge not found or expired'
        };
      }

      // Check expiry
      if (Date.now() - stored.timestamp > this.CHALLENGE_EXPIRY) {
        this.challengeAnswers.delete(challengeId);
        return {
          isValid: false,
          reason: 'Challenge expired'
        };
      }

      // Validate answer - ensure both are numbers and equal
      const storedAnswer = Number(stored.answer);
      const providedAnswer = Number(userAnswer);

      // Additional validation for the stored answer
      if (!isFinite(storedAnswer) || isNaN(storedAnswer)) {
        console.error('Invalid stored answer detected:', stored.answer);
        this.challengeAnswers.delete(challengeId);
        return {
          isValid: false,
          reason: 'Challenge corrupted'
        };
      }

      if (storedAnswer !== providedAnswer) {
        return {
          isValid: false,
          reason: 'Incorrect answer'
        };
      }

      // Clean up used challenge
      this.challengeAnswers.delete(challengeId);

      return { isValid: true };
    } catch (error) {
      console.error('Error validating challenge answer:', error);
      return {
        isValid: false,
        reason: 'Validation error occurred'
      };
    }
  }

  // Clean up expired challenges
  static cleanupExpiredChallenges(): void {
    const now = Date.now();
    for (const [challengeId, data] of this.challengeAnswers.entries()) {
      if (now - data.timestamp > this.CHALLENGE_EXPIRY) {
        this.challengeAnswers.delete(challengeId);
      }
    }
  }

  // Initialize periodic cleanup
  static initializeCleanup(): void {
    // Clean up every 5 minutes
    setInterval(() => {
      this.cleanupRateLimitData();
      this.cleanupExpiredChallenges();
    }, 300000);
  }
}

// User behavior tracking class
export class BehaviorTracker {
  private mouseMovements = 0;
  private keystrokes = 0;
  private focusEvents = 0;
  private scrollEvents = 0;
  private startTime = Date.now();
  private listeners: (() => void)[] = [];

  constructor() {
    this.startTracking();
  }

  private startTracking(): void {
    // Track mouse movements
    const mouseMoveHandler = () => {
      this.mouseMovements++;
    };
    document.addEventListener('mousemove', mouseMoveHandler);
    this.listeners.push(() => document.removeEventListener('mousemove', mouseMoveHandler));

    // Track keystrokes
    const keystrokeHandler = () => {
      this.keystrokes++;
    };
    document.addEventListener('keydown', keystrokeHandler);
    this.listeners.push(() => document.removeEventListener('keydown', keystrokeHandler));

    // Track focus events
    const focusHandler = () => {
      this.focusEvents++;
    };
    document.addEventListener('focus', focusHandler, true);
    this.listeners.push(() => document.removeEventListener('focus', focusHandler, true));

    // Track scroll events
    const scrollHandler = () => {
      this.scrollEvents++;
    };
    document.addEventListener('scroll', scrollHandler);
    this.listeners.push(() => document.removeEventListener('scroll', scrollHandler));
  }

  getBehaviorData() {
    return {
      mouseMovements: this.mouseMovements,
      keystrokes: this.keystrokes,
      focusEvents: this.focusEvents,
      scrollEvents: this.scrollEvents,
      timeOnPage: Date.now() - this.startTime
    };
  }

  cleanup(): void {
    this.listeners.forEach(removeListener => removeListener());
    this.listeners = [];
  }
}

// Helper function to create bot protected form
export function createBotProtectedForm(formData?: any) {
  const protectionData = BotProtection.generateProtectionData();
  const mathChallenge = BotProtection.generateMathChallenge();

  // If formData is provided, merge it with protection data
  if (formData) {
    return {
      ...formData,
      _honeypot_field: '',
      timestamp: protectionData.timestamp,
      verification: protectionData.verification
    };
  }

  // Otherwise return just the protection data (legacy behavior)
  return {
    timestamp: protectionData.timestamp,
    verification: protectionData.verification,
    mathChallenge,
    validate: (data: {
      honeypot: string;
      mathAnswer: string | number;
      timestamp: number;
    }) => {
      // Validate bot protection
      const protectionResult = BotProtection.validateProtectionData({
        honeypot: data.honeypot,
        timestamp: data.timestamp,
        verification: protectionData.verification
      });

      if (!protectionResult.isValid) {
        return protectionResult;
      }

      // Validate math challenge
      const mathAnswer = typeof data.mathAnswer === 'string' ? parseInt(data.mathAnswer, 10) : Number(data.mathAnswer);

      if (isNaN(mathAnswer)) {
        return {
          isValid: false,
          reason: 'Invalid math answer format'
        };
      }

      const mathResult = BotProtection.validateChallengeAnswer(
        mathChallenge.challengeId,
        mathAnswer
      );

      return mathResult;
    }
  };
}

// Honeypot field component for React
export function HoneypotField() {
  return (
    <div style={{ position: 'absolute', left: '-9999px', visibility: 'hidden' }}>
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
      />
    </div>
  );
}

// Rate limiting check function
export function checkRateLimit(
  identifier: string,
  maxRequests: number = 5,
  windowMs: number = 3600000
): boolean {
  const clientFingerprint = BotProtection.generateClientFingerprint();
  const key = `${identifier}_${clientFingerprint}`;

  const result = BotProtection.checkRateLimit(key);

  if (!result.isAllowed) {
    // Show a simple alert instead of using toast to avoid circular dependency
    if (typeof window !== 'undefined') {
      const resetTime = result.resetTime ? new Date(result.resetTime).toLocaleTimeString() : 'later';
      console.warn(`Rate limit exceeded. Please try again at ${resetTime}.`);
    }
    return false;
  }

  return true;
}

// Behavior validation function
export function validateUserBehavior() {
  const tracker = new BehaviorTracker();

  // Return a function to get validation results
  return () => {
    const behaviorData = tracker.getBehaviorData();
    const validation = BotProtection.validateUserBehavior(behaviorData);
    tracker.cleanup();
    return validation;
  };
}

// Export challenge generation for manual use
export function generateMathChallenge() {
  return BotProtection.generateMathChallenge();
}

// Export validation functions
export function validateChallengeAnswer(challengeId: string, answer: number) {
  return BotProtection.validateChallengeAnswer(challengeId, answer);
}

export function validateProtectionData(data: {
  honeypot: string;
  timestamp: number;
  verification: string;
}) {
  return BotProtection.validateProtectionData(data);
}

// BehaviorTracker is already exported above as a class

// Initialize cleanup when module loads (if in browser environment)
if (typeof window !== 'undefined') {
  BotProtection.initializeCleanup();
}

export default BotProtection;
