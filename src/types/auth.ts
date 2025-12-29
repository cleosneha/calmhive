/**
 * Authentication-related types for CalmHive
 */

/**
 * Better Auth session type
 */
export interface BetterAuthSession {
  session: {
    id: string;
    userId: string;
    expiresAt: Date;
    createdAt: Date;
    updatedAt: Date;
    token: string;
    ipAddress?: string;
    userAgent?: string;
  };
  user: {
    id: string;
    email: string;
    name: string;
    emailVerified: boolean;
    image?: string;
    createdAt: Date;
    updatedAt: Date;
    onboarded?: boolean;
  };
}

/**
 * Session callback parameters
 */
export interface SessionCallbackParams {
  session: BetterAuthSession["session"];
  user: BetterAuthSession["user"];
}

/**
 * Auth layout props
 */
export interface AuthLayoutProps {
  children: React.ReactNode;
}

/**
 * Auth left section props
 */
export interface AuthLeftSectionProps {
  type: "register" | "login" | "verify";
}

/**
 * Login form values
 */
export interface LoginFormValues {
  email: string;
  password: string;
}

/**
 * Register form values
 */
export interface RegisterFormValues {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

/**
 * OTP verification form values
 */
export interface OTPVerificationFormValues {
  code: string;
}

/**
 * Auth action response
 */
export interface AuthActionResponse {
  success: boolean;
  error?: string;
  message?: string;
  data?: Record<string, unknown>;
}
