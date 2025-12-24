"use server";

import db from "@/lib/db";
import { sendOTPEmail } from "@/lib/email-service";
import { apiResponse } from "@/utils/api-response";
import { apiError } from "@/utils/api-error";

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
    return apiResponse({ otp });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("❌ Failed to create OTP:", message);
    return apiError("Failed to create OTP");
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

    if (otpResult.status === "error") {
      return apiError("Failed to generate OTP");
    }

    const emailResult = await sendOTPEmail(email, otpResult.data.otp!);

    if (!emailResult.success) {
      return apiError("Failed to send OTP email");
    }

    return apiResponse(null, "OTP sent successfully to your email");
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("❌ Failed to send OTP:", message);
    return apiError("Failed to send OTP");
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
      return apiError("User not found", "USER_NOT_FOUND");
    }

    // Check if OTP matches
    if (user.verificationCode !== otp) {
      return apiError("Invalid OTP", "INVALID_OTP");
    }

    // Check if OTP has expired
    if (
      user.verificationCodeExpiresAt &&
      new Date(user.verificationCodeExpiresAt).getTime() < new Date().getTime()
    ) {
      return apiError(
        "OTP has expired. Please request a new one.",
        "OTP_EXPIRED"
      );
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
    return apiResponse(
      {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      "Email verified successfully"
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("❌ Failed to verify OTP:", message);
    return apiError("Failed to verify OTP");
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
      return apiError("User not found", "USER_NOT_FOUND");
    }

    // If already verified, don't send OTP
    if (user.emailVerified) {
      return apiError("Email is already verified", "ALREADY_VERIFIED");
    }

    return await sendOTP(email);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("❌ Failed to resend OTP:", message);
    return apiError("Failed to resend OTP");
  }
}
