import { NextResponse } from "next/server";
import { auth } from "@/libs/next-auth";
// import { authOptions } from "@/libs/next-auth";
import Question from "@/models/Question";
import connectMongo from "@/libs/mongoose";
import { formService } from "@/libs/services/formService";

export async function POST(req: Request, props: { params: Promise<{ formId: string }> }) {
    const params = await props.params;
    const session = await auth();
    if (!session || !session.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        await connectMongo();
        const { formId } = params;

        const form = await formService.getForm(formId);
        if (!form) return NextResponse.json({ error: "Form not found" }, { status: 404 });

        // Security Check
        if (form.userId.toString() !== session.user.id) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

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
    if (!session || !session.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        await connectMongo();

        const form = await formService.getForm(params.formId);
        if (!form) return NextResponse.json({ error: "Form not found" }, { status: 404 });

        // Security Check
        if (form.userId.toString() !== session.user.id) {
            console.log(`Forbidden access attempt: Form owner ${form.userId} vs Session user ${session.user.id}`);
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const questions = await Question.find({ formId: form._id }).sort({ order: 1 });
        return NextResponse.json(questions);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PUT(req: Request, props: { params: Promise<{ formId: string }> }) {
    const params = await props.params;
    const session = await auth();
    if (!session || !session.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        await connectMongo();
        const { formId } = params;

        const form = await formService.getForm(formId);
        if (!form) return NextResponse.json({ error: "Form not found" }, { status: 404 });

        // Security Check
        if (form.userId.toString() !== session.user.id) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const questions = await req.json();

        // 1. Get current questions from DB to track what needs deletion
        const currentQuestions = await Question.find({ formId: form._id }, '_id id');
        const currentIds = currentQuestions.map(q => q.id);

        const updatedIds: string[] = [];
        const seenIds = new Set<string>();

        // 2. Upsert each incoming question
        const upsertPromises = questions.map(async (q: any) => {
            const { _id, id, ...rest } = q;

            // Validate ObjectIds to prevent Casting Errors
            let validDbId = (typeof _id === 'string' && /^[0-9a-fA-F]{24}$/.test(_id)) ? _id : undefined;

            // The frontend UUID is reliable for syncing
            const frontendId = id || _id;

            // Avoid duplicate ID errors if duplicate module fired
            if (frontendId && seenIds.has(frontendId)) {
                return null;
            }
            if (frontendId) seenIds.add(frontendId);
            updatedIds.push(frontendId);

            const questionData = {
                ...rest,
                formId: form._id,
                id: frontendId
            };

            // Using findOneAndUpdate with upsert ensures we don't drop existing ObjectIds/refs
            if (validDbId) {
                return Question.findOneAndUpdate(
                    { _id: validDbId, formId: form._id },
                    { $set: questionData },
                    { upsert: true, new: true }
                );
            } else {
                // Try matching by the frontend `id` instead
                return Question.findOneAndUpdate(
                    { id: frontendId, formId: form._id },
                    { $set: questionData },
                    { upsert: true, new: true }
                );
            }
        });

        const updatedQuestions = (await Promise.all(upsertPromises)).filter(Boolean);

        // 3. Delete only the questions that are no longer in the updated list
        const idsToDelete = currentIds.filter(id => !updatedIds.includes(id));
        if (idsToDelete.length > 0) {
            await Question.deleteMany({ formId: form._id, id: { $in: idsToDelete } });
        }

        // Return the fresh data so the frontend can receive any newly minted ObjectIds
        return NextResponse.json(updatedQuestions);
    } catch (error: any) {
        console.error("Error updates questions:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
