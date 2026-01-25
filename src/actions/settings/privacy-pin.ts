"use server";

import bcrypt from "bcrypt";
import db from "@/lib/db";
import { sendPrivacyPinOTPEmail } from "@/lib/email-service";
import { apiResponse } from "@/utils/api-response";
import { apiError } from "@/utils/api-error";
import { getCurrentUser } from "@/actions/auth";

/**
 * Generate a random 6-digit OTP
 */
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Send OTP for privacy PIN change
 */
export async function sendPrivacyPinOTP() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return apiError("Unauthorized", "UNAUTHORIZED");
    }

    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Update user with verification code for PIN change
    await db.user.update({
      where: { id: user.id },
      data: {
        verificationCode: otp,
        verificationCodeExpiresAt: expiresAt,
      },
    });

    const emailResult = await sendPrivacyPinOTPEmail(user.email, otp);
    if (!emailResult.success) {
      return apiError("Failed to send OTP email");
    }

    return apiResponse(null, "OTP sent successfully to your email");
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("❌ Failed to send privacy PIN OTP:", message);
    return apiError("Failed to send OTP");
  }
}

/**
 * Verify OTP for privacy PIN change
 */
export async function verifyPrivacyPinOTP(otp: string) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return apiError("Unauthorized", "UNAUTHORIZED");
    }

    const dbUser = await db.user.findUnique({
      where: { id: user.id },
      select: {
        verificationCode: true,
        verificationCodeExpiresAt: true,
      },
    });

    if (!dbUser) {
      return apiError("User not found", "USER_NOT_FOUND");
    }

    // Check if OTP matches
    if (dbUser.verificationCode !== otp) {
      return apiError("Invalid OTP", "INVALID_OTP");
    }

    // Check if OTP has expired
    if (
      dbUser.verificationCodeExpiresAt &&
      new Date(dbUser.verificationCodeExpiresAt).getTime() <
        new Date().getTime()
    ) {
      return apiError(
        "OTP has expired. Please request a new one.",
        "OTP_EXPIRED",
      );
    }

    // OTP verified, but don't clear yet - will clear after PIN is set
    return apiResponse(null, "OTP verified successfully");
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("❌ Failed to verify privacy PIN OTP:", message);
    return apiError("Failed to verify OTP");
  }
}

/**
 * Set new privacy PIN after OTP verification
 */
export async function setPrivacyPin(pin: string) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return apiError("Unauthorized", "UNAUTHORIZED");
    }

    // Validate PIN format (4-6 digits)
    if (!/^\d{4,6}$/.test(pin)) {
      return apiError("PIN must be 4-6 digits", "INVALID_PIN");
    }

    const dbUser = await db.user.findUnique({
      where: { id: user.id },
      select: {
        verificationCode: true,
        verificationCodeExpiresAt: true,
      },
    });

    if (!dbUser || !dbUser.verificationCode) {
      return apiError("OTP verification required", "OTP_NOT_VERIFIED");
    }

    // Check if OTP is still valid
    if (
      dbUser.verificationCodeExpiresAt &&
      new Date(dbUser.verificationCodeExpiresAt).getTime() <
        new Date().getTime()
    ) {
      return apiError("OTP has expired. Please start over.", "OTP_EXPIRED");
    }

    // Hash the PIN
    const hashedPin = await bcrypt.hash(pin, 12);

    // Update user with hashed PIN and clear verification code
    await db.user.update({
      where: { id: user.id },
      data: {
        encryptedPin: hashedPin,
        verificationCode: null,
        verificationCodeExpiresAt: null,
      },
    });

    return apiResponse(null, "Privacy PIN updated successfully");
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("❌ Failed to set privacy PIN:", message);
    return apiError("Failed to update privacy PIN");
  }
}
