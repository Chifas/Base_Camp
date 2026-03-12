import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const role = req.nextauth.token?.role as string | undefined;

    // Professionals trying to access client dashboard
    if (pathname.startsWith("/dashboard/client") && role === "PROFESSIONAL") {
      return NextResponse.redirect(new URL("/dashboard/professional", req.url));
    }

    // Clients trying to access professional dashboard
    if (pathname.startsWith("/dashboard/professional") && role === "CLIENT") {
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
  ],
};
