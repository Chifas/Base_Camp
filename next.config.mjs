/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disabled to prevent GSAP double-invocation issues in dev.
  // React Strict Mode mounts → cleans up → remounts every effect, which
  // causes GSAP timelines and ScrollTrigger instances to run twice and
  // leave animations in a broken state. Production (Vercel) doesn't have
  // this problem because Strict Mode is a dev-only feature.
  reactStrictMode: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "api.dicebear.com",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(self \"https://*.daily.co\"), microphone=(self \"https://*.daily.co\"), geolocation=()",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' https://js.stripe.com https://cdn.vercel-insights.com",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob: https://images.unsplash.com https://lh3.googleusercontent.com https://res.cloudinary.com",
              "font-src 'self'",
              "connect-src 'self' https://api.stripe.com https://*.daily.co wss://*.daily.co https://vitals.vercel-insights.com",
              "frame-src 'self' https://js.stripe.com https://*.daily.co",
              "frame-ancestors 'none'",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
