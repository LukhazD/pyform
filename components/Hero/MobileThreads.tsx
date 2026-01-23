"use client";

import { useLayoutEffect, useRef, forwardRef, useImperativeHandle, useState, useEffect, useCallback } from "react";
import React from "react";
import gsap from "gsap";

export interface MobileThreadsHandle {
    handlePointerMove: (e: React.PointerEvent<HTMLDivElement>) => void;
    handlePointerLeave: () => void;
}

interface ThreadData {
    id: string;
    color: string;
    width: number;
    basePath: {
        start: [number, number];
        ctrl: [number, number];
        end: [number, number];
    };
}

const MobileThreads = forwardRef<MobileThreadsHandle>((_, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const threadRefs = useRef<(SVGPathElement | null)[]>([]);

    // Dynamic threads state
    const [threads, setThreads] = useState<ThreadData[]>([]);

    // Store physics and animation state
    const threadStates = useRef<{
        baseCtrl: { x: number; y: number }; // The original center
        physicsOffset: { x: number; y: number };
        isHovered: boolean;
        // Params for sine wave animation
        ambient: {
            speed: number;
            phase: number;
            ampX: number;
            ampY: number;
        }
    }[]>([]);

    // 1. Generate Random Threads on Mount
    useEffect(() => {
        // Determine count based on device width
        const isDesktop = window.innerWidth > 768;
        const count = isDesktop ? 20 : 8; // More threads on desktop as requested

        const generated: ThreadData[] = [];

        for (let i = 0; i < count; i++) {
            const isGrad1 = Math.random() > 0.5;
            // Randomize X positions for diversity
            const startX = gsap.utils.random(-10, 110);
            const endX = gsap.utils.random(-10, 110);
            const ctrlX = gsap.utils.random(0, 100);

            // Randomize Control Y for different "bend" heights
            const ctrlY = gsap.utils.random(30, 70);

            generated.push({
                id: `t-${i}-${Date.now()}`,
                color: isGrad1 ? "url(#grad1)" : "url(#grad2)",
                width: gsap.utils.random(0.5, 2.5),
                basePath: {
                    start: [startX, -20], // Always start top
                    ctrl: [ctrlX, ctrlY],
                    end: [endX, 120],     // Always end bottom
                }
            });
        }

        // Initialize the state refs for these new threads
        threadStates.current = generated.map((t) => ({
            baseCtrl: { x: t.basePath.ctrl[0], y: t.basePath.ctrl[1] },
            physicsOffset: { x: 0, y: 0 },
            isHovered: false,
            ambient: {
                speed: gsap.utils.random(0.3, 0.8),
                phase: gsap.utils.random(0, Math.PI * 2),
                ampX: gsap.utils.random(10, 25),
                ampY: gsap.utils.random(8, 15)
            }
        }));

        setThreads(generated);
    }, []);

    useImperativeHandle(ref, () => ({
        handlePointerMove: (e: React.PointerEvent<HTMLDivElement>) => {
            if (!containerRef.current) return;
            const rect = containerRef.current.getBoundingClientRect();
            const relX = ((e.clientX - rect.left) / rect.width) * 100;
            const relY = ((e.clientY - rect.top) / rect.height) * 100;

            const time = gsap.ticker.time;

            threads.forEach((_, i) => {
                const state = threadStates.current[i];
                if (!state) return;

                // Calculate current position for collision detection (Approximate)
                // We use baseCtrl + physics because ambient is just visual drift
                const currentX = state.baseCtrl.x + Math.sin(time * state.ambient.speed + state.ambient.phase) * state.ambient.ampX;
                const currentY = state.baseCtrl.y + Math.cos(time * state.ambient.speed + state.ambient.phase) * state.ambient.ampY;

                const distX = relX - currentX;
                const distY = relY - currentY;
                const dist = Math.sqrt(distX * distX + distY * distY);
                const radius = 25;

                if (dist < radius) {
                    state.isHovered = true;
                    // Lower force and smoother ease
                    const pushForce = 5;
                    const strength = Math.pow(1 - dist / radius, 2);

                    const pushDirX = distX === 0 ? 1 : -distX;
                    const pushDirY = -distY;

                    const tx = (pushDirX / dist) * strength * pushForce;
                    const ty = (pushDirY / dist) * strength * (pushForce * 0.5);

                    gsap.to(state.physicsOffset, {
                        x: tx, y: ty,
                        duration: 0.5,
                        ease: "power2.out",
                        overwrite: "auto"
                    });
                } else if (state.isHovered) {
                    state.isHovered = false;
                    gsap.to(state.physicsOffset, {
                        x: 0, y: 0,
                        duration: 1.2,
                        ease: "elastic.out(1, 0.5)",
                        overwrite: "auto"
                    });
                }
            });
        },
        handlePointerLeave: () => {
            threadStates.current.forEach(state => {
                if (!state) return;
                if (state.isHovered || state.physicsOffset.x !== 0 || state.physicsOffset.y !== 0) {
                    state.isHovered = false;
                    gsap.to(state.physicsOffset, {
                        x: 0, y: 0,
                        duration: 1.2,
                        ease: "elastic.out(1, 0.5)",
                        overwrite: "auto"
                    });
                }
            });
        }
    }));

    const renderThread = useCallback((index: number) => {
        const el = threadRefs.current[index];
        const state = threadStates.current[index];
        const thread = threads[index];

        if (!el || !state || !thread) return;

        const time = gsap.ticker.time;

        // Math-based smooth sine wave for ambient motion
        const ambientX = Math.sin(time * state.ambient.speed + state.ambient.phase) * state.ambient.ampX;
        const ambientY = Math.cos(time * state.ambient.speed + state.ambient.phase) * state.ambient.ampY;

        const x = state.baseCtrl.x + ambientX + state.physicsOffset.x;
        const y = state.baseCtrl.y + ambientY + state.physicsOffset.y;

        const d = `M ${thread.basePath.start[0]} ${thread.basePath.start[1]} Q ${x} ${y} ${thread.basePath.end[0]} ${thread.basePath.end[1]}`;
        el.setAttribute("d", d);
    }, [threads]);

    const renderAllThreads = useCallback(() => {
        // Batch update DOM
        threads.forEach((_, i) => {
            renderThread(i);
        });
    }, [renderThread, threads]);

    useLayoutEffect(() => {
        if (threads.length === 0) return; // Wait for hydration

        const ctx = gsap.context(() => {
            gsap.fromTo(".mobile-thread",
                { strokeDasharray: 1200, strokeDashoffset: 1200, opacity: 0 },
                { strokeDashoffset: 0, opacity: 1, duration: 2.5, ease: "power3.out", stagger: 0.1 }
            );

            // No GSAP Tweens for ambient loop anymore
            // Purely handled in ticker -> renderThread

            gsap.ticker.add(renderAllThreads);

        }, containerRef);

        return () => {
            gsap.ticker.remove(renderAllThreads);
            ctx.revert();
        }
    }, [threads, renderAllThreads]); // Re-run when threads are generated

    return (
        <div
            ref={containerRef}
            className="absolute inset-0 z-0 overflow-hidden bg-white touch-pan-y pointer-events-auto"
        >
            <svg
                className="absolute w-full h-full scale-110 pointer-events-none"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
            >
                <defs>
                    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#9929EA" stopOpacity="0.5" />
                        <stop offset="100%" stopColor="#5B23FF" stopOpacity="0.0" />
                    </linearGradient>
                    <linearGradient id="grad2" x1="100%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#008BFF" stopOpacity="0.0" />
                        <stop offset="100%" stopColor="#E4FF30" stopOpacity="0.5" />
                    </linearGradient>
                </defs>

                {threads.map((t, i) => (
                    <path
                        key={t.id}
                        ref={(el) => { threadRefs.current[i] = el; }}
                        className="mobile-thread"
                        stroke={t.color}
                        strokeWidth={t.width}
                        strokeLinecap="round"
                        fill="none"
                        d={`M ${t.basePath.start[0]} ${t.basePath.start[1]} Q ${t.basePath.ctrl[0]} ${t.basePath.ctrl[1]} ${t.basePath.end[0]} ${t.basePath.end[1]}`}
                    />
                ))}
            </svg>
        </div>
    );
});

MobileThreads.displayName = 'MobileThreads';

export default MobileThreads;
