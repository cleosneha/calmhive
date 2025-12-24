import { NextRequest, NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Get session from cookies (Better Auth stores it there)
  const token = request.cookies.get("better-auth.session_token")?.value;

  // Public routes that don't require authentication
  // const publicRoutes = ["/login", "/register", "/"];

  // Routes that require authentication
  const protectedRoutes = [
    "/onboarding",
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
    // Redirect to home if trying to access auth routes
    if (pathname === "/login" || pathname === "/register") {
      return NextResponse.redirect(new URL("/user", request.url));
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
