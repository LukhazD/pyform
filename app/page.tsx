"use client";

import dynamic from "next/dynamic";
import { Suspense, useEffect, useRef } from "react";
import React from "react"; // Added React for React.Children.map

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

// Headless GSAP Controller to handle the overlapping parallax without wrapping React nodes
const DeckController = (): null => {
  useEffect(() => {
    let ctx: any;

    const initGsap = async () => {
      const gsap = (await import("gsap")).default;
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      gsap.registerPlugin(ScrollTrigger);

      ctx = gsap.context(() => {
        // 1. Pin Hero until Problem fully slides over it
        ScrollTrigger.create({
          trigger: "#deck-hero",
          start: "top top",
          endTrigger: "#deck-problem",
          end: "top top",
          pin: true,
          pinSpacing: false,
        });

        // 2. Problem scrolls normally. Pin it when its bottom reaches the screen fold,
        // allowing Features to slide up and cover it. Unpin when Features covers it completely.
        ScrollTrigger.create({
          trigger: "#deck-problem",
          start: "bottom bottom",
          endTrigger: "#deck-features",
          end: "top top",
          pin: true,
          pinSpacing: false,
        });
      });
    };

    initGsap();
    return () => {
      if (ctx) ctx.revert();
    };
  }, []);

  return null;
};

export default function Page() {
  return (
    <main>
      <Suspense fallback={<div className="h-16" />}>
        <Header />
      </Suspense>

      <DeckController />

      <div className="relative w-full">
        {/* GSAP Managed Deck purely for Hero -> Problem -> Features overlap */}

        <div id="deck-hero" className="relative w-full z-10 min-h-screen">
          <Hero />
        </div>

        <div id="deck-problem" className="relative w-full z-20 shadow-[0_-20px_40px_rgba(0,0,0,0.5)] bg-black">
          <Problem />
        </div>

        <div id="deck-features" className="relative w-full z-30 shadow-[0_-20px_40px_rgba(0,0,0,0.3)] bg-base-100">
          <Features />
        </div>

        {/* Normal scroll sections flow normally underneath */}
        <div className="relative w-full z-40 bg-base-200">
          <Pricing />
        </div>
        <div className="relative w-full z-40 bg-gray-50">
          <FAQ />
        </div>
        <div className="relative w-full z-40 bg-gradient-to-b from-gray-900 to-black text-white">
          <CTA />
        </div>
        <div className="relative w-full z-40 bg-base-200">
          <Footer />
        </div>
      </div>
    </main>
  );
}
