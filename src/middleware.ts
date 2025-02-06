import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    // Add security headers
    const headers = new Headers(req.headers);
    headers.set("x-frame-options", "DENY");
    headers.set("x-content-type-options", "nosniff");
    headers.set("referrer-policy", "strict-origin-when-cross-origin");
    headers.set(
      "strict-transport-security",
      "max-age=31536000; includeSubDomains"
    );
    headers.set(
      "content-security-policy",
      "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';"
    );

    return NextResponse.next({
      request: {
        headers: headers,
      },
    });
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: '/signin',
    }
  }
);

// Protect all routes under /dashboard and /api (except auth endpoints)
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/links/:path*",
    "/credits/:path*",
    "/profile/:path*",
    "/settings/:path*",
    "/api/:path*",
    "/((?!api/auth|signin|signup|forgot_password|manifest.json|_next/static|_next/image|favicon.ico|icons/|screenshots/|public/).*)",
  ],
};
