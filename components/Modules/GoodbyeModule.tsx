import { useRef, useEffect } from "react";
import confetti from "canvas-confetti";
import { Card, Button } from "@heroui/react";
import { CheckCircle, Twitter, Instagram, Linkedin, Globe } from "lucide-react";

interface Module {
    id: string;
    type: string;
    title?: string;
    message?: string;
    showConfetti?: boolean;
    socialLinks?: {
        twitter?: string;
        instagram?: string;
        linkedin?: string;
        website?: string;
    };
}

interface GoodbyeModuleProps {
    module: Module;
    isPreview?: boolean;
}

export default function GoodbyeModule({ module, isPreview }: GoodbyeModuleProps) {
    useEffect(() => {
        if (module.showConfetti && !isPreview) {
            const duration = 3 * 1000;
            const animationEnd = Date.now() + duration;
            const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 100 };

            const randomInRange = (min: number, max: number) => {
                return Math.random() * (max - min) + min;
            };

            const interval: any = setInterval(function () {
                const timeLeft = animationEnd - Date.now();

                if (timeLeft <= 0) {
                    return clearInterval(interval);
                }

                const particleCount = 50 * (timeLeft / duration);

                // since particles fall down, start a bit higher than random
                confetti({
                    ...defaults,
                    particleCount,
                    origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
                });
                confetti({
                    ...defaults,
                    particleCount,
                    origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
                });
            }, 250);

            return () => clearInterval(interval);
        }
    }, [module.showConfetti]);

    return (
        <div className="min-h-[300px] md:min-h-[500px] flex items-center justify-center bg-gray-50 rounded-2xl p-4 md:p-8">
            <Card shadow="lg" radius="md" className="max-w-2xl w-full p-6 md:p-12 text-center bg-white">
                <div className="mb-8">
                    <div className="w-24 h-24 mx-auto rounded-full bg-gray-900 flex items-center justify-center">
                        <CheckCircle className="text-white" size={48} />
                    </div>
                </div>

                <h1 className="text-2xl md:text-4xl font-bold text-gray-900 mb-4">
                    {module.title || "¡Gracias por tu tiempo!"}
                </h1>
                <p className="text-lg text-gray-600 mb-10 max-w-md mx-auto">
                    {module.message || "Tu respuesta ha sido registrada correctamente."}
                </p>

                {module.socialLinks && (
                    <div className="flex justify-center gap-4">
                        {module.socialLinks.twitter && (
                            <Button
                                isIconOnly
                                variant="light"
                                radius="md"
                                size="lg"
                                as="a"
                                href={module.socialLinks.twitter}
                            >
                                <Twitter size={24} />
                            </Button>
                        )}
                        {module.socialLinks.instagram && (
                            <Button
                                isIconOnly
                                variant="light"
                                radius="md"
                                size="lg"
                                as="a"
                                href={module.socialLinks.instagram}
                            >
                                <Instagram size={24} />
                            </Button>
                        )}
                        {module.socialLinks.linkedin && (
                            <Button
                                isIconOnly
                                variant="light"
                                radius="md"
                                size="lg"
                                as="a"
                                href={module.socialLinks.linkedin}
                            >
                                <Linkedin size={24} />
                            </Button>
                        )}
                        {module.socialLinks.website && (
                            <Button
                                isIconOnly
                                variant="light"
                                radius="md"
                                size="lg"
                                as="a"
                                href={module.socialLinks.website}
                            >
                                <Globe size={24} />
                            </Button>
                        )}
                    </div>
                )}
            </Card>
        </div>
    );
}
