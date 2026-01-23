"use client";

import { useLayoutEffect, useRef } from "react";
import React from "react";
import gsap from "gsap";
import { Button } from "@heroui/react";
import MobileThreads, { MobileThreadsHandle } from "./MobileThreads";

export default function Hero() {
    const containerRef = useRef<HTMLDivElement>(null);
    const textRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLDivElement>(null);
    const threadsRef = useRef<MobileThreadsHandle>(null);

    useLayoutEffect(() => {
        const ctx = gsap.context(() => {
            const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

            // Animate Characters (Title & Highlight)
            tl.fromTo(
                ".char",
                {
                    opacity: 0,
                    rotateY: 90,
                    y: 20
                },
                {
                    opacity: 1,
                    rotateY: 0,
                    y: 0,
                    duration: 0.8,
                    stagger: 0.03,
                    ease: "back.out(1.7)"
                }
            )
                // Animate Description (Typewriter fade in)
                .fromTo(
                    ".desc-char",
                    {
                        opacity: 0
                    },
                    {
                        opacity: 1,
                        duration: 0.5, // Faster fade per char
                        stagger: 0.01,
                        ease: "power1.inOut"
                    },
                    "-=0.4"
                )
                // Buttons
                .fromTo(
                    buttonRef.current,
                    { opacity: 0, y: 20 },
                    { opacity: 1, y: 0, duration: 0.8 },
                    "-=0.2"
                );
        }, containerRef);

        return () => ctx.revert();
    }, []);

    // Bridge events to MobileThreads
    const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
        threadsRef.current?.handlePointerMove(e);
    };

    const handlePointerLeave = () => {
        threadsRef.current?.handlePointerLeave();
    };

    // Helper for sentences to ensure word wrapping
    const SplitSentence = ({ text, className = "" }: { text: string, className?: string }) => {
        return (
            <span className="inline-block">
                {text.split(" ").map((word, i) => (
                    <span key={i} className="inline-block whitespace-nowrap mr-1">
                        {word.split("").map((char, j) => (
                            <span key={j} className={`inline-block ${className}`} style={{ transformStyle: 'preserve-3d' }}>
                                {char}
                            </span>
                        ))}
                    </span>
                ))}
            </span>
        )
    }


    return (
        <div
            ref={containerRef}
            className="relative w-full min-h-screen pointer-events-auto flex items-center overflow-hidden bg-white touch-pan-y"
            onPointerMove={handlePointerMove}
            onPointerLeave={handlePointerLeave}
        >
            {/* Animated Background - Modularized (Now used for both Mobile and Desktop) */}
            <MobileThreads ref={threadsRef} />

            {/* Content Container */}
            <div className="relative w-full max-w-7xl mx-auto px-6 sm:px-8 flex flex-col justify-center h-full pointer-events-auto">
                <div className="max-w-xl md:max-w-2xl text-left text-black drop-shadow-none space-y-6 pointer-events-auto">
                    <div ref={textRef} className="opacity-100 perspective-500">
                        <h1 className="text-5xl md:text-7xl font-bold leading-tight tracking-tight text-gray-900 perspective-500">
                            <SplitSentence text="Build Forms" className="char origin-bottom" />
                            <br />
                            <span className="">
                                <SplitSentence text="Like Magic" className="char origin-bottom" />
                            </span>
                        </h1>
                        <div className="mt-6 text-lg md:text-xl text-gray-700 leading-relaxed font-medium max-w-lg">
                            <SplitSentence text="Create conversational, logic-driven forms in minutes. The most powerful open-source form builder for modern developers." className="desc-char" />
                        </div>
                    </div>

                    <div ref={buttonRef} className="flex flex-wrap gap-4 opacity-0 pt-2">
                        <Button
                            size="lg"
                            className="font-semibold text-lg px-8 text-white bg-gray-900 shadow-lg"
                        // onClick={() => ...}
                        >
                            Get Started
                        </Button>
                        <Button
                            size="lg"
                            variant="ghost"
                            className="font-semibold text-lg px-8 border-2 hover:bg-[#9929EA]/5"
                        >
                            Learn More
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
