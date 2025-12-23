"use server";

import db from "@/lib/db";
import { sendOTPEmail } from "@/lib/email-service";

/**
 * Generate a random 6-digit OTP
 */
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Create an OTP record in the database (stored in User.verificationCode)
 * @param email - User's email address
 * @returns OTP code
 */
export async function createOTP(email: string) {
  try {
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 60 * 1000); // 60 seconds

    // Update user with verification code
    await db.user.update({
      where: { email },
      data: {
        verificationCode: otp,
        verificationCodeExpiresAt: expiresAt,
      },
    });

    console.log(`✅ OTP created for ${email}: ${otp}`);
    return { success: true, otp };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("❌ Failed to create OTP:", message);
    return { success: false, error: "Failed to create OTP" };
  }
}

/**
 * Send OTP to user's email
 * @param email - User's email address
 * @returns Success status
 */
export async function sendOTP(email: string) {
  try {
    const otpResult = await createOTP(email);

    if (!otpResult.success) {
      return { success: false, error: "Failed to generate OTP" };
    }

    const emailResult = await sendOTPEmail(email, otpResult.otp!);

    if (!emailResult.success) {
      return { success: false, error: "Failed to send OTP email" };
    }

    return {
      success: true,
      message: "OTP sent successfully to your email",
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("❌ Failed to send OTP:", message);
    return { success: false, error: "Failed to send OTP" };
  }
}

/**
 * Verify OTP and mark user as verified
 * @param email - User's email address
 * @param otp - OTP code entered by user
 * @returns Success status
 */
export async function verifyOTP(email: string, otp: string) {
  try {
    // Find the user
    const user = await db.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        emailVerified: true,
        name: true,
        onboarded: true,
        createdAt: true,
        updatedAt: true,
        verificationCode: true,
        verificationCodeExpiresAt: true,
      },
    });

    if (!user) {
      return { success: false, error: "User not found" };
    }

    // Check if OTP matches
    if (user.verificationCode !== otp) {
      return { success: false, error: "Invalid OTP" };
    }

    // Check if OTP has expired
    if (
      user.verificationCodeExpiresAt &&
      new Date(user.verificationCodeExpiresAt).getTime() < new Date().getTime()
    ) {
      return {
        success: false,
        error: "OTP has expired. Please request a new one.",
      };
    }

    // Mark user as verified and clear verification code
    await db.user.update({
      where: { email },
      data: {
        emailVerified: true,
        verificationCode: null,
        verificationCodeExpiresAt: null,
      },
    });

    console.log(`✅ Email verified for ${email}`);
    return {
      success: true,
      message: "Email verified successfully",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("❌ Failed to verify OTP:", message);
    return { success: false, error: "Failed to verify OTP" };
  }
}

/**
 * Resend OTP to user's email
 * @param email - User's email address
 * @returns Success status
 */
export async function resendOTP(email: string) {
  try {
    // Check if user exists
    const user = await db.user.findUnique({
      where: { email },
    });

    if (!user) {
      return { success: false, error: "User not found" };
    }

    // If already verified, don't send OTP
    if (user.emailVerified) {
      return {
        success: false,
        error: "Email is already verified",
      };
    }

    return await sendOTP(email);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("❌ Failed to resend OTP:", message);
    return { success: false, error: "Failed to resend OTP" };
  }
}
