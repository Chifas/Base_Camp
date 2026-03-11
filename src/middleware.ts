export { default } from "next-auth/middleware";

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/book/:path*",
    "/session/:path*",
  ],
};
