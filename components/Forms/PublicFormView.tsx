"use client";

import React, { useState, useEffect, useRef } from "react";
import { Button, Progress } from "@heroui/react";
import { ChevronUp, ChevronDown } from "lucide-react";
import ModuleRenderer from "@/components/Modules/ModuleRenderer";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

interface Question {
    _id: string;
    type: string;
    order: number;
    title: string;
    description?: string;
    placeholder?: string;
    isRequired: boolean;
    options?: Array<{ id: string; label: string; value: string; order: number }>;
}

interface Form {
    _id: string;
    title: string;
    description?: string;
    settings?: {
        welcomeMessage?: string;
        thankYouMessage?: string;
        showProgressBar?: boolean;
    };
}

interface PublicFormViewProps {
    form: Form;
    questions: Question[];
}

export default function PublicFormView({ form, questions }: PublicFormViewProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [responses, setResponses] = useState<Record<string, any>>({});
    const [direction, setDirection] = useState(1); // 1 for next, -1 for prev
    const containerRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);

    // Build modules array
    const modules = [
        {
            id: "welcome",
            type: "WELCOME",
            title: form.title,
            description: form.description || form.settings?.welcomeMessage || "Gracias por participar",
            buttonText: "Comenzar",
        },
        ...questions.map((q) => ({
            id: q._id,
            type: q.type,
            title: q.title,
            description: q.description,
            placeholder: q.placeholder,
            isRequired: q.isRequired,
            options: q.options,
        })),
        {
            id: "goodbye",
            type: "GOODBYE",
            title: "¡Gracias por tu tiempo!",
            message: form.settings?.thankYouMessage || "Tu respuesta ha sido registrada.",
            showConfetti: true,
        },
    ];

    const currentModule = modules[currentIndex];
    // Calculate progress purely based on questions answered (excluding welcome/goodbye)
    const questionIndex = currentIndex - 1;
    const totalQuestions = modules.length - 2;
    const progress = totalQuestions > 0
        ? Math.max(0, Math.min(100, ((questionIndex) / totalQuestions) * 100))
        : 0;

    // GSAP Transition
    useGSAP(() => {
        if (!contentRef.current) return;

        gsap.fromTo(
            contentRef.current,
            {
                y: direction * 50,
                opacity: 0,
                scale: 0.95
            },
            {
                y: 0,
                opacity: 1,
                scale: 1,
                duration: 0.4,
                ease: "power2.out"
            }
        );
    }, { scope: containerRef, dependencies: [currentIndex] });

    // Handle value changes
    const handleAnswer = (value: any) => {
        setResponses((prev) => ({
            ...prev,
            [currentModule.id]: value,
        }));
    };

    // Validation
    const validateCurrent = () => {
        if (currentModule.type === "WELCOME" || currentModule.type === "GOODBYE") return true;

        // Check if required
        // Cast to Question type to safely access isRequired
        const questionModule = currentModule as any; // Using any for simplicity as union type handling is verbose here

        if (questionModule.isRequired) {
            const value = responses[currentModule.id];
            // Check if value is empty (string, array for checkboxes, etc.)
            const isEmpty = value === undefined || value === "" || value === null || (Array.isArray(value) && value.length === 0);

            if (isEmpty) {
                // Shake animation for error
                if (contentRef.current) {
                    gsap.to(contentRef.current, {
                        keyframes: {
                            x: [-5, 5, -5, 5, 0]
                        },
                        duration: 0.3,
                        ease: "power2.inOut"
                    });
                }
                return false;
            }
        }
        return true;
    };

    const navigateNext = () => {
        if (!validateCurrent()) return;

        if (currentIndex < modules.length - 1) {
            setDirection(1);
            setCurrentIndex(currentIndex + 1);
        }
    };

    const navigatePrev = () => {
        if (currentIndex > 0) {
            setDirection(-1);
            setCurrentIndex(currentIndex - 1);
        }
    };

    // Handle keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Prevent navigation on text inputs/textareas unless empty (optional refinement, skip for now)
            // Actually, Enter should only work if not in textarea, but let's keep it simple: Ctrl+Enter or just Enter if not textarea

            if (e.key === "Enter" && !e.shiftKey) {
                // Allow Enter in inputs but maybe not textareas? For now allow all
                // If it's a textarea, usually Enter means new line.
                if (document.activeElement?.tagName === 'TEXTAREA') return;

                e.preventDefault();
                navigateNext();
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [currentIndex, responses]); // Add responses dependency so validation sees latest

    return (
        <div ref={containerRef} className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex flex-col overflow-hidden">
            {/* Progress bar */}
            {form.settings?.showProgressBar !== false && currentIndex > 0 && currentIndex < modules.length - 1 && (
                <div className="fixed top-0 left-0 right-0 z-50">
                    <Progress
                        value={progress}
                        size="sm"
                        radius="none"
                        classNames={{
                            indicator: "bg-gray-900 transition-all duration-500 ease-out",
                            track: "bg-gray-200",
                        }}
                    />
                </div>
            )}

            {/* Main content */}
            <div className="flex-1 flex items-center justify-center p-4 sm:p-8">
                <div ref={contentRef} className="w-full max-w-3xl">
                    <ModuleRenderer
                        module={currentModule}
                        isPreview={false}
                        value={responses[currentModule.id] || ""}
                        onChange={handleAnswer}
                    />

                    {/* Internal Navigation (for questions) */}
                    {currentModule.type !== "WELCOME" && currentModule.type !== "GOODBYE" && (
                        <div className="flex justify-between items-center mt-8 max-w-2xl mx-auto opacity-0 animate-fadeIn" style={{ animationDelay: '0.3s', animationFillMode: 'forwards' }}>
                            <Button
                                variant="light"
                                radius="full"
                                onPress={navigatePrev}
                                isDisabled={currentIndex === 0}
                                startContent={<ChevronUp size={18} />}
                            >
                                Anterior
                            </Button>

                            <Button
                                radius="full"
                                onPress={navigateNext}
                                className="bg-gray-900 hover:bg-gray-800 text-white px-8"
                                endContent={<ChevronDown size={18} />}
                            >
                                {currentIndex === modules.length - 2 ? "Enviar" : "Siguiente"}
                            </Button>
                        </div>
                    )}

                    {/* Welcome Screen Button override */}
                    {currentModule.type === "WELCOME" && (
                        <div className="text-center mt-8">
                            <Button
                                size="lg"
                                radius="full"
                                onPress={navigateNext}
                                className="bg-gray-900 hover:bg-gray-800 text-white px-12 font-medium shadow-lg shadow-gray-500/30"
                            >
                                {(currentModule as any).buttonText || "Comenzar"}
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            {/* Floating Navigation Arrows */}
            <div className="fixed right-6 top-1/2 -translate-y-1/2 flex flex-col gap-2 z-40 hidden md:flex">
                <Button
                    isIconOnly
                    size="lg"
                    variant="flat"
                    radius="full"
                    isDisabled={currentIndex === 0}
                    onPress={navigatePrev}
                    className="bg-white/80 backdrop-blur shadow-lg hover:bg-white transition-all"
                >
                    <ChevronUp size={24} />
                </Button>
                <Button
                    isIconOnly
                    size="lg"
                    variant="flat"
                    radius="full"
                    isDisabled={currentIndex === modules.length - 1}
                    onPress={navigateNext}
                    className="bg-white/80 backdrop-blur shadow-lg hover:bg-white transition-all"
                >
                    <ChevronDown size={24} />
                </Button>
            </div>
        </div>
    );
}
