"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import db from "@/lib/db";
import { apiError } from "@/utils/api-error";
import { apiResponse } from "@/utils/api-response";

/**
 * Sign in user with email and password
 * Uses Better Auth's email/password authentication
 */
export async function login({
  email,
  password,
}: {
  email: string;
  password: string;
}) {
  try {
    const headersList = await headers();

    // Call Better Auth's signInEmail endpoint
    const response = await auth.api.signInEmail({
      body: {
        email,
        password,
      },
      asResponse: true,
      headers: headersList,
    });

    // Check if the response contains cookies (successful auth)
    if (response.ok) {
      // Return success response
      return apiResponse(null, "Login successful");
    }

    // Handle authentication errors
    const data = await response.json();
    const errorMessage = data.error?.message || "";
    const errorCode = data.error?.code || "";

    // Check if this is an invalid email/password error - could mean OAuth account
    if (
      errorCode === "INVALID_EMAIL_OR_PASSWORD" ||
      errorMessage.includes("Invalid email or password") ||
      errorMessage.includes("Credential account not found")
    ) {
      // Check if user exists with OAuth provider
      const user = await db.user.findUnique({
        where: { email },
        include: {
          accounts: {
            select: {
              providerId: true,
            },
          },
        },
      });

      if (user && user.accounts.length > 0) {
        // Check if user has only OAuth accounts (no credential/password account)
        const hasCredentialAccount = user.accounts.some(
          (acc) => acc.providerId === "credential"
        );

        if (!hasCredentialAccount) {
          const providers = user.accounts
            .filter((acc) => acc.providerId !== "credential")
            .map((acc) => acc.providerId);

          const providerNames = providers
            .map((p) => {
              if (p === "google") return "Google";
              if (p === "github") return "GitHub";
              return p.charAt(0).toUpperCase() + p.slice(1);
            })
            .join(" or ");

          return apiError(
            `This account is registered with ${providerNames}. Please sign in with ${providerNames} instead.`,
            "OAUTH_ACCOUNT"
          );
        }
      }
    }

    return apiError(errorMessage || "Invalid email or password.");
  } catch (err) {
    // Check if it's a redirect error (from redirect() call)
    if (err instanceof Error && err.message.includes("NEXT_REDIRECT")) {
      throw err;
    }

    return apiError(
      err instanceof Error ? err.message : "Login failed. Please try again."
    );
  }
}
