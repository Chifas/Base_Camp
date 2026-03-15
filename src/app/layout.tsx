import type { Metadata } from "next";
import localFont from "next/font/local";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { AuthSessionProvider } from "@/components/layout/session-provider";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

const inter = localFont({
  src: [
    {
      path: "./fonts/InterVariable.woff2",
      style: "normal",
    },
  ],
  variable: "--font-sans",
  display: "swap",
});

const geist = localFont({
  src: [
    {
      path: "./fonts/GeistVF.woff2",
      style: "normal",
    },
  ],
  variable: "--font-heading",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://guidepath.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
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
          </AuthSessionProvider>
        </ThemeProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
