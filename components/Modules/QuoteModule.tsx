"use client";

import React from "react";
import { Card } from "@heroui/react";
import { Quote } from "lucide-react";

interface Module {
    id: string;
    type: string;
    title?: string;
    content?: string;
    author?: string;
}

interface QuoteModuleProps {
    module: Module;
}

export default function QuoteModule({ module }: QuoteModuleProps) {
    return (
        <div className="min-h-[300px] md:min-h-[400px] flex items-center justify-center p-4 md:p-8">
            <Card shadow="sm" radius="lg" className="max-w-2xl w-full p-6 md:p-12 bg-white text-center">
                <div className="flex flex-col items-center">
                    <div className="mb-6">
                        <Quote className="text-primary opacity-80" size={48} />
                    </div>

                    <blockquote className="text-xl md:text-3xl font-serif text-gray-900 mb-6 md:mb-8 leading-snug">
                        &ldquo;{module.content || module.title || "Inserta tu cita aquí..."}&rdquo;
                    </blockquote>

                    {module.author && (
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-[1px] bg-gray-300"></div>
                            <p className="text-sm uppercase tracking-widest font-medium text-gray-500">
                                {module.author}
                            </p>
                            <div className="w-8 h-[1px] bg-gray-300"></div>
                        </div>
                    )}
                </div>
            </Card>
        </div>
    );
}
