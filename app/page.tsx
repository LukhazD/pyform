"use client";
import Hero from "@/components/Hero/Hero";
import CTA from "@/components/CTA";
import Header from "@/components/Header";
import Features from "@/components/FeaturesListicle";
import FAQ from "@/components/FAQ";
import Problem from "@/components/Problem";
import Footer from "@/components/Footer";

export default function Page() {
  return (
    <main>
      <Header />


      <Hero />
      <Problem />
      <Features />

      <FAQ />
      <CTA />
      <Footer />
    </main>
  );
}
