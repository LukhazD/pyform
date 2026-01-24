"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button, Input, Card, CardBody, CardHeader } from "@heroui/react";
import toast from "react-hot-toast";

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
            <Card className="w-full max-w-md p-4">
                <CardHeader className="flex flex-col gap-1 pb-4">
                    <h1 className="text-2xl font-bold">Welcome to PyForm!</h1>
                    <p className="text-sm text-gray-500">
                        Let&apos;s get to know you. Please enter your name to continue.
                    </p>
                </CardHeader>
                <CardBody>
                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <Input
                            label="Full Name"
                            placeholder="Elon Musk"
                            value={name}
                            onValueChange={setName}
                            variant="bordered"
                            isRequired
                            autoFocus
                        />
                        <Button
                            type="submit"
                            color="primary"
                            isLoading={isLoading}
                            className="w-full font-medium"
                        >
                            Continue to Dashboard
                        </Button>
                    </form>
                </CardBody>
            </Card>
        </div>
    );
}
