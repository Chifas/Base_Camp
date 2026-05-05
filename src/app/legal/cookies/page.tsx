import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Política de Cookies — GuidePath",
  description:
    "Qué cookies utiliza GuidePath, para qué sirven y cómo puedes gestionarlas.",
  alternates: { canonical: "/legal/cookies" },
};

const COOKIES = [
  {
    name: "next-auth.session-token",
    purpose: "Mantiene tu sesión iniciada de forma segura.",
    type: "Necesaria",
    duration: "30 días",
  },
  {
    name: "next-auth.csrf-token",
    purpose: "Protege los formularios frente a ataques CSRF.",
    type: "Necesaria",
    duration: "Sesión",
  },
  {
    name: "next-auth.callback-url",
    purpose: "Recuerda la página a la que volver tras iniciar sesión.",
    type: "Necesaria",
    duration: "Sesión",
  },
  {
    name: "theme",
    purpose: "Guarda tu preferencia de tema (claro/oscuro).",
    type: "Preferencia",
    duration: "1 año",
  },
  {
    name: "__stripe_mid / __stripe_sid",
    purpose: "Cookies de Stripe que permiten procesar pagos de forma segura y prevenir fraude.",
    type: "Necesaria (terceros)",
    duration: "1 año / Sesión",
  },
];

export default function CookiesPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" />
        Volver al inicio
      </Link>

      <h1 className="mt-6 font-heading text-3xl font-bold tracking-tight">
        Política de Cookies
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Última actualización: 1 de enero de 2026
      </p>

      <div className="mt-10 space-y-8 text-sm leading-relaxed text-muted-foreground">
        <section>
          <h2 className="font-heading text-lg font-semibold text-foreground">
            1. Qué son las cookies
          </h2>
          <p className="mt-3">
            Las cookies son pequeños archivos de texto que un sitio web guarda
            en tu dispositivo cuando lo visitas. Sirven para que el sitio
            funcione correctamente, recuerde tus preferencias y, en algunos
            casos, recopile información estadística sobre el uso.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-lg font-semibold text-foreground">
            2. Tipos de cookies que utilizamos
          </h2>
          <p className="mt-3">
            En GuidePath utilizamos exclusivamente cookies necesarias para el
            funcionamiento del servicio y de preferencias. <strong className="text-foreground">No utilizamos cookies de publicidad
            comportamental ni de seguimiento entre sitios.</strong>
          </p>
          <ul className="mt-3 list-disc space-y-1.5 pl-5">
            <li>
              <strong className="text-foreground">Cookies necesarias:</strong>{" "}
              imprescindibles para que la plataforma funcione (autenticación,
              seguridad, procesamiento de pagos). No requieren consentimiento
              previo.
            </li>
            <li>
              <strong className="text-foreground">Cookies de preferencia:</strong>{" "}
              guardan ajustes como el tema claro/oscuro para recordar tu
              elección entre visitas.
            </li>
            <li>
              <strong className="text-foreground">Cookies de terceros:</strong>{" "}
              Stripe instala cookies propias necesarias para procesar los pagos
              de forma segura. Consulta su{" "}
              <a
                href="https://stripe.com/es/cookie-settings"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                política de cookies
              </a>
              .
            </li>
          </ul>
        </section>

        <section>
          <h2 className="font-heading text-lg font-semibold text-foreground">
            3. Detalle de cookies utilizadas
          </h2>
          <div className="mt-4 overflow-x-auto rounded-xl border border-stone-200 dark:border-stone-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 dark:bg-stone-900">
                <tr>
                  <th className="px-4 py-3 font-semibold text-foreground">
                    Nombre
                  </th>
                  <th className="px-4 py-3 font-semibold text-foreground">
                    Finalidad
                  </th>
                  <th className="px-4 py-3 font-semibold text-foreground">
                    Tipo
                  </th>
                  <th className="px-4 py-3 font-semibold text-foreground">
                    Duración
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200 dark:divide-stone-800">
                {COOKIES.map((c) => (
                  <tr key={c.name} className="align-top">
                    <td className="px-4 py-3 font-mono text-[11px] text-foreground">
                      {c.name}
                    </td>
                    <td className="px-4 py-3">{c.purpose}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{c.type}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{c.duration}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="font-heading text-lg font-semibold text-foreground">
            4. Cómo gestionar las cookies
          </h2>
          <p className="mt-3">
            Puedes aceptar, bloquear o eliminar las cookies desde la
            configuración de tu navegador. Ten en cuenta que bloquear las
            cookies necesarias puede impedir el correcto funcionamiento del
            servicio (por ejemplo, no podrás iniciar sesión).
          </p>
          <ul className="mt-3 list-disc space-y-1.5 pl-5">
            <li>
              <a
                href="https://support.google.com/chrome/answer/95647"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Cómo gestionar cookies en Chrome
              </a>
            </li>
            <li>
              <a
                href="https://support.mozilla.org/es/kb/habilitar-y-deshabilitar-cookies-sitios-web-rastrear-preferencias"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Cómo gestionar cookies en Firefox
              </a>
            </li>
            <li>
              <a
                href="https://support.apple.com/es-es/guide/safari/sfri11471/mac"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Cómo gestionar cookies en Safari
              </a>
            </li>
            <li>
              <a
                href="https://support.microsoft.com/es-es/microsoft-edge/eliminar-las-cookies-en-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Cómo gestionar cookies en Edge
              </a>
            </li>
          </ul>
        </section>

        <section>
          <h2 className="font-heading text-lg font-semibold text-foreground">
            5. Cambios en esta política
          </h2>
          <p className="mt-3">
            Si actualizamos esta política para reflejar cambios en las cookies
            que utilizamos, lo notificaremos a través de la propia plataforma.
            La fecha de última actualización aparece al inicio de este
            documento.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-lg font-semibold text-foreground">
            6. Contacto
          </h2>
          <p className="mt-3">
            Si tienes preguntas sobre esta política, escríbenos a{" "}
            <a
              href="mailto:guidepathje@gmail.com"
              className="text-primary hover:underline"
            >
              guidepathje@gmail.com
            </a>
            .
          </p>
        </section>
      </div>

      <div className="mt-12 border-t pt-6 text-xs text-muted-foreground">
        <p>
          Consulta también nuestra{" "}
          <Link href="/legal/privacidad" className="text-primary hover:underline">
            Política de Privacidad
          </Link>{" "}
          y los{" "}
          <Link href="/legal/terminos" className="text-primary hover:underline">
            Términos de Uso
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
