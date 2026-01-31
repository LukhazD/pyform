import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import { UserService } from "@/services/UserService";

export function useOnboardingViewModel() {
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
            await UserService.updateOnboarding(name);

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

    return {
        name,
        setName,
        isLoading,
        handleSubmit
    };
}
