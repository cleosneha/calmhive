"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "./useSession";

/**
 * Hook to protect routes that require authentication
 * Redirects to login if user is not authenticated
 */
export function useProtectedRoute() {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  useEffect(() => {
    // Don't redirect while loading
    if (isPending) return;

    // Redirect to login if not authenticated
    if (!session?.user) {
      router.push("/login");
    }
  }, [session, isPending, router]);

  return { isLoading: isPending, isAuthenticated: !!session?.user };
}

/**
 * Hook to check if user is authenticated (without redirecting)
 */
export function useAuth() {
  const { data: session, isPending } = useSession();

  return {
    user: session?.user || null,
    isLoading: isPending,
    isAuthenticated: !!session?.user,
  };
}
