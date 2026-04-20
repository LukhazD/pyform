import { useState } from "react";
import toast from "react-hot-toast";
import { useTranslations } from "next-intl";

export function useClipboard() {
    const [copiedText, setCopiedText] = useState<string | null>(null);
    const t = useTranslations("common");

    const copyToClipboard = async (text: string) => {
        if (!text) return;

        try {
            if (navigator.clipboard) {
                await navigator.clipboard.writeText(text);
                toast.success(t("linkCopied"));
                setCopiedText(text);
            } else {
                // Fallback using legacy execCommand
                const textArea = document.createElement("textarea");
                textArea.value = text;
                textArea.style.position = "fixed";  // Avoid scrolling to bottom
                textArea.style.left = "-9999px";
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();

                try {
                    const successful = document.execCommand('copy');
                    if (successful) {
                        toast.success(t("linkCopied"));
                        setCopiedText(text);
                    } else {
                        toast.error(t("linkCopyError"));
                    }
                } catch (err) {
                    toast.error(t("linkCopyError"));
                }

                document.body.removeChild(textArea);
            }
        } catch (err) {
            toast.error(t("linkCopyError"));
        }
    };

    return { copyToClipboard, copiedText };
}
