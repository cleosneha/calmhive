/**
 * Email utility functions for logging and tracking email operations
 */

export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Log successful email send
 */
export function logEmailSuccess(
  to: string,
  subject: string,
  messageId?: string
) {
  console.log(`✅ Email sent successfully`, {
    to,
    subject,
    messageId,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Log email send error
 */
export function logEmailError(to: string, subject: string, error: unknown) {
  console.error(`❌ Failed to send email`, {
    to,
    subject,
    error: error instanceof Error ? error.message : String(error),
    timestamp: new Date().toISOString(),
  });
}
