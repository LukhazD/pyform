"use client";

import React, { useRef } from "react";
import { Button, Progress } from "@heroui/react";
import { ChevronUp, ChevronDown, CheckCircle2, Share2 } from "lucide-react";
import ModuleRenderer from "@/components/Modules/ModuleRenderer";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useNavigationStore } from "@/hooks/useNavigationStore";
import { usePublicFormViewModel } from "@/hooks/usePublicFormViewModel";
import { Form, Question } from "@/types/Form";
import { sanitizeCSS } from "@/libs/sanitizeCSS";

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
        showDefaultGoodbye,
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

    const isLastActionableModule = !questions[currentIndex + 1] || questions[currentIndex + 1].type === "GOODBYE";

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
                if (isLastActionableModule) {
                    submitForm();
                } else {
                    navigateNext();
                }
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [navigateNext, isLastActionableModule, submitForm]); // ViewModel's navigateNext is strict about dependencies

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
                // Prevent scrolling past the submit button (forcing the user to click it or press enter)
                if (isLastActionableModule) return;

                if (currentIndex < questions.length - 1) {
                    setNavigating(true);
                    setLastActionTime(now);
                    navigateNext();
                    setTimeout(() => setNavigating(false), cooldown);
                }
            } else {
                // Scroll up -> Prev
                // Prevent scrolling back if current module is GOODBYE (completed)
                if (currentModule?.type === "GOODBYE") return;

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
    }, [currentIndex, questions.length, isNavigating, lastActionTime, setNavigating, setLastActionTime, navigateNext, navigatePrev, isLastActionableModule]);

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: form.title,
                    text: 'Te invito a responder este formulario',
                    url: window.location.href,
                });
            } catch (error) {
                console.log('Error sharing:', error);
            }
        } else {
            // Fallback to copy to clipboard
            navigator.clipboard.writeText(window.location.href);
            import("react-hot-toast").then((mod) => mod.default.success("Enlace copiado al portapapeles"));
        }
    };

    const primaryColor = form.styling?.primaryColor || "#111827"; // Default to gray-900 if missing
    const fontFamily = form.styling?.fontFamily ? `"${form.styling.fontFamily}", sans-serif` : "Inter, sans-serif";

    // Handle generic goodbye screen
    if (showDefaultGoodbye) {
        return (
            <div
                className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex flex-col items-center justify-center p-4 transition-all duration-700"
                style={{ fontFamily, /* @ts-ignore */ "--color-primary": primaryColor } as React.CSSProperties}
            >
                <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 sm:p-12 text-center animate-fadeIn transform transition-all">
                    <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                        <CheckCircle2 className="w-10 h-10 text-green-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-3">¡Gracias! <br /> Respuesta enviada.</h2>
                    <p className="text-gray-500 mb-8 text-sm">
                        Tus respuestas han sido registradas correctamente de forma segura.
                    </p>

                    <Button
                        onPress={handleShare}
                        className="w-full font-medium shadow-md transition-transform hover:scale-105 mb-4 text-white"
                        style={{ backgroundColor: primaryColor }}
                        size="lg"
                        radius="md"
                        startContent={<Share2 size={18} />}
                    >
                        Compartir Formulario
                    </Button>
                </div>

                {/* Pyform Watermark / CTA */}
                <div className="mt-12 text-center">
                    <a href="https://pyform.app" target="_blank" rel="noopener noreferrer" className="group flex flex-col items-center gap-1 opacity-60 hover:opacity-100 transition-opacity">
                        <span className="text-xs font-semibold uppercase tracking-wider text-gray-400 group-hover:text-gray-600">Desarrollado con</span>
                        <div className="flex items-center gap-2 font-bold text-gray-900">
                            <span className="text-lg">PyForm</span>
                            <span className="bg-gray-900 text-white text-[10px] px-2 py-0.5 rounded-full">Gratis</span>
                        </div>
                    </a>
                </div>
            </div>
        );
    }


    if (!isLoaded || !currentModule) {
        return <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100" />;
    }

    return (
        <div
            ref={containerRef}
            className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex flex-col overflow-hidden transition-colors duration-300"
            style={{
                fontFamily,
                // @ts-ignore
                "--color-primary": primaryColor,
            } as React.CSSProperties}
        >
            {/* Custom CSS — sanitized to prevent XSS (C-8) */}
            {form.styling?.customCSS && (
                <style dangerouslySetInnerHTML={{ __html: sanitizeCSS(form.styling.customCSS) }} />
            )}

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
                            indicator: "transition-all duration-500 ease-out",
                            track: "bg-gray-200",
                        }}
                        style={{
                            // @ts-ignore
                            "--nextui-primary": primaryColor, // HeroUI/NextUI often uses this var
                        }}
                    // If HeroUI doesn't use the var, we try overriding the indicator:
                    // But Component API usually takes classnames. We can use inline style on the indicator if exposed, 
                    // or just rely on a wrapper. HeroUI Progress usually accepts `color` prop but only for preset colors.
                    // Let's use CSS variable injection context if possible, or style prop.
                    // Ideally:
                    />
                    {/* Manual overlay for color if component doesn't support arbitrary hex */}
                    <div
                        className="absolute top-0 left-0 h-1 transition-all duration-500 ease-out"
                        style={{
                            width: `${progress}%`,
                            backgroundColor: primaryColor
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
                        primaryColor={primaryColor} // Pass color to renderer if it accepts it
                        radius={form.styling?.heroUIRadius === "full" ? "lg" : form.styling?.heroUIRadius}
                        shadow={form.styling?.heroUIShadow}
                        formId={form._id} // Pass form ID
                    />

                    {/* Internal Navigation (for questions) */}
                    {currentModule.type !== "WELCOME" && currentModule.type !== "GOODBYE" && (
                        <div className={`mt-8 max-w-2xl mx-auto animate-fadeIn ${isLastActionableModule
                            ? "flex flex-col items-center gap-4"
                            : "flex justify-between items-center"
                            }`} style={{ animationDelay: '0.3s', animationFillMode: 'forwards' }}>

                            {isLastActionableModule ? (
                                <>
                                    <Button
                                        radius="md"
                                        size="lg"
                                        onPress={submitForm}
                                        isLoading={submitting}
                                        className="text-white px-12 font-medium shadow-lg transition-transform hover:scale-105"
                                        style={{
                                            backgroundColor: primaryColor,
                                        }}
                                    >
                                        Enviar respuestas
                                    </Button>

                                    <Button
                                        variant="light"
                                        size="sm"
                                        radius="md"
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
                                        radius="md"
                                        onPress={navigatePrev}
                                        isDisabled={currentIndex === 0}
                                        startContent={<ChevronUp size={18} />}
                                    >
                                        Anterior
                                    </Button>

                                    <Button
                                        radius="md"
                                        onPress={navigateNext}
                                        className="text-white px-8 transition-transform hover:scale-105"
                                        style={{
                                            backgroundColor: primaryColor,
                                        }}
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
