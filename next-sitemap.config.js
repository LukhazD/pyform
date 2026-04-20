module.exports = {
  // REQUIRED: add your own domain name here (e.g. https://shipfa.st),
  siteUrl: process.env.SITE_URL || "https://pyform.app",
  generateRobotsTxt: true,

  // use this to exclude routes from the sitemap (i.e. a user dashboard). By default, NextJS app router metadata files are excluded (https://nextjs.org/docs/app/api-reference/file-conventions/metadata)
  exclude: ["/twitter-image.*", "/opengraph-image.*", "/icon.*"],

  // i18n: generate alternateRefs for each locale
  alternateRefs: [
    {
      href: "https://pyform.app",
      hreflang: "en",
    },
    {
      href: "https://pyform.app/es",
      hreflang: "es",
    },
  ],
};
