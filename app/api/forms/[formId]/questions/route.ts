import { NextResponse } from "next/server";
import { auth } from "@/libs/next-auth";
import { authOptions } from "@/libs/next-auth";
import Question from "@/models/Question";
import connectMongo from "@/libs/mongoose";

export async function POST(req: Request, { params }: { params: { formId: string } }) {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        await connectMongo();
        const data = await req.json();
        const { formId } = params;

        const question = await Question.create({
            ...data,
            formId,
        });

        return NextResponse.json(question, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function GET(req: Request, { params }: { params: { formId: string } }) {
    // Public access might be needed for rendering, or protected?
    // Usually questions are fetched with form publically.
    // But this endpoint might be for editor.
    // Checking session for now.
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        await connectMongo();
        const questions = await Question.find({ formId: params.formId }).sort({ order: 1 });
        return NextResponse.json(questions);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
