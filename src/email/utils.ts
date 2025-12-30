/**
 * Email utility functions for CalmHive
 */

export interface EmailResult {
  success: boolean;
  error?: string;
}

export function logEmailSuccess(email: string, type: string): void {
  console.log(`✅ ${type} email sent successfully to: ${email}`);
}

export function logEmailError(error: unknown, type: string): void {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`❌ Failed to send ${type} email:`, message);
}

export function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
