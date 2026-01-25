import transporter from "@/email/service";
import {
  generateOTPEmailHTML,
  generateOTPEmailText,
} from "@/email/templates/otp-email";
import {
  generatePrivacyPinOTPEmailHTML,
  generatePrivacyPinOTPEmailText,
} from "@/email/templates/privacy-pin-otp-email";
import {
  logEmailSuccess,
  logEmailError,
  type EmailResult,
} from "@/email/utils";

/**
 * Send OTP email to user for email verification
 * @param email - User's email address
 * @param otp - 6-digit OTP code
 * @returns Promise with success status
 */
export async function sendOTPEmail(
  email: string,
  otp: string,
): Promise<EmailResult> {
  try {
    await transporter.sendMail({
      from: `"CalmHive" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: "Verify your CalmHive account - OTP",
      html: generateOTPEmailHTML(otp),
      text: generateOTPEmailText(otp),
    });

    logEmailSuccess(email, "OTP");
    return { success: true };
  } catch (error) {
    logEmailError(email, "OTP", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Send OTP email to user for privacy PIN change
 * @param email - User's email address
 * @param otp - 6-digit OTP code
 * @returns Promise with success status
 */
export async function sendPrivacyPinOTPEmail(
  email: string,
  otp: string,
): Promise<EmailResult> {
  try {
    await transporter.sendMail({
      from: `"CalmHive" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: "CalmHive - Privacy PIN Change Verification",
      html: generatePrivacyPinOTPEmailHTML(otp),
      text: generatePrivacyPinOTPEmailText(otp),
    });

    logEmailSuccess(email, "Privacy PIN OTP");
    return { success: true };
  } catch (error) {
    logEmailError(email, "Privacy PIN OTP", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
