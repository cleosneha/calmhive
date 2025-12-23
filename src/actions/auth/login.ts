"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import db from "@/lib/db";

interface LoginResult {
  success: boolean;
  error?: string;
  provider?: string;
}

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
}): Promise<LoginResult> {
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
      // Redirect to dashboard on successful login
      redirect("/user/");
    }

    // Handle authentication errors
    const data = await response.json();
    console.log(data);
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

      console.log("User found:", user);
      console.log("User accounts:", user?.accounts);

      if (user && user.accounts.length > 0) {
        // Check if user has only OAuth accounts (no credential/password account)
        const hasCredentialAccount = user.accounts.some(
          (acc) => acc.providerId === "credential"
        );

        console.log("Has credential account:", hasCredentialAccount);

        if (!hasCredentialAccount) {
          const providers = user.accounts
            .filter((acc) => acc.providerId !== "credential")
            .map((acc) => acc.providerId);

          console.log("OAuth providers found:", providers);

          const providerNames = providers
            .map((p) => {
              if (p === "google") return "Google";
              if (p === "github") return "GitHub";
              return p.charAt(0).toUpperCase() + p.slice(1);
            })
            .join(" or ");

          return {
            success: false,
            error: `This account is registered with ${providerNames}. Please sign in with ${providerNames} instead.`,
            provider: providers[0],
          };
        }
      }
    }

    return {
      success: false,
      error: errorMessage || "Invalid email or password.",
    };
  } catch (err) {
    // Check if it's a redirect error (from redirect() call)
    if (err instanceof Error && err.message.includes("NEXT_REDIRECT")) {
      throw err;
    }

    return {
      success: false,
      error:
        err instanceof Error ? err.message : "Login failed. Please try again.",
    };
  }
}
