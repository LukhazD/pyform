import { NextResponse } from "next/server";
import { submissionService } from "@/libs/services/submissionService";
import { checkRateLimit } from "@/libs/rateLimit";

// Rate limits: 5 submissions per minute per IP, 20 per minute per formId
const IP_LIMIT = 5;
const FORM_LIMIT = 20;
const WINDOW_MS = 60_000;

export async function POST(req: Request) {
    try {
        // Rate limiting by IP
        const forwarded = req.headers.get("x-forwarded-for");
        const ip = forwarded?.split(",")[0]?.trim() || "unknown";

        if (!checkRateLimit(`sub:ip:${ip}`, IP_LIMIT, WINDOW_MS)) {
            return NextResponse.json(
                { error: "Too many submissions. Please try again later." },
                { status: 429 }
            );
        }

        const { formId, answers, metadata, completionTimeMs } = await req.json();

        // Rate limiting by formId
        if (!checkRateLimit(`sub:form:${formId}`, FORM_LIMIT, WINDOW_MS)) {
            return NextResponse.json(
                { error: "This form is receiving too many submissions. Please try again later." },
                { status: 429 }
            );
        }

        // Refine metadata
        const userAgent = metadata.userAgent || "";
        let browser = metadata.browser || "unknown";

        if (browser === "unknown") {
            if (userAgent.indexOf("Firefox") > -1) {
                browser = "Firefox";
            } else if (userAgent.indexOf("SamsungBrowser") > -1) {
                browser = "Samsung Internet";
            } else if (userAgent.indexOf("Opera") > -1 || userAgent.indexOf("OPR") > -1) {
                browser = "Opera";
            } else if (userAgent.indexOf("Trident") > -1) {
                browser = "Internet Explorer";
            } else if (userAgent.indexOf("Edge") > -1) {
                browser = "Edge";
            } else if (userAgent.indexOf("Chrome") > -1) {
                browser = "Chrome";
            } else if (userAgent.indexOf("Safari") > -1) {
                browser = "Safari";
            } else {
                browser = "unknown";
            }
        }

        const refinedMetadata = {
            ...metadata,
            browser,
        };

        const submission = await submissionService.submitResponse(formId, answers, refinedMetadata || {}, completionTimeMs || 0);
        return NextResponse.json(submission, { status: 201 });
    } catch (error: any) {
        console.error("Submission Error:", error);
        // Only expose safe error messages to the client
        const safeMessages = [
            "Formulario no encontrado",
            "Este formulario no está disponible temporalmente",
        ];
        const message = safeMessages.find(m => error.message?.includes(m))
            || (error.message?.startsWith("Este formulario ha alcanzado") ? error.message : "Error al enviar respuesta");
        return NextResponse.json({ error: message }, { status: error.message?.includes("no encontrado") ? 404 : 500 });
    }
}
