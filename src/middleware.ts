import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Role-based access control for dashboards
    if (path.startsWith("/dashboard/professional") && token?.role !== "PROFESSIONAL") {
      return NextResponse.redirect(new URL("/dashboard/client", req.url));
    }
    if (path.startsWith("/dashboard/client") && token?.role === "PROFESSIONAL") {
      return NextResponse.redirect(new URL("/dashboard/professional", req.url));
    }

    // Only professionals can access onboarding
    if (path.startsWith("/onboarding/professional") && token?.role !== "PROFESSIONAL") {
      return NextResponse.redirect(new URL("/dashboard/client", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized({ token }) {
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/session/:path*",
    "/book/:path*",
    "/onboarding/:path*",
  ],
};
