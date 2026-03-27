/**
 * Shared helpers used by all email templates.
 * Internal to the emails module — not re-exported from index.ts.
 */

export const APP_URL   = process.env.NEXTAUTH_URL ?? "https://guidepath.app";
export const BRAND_CLR = "#4f46e5"; // indigo-600

export function fmtDate(d: Date | string) {
  return new Intl.DateTimeFormat("es-ES", {
    weekday: "long",
    day:     "numeric",
    month:   "long",
    year:    "numeric",
  }).format(new Date(d));
}

export function fmtTime(d: Date | string) {
  return new Intl.DateTimeFormat("es-ES", {
    hour:   "2-digit",
    minute: "2-digit",
  }).format(new Date(d));
}

export function fmtCurrency(n: number) {
  return new Intl.NumberFormat("es-ES", {
    style:    "currency",
    currency: "EUR",
  }).format(n);
}

export function layout(content: string): string {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>GuidePath</title>
</head>
<body style="margin:0;padding:0;background-color:#f1f5f9;font-family:Inter,Helvetica,Arial,sans-serif;color:#1e293b;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f1f5f9;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="580" cellpadding="0" cellspacing="0" style="max-width:580px;width:100%;background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="background-color:${BRAND_CLR};padding:28px 40px;text-align:center;">
              <span style="color:#ffffff;font-size:22px;font-weight:700;letter-spacing:-0.5px;">GuidePath</span>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px 40px 32px;">
              ${content}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#f8fafc;border-top:1px solid #e2e8f0;padding:20px 40px;text-align:center;">
              <p style="margin:0 0 4px;color:#94a3b8;font-size:12px;">
                © ${new Date().getFullYear()} GuidePath · Todos los derechos reservados
              </p>
              <p style="margin:0;color:#94a3b8;font-size:12px;">
                Has recibido este email porque tienes una cuenta en GuidePath.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function ctaButton(label: string, url: string): string {
  return `<div style="text-align:center;margin:32px 0 0;">
    <a href="${url}"
       style="display:inline-block;background-color:${BRAND_CLR};color:#ffffff;
              text-decoration:none;padding:14px 32px;border-radius:8px;
              font-weight:600;font-size:15px;">
      ${label}
    </a>
  </div>`;
}

export function sessionCard(rows: [string, string][]): string {
  const cells = rows
    .map(
      ([label, value]) => `
      <tr>
        <td style="padding:10px 16px;color:#64748b;font-size:13px;width:40%;border-bottom:1px solid #f1f5f9;">${label}</td>
        <td style="padding:10px 16px;font-size:13px;font-weight:600;border-bottom:1px solid #f1f5f9;">${value}</td>
      </tr>`
    )
    .join("");

  return `<table width="100%" cellpadding="0" cellspacing="0"
    style="border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;margin:24px 0 0;">
    ${cells}
  </table>`;
}
