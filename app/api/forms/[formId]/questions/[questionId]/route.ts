import { NextResponse } from "next/server";
import { auth } from "@/libs/next-auth";
// import { authOptions } from "@/libs/next-auth";
import Question from "@/models/Question";
import Form from "@/models/Form";
import connectMongo from "@/libs/mongoose";

export async function PATCH(req: Request, props: { params: Promise<{ formId: string, questionId: string }> }) {
    const params = await props.params;
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        await connectMongo();

        // 1. Verify Form Ownership first
        const form = await Form.findById(params.formId);
        if (!form) return NextResponse.json({ error: "Form not found" }, { status: 404 });
        
        if (form.userId.toString() !== session.user.id) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const body = await req.json();

        // Whitelist allowed fields to prevent mass assignment (C-4)
        const ALLOWED_QUESTION_FIELDS = ["type", "order", "title", "description", "isRequired", "validation", "options", "placeholder", "showConfetti"];
        const data: Record<string, unknown> = {};
        for (const key of ALLOWED_QUESTION_FIELDS) {
            if (key in body) {
                data[key] = body[key];
            }
        }

        const question = await Question.findOneAndUpdate(
            { _id: params.questionId, formId: params.formId },
            { $set: data },
            { new: true }
        );

        if (!question) return NextResponse.json({ error: "Question not found" }, { status: 404 });
        return NextResponse.json(question);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(req: Request, props: { params: Promise<{ formId: string, questionId: string }> }) {
    const params = await props.params;
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        await connectMongo();

        // 1. Verify Form Ownership first
        const form = await Form.findById(params.formId);
        if (!form) return NextResponse.json({ error: "Form not found" }, { status: 404 });

        if (form.userId.toString() !== session.user.id) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const result = await Question.findOneAndDelete({ _id: params.questionId, formId: params.formId });
        if (!result) return NextResponse.json({ error: "Question not found" }, { status: 404 });
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
