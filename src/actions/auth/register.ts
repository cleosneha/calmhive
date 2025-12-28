"use server";

import { auth } from "@/lib/auth";
import { sendOTP } from "@/actions/auth/otp";
import { registerSchema } from "@/schemas/auth";
import db from "@/lib/db";
import { headers } from "next/headers";
import { apiResponse } from "@/utils/api-response";
import { apiError } from "@/utils/api-error";

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
    return apiError(firstIssue?.message || "Invalid input", "VALIDATION_ERROR");
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
        return apiError(
          "An account with this email already exists.",
          "USER_EXISTS"
        );
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
      return apiError(
        data.error?.message || "Registration failed. Please try again."
      );
    }

    // Send OTP for email verification
    const otpResult = await sendOTP(email);
    if ("error" in otpResult) {
      return apiError(otpResult.error || "Failed to send OTP");
    } else {
      return apiResponse(
        null,
        "Registration successful. Please verify your email."
      );
    }
  } catch (err) {
    const errorMessage =
      err instanceof Error
        ? err.message
        : "Registration failed. Please try again.";
    return apiError(errorMessage);
  }
}
