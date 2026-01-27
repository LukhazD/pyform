"use client";

import React from "react";
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
}

export default function GoodbyeModule({ module }: GoodbyeModuleProps) {
    return (
        <div className="min-h-[300px] md:min-h-[500px] flex items-center justify-center bg-gray-50 rounded-2xl p-4 md:p-8">
            <Card shadow="lg" radius="lg" className="max-w-2xl w-full p-6 md:p-12 text-center bg-white">
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
                                radius="full"
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
                                radius="full"
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
                                radius="full"
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
                                radius="full"
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
