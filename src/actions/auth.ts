"use server";

import { auth } from "@/lib/auth";
import db from "@/lib/db";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { apiResponse } from "@/utils/api-response";
import { apiError, getErrorMessage } from "@/utils/api-error";

/**
 * Get the current authenticated user session
 * @returns User session or null if not authenticated
 */
export async function getSession() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return session;
}

/**
 * Get the current user from session
 */
export async function getCurrentUser() {
  const session = await getSession();

  if (!session?.user) {
    return null;
  }

  return session.user;
}

/**
 * Delete user account and all associated data
 * Deletes user from DB, sessions, and vector embeddings from Pinecone/Qdrant
 */
export async function deleteUserAccount() {
  try {
    const session = await getSession();
    if (!session?.user) {
      return apiError("Unauthorized");
    }

    const userId = session.user.id;

    // Delete plan embeddings from vector store
    try {
      const { deletePlanEmbedding } = await import(
        "@/actions/plan/process-embedding"
      );
      const deleteResult = await deletePlanEmbedding(userId);
      if (!deleteResult.success) {
        console.warn(
          "⚠️ Failed to delete plan embeddings:",
          deleteResult.error
        );
      }
    } catch (error) {
      console.warn("⚠️ Error deleting plan embeddings:", error);
      // Continue with deletion even if embedding cleanup fails
    }

    // Sign out the user first (before deleting from database)
    const headersList = await headers();
    try {
      await auth.api.signOut({
        headers: headersList,
      });
    } catch (error) {
      // Ignore sign out errors, we'll delete the user anyway
      console.warn("Error during sign out (continuing with deletion):", error);
    }

    // Delete all user data from database (cascades to related tables)
    await db.user.delete({
      where: { id: userId },
    });

    return apiResponse({ success: true }, "Account deleted successfully");
  } catch (error) {
    console.error("Error deleting user account:", error);
    return apiError(getErrorMessage(error));
  }
}

/**
 * Get authentication state - single source of truth
 * This function is called once per layout to get all auth info
 */
export async function getAuthState() {
  const session = await getSession();
  const user = session?.user;

  return {
    user,
    session,
    isLoggedIn: !!user,
    isVerified: user?.emailVerified ?? false,
    isOnboarded: user?.onboarded ?? false,
  };
}

/**
 * Require authentication - redirects to login if not authenticated
 * Use this in pages/layouts that require a logged-in user
 */
export async function requireAuth() {
  const { session, user } = await getAuthState();

  if (!user) {
    redirect("/login");
  }

  return { session, user };
}

/**
 * Require verified email - redirects to verify-email if not verified
 * Use this in pages/layouts that require email verification
 */
export async function requireVerifiedEmail() {
  const { user, isVerified } = await getAuthState();

  if (!user) {
    redirect("/login");
  }

  if (!isVerified) {
    redirect("/verify-email");
  }

  return user;
}

/**
 * Require completed onboarding - redirects to onboarding if not completed
 * Use this in protected pages/layouts that require full onboarding
 */
export async function requireOnboarding() {
  const { user, isVerified, isOnboarded } = await getAuthState();

  if (!user) {
    redirect("/login");
  }

  if (!isVerified) {
    redirect("/verify-email");
  }

  if (!isOnboarded) {
    redirect("/onboarding");
  }

  return user;
}

/**
 * Redirect if authenticated - for login/register pages
 * Redirects authenticated users away from auth pages to appropriate destination
 */
export async function redirectIfAuthenticated() {
  const { isLoggedIn, isVerified, isOnboarded } = await getAuthState();

  if (!isLoggedIn) {
    return; // Not logged in, stay on page
  }

  if (!isVerified) {
    redirect("/verify-email");
  }

  if (!isOnboarded) {
    redirect("/onboarding");
  }

  // Fully authenticated and onboarded
  redirect("/user");
}

/**
 * Redirect if onboarded - for onboarding pages
 * Redirects users who have completed onboarding to dashboard
 */
export async function redirectIfOnboarded() {
  const { user, isOnboarded } = await getAuthState();

  if (!user) {
    redirect("/login");
  }

  if (isOnboarded) {
    redirect("/user");
  }

  return user;
}

/**
 * Check if onboarding is complete
 * Returns boolean without redirecting
 */
export async function isOnboardingComplete() {
  const { isOnboarded } = await getAuthState();
  return isOnboarded;
}
