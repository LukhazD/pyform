import Link from "next/link";
import Image from "next/image";
import config from "@/config";
import logo from "@/app/icon.png";
import RaodSystemLogo from "@/public/assets/icons/RaodSystemLogo.png";
import { useTranslations } from "next-intl";
// Add the Footer to the bottom of your landing page and more.
// The support link is connected to the config.js file. If there's no config.resend.supportEmail, the link won't be displayed.

const Footer = () => {
  const t = useTranslations("footer");

  return (
    <footer className="bg-base-200 border-t border-base-content/10">
      <div className="max-w-7xl mx-auto px-8 py-24">
        <div className=" flex lg:items-start md:flex-row md:flex-nowrap flex-wrap flex-col">
          <div className="w-64 flex-shrink-0 md:mx-0 mx-auto text-center md:text-left">
            <Link
              href="/#"
              aria-current="page"
              className="flex gap-2 justify-center md:justify-start items-center"
            >
              <Image
                src={logo}
                alt={`${config.appName} logo`}
                priority={true}
                className="w-6 h-6"
                width={24}
                height={24}
              />
              <strong className="font-extrabold tracking-tight text-base md:text-lg">
                {config.appName}
              </strong>
            </Link>

            <p className="mt-3 text-sm text-base-content/80">
              {config.appDescription}
            </p>

            <p className="mt-3 text-sm text-base-content/80">{t("madeBy")}</p>
            <Image
              src={RaodSystemLogo}
              alt="RaodSystem Logo"
              priority={true}
              width={86}
              height={24}
            />
            <p className="mt-3 text-sm text-base-content/60">
              2021 - {new Date().getFullYear()} © RAOD System LLC
            </p>

          </div>
          <div className="flex-grow flex flex-wrap justify-center -mb-10 md:mt-0 mt-10 text-center">
            <div className="lg:w-1/3 md:w-1/2 w-full px-4">
              <div className="footer-title font-semibold text-base-content tracking-widest text-sm md:text-left mb-3">
                {t("links")}
              </div>

              <div className="flex flex-col justify-center items-center md:items-start gap-2 mb-10 text-sm">
                {config.resend.supportEmail && (
                  <a
                    href={`https://wa.me/34642789051`}
                    target="_blank"
                    className="link link-hover"
                    aria-label="Contact Support"
                  >
                    {t("support")}
                  </a>
                )}
                <Link href="/#pricing" className="link link-hover">
                  {t("pricing")}
                </Link>
                <Link href="/blog" className="link link-hover">
                  {t("blog")}
                </Link>
              </div>
            </div>

            <div className="lg:w-1/3 md:w-1/2 w-full px-4">
              <div className="footer-title font-semibold text-base-content tracking-widest text-sm md:text-left mb-3">
                {t("legal")}
              </div>

              <div className="flex flex-col justify-center items-center md:items-start gap-2 mb-10 text-sm">
                <Link href="/tos" className="link link-hover">
                  {t("tos")}
                </Link>
                <Link href="/privacy-policy" className="link link-hover">
                  {t("privacy")}
                </Link>
                <Link href="/about" className="link link-hover">
                  {t("about")}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
