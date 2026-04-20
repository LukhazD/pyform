import config from "@/config";
import ButtonCheckout from "./ButtonCheckout";
import { useTranslations } from "next-intl";

// Translation key mapping for plan names/descriptions/features
const PLAN_I18N_MAP: Record<number, {
  nameKey: string;
  descriptionKey: string;
  featureKeys: string[];
}> = {
  0: {
    nameKey: "plans.proMonthly.name",
    descriptionKey: "plans.proMonthly.description",
    featureKeys: [
      "features.unlimitedForms",
      "features.responsesPerForm",
      "features.questionTypes",
      "features.liveEditor",
      "features.advancedStats",
      "features.csvExport",
      "features.googleLogin",
      "features.emailSupport",
    ],
  },
  1: {
    nameKey: "plans.proAnnual.name",
    descriptionKey: "plans.proAnnual.description",
    featureKeys: [
      "features.unlimitedForms",
      "features.responsesPerForm",
      "features.questionTypes",
      "features.liveEditor",
      "features.advancedStats",
      "features.csvExport",
      "features.googleLogin",
      "features.prioritySupport",
    ],
  },
};

const Pricing = () => {
  const t = useTranslations("pricing");

  return (
    <section className="bg-base-200 overflow-hidden" id="pricing">
      <div className="py-24 px-8 max-w-5xl mx-auto w-full">
        <div className="flex flex-col text-center w-full mb-20">
          <p className="font-medium text-primary mb-8">{t("label")}</p>
          <h2 className="font-bold text-3xl lg:text-5xl tracking-tight">
            {t("title")}
          </h2>
        </div>

        <div className="relative flex justify-center flex-col lg:flex-row items-center lg:items-stretch gap-8">
          {config.stripe.plans.map((plan, planIndex) => (
            <div key={plan.priceId} className="relative w-full max-w-lg">
              {plan.isFeatured && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
                  <span
                    className={`badge text-xs text-primary-content font-semibold border-0 bg-primary`}
                  >
                    {t("popular")}
                  </span>
                </div>
              )}

              {plan.isFeatured && (
                <div
                  className={`absolute -inset-[1px] rounded-[9px] bg-primary z-10`}
                ></div>
              )}

              <div className="relative flex flex-col h-full gap-5 lg:gap-8 z-10 bg-base-100 p-8 rounded-lg">
                <div className="flex justify-between items-center gap-4">
                  <div>
                    <p className="text-lg lg:text-xl font-bold">
                      {PLAN_I18N_MAP[planIndex] ? t(PLAN_I18N_MAP[planIndex].nameKey) : plan.name}
                    </p>
                    {(PLAN_I18N_MAP[planIndex]?.descriptionKey || plan.description) && (
                      <p className="text-base-content/80 mt-2">
                        {PLAN_I18N_MAP[planIndex] ? t(PLAN_I18N_MAP[planIndex].descriptionKey) : plan.description}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  {plan.priceAnchor && (
                    <div className="flex flex-col justify-end mb-[4px] text-lg ">
                      <p className="relative">
                        <span className="absolute bg-base-content h-[1.5px] inset-x-0 top-[53%]"></span>
                        <span className="text-base-content/80">
                          ${plan.priceAnchor}
                        </span>
                      </p>
                    </div>
                  )}
                  <p className={`text-5xl tracking-tight font-extrabold`}>
                    ${plan.price}
                  </p>
                  <div className="flex flex-col justify-end mb-[4px]">
                    <p className="text-xs text-base-content/60 uppercase font-semibold">
                      USD
                    </p>
                  </div>
                </div>
                {plan.trialPeriodDays && (
                  <div className="mb-2 w-fit bg-primary/10 text-primary border border-primary/20 px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                    </span>
                    {t("trialBadge", { trialDays: plan.trialPeriodDays })}
                  </div>
                )}
                {(PLAN_I18N_MAP[planIndex]?.featureKeys || plan.features) && (
                  <ul className="space-y-2.5 leading-relaxed text-base flex-1">
                    {(PLAN_I18N_MAP[planIndex]?.featureKeys ?? []).map((featureKey, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          className="w-[18px] h-[18px] opacity-80 shrink-0"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                            clipRule="evenodd"
                          />
                        </svg>

                        <span>{t(featureKey)}</span>
                      </li>
                    ))}
                  </ul>
                )}
                <div className="space-y-2">
                  <ButtonCheckout priceId={plan.priceId} trialPeriodDays={plan.trialPeriodDays} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Pricing;
