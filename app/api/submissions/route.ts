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

        const body = await req.json();
        const { formId, answers, metadata, completionTimeMs } = body;

        // Basic input validation — this endpoint is public (no auth required)
        if (!formId || typeof formId !== "string" || !/^[0-9a-fA-F]{24}$/.test(formId)) {
            return NextResponse.json({ error: "Invalid formId" }, { status: 400 });
        }
        if (!Array.isArray(answers)) {
            return NextResponse.json({ error: "answers must be an array" }, { status: 400 });
        }
        if (!metadata || typeof metadata !== "object") {
            return NextResponse.json({ error: "metadata is required" }, { status: 400 });
        }
        if (!metadata.deviceType || !["desktop", "mobile", "tablet"].includes(metadata.deviceType)) {
            return NextResponse.json({ error: "Invalid deviceType" }, { status: 400 });
        }

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
        // Return error codes that the client can translate
        const msg = error.message || "";
        if (msg.includes("no encontrado")) {
            return NextResponse.json({ error: "FORM_NOT_FOUND" }, { status: 404 });
        }
        if (msg.startsWith("FORM_RESPONSE_LIMIT_REACHED")) {
            return NextResponse.json({ error: msg }, { status: 429 });
        }
        if (msg === "DUPLICATE_SUBMISSION") {
            return NextResponse.json({ error: "DUPLICATE_SUBMISSION" }, { status: 409 });
        }
        return NextResponse.json({ error: "SUBMISSION_ERROR" }, { status: 500 });
    }
}
