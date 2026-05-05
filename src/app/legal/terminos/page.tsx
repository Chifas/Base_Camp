import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export const metadata = {
  title: "Términos de Uso — GuidePath",
  description: "Condiciones generales de uso de la plataforma GuidePath.",
};

export default function TerminosPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ChevronLeft className="h-4 w-4" />
        Volver al inicio
      </Link>

      <h1 className="mt-6 font-heading text-3xl font-bold tracking-tight">
        Términos de Uso
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Última actualización: 1 de enero de 2026
      </p>

      <div className="mt-10 space-y-8 text-sm leading-relaxed text-muted-foreground">
        <section>
          <h2 className="font-heading text-lg font-semibold text-foreground">
            1. Aceptación de los términos
          </h2>
          <p className="mt-3">
            Al acceder o utilizar la plataforma GuidePath (&ldquo;la Plataforma&rdquo;),
            aceptas quedar vinculado por estos Términos de Uso. Si no estás de
            acuerdo con alguno de estos términos, no utilices la Plataforma. El
            uso continuado de GuidePath tras la publicación de cambios en los
            términos implica tu aceptación de dichos cambios.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-lg font-semibold text-foreground">
            2. Descripción del servicio
          </h2>
          <p className="mt-3">
            GuidePath es un marketplace que conecta a profesionales que buscan
            desarrollo laboral con mentores, coaches y expertos verificados.
            Los servicios incluyen sesiones de mentoría, coaching ejecutivo,
            asesoramiento de carrera y orientación en emprendimiento, realizados
            mediante videollamada a través de la plataforma.
          </p>
          <p className="mt-3">
            GuidePath actúa como intermediario entre clientes y profesionales.
            No somos empleadores de los profesionales ni garantizamos resultados
            específicos de las sesiones.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-lg font-semibold text-foreground">
            3. Registro y cuenta de usuario
          </h2>
          <p className="mt-3">
            Para utilizar los servicios debes crear una cuenta proporcionando
            información veraz y actualizada. Eres responsable de mantener la
            confidencialidad de tus credenciales de acceso y de todas las
            actividades realizadas desde tu cuenta.
          </p>
          <p className="mt-3">
            GuidePath se reserva el derecho de suspender o cancelar cuentas que
            incumplan estos términos, aporten información falsa o realicen un
            uso fraudulento de la plataforma.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-lg font-semibold text-foreground">
            4. Condiciones para profesionales
          </h2>
          <p className="mt-3">
            Los profesionales que ofrezcan servicios en GuidePath deben:
          </p>
          <ul className="mt-3 list-disc space-y-1.5 pl-5">
            <li>Disponer de las titulaciones, certificaciones o experiencia que declaran en su perfil.</li>
            <li>Completar el proceso de verificación de identidad de GuidePath.</li>
            <li>Mantener sus datos de disponibilidad y tarifas actualizados.</li>
            <li>Conectar una cuenta de Stripe para recibir pagos.</li>
            <li>Respetar la confidencialidad de la información de sus clientes.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-heading text-lg font-semibold text-foreground">
            5. Pagos y comisiones
          </h2>
          <p className="mt-3">
            Los pagos se procesan de forma segura a través de Stripe. GuidePath
            retiene una comisión del 10% sobre cada sesión completada como
            tarifa de servicio por el uso de la plataforma. El 90% restante se
            transfiere directamente al profesional.
          </p>
          <p className="mt-3">
            Las cancelaciones realizadas con más de 24 horas de antelación
            serán reembolsadas íntegramente. Las cancelaciones tardías podrán
            estar sujetas a una penalización del 50%.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-lg font-semibold text-foreground">
            6. Conducta del usuario
          </h2>
          <p className="mt-3">Queda prohibido:</p>
          <ul className="mt-3 list-disc space-y-1.5 pl-5">
            <li>Publicar información falsa o engañosa en tu perfil.</li>
            <li>Acordar sesiones fuera de la plataforma para evitar el pago de comisiones.</li>
            <li>Acosar, discriminar o faltar al respeto a otros usuarios.</li>
            <li>Utilizar la plataforma para actividades ilegales.</li>
            <li>Intentar vulnerar la seguridad de los sistemas de GuidePath.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-heading text-lg font-semibold text-foreground">
            7. Limitación de responsabilidad
          </h2>
          <p className="mt-3">
            GuidePath no se responsabiliza de los resultados de las sesiones,
            ni de los daños directos o indirectos derivados del uso de la
            plataforma. La responsabilidad máxima de GuidePath en cualquier
            reclamación se limita al importe abonado por el usuario en los
            últimos 3 meses.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-lg font-semibold text-foreground">
            8. Modificaciones y legislación aplicable
          </h2>
          <p className="mt-3">
            GuidePath puede modificar estos términos en cualquier momento
            notificando a los usuarios con al menos 15 días de antelación. Estos
            términos se rigen por la legislación española. Para cualquier
            disputa, las partes se someten a la jurisdicción de los tribunales
            de Madrid, España.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-lg font-semibold text-foreground">
            9. Contacto
          </h2>
          <p className="mt-3">
            Para cualquier consulta sobre estos términos, puedes contactarnos
            en{" "}
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
          ¿Tienes preguntas?{" "}
          <Link href="/legal/privacidad" className="text-primary hover:underline">
            Consulta también nuestra Política de Privacidad.
          </Link>
        </p>
      </div>
    </div>
  );
}
