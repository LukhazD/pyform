/**
 * PyForm branded magic-link email template.
 * Used by NextAuth's EmailProvider → sendVerificationRequest.
 */
export function getMagicLinkEmailHTML(url: string): string {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Accede a PyForm</title>
  <!--[if mso]>
  <noscript>
    <xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml>
  </noscript>
  <![endif]-->
</head>
<body style="margin:0;padding:0;font-family:'Segoe UI',Arial,sans-serif;">

  <!-- Outer wrapper -->
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"
    style="padding:40px 16px;">
    <tr>
      <td align="center">

        <!-- Card -->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"
          style="max-width:520px;background-color:#ffffff;border-radius:20px;overflow:hidden;
                 box-shadow:0 4px 24px rgba(124,58,237,0.10);">

          <!-- Purple gradient header -->
          <tr>
            <td style="background:#1a1a1a;
                       padding:36px 40px 28px;text-align:center;">
              <!-- Logo: using text-based logo for email compatibility -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center">
                <tr>
                  <td style="background-color:rgba(255, 255, 255, 0.71);border-radius:16px;
                             padding:14px 22px;display:inline-block;">
                    <!-- P icon (inline SVG as data URI for max compat) -->
                    <img
                      src="https://pyform.app/assets/icons/logo.png"
                      alt="PyForm Logo"
                      width="40"
                      height="40"
                      style="display:inline-block;vertical-align:middle;border-radius:8px;"
                    />
                    <span style="display:inline-block;vertical-align:middle;font-size:24px;
                                 font-weight:800;color:#ffffff;letter-spacing:-0.5px;">
                      Py<span style="color:#fff;">form</span>
                    </span>
                  </td>
                </tr>
              </table>

              <p style="margin:20px 0 0;font-size:13px;color:rgba(255,255,255,0.75);letter-spacing:0.5px;
                         text-transform:uppercase;font-weight:600;">
                Enlace mágico de acceso
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px 40px 32px;">
              <h1 style="margin:0 0 12px;font-size:26px;font-weight:800;color:#1e1b4b;line-height:1.2;">
                ¡Hola! 👋
              </h1>
              <p style="margin:0 0 10px;font-size:15px;color:#4b5563;line-height:1.6;">
                Recibimos una solicitud para iniciar sesión en tu cuenta de <strong style="color:#1a1a1a;">PyForm</strong>.
              </p>
              <p style="margin:0 0 32px;font-size:15px;color:#4b5563;line-height:1.6;">
                Haz clic en el botón de abajo para acceder. Este enlace es válido durante <strong>24 horas</strong> y solo puede usarse una vez.
              </p>

              <!-- CTA Button -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" style="margin:0 auto 32px;">
                <tr>
                  <td style="border-radius:12px;background-color:#1a1a1a;">
                    <a href="${url}"
                      target="_blank"
                      style="display:inline-block;padding:16px 40px;font-size:16px;font-weight:700;
                             color:#ffffff;text-decoration:none;border-radius:12px;
                             letter-spacing:0.2px;mso-padding-alt:16px 40px;">
                      Acceder a PyForm →
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Divider -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td style="border-top:1px solid #ede9fe;padding-top:24px;">
                    <p style="margin:0 0 8px;font-size:12px;color:#9ca3af;line-height:1.5;">
                      Si el botón no funciona, copia y pega este enlace en tu navegador:
                    </p>
                    <p style="margin:0;font-size:11px;color:#7c3aed;word-break:break-all;line-height:1.5;">
                      ${url}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Security notice -->
          <tr>
            <td style="padding:0 40px 32px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td style="padding:16px 18px;
                             border-left:4px solid #10b981;">
                    <p style="margin:0;font-size:12px;color:#6b7280;line-height:1.6;">
                      🔒 <strong style="color:#374151;">¿No fuiste tú?</strong>
                      Puedes ignorar este mensaje con seguridad. Nadie podrá acceder a tu cuenta sin este enlace.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 40px;border-top:1px solid #ede9fe;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td style="text-align:center;">
                    <p style="margin:0 0 4px;font-size:12px;color:#9ca3af;">
                      Enviado por <strong style="color:#7c3aed;">PyForm</strong> · El editor visual para tus formularios
                    </p>
                    <p style="margin:0;font-size:11px;color:#c4b5fd;">
                      <a href="https://pyform.app" style="color:#7c3aed;text-decoration:none;" target="_blank">pyform.app</a>
                      &nbsp;·&nbsp;
                      <a href="mailto:io@pyform.app" style="color:#7c3aed;text-decoration:none;">io@pyform.app</a>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
        <!-- End Card -->

      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function getMagicLinkEmailText(url: string): string {
  return `Accede a PyForm\n\nHaz clic en el siguiente enlace para iniciar sesión en tu cuenta de PyForm:\n\n${url}\n\nEste enlace es válido durante 24 horas y solo puede usarse una vez.\n\n¿No fuiste tú? Puedes ignorar este mensaje de forma segura.\n\n— El equipo de PyForm\nhttps://pyform.app`;
}
