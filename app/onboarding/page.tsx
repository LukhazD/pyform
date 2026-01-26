"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button, Input, Card, CardBody, CardHeader } from "@heroui/react";
import toast from "react-hot-toast";
import Image from "next/image";

export default function OnboardingPage() {
    const router = useRouter();
    const { update } = useSession();
    const [name, setName] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name.trim()) {
            toast.error("Please enter your name");
            return;
        }

        setIsLoading(true);

        try {
            const res = await fetch("/api/user/onboarding", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Something went wrong");
            }

            // Update the session to reflect new onboarding status
            await update({ onboardingCompleted: true, name: name });

            toast.success("Profile updated!");
            router.push("/dashboard");
            router.refresh();

        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsLoading(false);
        }
    };

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
