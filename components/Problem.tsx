"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

interface ProblemCardProps {
  icon: string;
  title: string;
  description: string;
}

const ProblemCard = ({ icon, title, description }: ProblemCardProps) => (
  <div className="problem-card bg-white/5 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-white/10 hover:border-white/20 transition-colors">
    <div className="text-4xl mb-4">{icon}</div>
    <h3 className="text-xl font-bold mb-2 text-white">{title}</h3>
    <p className="text-gray-400 leading-relaxed">{description}</p>
  </div>
);

const Problem = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const solutionRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      // Animate title
      gsap.fromTo(
        titleRef.current,
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: {
            trigger: titleRef.current,
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
        }
      );

      // Animate cards with stagger
      gsap.fromTo(
        ".problem-card",
        { opacity: 0, y: 60, scale: 0.95 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.6,
          stagger: 0.15,
          ease: "power3.out",
          scrollTrigger: {
            trigger: cardsRef.current,
            start: "top 80%",
            toggleActions: "play none none reverse",
          },
        }
      );

      // Animate solution section
      gsap.fromTo(
        solutionRef.current,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: {
            trigger: solutionRef.current,
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const problems: ProblemCardProps[] = [
    {
      icon: "💸",
      title: "Precios impredecibles",
      description: "Cuantas más respuestas recibes, más pagas. Tus costos se disparan justo cuando más éxito tienes.",
    },
    {
      icon: "🔄",
      title: "Vista previa separada",
      description: "Editas en un lugar, previsualizas en otro. Y cuando publicas... nunca se ve igual.",
    },
    {
      icon: "🧩",
      title: "Complejidad innecesaria",
      description: "100 funciones que jamás usarás. Interfaces sobrecargadas que ralentizan tu trabajo.",
    },
  ];

  return (
    <section
      ref={sectionRef}
      className="bg-gradient-to-b from-gray-900 to-black text-white py-20 md:py-32 overflow-hidden"
    >
      <div className="max-w-6xl mx-auto px-6 md:px-8">
        {/* Header */}
        <div ref={titleRef} className="text-center mb-16 md:mb-20">
          <span className="inline-block px-4 py-1.5 mb-6 text-sm font-medium bg-purple-500/10 text-purple-400 rounded-full border border-purple-500/20">
            El problema
          </span>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6 max-w-3xl mx-auto leading-tight">
            ¿Cansado de herramientas{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
              complicadas
            </span>
            ?
          </h2>
          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Los constructores de formularios actuales te obligan a elegir entre calidad y precio.
            Nosotros creemos que mereces ambos.
          </p>
        </div>

        {/* Problem Cards */}
        <div
          ref={cardsRef}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-16 md:mb-20"
        >
          {problems.map((problem, index) => (
            <ProblemCard key={index} {...problem} />
          ))}
        </div>

        {/* Solution */}
        <div
          ref={solutionRef}
          className="text-center bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-3xl p-8 md:p-12 border border-purple-500/20"
        >
          <div className="text-4xl mb-4">✨</div>
          <h3 className="text-2xl md:text-3xl font-bold mb-4">
            Con Pyform, todo es diferente
          </h3>
          <p className="text-gray-400 text-lg max-w-xl mx-auto leading-relaxed">
            Edición en tiempo real. Precio plano y predecible.
            Crea formularios profesionales en minutos, sin sorpresas.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Problem;
