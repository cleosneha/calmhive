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
  const headersList = await headers();
  const session = await auth.api.getSession({
    headers: headersList,
  });

  return session;
}

/**
 * Sign out the current user
 */
export async function signOutAction() {
  const headersList = await headers();
  await auth.api.signOut({
    headers: headersList,
  });

  redirect("/login");
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
 * Check if user is authenticated
 */
export async function isAuthenticated() {
  const session = await getSession();
  return !!session?.user;
}

/**
 * Get user by ID from database
 */
export async function getUserById(userId: string) {
  try {
    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        onboarded: true,
        emailVerified: true,
        createdAt: true,
      },
    });

    return user;
  } catch (error) {
    console.error("Error fetching user:", error);
    return null;
  }
}

/**
 * Update user profile
 */
export async function updateUserProfile(
  userId: string,
  data: { name?: string }
) {
  try {
    const user = await db.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        email: true,
        name: true,
      },
    });

    return apiResponse(user, "Profile updated successfully");
  } catch (error) {
    console.error("Error updating user:", error);
    return apiError("Failed to update user profile");
  }
}

/**
 * Mark user as onboarded
 * After onboarding is complete, this updates the user record
 * The session will automatically refresh with the new onboarded status
 * due to the callback in src/lib/auth.ts
 */
export async function completeOnboarding(userId: string) {
  try {
    const user = await db.user.update({
      where: { id: userId },
      data: { onboarded: true },
      select: {
        id: true,
        email: true,
        name: true,
        onboarded: true,
      },
    });

    return apiResponse(user, "Onboarding completed successfully");
  } catch (error) {
    console.error("Error completing onboarding:", error);
    return apiError("Failed to complete onboarding");
  }
}
