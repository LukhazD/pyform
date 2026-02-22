"use client";

import React from "react";
import { Card, Button } from "@heroui/react";

interface Module {
    id: string;
    type: string;
    title?: string;
    description?: string;
    buttonText?: string;
    image?: string;
}

import { FormStyling } from "@/types/FormStyling";

interface WelcomeModuleProps {
    module: any;
    onNext?: () => void;
    primaryColor?: string;
    radius?: FormStyling["heroUIRadius"];
    shadow?: FormStyling["heroUIShadow"];
}

export default function WelcomeModule({ module, onNext, primaryColor, radius = "lg", shadow = "sm" }: WelcomeModuleProps) {
    return (
        <div className="min-h-[300px] md:min-h-[500px] flex items-center justify-center bg-transparent p-4 md:p-8">
            <Card shadow={shadow} radius={radius === "full" ? "lg" : radius} className="max-w-2xl w-full p-6 md:p-12 text-center bg-white border-0">
                {module.image && (
                    <div className="mb-8">
                        <img
                            src={module.image}
                            alt=""
                            className="w-32 h-32 mx-auto rounded-full object-cover"
                        />
                    </div>
                )}
                <div className="space-y-8 flex flex-col items-center">
                    <div>
                        <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4 md:mb-6">
                            {module.title || "Bienvenido"}
                        </h1>
                        <p className="text-lg text-gray-600 leading-relaxed max-w-xl mx-auto">
                            {module.description || "Gracias por participar en nuestra encuesta."}
                        </p>
                    </div>
                    <Button
                        size="lg"
                        radius="md"
                        className="text-white px-12 py-6 text-lg font-medium transition-transform hover:scale-105"
                        style={{ backgroundColor: primaryColor || "#111827" }}
                        onPress={onNext}
                    >
                        {module.buttonText || "Comenzar"}
                    </Button>
                </div>
            </Card>
        </div>
    );
}
