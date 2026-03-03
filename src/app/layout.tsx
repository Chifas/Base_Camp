import type { Metadata } from "next";
import localFont from "next/font/local";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { SessionProvider } from "@/components/layout/session-provider";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
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

export const metadata: Metadata = {
  title: "GuidePath — Impulsa tu carrera con mentores y coaches del mundo laboral",
  description:
    "Marketplace que conecta profesionales con mentores de carrera, coaches ejecutivos y expertos en emprendimiento. Sesiones por videollamada, fácil y seguro.",
  keywords: [
    "mentor de carrera",
    "coach ejecutivo",
    "mentor de emprendimiento",
    "desarrollo profesional",
    "cambio de trabajo",
    "liderazgo",
    "coaching laboral",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${inter.variable} ${geist.variable} font-sans antialiased`}>
        <SessionProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <div className="flex min-h-screen flex-col">
              <Navbar />
              <main className="flex-1">{children}</main>
              <Footer />
            </div>
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
