"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";

// Critical components - load immediately
import Header from "@/components/Header";

// Hero loads with priority but with SSR disabled for GSAP compatibility
const Hero = dynamic(() => import("@/components/Hero/Hero"), {
  ssr: false,
  loading: () => (
    <div className="relative w-full min-h-screen flex items-center bg-white">
      <div className="w-full max-w-7xl mx-auto px-6 sm:px-8">
        <div className="max-w-xl md:max-w-2xl space-y-6 animate-pulse">
          <div className="h-16 bg-gray-200 rounded-lg w-3/4"></div>
          <div className="h-16 bg-gradient-to-r from-purple-200 to-pink-200 rounded-lg w-1/2"></div>
          <div className="h-6 bg-gray-100 rounded w-full mt-6"></div>
          <div className="h-6 bg-gray-100 rounded w-2/3"></div>
          <div className="flex gap-4 mt-8">
            <div className="h-12 bg-gray-900 rounded-lg w-32"></div>
            <div className="h-12 bg-gray-100 border-2 rounded-lg w-36"></div>
          </div>
        </div>
      </div>
    </div>
  ),
});

// Below-the-fold components - lazy load
const Problem = dynamic(() => import("@/components/Problem"), {
  loading: () => <div className="min-h-[50vh] bg-gradient-to-b from-gray-900 to-black" />,
});

const Features = dynamic(() => import("@/components/FeaturesListicle"), {
  loading: () => <div className="min-h-[50vh] bg-base-100" />,
});

const Pricing = dynamic(() => import("@/components/Pricing"), {
  loading: () => <div className="min-h-[50vh]" />,
});

const FAQ = dynamic(() => import("@/components/FAQ"), {
  loading: () => <div className="min-h-[30vh]" />,
});

const CTA = dynamic(() => import("@/components/CTA"), {
  loading: () => <div className="min-h-[30vh]" />,
});

const Footer = dynamic(() => import("@/components/Footer"), {
  loading: () => <div className="min-h-[20vh] bg-base-200" />,
});

export default function Page() {
  return (
    <main>
      <Suspense fallback={<div className="h-16" />}>
        <Header />
      </Suspense>
      <Hero />
      <Problem />
      <Features />
      <Pricing />
      <FAQ />
      <CTA />
      <Footer />
    </main>
  );
}
