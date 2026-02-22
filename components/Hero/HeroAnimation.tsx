"use client";

import { useEffect, useRef } from "react";
import React from "react";
import gsap from "gsap";

export default function HeroAnimation() {
    const containerRef = useRef<HTMLDivElement>(null);
    const blocksRef = useRef<HTMLDivElement[]>([]);
    const fillsRef = useRef<HTMLDivElement[]>([]); // To animate the "typing/filling" of inputs
    const buttonFillRef = useRef<HTMLDivElement>(null); // To animate the button success state

    // QuickTo for smooth cursor following
    const xTo = useRef<any>(null);
    const yTo = useRef<any>(null);

    useEffect(() => {
        // Create matchMedia for responsive animations
        let mm = gsap.matchMedia();

        const ctx = gsap.context(() => {
            mm.add("(min-width: 768px)", () => {
                // Desktop Animation - Larger and cyclic

                // Set initial state for 3D perspective
                gsap.set(blocksRef.current, {
                    transformPerspective: 1200,
                    transformStyle: "preserve-3d"
                });

                // Main Timeline: 3s animation + 3s pause = 6s cycle
                const mainTl = gsap.timeline({ repeat: -1, repeatDelay: 2 });

                // 1. Entrance (0 to 1s)
                // 1. Entrance (0 to 1s)
                mainTl.fromTo(blocksRef.current[0], // Name Input
                    { x: 250, y: -100, opacity: 0, rotateX: 45, rotateY: -30, scale: 0.9 },
                    { x: 0, y: -80, opacity: 1, rotateX: 15, rotateY: -15, scale: 1.1, duration: 1, ease: "back.out(1.2)" },
                    0
                )
                    .fromTo(blocksRef.current[1], // Email Input
                        { x: 300, y: -40, opacity: 0, rotateX: 30, rotateY: -45, scale: 0.9 },
                        { x: 30, y: -20, opacity: 1, rotateX: 12, rotateY: -12, scale: 1.1, duration: 1, ease: "back.out(1.2)" },
                        0.1
                    )
                    .fromTo(blocksRef.current[2], // Radio/Select
                        { x: 200, y: 30, opacity: 0, rotateX: 50, rotateY: -20, scale: 0.9 },
                        { x: 60, y: 40, opacity: 1, rotateX: 18, rotateY: -18, scale: 1.1, duration: 1, ease: "back.out(1.2)" },
                        0.2
                    )
                    .fromTo(blocksRef.current[3], // Submit Button
                        { x: 150, y: 100, opacity: 0, rotateX: 60, rotateY: -20, scale: 0.9 },
                        { x: 20, y: 80, opacity: 1, rotateX: 25, rotateY: -10, scale: 1.15, duration: 1, ease: "back.out(1.2)" },
                        0.3
                    );

                // 2. Filling the form (1s to 2s)
                // Reset fills first
                mainTl.set(fillsRef.current, { scaleX: 0, transformOrigin: "left center", opacity: 0 }, 0);
                mainTl.set(buttonFillRef.current, { backgroundColor: "#8b5cf6" }, 0); // Reset button to violet

                mainTl.to(fillsRef.current[0], { scaleX: 1, opacity: 1, duration: 0.3, ease: "power2.out" }, 1.2)
                    .to(fillsRef.current[1], { scaleX: 1, opacity: 1, duration: 0.4, ease: "power2.out" }, 1.5)
                    .to(fillsRef.current[2], { backgroundColor: "#8b5cf6", duration: 0.2 }, 1.8); // Select radio

                // 3. Submitting (2s to 2.5s)
                mainTl.to(blocksRef.current[3], { scale: 1.05, duration: 0.1, yoyo: true, repeat: 1 }, 2.2) // Button click bump
                    .to(buttonFillRef.current, { backgroundColor: "#10b981", duration: 0.3 }, 2.4); // Button turns green (success)

                // 4. Exit / Fly away (2.8s to 3.5s)
                mainTl.to(blocksRef.current, {
                    x: "-=300",
                    y: "-=100",
                    opacity: 0,
                    rotateY: "-=20",
                    stagger: 0.1,
                    duration: 0.6,
                    ease: "power2.in"
                }, 3.5);

                // Continuous floating animation (Desktop) - Independent of the cycle
                blocksRef.current.forEach((block, i) => {
                    gsap.to(block, {
                        y: `+=${15 + i * 5}`,
                        rotateX: `+=${2 + i}`,
                        rotateY: `-=${3 + i}`,
                        duration: 3 + i * 0.5,
                        ease: "sine.inOut",
                        yoyo: true,
                        repeat: -1
                    });
                });
            });

            mm.add("(max-width: 767px)", () => {
                // Mobile/Tablet Animation
                const tl = gsap.timeline({
                    defaults: { ease: "power3.out" }
                });

                // Entry Animation (Mobile) - Pushed down and right, scaled down to fit 4 cards
                tl.fromTo(blocksRef.current[0], // Name
                    { x: 30, y: 100, opacity: 0, scale: 0.65, rotateX: 10, rotateY: -10 },
                    { x: 10, y: 20, opacity: 0.85, scale: 0.75, rotateX: 15, rotateY: -5, duration: 1 }
                )
                    .fromTo(blocksRef.current[1], // Email
                        { x: 50, y: 140, opacity: 0, scale: 0.6, rotateX: 15, rotateY: -15 },
                        { x: 20, y: 50, opacity: 0.9, scale: 0.7, rotateX: 12, rotateY: -8, duration: 1 },
                        "-=0.8"
                    )
                    .fromTo(blocksRef.current[2], // Radio
                        { x: 70, y: 180, opacity: 0, scale: 0.55, rotateX: 20, rotateY: -20 },
                        { x: 30, y: 80, opacity: 0.95, scale: 0.65, rotateX: 10, rotateY: -10, duration: 1 },
                        "-=0.8"
                    )
                    .fromTo(blocksRef.current[3], // Button
                        { x: 90, y: 220, opacity: 0, scale: 0.5, rotateX: 30, rotateY: -15 },
                        { x: 40, y: 120, opacity: 1, scale: 0.6, rotateX: 20, rotateY: -5, duration: 1 },
                        "-=0.8"
                    );

                // Continuous subtle floating (Mobile)
                blocksRef.current.forEach((block, i) => {
                    gsap.to(block, {
                        y: `+=${6 + i * 1.5}`,
                        rotateX: `+=${1 + i}`,
                        duration: 3.5 + i * 0.5,
                        ease: "sine.inOut",
                        yoyo: true,
                        repeat: -1,
                        delay: tl.duration()
                    });
                });
            });
        }, containerRef);

        return () => {
            mm.revert();
            ctx.revert();
        };
    }, []);

    const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
        if (!containerRef.current || !xTo.current || !yTo.current) return;

        // Only run quickTo on desktop to save mobile performance
        if (window.innerWidth >= 768) {
            const rect = containerRef.current.getBoundingClientRect();
            // Center the glow on the cursor
            xTo.current(e.clientX - rect.left - 200); // 200 is half the glow width
            yTo.current(e.clientY - rect.top - 200);
        }
    };

    return (
        <div
            ref={containerRef}
            className="absolute inset-0 z-0 overflow-hidden bg-[#FAFAFA] flex items-center justify-center md:justify-end md:pr-[10%]"
            onPointerMove={handlePointerMove}
        >
            {/* Interactive Grid Background */}
            <div
                className="absolute inset-0 opacity-40 mix-blend-multiply"
                style={{
                    backgroundImage: `radial-gradient(#E5E7EB 1px, transparent 1px)`,
                    backgroundSize: '24px 24px'
                }}
            />

            {/* Aurora Background Glows (Always visible, animated slowly) */}
            <div className="absolute top-1/4 md:top-1/2 left-1/4 w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-violet-400/30 rounded-full blur-[80px] md:blur-[120px] mix-blend-multiply animate-pulse" style={{ animationDuration: '8s' }} />
            <div className="absolute bottom-1/4 right-1/4 w-[250px] md:w-[400px] h-[250px] md:h-[400px] bg-cyan-400/20 rounded-full blur-[80px] md:blur-[100px] mix-blend-multiply animate-pulse" style={{ animationDuration: '10s' }} />

            {/* 3D Form Elements Container - Scaled up for Desktop */}
            <div className="relative w-full max-w-sm md:max-w-2xl h-[400px] md:h-[600px] mt-[45vh] md:mt-0 opacity-100 pointer-events-none perspective-[1200px] flex flex-col items-center md:items-end justify-center px-4 md:px-0 md:mr-10">

                {/* Block 1: Name Input (NEW) */}
                <div
                    ref={el => { if (el) blocksRef.current[0] = el }}
                    className="absolute z-40 w-full max-w-[340px] bg-white rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.04)] border border-gray-100 p-4"
                >
                    <div className="h-4 w-16 bg-gray-200/60 rounded-md mb-3"></div>
                    <div className="h-10 w-full bg-gray-50/50 rounded-lg border border-gray-100/50 flex items-center px-3 relative overflow-hidden">
                        <div className="h-4 w-32 bg-gray-200/50 rounded-md"></div>
                        {/* Fill animation layer */}
                        <div ref={el => { if (el) fillsRef.current[0] = el }} className="absolute left-3 h-4 w-24 bg-gray-800 rounded-md scale-x-0 opacity-0"></div>
                    </div>
                </div>

                {/* Block 2: Email Input */}
                <div
                    ref={el => { if (el) blocksRef.current[1] = el }}
                    className="absolute z-30 w-full max-w-[340px] bg-white rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.06)] border border-gray-100 p-4 mt-8"
                >
                    <div className="h-4 w-24 bg-gray-200/60 rounded-md mb-3"></div>
                    <div className="h-10 w-full bg-gray-50/50 rounded-lg border border-gray-100/50 flex items-center px-3 relative overflow-hidden">
                        <div className="h-4 w-40 bg-gray-200/50 rounded-md"></div>
                        {/* Fill animation layer */}
                        <div ref={el => { if (el) fillsRef.current[1] = el }} className="absolute left-3 h-4 w-36 bg-gray-800 rounded-md scale-x-0 opacity-0"></div>
                    </div>
                </div>

                {/* Block 3: Radio Selection */}
                <div
                    ref={el => { if (el) blocksRef.current[2] = el }}
                    className="absolute z-20 w-full max-w-[320px] bg-white rounded-xl shadow-[0_12px_40px_rgba(0,0,0,0.08)] border border-gray-100 p-5 mt-[100px]"
                >
                    <div className="h-4 w-28 bg-gray-200/60 rounded-md mb-4"></div>
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="h-5 w-5 rounded-full border-2 border-gray-300 flex items-center justify-center transition-colors duration-300" ref={el => { if (el) fillsRef.current[2] = el }}>
                                <div className="h-2 w-2 rounded-full bg-white"></div>
                            </div>
                            <div className="h-3 w-36 bg-gray-200/80 rounded-md"></div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="h-5 w-5 rounded-full border-2 border-gray-200"></div>
                            <div className="h-3 w-48 bg-gray-200/50 rounded-md"></div>
                        </div>
                    </div>
                </div>

                {/* Block 4: Submit Button */}
                <div
                    ref={el => { if (el) blocksRef.current[3] = el }}
                    className="absolute z-10 w-full max-w-[300px] bg-white rounded-xl shadow-[0_12px_40px_rgba(139,92,246,0.15)] p-4 flex justify-center mt-[160px] border border-violet-100"
                >
                    <div ref={buttonFillRef} className="h-10 w-full bg-violet-500 rounded-lg flex items-center justify-center transition-colors">
                        <div className="h-4 w-20 bg-white/90 rounded-md"></div>
                    </div>
                </div>

            </div>
        </div>
    );
}
