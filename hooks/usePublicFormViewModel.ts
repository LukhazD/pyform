import { useState, useEffect, useCallback, useRef } from "react";
import toast from "react-hot-toast";
import { Form, Question } from "@/types/Form";
import { incrementFormViews } from "@/actions/form";

export function usePublicFormViewModel(form: Form, questions: Question[], isPreview: boolean = false) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [responses, setResponses] = useState<Record<string, any>>({});
    const [direction, setDirection] = useState(1); // 1 for next, -1 for prev
    const [isLoaded, setIsLoaded] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [viewCounted, setViewCounted] = useState(false);

    // For triggering UI effects like shake
    const [validationError, setValidationError] = useState<number>(0); // Increment to trigger effect

    // Storage key
    const STORAGE_KEY = `form_state_${form._id}`;

    // Load state
    useEffect(() => {
        if (typeof window !== "undefined" && !isPreview) {
            // View counting
            const viewKey = `viewed_${form._id}`;
            const hasViewed = sessionStorage.getItem(viewKey);

            if (!hasViewed && !viewCounted) {
                incrementFormViews(form._id);
                sessionStorage.setItem(viewKey, "true");
                setViewCounted(true);
            }

            // Check for previous submission if multiple submissions are not allowed
            const completionKey = `completed_${form._id}`;
            const hasCompleted = localStorage.getItem(completionKey);

            if (!form.settings?.allowMultipleSubmissions && hasCompleted) {
                // Determine what to do: redirect to goodbye or stay on a clean state but warn?
                // For now, let's just go to the goodbye screen if it exists.
                const goodbyeIndex = questions.findIndex(q => q.type === "GOODBYE");
                if (goodbyeIndex !== -1) {
                    setCurrentIndex(goodbyeIndex);
                    setIsLoaded(true);
                    return;
                }
            }

            // Restore progress
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                try {
                    const parsed = JSON.parse(saved);
                    if (parsed.responses) setResponses(parsed.responses);
                    if (typeof parsed.currentIndex === 'number' && parsed.currentIndex >= 0 && parsed.currentIndex < questions.length) {
                        setCurrentIndex(parsed.currentIndex);
                    }
                } catch (e) {
                    console.error("Failed to parse saved form state", e);
                }
            }
            setIsLoaded(true);
        } else {
            setIsLoaded(true);
        }
    }, [form._id, isPreview, questions.length, viewCounted, STORAGE_KEY]);

    // Save state
    useEffect(() => {
        if (isLoaded && !isPreview) {
            const stateToSave = {
                responses,
                currentIndex,
                timestamp: Date.now()
            };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
        }
    }, [responses, currentIndex, isLoaded, isPreview, STORAGE_KEY]);

    const handleAnswer = (value: any) => {
        const currentModule = questions[currentIndex];
        setResponses((prev) => ({
            ...prev,
            [currentModule._id]: value,
        }));
    };

    const validateCurrent = useCallback(() => {
        const currentModule = questions[currentIndex];
        if (!currentModule) return true;
        if (currentModule.type === "WELCOME" || currentModule.type === "GOODBYE") return true;

        const value = responses[currentModule._id];

        // Specific validation for Email
        if (currentModule.type === "EMAIL") {
            // Check if required first
            if (currentModule.isRequired && (!value || value === "")) {
                setValidationError(prev => prev + 1);
                return false;
            }
            // If has value, validate format
            if (value && value !== "") {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(value)) {
                    setValidationError(prev => prev + 1);
                    // Could add toast or specific error UI here
                    toast.error("Por favor, introduce un email válido.");
                    return false;
                }
            }
        }

        if (currentModule.isRequired) {
            const isEmpty = value === undefined || value === "" || value === null || (Array.isArray(value) && value.length === 0);

            if (isEmpty) {
                setValidationError(prev => prev + 1); // Trigger effect
                return false;
            }
        }
        return true;
    }, [currentIndex, questions, responses]);

    const navigateNext = useCallback(() => {
        if (!validateCurrent()) return;

        if (currentIndex < questions.length - 1) {
            setDirection(1);
            setCurrentIndex(prev => prev + 1);
        }
    }, [currentIndex, questions.length, validateCurrent]);

    const navigatePrev = useCallback(() => {
        if (currentIndex > 0) {
            setDirection(-1);
            setCurrentIndex(prev => prev - 1);
        }
    }, [currentIndex]);

    // Track start time for analytics
    const startTime = useRef<number>(Date.now());

    // ... (existing code)

    const submitForm = async () => {
        if (!validateCurrent()) return;
        setSubmitting(true);

        try {
            const completionTimeMs = Date.now() - startTime.current;

            const submissionData = {
                formId: form._id,
                completionTimeMs,
                answers: Object.entries(responses).map(([questionId, value]) => {
                    const question = questions.find(q => q._id === questionId);
                    return {
                        questionId,
                        questionType: question?.type || "unknown",
                        value,
                    };
                }),
                metadata: {
                    userAgent: navigator.userAgent,
                    language: navigator.language,
                    deviceType: /Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(navigator.userAgent) ? "mobile" : "desktop",
                    browser: "unknown"
                }
            };

            const res = await fetch("/api/submissions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(submissionData),
            });

            if (!res.ok) throw new Error("Submission failed");

            if (!isPreview) {
                localStorage.removeItem(STORAGE_KEY);
                localStorage.setItem(`completed_${form._id}`, "true");
            }


            const goodbyeIndex = questions.findIndex(q => q.type === "GOODBYE");
            if (goodbyeIndex !== -1) {
                setDirection(1);
                setCurrentIndex(goodbyeIndex);
            } else {
                toast.success("¡Gracias! Tu respuesta ha sido registrada.");
            }
        } catch (error) {
            console.error("Submission error:", error);
            toast.error("Error al enviar el formulario. Por favor, inténtalo de nuevo.");
        } finally {
            setSubmitting(false);
        }
    };

    return {
        currentIndex,
        responses,
        direction,
        isLoaded,
        submitting,
        validationError,
        progress: questions.length > 0 ? Math.max(0, Math.min(100, ((currentIndex + 1) / questions.length) * 100)) : 0,
        handleAnswer,
        navigateNext,
        navigatePrev,
        submitForm,
        currentModule: questions[currentIndex]
    };
}
