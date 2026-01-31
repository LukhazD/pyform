import { useState } from "react";
import { signIn } from "next-auth/react";
import toast from "react-hot-toast";
import config from "@/config";

export function useAuthViewModel() {
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);

    const handleEmailSignIn = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) {
            toast.error("Por favor introduce tu email");
            return;
        }

        setIsLoading(true);
        try {
            const res = await signIn("email", {
                email,
                callbackUrl: config.auth.callbackUrl,
                redirect: false
            });

            if (res?.error) {
                toast.error("Error al enviar el magic link");
            } else {
                toast.success("¡Enlace enviado! Revisa tu correo.");
            }
        } catch (error) {
            toast.error("Algo salió mal");
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        setIsGoogleLoading(true);
        await signIn("google", { callbackUrl: config.auth.callbackUrl });
    };

    return {
        email,
        setEmail,
        isLoading,
        isGoogleLoading,
        handleEmailSignIn,
        handleGoogleSignIn
    };
}
