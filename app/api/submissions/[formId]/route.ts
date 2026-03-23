import { NextResponse } from "next/server";
import { resolveUserId } from "@/libs/api/resolveUserId";
import { submissionService } from "@/libs/services/submissionService";
import Form from "@/models/Form";
import connectMongo from "@/libs/mongoose";

export async function GET(req: Request, props: { params: Promise<{ formId: string }> }) {
    const params = await props.params;
    const userIdOrError = await resolveUserId(req);
    if (userIdOrError instanceof NextResponse) return userIdOrError;
    const userId = userIdOrError;

    try {
        await connectMongo();
        const form = await Form.findById(params.formId);

        if (!form) return NextResponse.json({ error: "Form not found" }, { status: 404 });

        // Security Check: Ensure user owns the form
        if (form.userId.toString() !== userId) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const submissions = await submissionService.getSubmissions(params.formId);

        return NextResponse.json(submissions);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
