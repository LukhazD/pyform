"use client";

import { useEffect, useRef, useState } from "react";

interface ProblemCardProps {
  icon: string;
  title: string;
  description: string;
}

const ProblemCard = ({ icon, title, description }: ProblemCardProps) => (
  <div className="problem-card relative z-10 bg-[#111113]/80 backdrop-blur-xl rounded-2xl p-6 md:p-8 border border-white/5 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)]">
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
  const bgShapesRef = useRef<HTMLDivElement[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  // Use Intersection Observer for visibility, then load GSAP
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Load GSAP only when section is visible
  useEffect(() => {
    if (!isVisible) return;

    const initAnimations = async () => {
      const gsap = (await import("gsap")).default;
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      gsap.registerPlugin(ScrollTrigger);

      const ctx = gsap.context(() => {
        // Parallax background shapes moving organically
        bgShapesRef.current.forEach((shape, i) => {
          gsap.to(shape, {
            y: (i % 2 === 0) ? -150 : -250, // Move up at different speeds
            x: (i % 2 !== 0) ? 50 : -50,    // Slight horizontal drift
            ease: "none",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top bottom",
              end: "bottom top",
              scrub: 1, // Soft scrub for premium feel
            }
          });
        });

        // Animate title
        gsap.fromTo(
          titleRef.current,
          { opacity: 0, y: 50 },
          {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: "power3.out",
            scrollTrigger: {
              trigger: titleRef.current,
              start: "top 85%",
              toggleActions: "play none none reverse",
            },
          }
        );

        // Animate cards with stagger and slight rotation
        gsap.fromTo(
          ".problem-card",
          { opacity: 0, y: 80, scale: 0.95, rotateX: 10, rotateY: -5 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            rotateX: 0,
            rotateY: 0,
            duration: 0.8,
            stagger: 0.2,
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
          { opacity: 0, y: 40, scale: 0.98 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 1,
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
    };

    initAnimations();
  }, [isVisible]);

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
      className="relative bg-gradient-to-b from-gray-900 to-black text-white min-h-screen w-full flex flex-col justify-center py-24 md:py-32 overflow-hidden"
    >
      {/* Flat Geometry Parallax Backgrounds (No Blurs) */}
      <div
        ref={el => { if (el) bgShapesRef.current[0] = el }}
        className="absolute top-[10%] left-[-5%] w-[300px] h-[400px] md:w-[500px] md:h-[600px] bg-indigo-900/40 rounded-[4rem] rotate-12 z-0"
      />
      <div
        ref={el => { if (el) bgShapesRef.current[1] = el }}
        className="absolute top-[40%] right-[-10%] w-[250px] h-[300px] md:w-[400px] md:h-[450px] bg-violet-900/30 rounded-full -rotate-12 z-0"
      />
      <div
        ref={el => { if (el) bgShapesRef.current[2] = el }}
        className="absolute bottom-[-10%] left-[20%] w-[400px] h-[300px] bg-fuchsia-900/20 rounded-[3rem] rotate-45 z-0"
      />

      <div className="relative z-10 max-w-6xl mx-auto px-6 md:px-8">
        {/* Header */}
        <div ref={titleRef} className="text-center mb-8 md:mb-24 perspective-[1200px]">

          <h2 className="text-3xl md:text-6xl font-extrabold tracking-tight mb-4 md:mb-6 max-w-4xl mx-auto leading-[1.1]">
            ¿Cansado de herramientas{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400">
              lentas y complicadas
            </span>
            ?
          </h2>
          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Los constructores corporativos te obligan a pagar facturas monstruosas por formularios que parecen sacados de 2010.
          </p>
        </div>

        {/* Problem Cards */}
        <div
          ref={cardsRef}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8 mb-8 md:mb-32 perspective-[1200px]"
        >
          {problems.map((problem, index) => (
            <ProblemCard key={index} {...problem} />
          ))}
        </div>

        {/* Solution */}
        <div
          ref={solutionRef}
          className="relative text-center bg-[#111113]/90 backdrop-blur-xl rounded-[2.5rem] p-10 md:p-16 border border-white/10 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.6)]"
        >
          <div className="text-5xl mb-6">✨</div>
          <h3 className="text-3xl md:text-4xl font-extrabold mb-5 tracking-tight">
            Con Pyform, todo es diferente
          </h3>
          <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            Edición en tiempo real. Precio plano. Crea experiencias inmersivas
            en minutos, sin sacrificar la elegancia de tu marca.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Problem;
