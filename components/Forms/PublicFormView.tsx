"use client";

import React, { useState, useEffect, useRef } from "react";
import { Button, Progress } from "@heroui/react";
import { ChevronUp, ChevronDown } from "lucide-react";
import ModuleRenderer from "@/components/Modules/ModuleRenderer";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useNavigationStore } from "@/hooks/useNavigationStore";

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
    isPreview?: boolean;
}

export default function PublicFormView({ form, questions, isPreview = false }: PublicFormViewProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [responses, setResponses] = useState<Record<string, any>>({});
    const [direction, setDirection] = useState(1); // 1 for next, -1 for prev
    const containerRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);

    // Build modules array
    const modules = questions.map((q) => ({
        id: q._id,
        type: q.type,
        title: q.title,
        description: q.description,
        placeholder: q.placeholder,
        isRequired: q.isRequired,
        options: q.options,
    }));

    const currentModule = modules[currentIndex];
    // Calculate progress purely based on questions answered (excluding welcome/goodbye)
    // Calculate progress
    const totalQuestions = modules.length;
    const progress = totalQuestions > 0
        ? Math.max(0, Math.min(100, ((currentIndex + 1) / totalQuestions) * 100))
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

    const [submitting, setSubmitting] = useState(false);

    const submitForm = async () => {
        if (!validateCurrent()) return;
        setSubmitting(true);

        try {
            // Prepare submission data
            const submissionData = {
                formId: form._id,
                answers: Object.entries(responses).map(([questionId, value]) => {
                    const question = modules.find(m => m.id === questionId);
                    return {
                        questionId,
                        questionType: question?.type || "unknown",
                        value,
                    };
                }),
                metadata: {
                    userAgent: navigator.userAgent,
                    language: navigator.language,
                    // Basic client-side detection (will be refined on server or here)
                    deviceType: /Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(navigator.userAgent) ? "mobile" : "desktop",
                    browser: "unknown" // Let server refine or just pass generic
                }
            };

            const res = await fetch("/api/submissions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(submissionData),
            });

            if (!res.ok) throw new Error("Submission failed");

            // Look for goodbye module
            const goodbyeIndex = modules.findIndex(m => m.type === "GOODBYE");
            if (goodbyeIndex !== -1) {
                setDirection(1);
                setCurrentIndex(goodbyeIndex);
            } else {
                alert("Thank you! Your response has been recorded.");
                // Optional: window.location.reload() or redirect
            }
        } catch (error) {
            console.error("Submission error:", error);
            alert("Failed to submit form. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    const navigateNext = () => {
        if (!validateCurrent()) return;

        // Check if current module is the last before Goodbye
        const nextModule = modules[currentIndex + 1];

        // If next is Goodbye or end of list, DO NOT auto-advance. 
        // Submission must be triggered explicitly by the "Enviar" button.

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
        console.log("Current index:", currentIndex);
        console.log("Modules length:", modules.length - 2);
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

    // Scroll navigation with Zustand
    const { isNavigating, setNavigating, lastActionTime, setLastActionTime } = useNavigationStore();

    useEffect(() => {
        const scrollThreshold = 40; // Sensitivity threshold
        const cooldown = 1000; // 1s cooldown to ensure animation finishes and prevents double-skip

        const handleWheel = (e: WheelEvent) => {
            const now = Date.now();

            // Check if global lock is active or cooldown hasn't passed
            if (isNavigating || (now - lastActionTime < cooldown)) return;

            // Only handle vertical scroll with sufficient magnitude
            if (Math.abs(e.deltaY) < scrollThreshold) return;

            if (e.deltaY > 0) {
                // Scroll down -> Next
                if (currentIndex < modules.length - 1) {
                    setNavigating(true);
                    setLastActionTime(now);
                    navigateNext();

                    // Unlock after cooldown
                    setTimeout(() => {
                        setNavigating(false);
                    }, cooldown);
                }
            } else {
                // Scroll up -> Prev
                if (currentIndex > 0) {
                    setNavigating(true);
                    setLastActionTime(now);
                    navigatePrev();

                    // Unlock after cooldown
                    setTimeout(() => {
                        setNavigating(false);
                    }, cooldown);
                }
            }
        };

        window.addEventListener("wheel", handleWheel, { passive: true });
        return () => window.removeEventListener("wheel", handleWheel);
    }, [currentIndex, responses, modules.length, isNavigating, lastActionTime, setNavigating, setLastActionTime]);

    return (
        <div ref={containerRef} className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex flex-col overflow-hidden">
            {/* Preview mode banner */}
            {isPreview && (
                <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-amber-500 text-white px-6 py-2 rounded-full shadow-lg flex items-center gap-2 text-sm font-medium">
                    <span className="text-lg">👁️</span>
                    Vista previa — Las respuestas no se guardarán
                </div>
            )}
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
                        onNext={navigateNext}
                    />

                    {/* Internal Navigation (for questions) */}
                    {currentModule.type !== "WELCOME" && currentModule.type !== "GOODBYE" && (
                        <div className={`mt-8 max-w-2xl mx-auto animate-fadeIn ${(!modules[currentIndex + 1] || modules[currentIndex + 1].type === "GOODBYE")
                            ? "flex flex-col items-center gap-4"
                            : "flex justify-between items-center"
                            }`} style={{ animationDelay: '0.3s', animationFillMode: 'forwards' }}>

                            {modules.length - 2 == currentIndex ? (
                                <>
                                    <Button
                                        radius="full"
                                        size="lg"
                                        onPress={submitForm}
                                        isLoading={submitting}
                                        className="bg-gray-900 hover:bg-gray-800 text-white px-12 font-medium shadow-lg"
                                    >
                                        Enviar respuestas
                                    </Button>

                                    <Button
                                        variant="light"
                                        size="sm"
                                        radius="full"
                                        onPress={navigatePrev}
                                        isDisabled={currentIndex === 0 || submitting}
                                        className="text-gray-400 hover:text-gray-600"
                                    >
                                        Volver
                                    </Button>
                                </>
                            ) : (
                                <>
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
                                        Siguiente
                                    </Button>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Floating Navigation Arrows */}
            {/* <div className="fixed right-6 top-1/2 -translate-y-1/2 flex flex-col gap-2 z-40 hidden md:flex">
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
            </div> */}
        </div>
    );
}
