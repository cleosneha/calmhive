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

    // Delete vector embeddings from Pinecone
    try {
      const pineconeApiKey = process.env.PINECONE_API_KEY;
      const pineconeIndexHost = process.env.PINECONE_INDEX_HOST;

      if (pineconeApiKey && pineconeIndexHost) {
        const response = await fetch(
          `https://${pineconeIndexHost}/vectors/delete`,
          {
            method: "POST",
            headers: {
              "Api-Key": pineconeApiKey,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              filter: { userId: { $eq: userId } },
            }),
          }
        );

        if (response.ok) {
          console.log(`✓ Deleted Pinecone embeddings for user: ${userId}`);
        } else {
          console.error(
            "Failed to delete Pinecone embeddings:",
            await response.text()
          );
        }
      }
    } catch (error) {
      console.error("Error deleting Pinecone embeddings:", error);
    }

    // Delete vector embeddings from Qdrant (if in development)
    if (process.env.NODE_ENV === "development") {
      try {
        const qdrantUrl = process.env.QDRANT_URL || "http://localhost:6333";
        const qdrantCollection =
          process.env.QDRANT_COLLECTION || "calmhive_onboarding";

        const response = await fetch(
          `${qdrantUrl}/collections/${qdrantCollection}/points/delete`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              filter: {
                must: [
                  {
                    key: "userId",
                    match: { value: userId },
                  },
                ],
              },
            }),
          }
        );

        if (response.ok) {
          console.log(`✓ Deleted Qdrant embeddings for user: ${userId}`);
        } else {
          console.error(
            "Failed to delete Qdrant embeddings:",
            await response.text()
          );
        }
      } catch (error) {
        console.error("Error deleting Qdrant embeddings:", error);
      }
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

    console.log(`✓ Deleted user account: ${userId}`);
    return apiResponse({ success: true }, "Account deleted successfully");
  } catch (error) {
    console.error("Error deleting user account:", error);
    return apiError(getErrorMessage(error));
  }
}
