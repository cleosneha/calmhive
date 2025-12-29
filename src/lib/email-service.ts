import nodemailer from "nodemailer";

/**
 * Email service configuration for sending OTP and verification emails
 * Uses Gmail SMTP with app-specific password for security
 */

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

/**
 * Send OTP email to user
 * @param email - User's email address
 * @param otp - 6-digit OTP code
 * @returns Promise with success status
 */
export async function sendOTPEmail(email: string, otp: string) {
  try {
    const result = await transporter.sendMail({
      from: `"CalmHive" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: "Verify your CalmHive account - OTP",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #1e293b; padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="color: #fff; margin: 0; font-size: 28px;">CalmHive</h1>
            <p style="color: #cbd5e1; margin: 8px 0 0 0;">Verify Your Account</p>
          </div>
          
          <div style="padding: 40px 20px; background-color: #f8fafc; border-radius: 0 0 8px 8px;">
            <p style="color: #475569; font-size: 16px; margin: 0 0 24px 0;">
              Welcome to CalmHive! To complete your registration, please verify your email address using the OTP below.
            </p>
            
            <div style="text-align: center; margin: 32px 0;">
              <p style="font-size: 14px; color: #64748b; margin: 0 0 16px 0;">Your One-Time Password (OTP):</p>
              <div style="background-color: #fff; border: 2px solid #e2e8f0; border-radius: 8px; padding: 16px; font-size: 32px; font-weight: bold; letter-spacing: 4px; color: #1e293b; font-family: 'Courier New', monospace;">
                ${otp}
              </div>
            </div>
            
            <p style="color: #64748b; font-size: 14px; margin: 24px 0;">
              This OTP will expire in 10 minutes.
            </p>
            
            <p style="color: #64748b; font-size: 14px; margin: 24px 0;">
              If you didn't create this account, please ignore this email.
            </p>
            
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 32px 0;">
            
            <p style="color: #94a3b8; font-size: 12px; margin: 0; text-align: center;">
              © 2025 CalmHive. All rights reserved.<br>
              <a href="${
                process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
              }" style="color: #0284c7; text-decoration: none;">Visit CalmHive</a>
            </p>
          </div>
        </div>
      `,
      text: `Your CalmHive OTP: ${otp}\n\nThis OTP will expire in 10 minutes.\n\nIf you didn't create this account, please ignore this email.`,
    });

    console.log("✅ OTP email sent successfully to:", email);
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("❌ Failed to send OTP email:", message);
    return { success: false, error: message };
  }
}
