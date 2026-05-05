import Link from "next/link";
import Image from "next/image";
import { Linkedin, Instagram } from "lucide-react";

const footerLinks = {
  plataforma: [
    { href: "/explore", label: "Explorar profesionales" },
    { href: "/auth/register", label: "Registrarse como profesional" },
    { href: "/precios", label: "Precios" },
    { href: "/#como-funciona", label: "Cómo funciona" },
  ],
  soporte: [
    { href: "mailto:soporte@guidepath.com", label: "Contacto" },
  ],
  legal: [
    { href: "/legal/privacidad", label: "Política de privacidad" },
    { href: "/legal/terminos", label: "Términos de uso" },
  ],
};

export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-4">
          {/* Brand */}
          <div className="sm:col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-1">
              <Image
                src="/logo.svg"
                alt="GuidePath"
                width={52}
                height={48}
                className="h-12 w-auto brightness-150 saturate-150 dark:brightness-200 dark:saturate-200"
              />
              <span className="font-heading text-xl font-bold">GuidePath</span>
            </Link>
            <p className="mt-4 text-sm text-muted-foreground">
              Conectamos personas con profesionales que les ayudan a encontrar su
              camino.
            </p>
            {/* Social media icons */}
            <div className="mt-5 flex items-center gap-3">
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted/50 text-muted-foreground transition-all hover:bg-primary/10 hover:text-primary hover:scale-110"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-4 w-4" />
              </a>
              <a
                href="https://x.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted/50 text-muted-foreground transition-all hover:bg-primary/10 hover:text-primary hover:scale-110"
                aria-label="X"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted/50 text-muted-foreground transition-all hover:bg-primary/10 hover:text-primary hover:scale-110"
                aria-label="Instagram"
              >
                <Instagram className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-sm font-semibold">Plataforma</h3>
            <ul className="mt-4 space-y-2">
              {footerLinks.plataforma.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold">Soporte</h3>
            <ul className="mt-4 space-y-2">
              {footerLinks.soporte.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold">Legal</h3>
            <ul className="mt-4 space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t pt-8">
          <p className="text-center text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} GuidePath. Todos los derechos
            reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
