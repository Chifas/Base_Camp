import Link from "next/link";
import Image from "next/image";

const footerLinks = {
  plataforma: [
    { href: "/explore", label: "Explorar profesionales" },
    { href: "/auth/register", label: "Registrarse como profesional" },
    { href: "#", label: "Precios" },
    { href: "#", label: "Cómo funciona" },
  ],
  soporte: [
    { href: "#", label: "Centro de ayuda" },
    { href: "#", label: "Contacto" },
    { href: "#", label: "FAQ" },
  ],
  legal: [
    { href: "#", label: "Política de privacidad" },
    { href: "#", label: "Términos de uso" },
    { href: "#", label: "Política de cookies" },
  ],
};

export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-1.5">
              <Image
                src="/logo.svg"
                alt="GuidePath"
                width={44}
                height={40}
                className="h-10 w-auto brightness-150 saturate-150 dark:brightness-200 dark:saturate-200"
              />
              <span className="font-heading text-lg font-bold">GuidePath</span>
            </Link>
            <p className="mt-4 text-sm text-muted-foreground">
              Conectamos personas con profesionales que les ayudan a encontrar su
              camino.
            </p>
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
