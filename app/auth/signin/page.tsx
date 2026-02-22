"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button, Input, Card, CardBody, CardHeader } from "@heroui/react";
import Image from "next/image";
import { useAuthViewModel } from "@/hooks/useAuthViewModel";

export default function SigninPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const {
        email,
        setEmail,
        isLoading,
        isGoogleLoading,
        handleEmailSignIn,
        handleGoogleSignIn
    } = useAuthViewModel();

    useEffect(() => {
        if (status === "authenticated") {
            router.replace("/dashboard");
        }
    }, [status, router]);

    if (status === "loading" || status === "authenticated") {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
            </div>
        );
    }


    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
            <Card className="w-full max-w-md p-6 shadow-xl bg-white">
                <CardHeader className="flex flex-col gap-3 pb-8 text-center">
                    <div className="mx-auto mb-2">
                        <Image src="/assets/icons/logo.png" alt="PyForm Logo" width={48} height={48} className="rounded-xl" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Bienvenido de nuevo</h1>
                        <p className="text-gray-500 mt-2 text-sm">
                            Inicia sesión para continuar en PyForm
                        </p>
                    </div>
                </CardHeader>
                <CardBody className="px-0 py-0 overflow-visible">
                    <div className="flex flex-col gap-4">
                        <Button
                            size="lg"
                            variant="bordered"
                            className="w-full font-medium border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700 relative"
                            onPress={handleGoogleSignIn}
                            isLoading={isGoogleLoading}
                            startContent={
                                !isGoogleLoading && (
                                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                                        <path
                                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                            fill="#4285F4"
                                        />
                                        <path
                                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                            fill="#34A853"
                                        />
                                        <path
                                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                            fill="#FBBC05"
                                        />
                                        <path
                                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                            fill="#EA4335"
                                        />
                                    </svg>
                                )
                            }
                        >
                            Continuar con Google
                        </Button>

                        <div className="relative flex py-2 items-center">
                            <div className="flex-grow border-t border-gray-200"></div>
                            <span className="flex-shrink-0 mx-4 text-gray-400 text-xs">O CON EMAIL</span>
                            <div className="flex-grow border-t border-gray-200"></div>
                        </div>

                        <form onSubmit={handleEmailSignIn} className="flex flex-col gap-4">
                            <Input
                                type="email"
                                label="Email"
                                placeholder="tu@email.com"
                                value={email}
                                onValueChange={setEmail}
                                variant="bordered"
                                labelPlacement="outside"
                                size="lg"
                                classNames={{
                                    inputWrapper: "border-2 border-gray-200 focus-within:border-gray-900 h-12",
                                    label: "text-sm font-medium text-gray-700 mb-2",
                                    input: "text-base"
                                }}
                                isRequired
                            />

                            <Button
                                type="submit"
                                size="lg"
                                isLoading={isLoading}
                                className="w-full font-medium bg-gray-900 text-white hover:bg-gray-800 shadow-lg shadow-gray-900/10"
                            >
                                {isLoading ? "Enviando enlace..." : "Enviar enlace mágico"}
                            </Button>
                        </form>
                    </div>
                </CardBody>
            </Card>
        </div>
    );
}
