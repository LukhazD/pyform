"use client";

import React, { useRef } from "react";
import { Button, Progress } from "@heroui/react";
import { ChevronUp, ChevronDown } from "lucide-react";
import ModuleRenderer from "@/components/Modules/ModuleRenderer";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useNavigationStore } from "@/hooks/useNavigationStore";
import { usePublicFormViewModel } from "@/hooks/usePublicFormViewModel";
import { Form, Question } from "@/types/Form";

gsap.registerPlugin(useGSAP);

interface PublicFormViewProps {
    form: Form;
    questions: Question[];
    isPreview?: boolean;
}

export default function PublicFormView({ form, questions, isPreview = false }: PublicFormViewProps) {
    const {
        currentIndex,
        responses,
        direction,
        isLoaded,
        submitting,
        validationError,
        progress,
        handleAnswer,
        navigateNext,
        navigatePrev,
        submitForm,
        currentModule: currentQuestion
    } = usePublicFormViewModel(form, questions, isPreview);

    const containerRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);

    // Build modules array for renderer (mapping _id to id)
    // We recreate this mapping here or just use currentQuestion and map it on the fly
    const currentModule = currentQuestion ? {
        ...currentQuestion,
        id: currentQuestion._id
    } : null;

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

    // Shake Animation on Error
    useGSAP(() => {
        if (validationError > 0 && contentRef.current) {
            gsap.to(contentRef.current, {
                keyframes: {
                    x: [-5, 5, -5, 5, 0]
                },
                duration: 0.3,
                ease: "power2.inOut"
            });
        }
    }, { scope: containerRef, dependencies: [validationError] });

    // Handle keyboard navigation
    React.useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Enter" && !e.shiftKey) {
                if (document.activeElement?.tagName === 'TEXTAREA') return;
                e.preventDefault();
                navigateNext();
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [navigateNext]); // ViewModel's navigateNext is strict about dependencies

    // Scroll navigation
    const { isNavigating, setNavigating, lastActionTime, setLastActionTime } = useNavigationStore();

    React.useEffect(() => {
        const scrollThreshold = 40;
        const cooldown = 1000;

        const handleWheel = (e: WheelEvent) => {
            const now = Date.now();

            if (isNavigating || (now - lastActionTime < cooldown)) return;
            if (Math.abs(e.deltaY) < scrollThreshold) return;

            if (e.deltaY > 0) {
                // Scroll down -> Next
                // We need to know if we can go next based on questions length to avoid triggering on last page if handled by button
                if (currentIndex < questions.length - 1) {
                    setNavigating(true);
                    setLastActionTime(now);
                    navigateNext();
                    setTimeout(() => setNavigating(false), cooldown);
                }
            } else {
                // Scroll up -> Prev
                if (currentIndex > 0) {
                    setNavigating(true);
                    setLastActionTime(now);
                    navigatePrev();
                    setTimeout(() => setNavigating(false), cooldown);
                }
            }
        };

        window.addEventListener("wheel", handleWheel, { passive: true });
        return () => window.removeEventListener("wheel", handleWheel);
    }, [currentIndex, questions.length, isNavigating, lastActionTime, setNavigating, setLastActionTime, navigateNext, navigatePrev]);


    if (!isLoaded || !currentModule) {
        return <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100" />;
    }

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
            {form.settings?.showProgressBar !== false && currentIndex > 0 && currentIndex < questions.length - 1 && (
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
                        key={currentModule.id}
                        module={currentModule}
                        isPreview={false}
                        value={responses[currentModule.id] || ""}
                        onChange={handleAnswer}
                        onNext={navigateNext}
                    />

                    {/* Internal Navigation (for questions) */}
                    {currentModule.type !== "WELCOME" && currentModule.type !== "GOODBYE" && (
                        <div className={`mt-8 max-w-2xl mx-auto animate-fadeIn ${(!questions[currentIndex + 1] || questions[currentIndex + 1].type === "GOODBYE")
                            ? "flex flex-col items-center gap-4"
                            : "flex justify-between items-center"
                            }`} style={{ animationDelay: '0.3s', animationFillMode: 'forwards' }}>

                            {questions.length - 2 === currentIndex ? (
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
        </div>
    );
}
