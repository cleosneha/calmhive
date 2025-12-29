import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Get session from cookies (Better Auth stores it there)
  const token = request.cookies.get("better-auth.session_token")?.value;

  // Routes that require authentication
  const protectedRoutes = [
    "/onboarding",
    "/journal",
    "/plan",
    "/insights",
    "/settings",
    "/user",
  ];

  // Routes that require onboarding completion
  const onboardingRequiredRoutes = [
    "/journal",
    "/plan",
    "/insights",
    "/settings",
    "/user",
  ];

  // If user is not authenticated (no session token)
  if (!token) {
    // Redirect to login if trying to access protected route
    if (protectedRoutes.some((route) => pathname.startsWith(route))) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // If user is authenticated
  if (token) {
    // Validate session token
    try {
      const headersList = await headers();
      const session = await auth.api.getSession({
        headers: headersList,
      });
      // If session is invalid, redirect to login
      if (!session?.user) {
        if (protectedRoutes.some((route) => pathname.startsWith(route))) {
          return NextResponse.redirect(new URL("/login", request.url));
        }
      }

      // Redirect to home if trying to access auth routes
      if (pathname === "/login" || pathname === "/register") {
        return NextResponse.redirect(new URL("/user", request.url));
      }

      // Check if user is onboarded for onboarding-required routes
      if (
        onboardingRequiredRoutes.some((route) => pathname.startsWith(route))
      ) {
        // If user is not onboarded, redirect to onboarding
        if (
          session?.user &&
          !(session.user as typeof session.user & { onboarded?: boolean })
            .onboarded
        ) {
          // Allow access to /onboarding/chat and /onboarding/complete
          if (
            !pathname.startsWith("/onboarding/chat") &&
            !pathname.startsWith("/onboarding/complete") &&
            pathname !== "/onboarding"
          ) {
            return NextResponse.redirect(new URL("/onboarding", request.url));
          }
        }
      }
    } catch (error) {
      console.error("Error checking session:", error);
      // On session error, redirect to login for protected routes
      if (protectedRoutes.some((route) => pathname.startsWith(route))) {
        return NextResponse.redirect(new URL("/login", request.url));
      }
    }
  }

  return NextResponse.next();
}

// Configure which routes to run proxy on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
