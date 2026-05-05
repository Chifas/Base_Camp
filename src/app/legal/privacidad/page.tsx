import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export const metadata = {
  title: "Política de Privacidad — GuidePath",
  description: "Cómo GuidePath recopila, usa y protege tus datos personales.",
};

export default function PrivacidadPage() {
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
        Política de Privacidad
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Última actualización: 1 de enero de 2026
      </p>

      <div className="mt-10 space-y-8 text-sm leading-relaxed text-muted-foreground">
        <section>
          <h2 className="font-heading text-lg font-semibold text-foreground">
            1. Responsable del tratamiento
          </h2>
          <p className="mt-3">
            GuidePath S.L. (en adelante, &ldquo;GuidePath&rdquo;) es la entidad
            responsable del tratamiento de tus datos personales. Puedes
            contactarnos en{" "}
            <a href="mailto:guidepathje@gmail.com" className="text-primary hover:underline">
              guidepathje@gmail.com
            </a>
            .
          </p>
        </section>

        <section>
          <h2 className="font-heading text-lg font-semibold text-foreground">
            2. Datos que recopilamos
          </h2>
          <p className="mt-3">Recopilamos los siguientes datos:</p>
          <ul className="mt-3 list-disc space-y-1.5 pl-5">
            <li>
              <strong className="text-foreground">Datos de cuenta:</strong> nombre,
              dirección de email, contraseña cifrada y foto de perfil.
            </li>
            <li>
              <strong className="text-foreground">Datos de perfil profesional:</strong>{" "}
              experiencia, titulaciones, tarifa horaria y disponibilidad
              (solo para profesionales).
            </li>
            <li>
              <strong className="text-foreground">Datos de sesión:</strong> historial
              de reservas, notas de sesión y valoraciones.
            </li>
            <li>
              <strong className="text-foreground">Datos de pago:</strong> gestionados
              íntegramente por Stripe. GuidePath no almacena números de tarjeta
              ni datos bancarios completos.
            </li>
            <li>
              <strong className="text-foreground">Datos técnicos:</strong> dirección IP,
              tipo de navegador, páginas visitadas y duración de las sesiones,
              con fines analíticos y de seguridad.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="font-heading text-lg font-semibold text-foreground">
            3. Finalidad y base legal del tratamiento
          </h2>
          <div className="mt-3 space-y-3">
            <p>
              <strong className="text-foreground">Ejecución del contrato:</strong>{" "}
              gestionar tu cuenta, procesar reservas y pagos, y conectarte con
              profesionales.
            </p>
            <p>
              <strong className="text-foreground">Interés legítimo:</strong>{" "}
              mejorar la plataforma, prevenir el fraude y garantizar la seguridad
              del servicio.
            </p>
            <p>
              <strong className="text-foreground">Consentimiento:</strong>{" "}
              envío de comunicaciones de marketing y newsletter (solo si lo has
              autorizado expresamente).
            </p>
            <p>
              <strong className="text-foreground">Obligación legal:</strong>{" "}
              cumplimiento de obligaciones fiscales y legales aplicables.
            </p>
          </div>
        </section>

        <section>
          <h2 className="font-heading text-lg font-semibold text-foreground">
            4. Terceros que acceden a tus datos
          </h2>
          <ul className="mt-3 list-disc space-y-1.5 pl-5">
            <li>
              <strong className="text-foreground">Stripe:</strong> procesamiento
              de pagos. Consulta la{" "}
              <a
                href="https://stripe.com/es/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                política de privacidad de Stripe
              </a>
              .
            </li>
            <li>
              <strong className="text-foreground">Daily.co:</strong> infraestructura
              de videollamadas. Las sesiones de vídeo no se graban salvo
              consentimiento expreso de ambas partes.
            </li>
            <li>
              <strong className="text-foreground">Resend:</strong> servicio de
              envío de emails transaccionales (confirmaciones de reserva,
              recordatorios).
            </li>
          </ul>
          <p className="mt-3">
            Todos los proveedores están sujetos a contratos de tratamiento de
            datos conformes al RGPD.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-lg font-semibold text-foreground">
            5. Conservación de los datos
          </h2>
          <p className="mt-3">
            Conservamos tus datos mientras mantengas una cuenta activa y durante
            el tiempo necesario para cumplir obligaciones legales (generalmente
            5 años para datos fiscales). Los datos de sesiones se conservan 3
            años para resolver posibles reclamaciones.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-lg font-semibold text-foreground">
            6. Tus derechos (RGPD)
          </h2>
          <p className="mt-3">
            De acuerdo con el Reglamento General de Protección de Datos (RGPD),
            tienes derecho a:
          </p>
          <ul className="mt-3 list-disc space-y-1.5 pl-5">
            <li><strong className="text-foreground">Acceso:</strong> obtener copia de tus datos personales.</li>
            <li><strong className="text-foreground">Rectificación:</strong> corregir datos inexactos o incompletos.</li>
            <li><strong className="text-foreground">Supresión:</strong> solicitar la eliminación de tus datos (&ldquo;derecho al olvido&rdquo;).</li>
            <li><strong className="text-foreground">Portabilidad:</strong> recibir tus datos en formato estructurado.</li>
            <li><strong className="text-foreground">Oposición:</strong> oponerte al tratamiento basado en interés legítimo.</li>
            <li><strong className="text-foreground">Limitación:</strong> solicitar la restricción del tratamiento en determinados casos.</li>
          </ul>
          <p className="mt-3">
            Para ejercer cualquiera de estos derechos, envía un email a{" "}
            <a
              href="mailto:guidepathje@gmail.com"
              className="text-primary hover:underline"
            >
              guidepathje@gmail.com
            </a>{" "}
            con copia de tu documento de identidad. Responderemos en un máximo
            de 30 días. También puedes presentar una reclamación ante la{" "}
            <a
              href="https://www.aepd.es"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Agencia Española de Protección de Datos (AEPD)
            </a>
            .
          </p>
        </section>

        <section>
          <h2 className="font-heading text-lg font-semibold text-foreground">
            7. Seguridad
          </h2>
          <p className="mt-3">
            Aplicamos medidas técnicas y organizativas adecuadas para proteger
            tus datos: cifrado en tránsito (TLS), contraseñas hasheadas con
            bcrypt, acceso restringido a datos sensibles y auditorías periódicas
            de seguridad.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-lg font-semibold text-foreground">
            8. Cookies
          </h2>
          <p className="mt-3">
            Utilizamos cookies estrictamente necesarias para el funcionamiento
            de la plataforma (autenticación, preferencias de tema). No
            utilizamos cookies de publicidad comportamental. Puedes gestionar
            tus preferencias de cookies desde la configuración de tu navegador.
          </p>
        </section>
      </div>

      <div className="mt-12 border-t pt-6 text-xs text-muted-foreground">
        <p>
          ¿Tienes preguntas?{" "}
          <Link href="/legal/terminos" className="text-primary hover:underline">
            Consulta también nuestros Términos de Uso.
          </Link>
        </p>
      </div>
    </div>
  );
}
