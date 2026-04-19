import type { Metadata } from "next";
import localFont from "next/font/local";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { AuthSessionProvider } from "@/components/layout/session-provider";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Toaster } from "sonner";
import { ChatWidget } from "@/components/shared/chat-widget";
import "./globals.css";

const inter = localFont({
  src: "./fonts/InterVariable.woff2",
  variable: "--font-sans",
  display: "swap",
  weight: "100 900",
});

const geist = localFont({
  src: "./fonts/GeistVF.woff2",
  variable: "--font-heading",
  display: "swap",
  weight: "100 900",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://guidepath.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  manifest: "/manifest.json",
  themeColor: "#4f46e5",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/logo.png", type: "image/png" },
    ],
    shortcut: "/favicon.svg",
    apple: "/logo.png",
  },
  title: {
    default: "GuidePath — Encuentra tu camino con profesionales que te guían",
    template: "%s | GuidePath",
  },
  description:
    "Marketplace que conecta personas que buscan orientación con psicólogos, coaches, mentores de carrera y nutricionistas certificados. Sesiones por videollamada, fácil y seguro.",
  keywords: [
    "psicólogo online",
    "coach de vida",
    "mentor de carrera",
    "nutricionista online",
    "terapia online",
    "bienestar",
    "salud mental",
  ],
  openGraph: {
    type: "website",
    locale: "es_ES",
    url: siteUrl,
    siteName: "GuidePath",
    title: "GuidePath — Encuentra tu camino con profesionales que te guían",
    description:
      "Conecta con psicólogos, coaches, mentores y nutricionistas certificados. Sesiones por videollamada.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "GuidePath — Orientación profesional online",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "GuidePath — Encuentra tu camino con profesionales que te guían",
    description:
      "Conecta con psicólogos, coaches, mentores y nutricionistas certificados. Sesiones por videollamada.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        {/* Mark <html> as JS-ready BEFORE body paints so the `opacity:0`
            initial states (gated on `.js-ready`) only apply when JS is alive.
            A 1.2s safety timeout force-reveals any animated element that
            never got a chance to play — protects against hydration failures,
            CSP blocks, or any bug that prevents GSAP from firing. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var h=document.documentElement;h.classList.add('js-ready');setTimeout(function(){h.classList.add('gsap-fallback')},1200)})();`,
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', () => {
                  navigator.serviceWorker.register('/sw.js').catch(() => {});
                });
              }
            `,
          }}
        />
      </head>
      <body className={`${inter.variable} ${geist.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthSessionProvider>
            <div className="flex min-h-screen flex-col">
              <Navbar />
              <main className="flex-1">{children}</main>
              <Footer />
            </div>
            <ChatWidget />
          </AuthSessionProvider>
          <Toaster richColors position="top-right" />
        </ThemeProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
