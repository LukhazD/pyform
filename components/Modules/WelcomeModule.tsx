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

interface WelcomeModuleProps {
    module: Module;
}

export default function WelcomeModule({ module }: WelcomeModuleProps) {
    return (
        <div className="min-h-[500px] flex items-center justify-center bg-gray-50 rounded-2xl p-8">
            <Card shadow="lg" radius="lg" className="max-w-2xl w-full p-12 text-center bg-white">
                {module.image && (
                    <div className="mb-8">
                        <img
                            src={module.image}
                            alt=""
                            className="w-32 h-32 mx-auto rounded-full object-cover"
                        />
                    </div>
                )}
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                    {module.title || "Bienvenido"}
                </h1>
                <p className="text-lg text-gray-600 mb-10 leading-relaxed max-w-xl mx-auto">
                    {module.description || "Gracias por participar en nuestra encuesta."}
                </p>
                <Button
                    size="lg"
                    radius="full"
                    className="bg-gray-900 hover:bg-gray-800 text-white px-12 py-6 text-lg font-medium"
                >
                    {module.buttonText || "Comenzar"}
                </Button>
            </Card>
        </div>
    );
}
