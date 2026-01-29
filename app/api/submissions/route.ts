import { NextResponse } from "next/server";
import { submissionService } from "@/libs/services/submissionService";

export async function POST(req: Request) {
    try {
        const { formId, answers, metadata } = await req.json();

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

        const submission = await submissionService.submitResponse(formId, answers, refinedMetadata || {});
        return NextResponse.json(submission, { status: 201 });
    } catch (error: any) {
        console.error("Submission Error:", error);
        return NextResponse.json({ error: error.message || "Internal Server Error", details: error.errors }, { status: 500 });
    }
}
