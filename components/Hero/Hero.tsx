"use client";

import { useEffect, useRef, useState } from "react";
import React from "react";
import { Button } from "@heroui/react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import HeroAnimation from "./HeroAnimation";

// Lazy load GSAP - only when needed for animations
const loadGsap = () => import("gsap").then(mod => mod.default);

// Profesiones que rotan en el hero
const professions = [
    "Desarrolladores",
    "Marketers",
    "Diseñadores",
    "Startups",
    "Emprendedores",
    "Freelancers",
];

export default function Hero() {
    const router = useRouter();
    const containerRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLDivElement>(null);
    const professionRef = useRef<HTMLSpanElement>(null);

    const [currentProfession, setCurrentProfession] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);

    // Load GSAP and start animations after initial render
    useEffect(() => {
        let gsap: typeof import("gsap").default;

        const init = async () => {
            gsap = await loadGsap();
            setIsLoaded(true);

            // Initial entrance animation
            const ctx = gsap.context(() => {
                const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

                tl.fromTo(
                    ".hero-title",
                    { opacity: 0.5, y: 10 },
                    { opacity: 1, y: 0, duration: 0.4 }
                )
                    .fromTo(
                        ".hero-profession",
                        { opacity: 0.5, y: 10 },
                        { opacity: 1, y: 0, duration: 0.3 },
                        "-=0.2"
                    )
                    .fromTo(
                        ".hero-description",
                        { opacity: 0.5 },
                        { opacity: 1, duration: 0.3 },
                        "-=0.2"
                    )
                    .fromTo(
                        buttonRef.current,
                        { opacity: 0.5 },
                        { opacity: 1, duration: 0.3 },
                        "-=0.1"
                    );
            }, containerRef);

            return () => ctx.revert();
        };

        init();
    }, []);

    // Rotación automática de profesiones after load
    useEffect(() => {
        if (!isLoaded) return;

        let gsap: typeof import("gsap").default;
        let intervalId: ReturnType<typeof setInterval>;

        const startRotation = async () => {
            gsap = await loadGsap();

            intervalId = setInterval(() => {
                if (isAnimating) return;

                setIsAnimating(true);

                gsap.to(professionRef.current, {
                    y: -15,
                    opacity: 0,
                    duration: 0.25,
                    ease: "power2.in",
                    onComplete: () => {
                        setCurrentProfession((prev) => (prev + 1) % professions.length);

                        gsap.fromTo(
                            professionRef.current,
                            { y: 15, opacity: 0 },
                            {
                                y: 0,
                                opacity: 1,
                                duration: 0.25,
                                ease: "power2.out",
                                onComplete: () => setIsAnimating(false)
                            }
                        );
                    }
                });
            }, 2500);
        };

        startRotation();

        return () => {
            if (intervalId) clearInterval(intervalId);
        };
    }, [isLoaded, isAnimating]);

    return (
        <div
            ref={containerRef}
            className="relative w-full min-h-screen pointer-events-auto flex items-center justify-center overflow-hidden bg-[#FAFAFA]"
        >
            {/* Animated 3D Grid Background */}
            <HeroAnimation />

            {/* Content Container - visible immediately */}
            <div className="relative w-full max-w-7xl mx-auto px-6 sm:px-8 flex flex-col justify-center h-full pointer-events-auto">
                <div className="max-w-xl md:max-w-2xl text-left text-black drop-shadow-none space-y-6 pointer-events-auto">
                    <div className="opacity-100">
                        <h1 className="text-5xl md:text-7xl font-bold leading-tight tracking-tight text-gray-900">
                            <span className="hero-title block">Formularios para</span>
                            <span
                                ref={professionRef}
                                className="hero-profession block text-gray-600"
                            >
                                {professions[currentProfession]}
                            </span>
                        </h1>
                        <p className="hero-description mt-6 text-lg md:text-xl text-gray-600 leading-relaxed max-w-lg">
                            Crea formularios de lujo en minutos.
                            Simple, rápido y a una fracción del costo.
                        </p>
                    </div>

                    <div ref={buttonRef} className="flex flex-wrap gap-4 pt-2">
                        <Button
                            size="lg"
                            radius="md"
                            color="default"
                            className="font-semibold text-lg px-8 text-white bg-gray-900 shadow-lg hover:bg-gray-800"
                            onPress={() => router.push("/auth/signin")}
                        >
                            Empezar
                        </Button>
                        <Button
                            size="lg"
                            radius="md"
                            variant="bordered"
                            className="font-semibold text-lg px-8"
                            onPress={() => document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" })}
                        >
                            Más información
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
