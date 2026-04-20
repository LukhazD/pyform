"use client";

import { useState, useEffect, useRef } from "react";
import type { JSX } from "react";
import { useTranslations } from "next-intl";

// Iconos SVG para las características
const CheckIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    className="w-[18px] h-[18px] inline shrink-0 opacity-80"
  >
    <path
      fillRule="evenodd"
      d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
      clipRule="evenodd"
    />
  </svg>
);

const HighlightIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    className="w-[18px] h-[18px] inline shrink-0"
  >
    <path
      fillRule="evenodd"
      d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
      clipRule="evenodd"
    />
  </svg>
);

const featureKeys = ["liveEditor", "fairPrice", "analytics", "simplicity", "speed"] as const;

const featureSvgs: Record<string, JSX.Element> = {
  liveEditor: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className="w-8 h-8"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
      />
    </svg>
  ),
  fairPrice: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className="w-8 h-8"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  ),
  analytics: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className="w-8 h-8"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"
      />
    </svg>
  ),
  simplicity: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className="w-8 h-8"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z"
      />
    </svg>
  ),
  speed: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className="w-8 h-8"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"
      />
    </svg>
  ),
};

// A list of features with a listicle style.
const FeaturesListicle = () => {
  const t = useTranslations("features");
  const featuresEndRef = useRef<HTMLParagraphElement>(null);
  const [featureSelected, setFeatureSelected] = useState<string>(featureKeys[0]);
  const [hasClicked, setHasClicked] = useState<boolean>(false);

  // Autoscroll the list of features
  useEffect(() => {
    const interval = setInterval(() => {
      if (!hasClicked) {
        const index = featureKeys.indexOf(featureSelected as typeof featureKeys[number]);
        const nextIndex = (index + 1) % featureKeys.length;
        setFeatureSelected(featureKeys[nextIndex]);
      }
    }, 5000);

    try {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            clearInterval(interval);
          }
        },
        {
          root: null,
          rootMargin: "0px",
          threshold: 0.5,
        }
      );
      if (featuresEndRef.current) {
        observer.observe(featuresEndRef.current);
      }
    } catch (e) {
      console.error(e);
    }

    return () => clearInterval(interval);
  }, [featureSelected, hasClicked]);

  return (
    <section className="min-h-screen w-full flex flex-col justify-center py-24 bg-base-100 overflow-hidden" id="features">
      <div className="max-w-3xl mx-auto">
        <div className="bg-base-100 max-md:px-8 max-w-3xl">
          <span className="inline-block px-4 py-1.5 mb-4 md:mb-6 text-sm font-medium bg-primary/10 text-primary rounded-full">
            {t("badge")}
          </span>
          <h2 className="font-extrabold text-2xl md:text-3xl lg:text-5xl tracking-tight mb-4 md:mb-8">
            {t("title")}
          </h2>
          <div className="text-base-content/80 leading-relaxed mb-6 md:mb-8 text-sm md:text-base lg:text-lg">
            {t("subtitle")}
          </div>
        </div>
      </div>

      <div>
        <div className="grid grid-cols-3 md:flex justify-center gap-4 md:gap-12 max-md:px-8 max-w-3xl mx-auto mb-8">
          {featureKeys.map((key) => (
            <span
              key={key}
              onClick={() => {
                if (!hasClicked) setHasClicked(true);
                setFeatureSelected(key);
              }}
              className={`flex flex-col items-center justify-center gap-3 select-none cursor-pointer p-2 duration-200 group`}
            >
              <span
                className={`duration-100 ${featureSelected === key
                  ? "text-primary"
                  : "text-base-content/30 group-hover:text-base-content/50"
                  }`}
              >
                {featureSvgs[key]}
              </span>
              <span
                className={`font-semibold text-sm text-center ${featureSelected === key
                  ? "text-primary"
                  : "text-base-content/50"
                  }`}
              >
                {t(`${key}.name`)}
              </span>
            </span>
          ))}
        </div>
        <div>
          <div className="max-w-3xl mx-auto flex flex-col md:flex-row justify-center md:justify-start md:items-center gap-12">
            <div
              className="text-base-content/80 leading-relaxed space-y-4 px-12 md:px-0 py-12 max-w-xl animate-opacity"
              key={featureSelected}
            >
              <h3 className="font-semibold text-base-content text-lg">
                {t(`${featureSelected}.name`)}
              </h3>

              <ul className="space-y-2">
                {(t.raw(`${featureSelected}.items`) as string[]).map((item: string) => (
                  <li key={item} className="flex items-center gap-3">
                    <CheckIcon />
                    {item}
                  </li>
                ))}
                <li className="flex items-center gap-3 text-accent font-medium">
                  <HighlightIcon />
                  {t(`${featureSelected}.highlight`)}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      {/* End of autoscroll feature */}
      <p className="opacity-0" ref={featuresEndRef}></p>
    </section>
  );
};

export default FeaturesListicle;
