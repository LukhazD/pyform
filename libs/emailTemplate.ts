/**
 * PyForm branded magic-link email template.
 * Used by NextAuth's EmailProvider → sendVerificationRequest.
 */

const emailStrings = {
  en: {
    title: "Access PyForm",
    header: "Magic access link",
    greeting: "Hello! 👋",
    body1: 'We received a request to sign in to your <strong style="color:#1a1a1a;">PyForm</strong> account.',
    body2: "Click the button below to access. This link is valid for <strong>24 hours</strong> and can only be used once.",
    cta: "Access PyForm →",
    fallback: "If the button doesn't work, copy and paste this link in your browser:",
    security: '<strong style="color:#374151;">Wasn\'t you?</strong> You can safely ignore this message. No one can access your account without this link.',
    footer: 'Sent by <strong style="color:#7c3aed;">PyForm</strong> · The visual editor for your forms',
    textGreeting: "Access PyForm",
    textBody: "Click the following link to sign in to your PyForm account:",
    textExpiry: "This link is valid for 24 hours and can only be used once.",
    textSecurity: "Wasn't you? You can safely ignore this message.",
    textSignoff: "— The PyForm team",
  },
  es: {
    title: "Accede a PyForm",
    header: "Enlace mágico de acceso",
    greeting: "¡Hola! 👋",
    body1: 'Recibimos una solicitud para iniciar sesión en tu cuenta de <strong style="color:#1a1a1a;">PyForm</strong>.',
    body2: "Haz clic en el botón de abajo para acceder. Este enlace es válido durante <strong>24 horas</strong> y solo puede usarse una vez.",
    cta: "Acceder a PyForm →",
    fallback: "Si el botón no funciona, copia y pega este enlace en tu navegador:",
    security: '<strong style="color:#374151;">¿No fuiste tú?</strong> Puedes ignorar este mensaje con seguridad. Nadie podrá acceder a tu cuenta sin este enlace.',
    footer: 'Enviado por <strong style="color:#7c3aed;">PyForm</strong> · El editor visual para tus formularios',
    textGreeting: "Accede a PyForm",
    textBody: "Haz clic en el siguiente enlace para iniciar sesión en tu cuenta de PyForm:",
    textExpiry: "Este enlace es válido durante 24 horas y solo puede usarse una vez.",
    textSecurity: "¿No fuiste tú? Puedes ignorar este mensaje de forma segura.",
    textSignoff: "— El equipo de PyForm",
  },
} as const;

type EmailLocale = keyof typeof emailStrings;

export function getMagicLinkEmailHTML(url: string, locale: string = "es"): string {
  const s = emailStrings[(locale in emailStrings ? locale : "es") as EmailLocale];
  return `<!DOCTYPE html>
<html lang="${locale}">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${s.title}</title>
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
                ${s.header}
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px 40px 32px;">
              <h1 style="margin:0 0 12px;font-size:26px;font-weight:800;color:#1e1b4b;line-height:1.2;">
                ${s.greeting}
              </h1>
              <p style="margin:0 0 10px;font-size:15px;color:#4b5563;line-height:1.6;">
                ${s.body1}
              </p>
              <p style="margin:0 0 32px;font-size:15px;color:#4b5563;line-height:1.6;">
                ${s.body2}
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
                      ${s.cta}
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Divider -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td style="border-top:1px solid #ede9fe;padding-top:24px;">
                    <p style="margin:0 0 8px;font-size:12px;color:#9ca3af;line-height:1.5;">
                      ${s.fallback}
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
                      🔒 ${s.security}
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
                      ${s.footer}
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

export function getMagicLinkEmailText(url: string, locale: string = "es"): string {
  const s = emailStrings[(locale in emailStrings ? locale : "es") as EmailLocale];
  return `${s.textGreeting}\n\n${s.textBody}\n\n${url}\n\n${s.textExpiry}\n\n${s.textSecurity}\n\n${s.textSignoff}\nhttps://pyform.app`;
}
