import { NextResponse } from "next/server";
import { auth } from "@/libs/next-auth";
// import { authOptions } from "@/libs/next-auth";
import Question from "@/models/Question";
import connectMongo from "@/libs/mongoose";
import { formService } from "@/libs/services/formService";

export async function POST(req: Request, props: { params: Promise<{ formId: string }> }) {
    const params = await props.params;
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        await connectMongo();
        const { formId } = params;

        const form = await formService.getForm(formId);
        if (!form) return NextResponse.json({ error: "Form not found" }, { status: 404 });

        const data = await req.json();

        const question = await Question.create({
            ...data,
            formId: form._id, // Ensure we use the ObjectId
        });

        return NextResponse.json(question, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function GET(req: Request, props: { params: Promise<{ formId: string }> }) {
    const params = await props.params;
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        await connectMongo();

        const form = await formService.getForm(params.formId);
        if (!form) return NextResponse.json({ error: "Form not found" }, { status: 404 });

        const questions = await Question.find({ formId: form._id }).sort({ order: 1 });
        return NextResponse.json(questions);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PUT(req: Request, props: { params: Promise<{ formId: string }> }) {
    const params = await props.params;
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        await connectMongo();
        const { formId } = params;
        const questions = await req.json();

        const form = await formService.getForm(formId);
        if (!form) return NextResponse.json({ error: "Form not found" }, { status: 404 });

        // Transaction approach would be better but for now simple replacement
        // 1. Delete all existing questions for this form ObjectId
        await Question.deleteMany({ formId: form._id });

        // 2. Prepare questions with correct formId ObjectId
        // Filter out temporary string IDs that are not valid ObjectIds
        const questionsToInsert = questions.map((q: any) => {
            const { _id, id, ...rest } = q;
            // Use _id or id if it is a valid ObjectId, otherwise let mongoose generate one
            const validId = (typeof _id === 'string' && /^[0-9a-fA-F]{24}$/.test(_id)) ? _id :
                (typeof id === 'string' && /^[0-9a-fA-F]{24}$/.test(id)) ? id : undefined;

            return {
                ...rest,
                formId: form._id,
                _id: validId
            };
        });

        // 3. Insert new questions
        const createdQuestions = await Question.insertMany(questionsToInsert);

        return NextResponse.json(createdQuestions);
    } catch (error: any) {
        console.error("Error updates questions:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
