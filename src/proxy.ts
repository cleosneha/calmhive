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

  // Routes that require both authentication and onboarding
  const fullyProtectedRoutes = [
    "/journal",
    "/plan",
    "/insights",
    "/settings",
    "/user",
  ];

  // Public routes (no auth required)
  const publicRoutes = ["/", "/login", "/register"];

  // Email verification routes
  const verificationRoutes = ["/verify-email", "/resend-verification"];

  // Validate session using Better Auth
  let session = null;
  try {
    const headersList = await headers();
    session = await auth.api.getSession({
      headers: headersList,
    });
  } catch (error) {
    console.error("Error checking session:", error);
  }

  const user = session?.user;
  const isLoggedIn = !!user;
  const isVerified = user?.emailVerified ?? false;
  const isOnboarded = user?.onboarded ?? false;

  // ===== STEP 1: User not logged in =====
  if (!isLoggedIn) {
    // Allow access to public routes
    if (publicRoutes.includes(pathname)) {
      return NextResponse.next();
    }

    // Allow access to verification routes
    if (verificationRoutes.some((route) => pathname.startsWith(route))) {
      return NextResponse.next();
    }

    // Block access to protected routes - redirect to login
    if (protectedRoutes.some((route) => pathname.startsWith(route))) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    return NextResponse.next();
  }

  // ===== STEP 2: User logged in but NOT verified =====
  if (isLoggedIn && !isVerified) {
    // Allow access to verification routes
    if (verificationRoutes.some((route) => pathname.startsWith(route))) {
      return NextResponse.next();
    }

    // Redirect away from login/register
    if (pathname === "/login" || pathname === "/register") {
      return NextResponse.redirect(new URL("/verify-email", request.url));
    }

    // Block access to all protected routes - redirect to verify email
    if (protectedRoutes.some((route) => pathname.startsWith(route))) {
      return NextResponse.redirect(new URL("/verify-email", request.url));
    }

    return NextResponse.next();
  }

  // ===== STEP 3: User logged in and verified but NOT onboarded =====
  if (isLoggedIn && isVerified && !isOnboarded) {
    // Redirect away from verify-email pages since user is already verified
    if (verificationRoutes.some((route) => pathname.startsWith(route))) {
      return NextResponse.redirect(new URL("/onboarding", request.url));
    }

    // Allow onboarding routes
    if (
      pathname === "/onboarding" ||
      pathname.startsWith("/onboarding/chat") ||
      pathname.startsWith("/onboarding/complete")
    ) {
      return NextResponse.next();
    }

    // Redirect away from login/register
    if (pathname === "/login" || pathname === "/register") {
      return NextResponse.redirect(new URL("/onboarding", request.url));
    }

    // Block access to fully protected routes - redirect to onboarding
    if (fullyProtectedRoutes.some((route) => pathname.startsWith(route))) {
      return NextResponse.redirect(new URL("/onboarding", request.url));
    }

    return NextResponse.next();
  }

  // ===== STEP 4: User logged in, verified, and onboarded (Fully authorized) =====
  if (isLoggedIn && isVerified && isOnboarded) {
    // Redirect away from verify-email pages since user is already verified and onboarded
    if (verificationRoutes.some((route) => pathname.startsWith(route))) {
      return NextResponse.redirect(new URL("/user", request.url));
    }

    // Redirect away from auth routes to dashboard
    if (pathname === "/login" || pathname === "/register") {
      return NextResponse.redirect(new URL("/user", request.url));
    }

    // Allow access to the onboarding complete page even if already onboarded (so users land on the completion page after accepting T&C)
    if (pathname === "/onboarding/complete") {
      return NextResponse.next();
    }

    // Redirect away from other onboarding routes
    if (pathname === "/onboarding" || pathname.startsWith("/onboarding/")) {
      return NextResponse.redirect(new URL("/user", request.url));
    }

    // Allow access to all protected routes
    if (protectedRoutes.some((route) => pathname.startsWith(route))) {
      return NextResponse.next();
    }

    return NextResponse.next();
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
