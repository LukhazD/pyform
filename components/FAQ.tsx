"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";

interface FAQItemProps {
  question: string;
  answerHtml: string;
}

const questionKeys = [
  "questionTypes",
  "editor",
  "stats",
  "customization",
  "subscription",
  "fileUpload",
] as const;

const FaqItem = ({ item }: { item: FAQItemProps }) => {
  const accordion = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  return (
    <li className="group">
      <button
        className={`relative flex gap-4 items-center w-full py-5 px-6 text-base font-semibold text-left rounded-2xl transition-all duration-200 ${isOpen
          ? "bg-white shadow-sm ring-1 ring-gray-200"
          : "hover:bg-gray-100/80"
          }`}
        onClick={(e) => {
          e.preventDefault();
          setIsOpen(!isOpen);
        }}
        aria-expanded={isOpen}
      >
        <span
          className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold shrink-0 transition-colors duration-200 ${isOpen
            ? "bg-gray-900 text-white"
            : "bg-gray-200 text-gray-500 group-hover:bg-gray-300"
            }`}
        >
          {isOpen ? "−" : "+"}
        </span>
        <span
          className={`flex-1 ${isOpen ? "text-gray-900" : "text-gray-700"
            }`}
        >
          {item?.question}
        </span>
        <svg
          className={`flex-shrink-0 w-5 h-5 transition-transform duration-300 ${isOpen ? "rotate-180 text-gray-900" : "text-gray-400"
            }`}
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19.5 8.25l-7.5 7.5-7.5-7.5"
          />
        </svg>
      </button>

      <div
        ref={accordion}
        className="transition-all duration-300 ease-in-out overflow-hidden"
        style={
          isOpen
            ? { maxHeight: accordion?.current?.scrollHeight, opacity: 1 }
            : { maxHeight: 0, opacity: 0 }
        }
      >
        <div
          className="px-6 pb-5 pt-2 ml-14 text-gray-600 leading-relaxed space-y-2"
          dangerouslySetInnerHTML={{ __html: item?.answerHtml }}
        />
      </div>
    </li>
  );
};

const FAQ = () => {
  const t = useTranslations("faq");

  const faqList: FAQItemProps[] = questionKeys.map((key) => {
    const answer = t.raw(`questions.${key}.answer`) as string;
    const hasAnswer2 = t.has(`questions.${key}.answer2`);
    const answer2 = hasAnswer2 ? t.raw(`questions.${key}.answer2`) as string : undefined;
    const answerHtml = answer2
      ? `<p>${answer}</p><p>${answer2}</p>`
      : `<p>${answer}</p>`;

    return {
      question: t(`questions.${key}.question`),
      answerHtml,
    };
  });

  return (
    <section className="bg-gray-50 py-20 md:py-28 overflow-hidden" id="faq">
      <div className="max-w-3xl mx-auto px-6 md:px-8">
        {/* Header */}
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-gray-900 mb-4">
            {t("title")}
          </h2>
          <p className="text-gray-500 text-lg max-w-xl mx-auto">
            {t("subtitle")}
          </p>
        </div>

        {/* Questions */}
        <ul className="flex flex-col gap-2">
          {faqList.map((item, i) => (
            <FaqItem key={i} item={item} />
          ))}
        </ul>
      </div>
    </section>
  );
};

export default FAQ;
