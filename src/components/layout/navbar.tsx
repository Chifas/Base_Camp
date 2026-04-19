"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { Menu, X, LayoutDashboard, LogOut } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./theme-toggle";
import { NotificationBell } from "./notification-bell";
import { gsap, useGSAP } from "@/lib/gsap-config";

const navLinks = [
  { href: "/explore", label: "Explorar" },
];

export function Navbar() {
  const { data: session } = useSession();
  const user = session?.user;
  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()
    : "?";
  const dashboardHref =
    (user as { role?: string })?.role === "PROFESSIONAL"
      ? "/dashboard/professional"
      : "/dashboard/client";

  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const logoRef = useRef<HTMLAnchorElement>(null);

  // Scroll-driven navbar style — toggle CSS class to avoid GSAP color-parsing issues
  useEffect(() => {
    const header = headerRef.current;
    if (!header) return;

    const onScroll = () => {
      if (window.scrollY > 10) {
        header.classList.add("navbar-scrolled");
      } else {
        header.classList.remove("navbar-scrolled");
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // GSAP entrance animation on mount — useGSAP runs in useLayoutEffect and
  // handles React StrictMode's double-invoke safely.
  useGSAP(
    () => {
      if (!headerRef.current) return;
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduced) {
        gsap.set(headerRef.current, { opacity: 1, y: 0 });
        return;
      }
      gsap.fromTo(
        headerRef.current,
        { y: -64, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7, ease: "expo.out", delay: 0.05 }
      );
    },
    { scope: headerRef }
  );

  // Close profile dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header
      ref={headerRef}
      data-gsap-init
      className="sticky top-0 z-50 w-full px-3 pt-3 sm:px-4 sm:pt-4 lg:px-6"
    >
      <div className="mx-auto max-w-7xl">
        <div className="navbar-pill flex h-14 items-center justify-between rounded-2xl border border-border/60 bg-background/70 pl-3 pr-2 shadow-[0_1px_0_hsl(var(--border)/0.4)] backdrop-blur-xl transition-[background-color,border-color,box-shadow,transform] duration-300 sm:h-16 sm:pl-5 sm:pr-3">
          {/* Logo */}
          <Link ref={logoRef} href="/" className="group flex items-center gap-1.5">
            <Image
              src="/logo.svg"
              alt="GuidePath"
              width={44}
              height={40}
              className="h-9 w-auto brightness-150 saturate-150 transition-transform group-hover:scale-110 dark:brightness-200 dark:saturate-200 sm:h-10"
            />
            <span className="font-heading text-lg font-bold tracking-tight sm:text-xl">
              GuidePath
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-1 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
            <span aria-hidden className="mx-1 hidden h-5 w-px bg-border/70 lg:block" />
            <ThemeToggle />
            {user && <NotificationBell />}

            {!user ? (
              <div className="ml-2 flex items-center gap-2">
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/auth/login">Iniciar sesión</Link>
                </Button>
                <Button size="sm" asChild className="rounded-full">
                  <Link href="/auth/register">Registrarse</Link>
                </Button>
              </div>
            ) : (
              <div className="relative ml-2" ref={profileRef}>
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                  aria-label="Menú de perfil"
                >
                  {initials}
                </button>

                <AnimatePresence>
                  {profileOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -4 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -4 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-3 w-56 overflow-hidden rounded-2xl border bg-popover shadow-xl ring-1 ring-black/5"
                    >
                      <div className="border-b px-4 py-3">
                        <p className="truncate text-sm font-semibold">{user?.name ?? ""}</p>
                        <p className="text-xs text-muted-foreground">
                          {(user as { role?: string })?.role === "PROFESSIONAL"
                            ? "Profesional"
                            : "Cliente"}
                        </p>
                      </div>
                      <div className="py-1">
                        <Link
                          href={dashboardHref}
                          onClick={() => setProfileOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors hover:bg-accent"
                        >
                          <LayoutDashboard className="h-4 w-4 text-muted-foreground" />
                          Mi panel
                        </Link>
                        <button
                          onClick={() => {
                            setProfileOpen(false);
                            signOut({ redirect: false }).then(() => {
                              window.location.href = "/";
                            });
                          }}
                          className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-destructive transition-colors hover:bg-accent"
                        >
                          <LogOut className="h-4 w-4" />
                          Cerrar sesión
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </nav>

          {/* Mobile menu button */}
          <div className="flex items-center gap-1 md:hidden">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Menú"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile nav — floating panel */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            className="mx-auto mt-2 max-w-7xl md:hidden"
          >
            <nav className="flex flex-col gap-1 rounded-2xl border border-border/60 bg-background/90 p-3 shadow-lg backdrop-blur-xl">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                >
                  {link.label}
                </Link>
              ))}
              {!user ? (
                <div className="mt-2 flex flex-col gap-2">
                  <Button variant="outline" asChild className="w-full">
                    <Link href="/auth/login" onClick={() => setMobileOpen(false)}>
                      Iniciar sesión
                    </Link>
                  </Button>
                  <Button asChild className="w-full">
                    <Link href="/auth/register" onClick={() => setMobileOpen(false)}>
                      Registrarse
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="mt-2 rounded-lg border bg-card p-3">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold">
                      {initials}
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{user?.name ?? ""}</p>
                      <p className="text-xs text-muted-foreground">
                        {(user as { role?: string })?.role === "PROFESSIONAL"
                          ? "Profesional"
                          : "Cliente"}
                      </p>
                    </div>
                  </div>
                  <Link
                    href={dashboardHref}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent"
                  >
                    <LayoutDashboard className="h-4 w-4 text-muted-foreground" />
                    Mi panel
                  </Link>
                  <button
                    onClick={() => {
                      setMobileOpen(false);
                      signOut({ redirect: false }).then(() => {
                        window.location.href = "/";
                      });
                    }}
                    className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-destructive transition-colors hover:bg-accent"
                  >
                    <LogOut className="h-4 w-4" />
                    Cerrar sesión
                  </button>
                </div>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
