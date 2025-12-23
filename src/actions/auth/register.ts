"use server";

import { auth } from "@/lib/auth";
import { sendOTP } from "@/actions/auth/otp";
import { registerSchema } from "@/schemas/auth";
import db from "@/lib/db";
import { headers } from "next/headers";

export async function registerUser({
  name,
  email,
  password,
  confirmPassword,
}: {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}) {
  // Zod validation (server-side)
  const result = registerSchema.safeParse({
    name,
    email,
    password,
    confirmPassword,
  });
  if (!result.success) {
    const firstIssue = result.error.issues[0];
    return { success: false, error: firstIssue?.message || "Invalid input" };
  }

  try {
    // Check for existing user
    const existingUser = await db.user.findUnique({ where: { email } });
    if (existingUser) {
      if (!existingUser.emailVerified) {
        // Delete unverified user to allow re-registration
        await db.user.delete({ where: { email } });
      } else {
        // User already exists and is verified
        return {
          success: false,
          error: "An account with this email already exists.",
        };
      }
    }

    const headersList = await headers();

    // Use Better Auth's server API to sign up with email and password
    const response = await auth.api.signUpEmail({
      body: {
        name,
        email,
        password,
      },
      asResponse: true,
      headers: headersList,
    });

    if (!response.ok) {
      const data = await response.json();
      return {
        success: false,
        error: data.error?.message || "Registration failed. Please try again.",
      };
    }

    // Send OTP for email verification
    const otpResult = await sendOTP(email);
    if (otpResult.success) {
      return { success: true };
    } else {
      return { success: false, error: otpResult.error || "Failed to send OTP" };
    }
  } catch (err) {
    const errorMessage =
      err instanceof Error
        ? err.message
        : "Registration failed. Please try again.";
    return {
      success: false,
      error: errorMessage,
    };
  }
}
