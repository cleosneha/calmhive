"use client";
import { authClient } from "@/lib/auth-client";

/**
 * Hook to get the current user session in client components
 * @returns Object with user data and loading state
 */
export function useSession() {
  const session = authClient.useSession();
  return session;
}

/**
 * Hook to handle sign out
 */
export function useSignOut() {
  const handleSignOut = async () => {
    await authClient.signOut();
  };

  return { signOut: handleSignOut };
}
