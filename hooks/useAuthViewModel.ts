import { useState } from "react";
import { signIn } from "next-auth/react";
import toast from "react-hot-toast";
import { useTranslations } from "next-intl";
import config from "@/config";

export function useAuthViewModel() {
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);
    const t = useTranslations("auth");

    const handleEmailSignIn = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) {
            toast.error(t("enterEmail"));
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
                toast.error(t("magicLinkError"));
            } else {
                toast.success(t("linkSent"));
            }
        } catch (error) {
            toast.error(t("somethingWentWrong"));
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
