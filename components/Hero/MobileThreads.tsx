"use client";

import { useLayoutEffect, useRef, forwardRef, useImperativeHandle } from "react";
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
    startX: number;
    startY: number;
    ctrlX: number;
    ctrlY: number;
    endX: number;
    endY: number;
}

interface ThreadState {
    baseCtrl: { x: number; y: number };
    pos: { x: number; y: number };
    vel: { x: number; y: number };
    target: { x: number; y: number };
    ambient: {
        speed: number;
        phase: number;
        ampX: number;
        ampY: number;
    };
}

// Pure client-side component - no SSR, no hydration issues
const MobileThreads = forwardRef<MobileThreadsHandle>((_, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const svgRef = useRef<SVGSVGElement>(null);

    // All data stored in refs - no React state = no re-renders
    const threadsRef = useRef<ThreadData[]>([]);
    const threadStates = useRef<ThreadState[]>([]);
    const pathElements = useRef<SVGPathElement[]>([]);
    const isInitialized = useRef(false);

    useImperativeHandle(ref, () => ({
        handlePointerMove: (e: React.PointerEvent<HTMLDivElement>) => {
            if (!containerRef.current || !isInitialized.current) return;
            const rect = containerRef.current.getBoundingClientRect();
            const relX = ((e.clientX - rect.left) / rect.width) * 100;
            const relY = ((e.clientY - rect.top) / rect.height) * 100;

            const time = gsap.ticker.time;

            threadStates.current.forEach((state) => {
                if (!state) return;

                const currentX = state.baseCtrl.x + Math.sin(time * state.ambient.speed + state.ambient.phase) * state.ambient.ampX;
                const currentY = state.baseCtrl.y + Math.cos(time * state.ambient.speed + state.ambient.phase) * state.ambient.ampY;

                const distX = relX - currentX;
                const distY = relY - currentY;
                const dist = Math.sqrt(distX * distX + distY * distY) || 0.0001;
                const radius = 25;

                if (dist < radius) {
                    const pushForce = 6;
                    const strength = Math.pow(1 - dist / radius, 2);
                    const dirX = distX / dist;
                    const dirY = distY / dist;

                    state.target.x = -dirX * strength * pushForce;
                    state.target.y = -dirY * strength * (pushForce * 0.5);
                } else {
                    state.target.x = 0;
                    state.target.y = 0;
                }
            });
        },
        handlePointerLeave: () => {
            threadStates.current.forEach(state => {
                if (state) {
                    state.target.x = 0;
                    state.target.y = 0;
                }
            });
        }
    }), []);

    // Single effect: create everything imperatively, no React rendering of paths
    useLayoutEffect(() => {
        if (isInitialized.current || !svgRef.current) return;
        isInitialized.current = true;

        const svg = svgRef.current;
        const isDesktop = window.innerWidth > 768;
        const count = isDesktop ? 20 : 8;

        // Create gradients
        const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
        defs.innerHTML = `
            <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#9929EA" stop-opacity="0.5" />
                <stop offset="100%" stop-color="#5B23FF" stop-opacity="0.0" />
            </linearGradient>
            <linearGradient id="grad2" x1="100%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stop-color="#008BFF" stop-opacity="0.0" />
                <stop offset="100%" stop-color="#E4FF30" stop-opacity="0.5" />
            </linearGradient>
        `;
        svg.appendChild(defs);

        // Generate threads
        for (let i = 0; i < count; i++) {
            const isGrad1 = Math.random() > 0.5;
            const startX = gsap.utils.random(-10, 110);
            const endX = gsap.utils.random(-10, 110);
            const ctrlX = gsap.utils.random(0, 100);
            const ctrlY = gsap.utils.random(30, 70);
            const width = gsap.utils.random(0.5, 2.5);

            const thread: ThreadData = {
                id: `t-${i}`,
                color: isGrad1 ? "url(#grad1)" : "url(#grad2)",
                width,
                startX,
                startY: -20,
                ctrlX,
                ctrlY,
                endX,
                endY: 120,
            };

            const state: ThreadState = {
                baseCtrl: { x: ctrlX, y: ctrlY },
                pos: { x: 0, y: 0 },
                vel: { x: 0, y: 0 },
                target: { x: 0, y: 0 },
                ambient: {
                    speed: gsap.utils.random(0.3, 0.8),
                    phase: gsap.utils.random(0, Math.PI * 2),
                    ampX: gsap.utils.random(10, 25),
                    ampY: gsap.utils.random(8, 15)
                }
            };

            threadsRef.current.push(thread);
            threadStates.current.push(state);

            // Create path element imperatively
            const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
            path.setAttribute("stroke", thread.color);
            path.setAttribute("stroke-width", String(thread.width));
            path.setAttribute("stroke-linecap", "round");
            path.setAttribute("fill", "none");
            path.setAttribute("d", `M ${startX} -20 Q ${ctrlX} ${ctrlY} ${endX} 120`);
            path.style.strokeDasharray = "1200";
            path.style.strokeDashoffset = "1200";
            path.style.opacity = "0";

            svg.appendChild(path);
            pathElements.current.push(path);
        }

        // Intro animation
        gsap.to(pathElements.current, {
            strokeDashoffset: 0,
            opacity: 1,
            duration: 2.5,
            ease: "power3.out",
            stagger: 0.1
        });

        // Animation loop
        const renderLoop = () => {
            const time = gsap.ticker.time;

            for (let i = 0; i < threadsRef.current.length; i++) {
                const path = pathElements.current[i];
                const state = threadStates.current[i];
                const thread = threadsRef.current[i];

                if (!path || !state || !thread) continue;

                // Ambient motion
                const ambientX = Math.sin(time * state.ambient.speed + state.ambient.phase) * state.ambient.ampX;
                const ambientY = Math.cos(time * state.ambient.speed + state.ambient.phase) * state.ambient.ampY;

                // Spring physics
                const k = 0.08;
                const damp = 0.9;
                const ax = (state.target.x - state.pos.x) * k;
                const ay = (state.target.y - state.pos.y) * k;

                state.vel.x = (state.vel.x + ax) * damp;
                state.vel.y = (state.vel.y + ay) * damp;
                state.pos.x += state.vel.x;
                state.pos.y += state.vel.y;

                // Final position
                const x = state.baseCtrl.x + ambientX + state.pos.x;
                const y = state.baseCtrl.y + ambientY + state.pos.y;

                path.setAttribute("d", `M ${thread.startX} ${thread.startY} Q ${x} ${y} ${thread.endX} ${thread.endY}`);
            }
        };

        gsap.ticker.add(renderLoop);

        return () => {
            gsap.ticker.remove(renderLoop);
            // Clean up paths
            pathElements.current.forEach(p => p.remove());
            pathElements.current = [];
            threadsRef.current = [];
            threadStates.current = [];
            isInitialized.current = false;
        };
    }, []);

    return (
        <div
            ref={containerRef}
            className="absolute inset-0 z-0 overflow-hidden bg-white touch-pan-y pointer-events-auto"
        >
            <svg
                ref={svgRef}
                className="absolute w-full h-full scale-110 pointer-events-none"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
            />
        </div>
    );
});

MobileThreads.displayName = 'MobileThreads';

export default MobileThreads;
