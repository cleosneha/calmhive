import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

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

  // Validate session using Better Auth directly
  let session = null;
  try {
    const headersList = await headers();
    session = await auth.api.getSession({
      headers: headersList,
    });
  } catch (error) {
    console.error("Error checking session:", error);
  }

  // If user is not authenticated
  if (!session?.user) {
    // Redirect to login if trying to access protected route
    if (protectedRoutes.some((route) => pathname.startsWith(route))) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  } else {
    // User is authenticated
    // Redirect to home if trying to access auth routes
    if (pathname === "/login" || pathname === "/register") {
      return NextResponse.redirect(new URL("/user", request.url));
    }

    // Check if user is onboarded for onboarding-required routes
    if (onboardingRequiredRoutes.some((route) => pathname.startsWith(route))) {
      // If user is not onboarded, redirect to onboarding
      if (!session.user.onboarded) {
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
