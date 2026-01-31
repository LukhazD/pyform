import { ConfigProps } from "./types/config";

// DaisyUI v5 no longer exports themes directly, using fallback color
const themes = {
  light: {
    primary: "#3b82f6", // blue-500
  }
};

const config = {
  // REQUIRED
  appName: "Pyform",
  // REQUIRED: a short description of your app for SEO tags (can be overwritten)
  appDescription:
    "El editor visual que necesitas para transformar datos en acción.",
  // REQUIRED (no https://, not trailing slash at the end, just the naked domain)
  domainName: "pyform.luidiaz.com",
  crisp: {
    // Crisp website ID. IF YOU DON'T USE CRISP: just remove this => Then add a support email in this config file (resend.supportEmail) otherwise customer support won't work.
    id: "",
    // Hide Crisp by default, except on route "/". Crisp is toggled with <ButtonSupport/>. If you want to show Crisp on every routes, just remove this below
    onlyShowOnRoutes: ["/"],
  },
  stripe: {
    // Create multiple plans in your Stripe dashboard, then add them here. You can add as many plans as you want, just make sure to add the priceId
    plans: [
      {
        // REQUIRED — we use this to find the plan in the webhook (for instance if you want to update the user's credits based on the plan)
        priceId:
          process.env.NODE_ENV === "development"
            ? "price_1Sta0MQ2ocSqu8xkDWyl0B7A"
            : "price_1Sta0MQ2ocSqu8xkDWyl0B7A",
        //  REQUIRED - Name of the plan, displayed on the pricing page
        name: "Pro Mensual",
        // A friendly description of the plan, displayed on the pricing page. Tip: explain why this plan and not others
        description: "Todo lo que necesitas para crear formularios profesionales",
        // The price you want to display, the one user will be charged on Stripe.
        price: 9.99,
        // If you have an anchor price (i.e. $29) that you want to display crossed out, put it here. Otherwise, leave it empty
        priceAnchor: 19,
        features: [
          { name: "5 formularios activos" },
          { name: "500 respuestas/mes" },
          { name: "13 tipos de preguntas" },
          { name: "Editor Live en tiempo real" },
          { name: "Analíticas de abandono" },
          { name: "Exportación CSV" },
          { name: "Inicio de sesión con Google" },
        ],
      },
      {
        priceId:
          process.env.NODE_ENV === "development"
            ? "price_1Sta10Q2ocSqu8xkeY9vR9mE"
            : "price_1Sta10Q2ocSqu8xkeY9vR9mE",
        // This plan will look different on the pricing page, it will be highlighted. You can only have one plan with isFeatured: true
        isFeatured: true,
        name: "Pro Anual",
        description: "Ahorra 40% con el plan anual — mejor valor",
        price: 71.88,
        priceAnchor: 119.88,
        features: [
          { name: "5 formularios activos" },
          { name: "Respuestas ilimitadas" },
          { name: "13 tipos de preguntas" },
          { name: "Editor Live en tiempo real" },
          { name: "Analíticas avanzadas de fricción" },
          { name: "Exportación CSV ilimitada" },
          { name: "Inicio de sesión con Google" },
          { name: "Soporte prioritario por email" },
        ],
      },
    ],
  },
  aws: {
    // If you use AWS S3/Cloudfront, put values in here
    bucket: "bucket-name",
    bucketUrl: `https://bucket-name.s3.amazonaws.com/`,
    cdn: "https://cdn-id.cloudfront.net/",
  },
  resend: {
    // REQUIRED — Email 'From' field to be used when sending magic login links
    fromNoReply: `<noreply@luidiaz.com>`,
    // REQUIRED — Email 'From' field to be used when sending other emails, like abandoned carts, updates etc..
    fromAdmin: `<admin@luidiaz.com>`,
    // Email shown to customer if they need support. Leave empty if not needed => if empty, set up Crisp above, otherwise you won't be able to offer customer support."
    supportEmail: "<io@luidiaz.com>",
  },
  colors: {
    // REQUIRED — The DaisyUI theme to use (added to the main layout.js). Leave blank for default (light & dark mode). If you use any theme other than light/dark, you need to add it in config.tailwind.js in daisyui.themes.
    theme: "light",
    // REQUIRED — This color will be reflected on the whole app outside of the document (loading bar, Chrome tabs, etc..). By default it takes the primary color from your DaisyUI theme (make sure to update your the theme name after "data-theme=")
    // OR you can just do this to use a custom color: main: "#f37055". HEX only.
    main: themes["light"]["primary"],
  },
  auth: {
    // REQUIRED — the path to log in users. It's use to protect private routes (like /dashboard). It's used in apiClient (/libs/api.js) upon 401 errors from our API
    loginUrl: "/api/auth/signin",
    // REQUIRED — the path you want to redirect users to after a successful login (i.e. /dashboard, /private). This is normally a private page for users to manage their accounts. It's used in apiClient (/libs/api.js) upon 401 errors from our API & in ButtonSignin.js
    callbackUrl: "/dashboard",
  },
} as ConfigProps;

export default config;
