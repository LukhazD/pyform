"use client";

import React from "react";
import { Button, Input, Card, CardBody, CardHeader } from "@heroui/react";
import Image from "next/image";
import { useOnboardingViewModel } from "@/hooks/useOnboardingViewModel";

export default function OnboardingPage() {
    const { name, setName, isLoading, handleSubmit } = useOnboardingViewModel();

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
            <Card className="w-full max-w-lg p-8 shadow-xl">
                <CardHeader className="flex flex-col gap-3 pb-8 text-center">
                    <div className="mx-auto mb-2">
                        <Image src="/assets/icons/logo.png" alt="PyForm Logo" width={64} height={64} className="rounded-2xl" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Bienvenido a PyForm</h1>
                        <p className="text-gray-500 mt-2 text-lg">
                            Vamos a configurar tu cuenta. ¿Cómo te llamas?
                        </p>
                    </div>
                </CardHeader>
                <CardBody className="px-0">
                    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                        <Input
                            label="Nombre completo"
                            placeholder="Ej. Elon Musk"
                            value={name}
                            onValueChange={setName}
                            variant="bordered"
                            labelPlacement="outside"
                            size="lg"
                            classNames={{
                                inputWrapper: "border-2 border-gray-200 focus-within:border-gray-900 h-14",
                                label: "text-base font-medium text-gray-700 mb-2",
                                input: "text-lg"
                            }}
                            isRequired
                            autoFocus
                        />
                        <Button
                            type="submit"
                            size="lg"
                            isLoading={isLoading}
                            className="w-full font-medium bg-gray-900 text-white hover:bg-gray-800"
                        >
                            Continuar al Dashboard
                        </Button>
                    </form>
                </CardBody>
            </Card>
        </div>
    );
}
