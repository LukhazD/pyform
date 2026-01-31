import { useState } from "react";
import toast from "react-hot-toast";

export function useClipboard() {
    const [copiedText, setCopiedText] = useState<string | null>(null);

    const copyToClipboard = async (text: string) => {
        if (!text) return;

        try {
            if (navigator.clipboard) {
                await navigator.clipboard.writeText(text);
                toast.success("Enlace copiado correctamente");
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
                        toast.success("Enlace copiado correctamente");
                        setCopiedText(text);
                    } else {
                        toast.error("No se pudo copiar el enlace");
                    }
                } catch (err) {
                    toast.error("Error al copiar el enlace");
                }

                document.body.removeChild(textArea);
            }
        } catch (err) {
            toast.error("Error al copiar el enlace");
        }
    };

    return { copyToClipboard, copiedText };
}
