import { NextResponse } from "next/server";
import { submissionService } from "@/libs/services/submissionService";

export async function POST(req: Request) {
    try {
        const { formId, answers, metadata } = await req.json();
        const submission = await submissionService.submitResponse(formId, answers, metadata || {});
        return NextResponse.json(submission, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
