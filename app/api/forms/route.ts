import connectMongo from "@/libs/mongoose";
import Form from "@/models/Form";
import Question from "@/models/Question";
import { NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { resolveUserId } from "@/libs/api/resolveUserId";
import { adaptPyformSchema, parsePyformPayload } from "@/adapters/PyformAdapter";

export async function POST(req: Request) {
    try {
        const userIdOrError = await resolveUserId(req);
        if (userIdOrError instanceof NextResponse) return userIdOrError;
        const userId = userIdOrError;

        const body = await req.json();

        await connectMongo();

        // ── Pyform plugin path: full schema with questions ──
        if (body.fields && Array.isArray(body.fields)) {
            const parsed = parsePyformPayload(body);
            if (parsed.ok === false) {
                return NextResponse.json(
                    { error: "Payload inválido", details: parsed.errors },
                    { status: 400 }
                );
            }
            if (parsed.ok !== true) {
                return NextResponse.json({ error: "Error de parsing" }, { status: 400 });
            }

            const adapted = adaptPyformSchema(parsed.schema);
            const shortId = nanoid(8);

            const form = await Form.create({
                userId,
                title: adapted.title,
                description: adapted.description,
                shortId,
                status: "draft",
                settings: adapted.settings,
                styling: adapted.styling,
            });

            // Bulk-insert questions linked to the new form
            if (adapted.questions.length > 0) {
                const questionDocs = adapted.questions.map((q) => ({
                    ...q,
                    formId: form._id,
                }));
                await Question.insertMany(questionDocs);
            }

            return NextResponse.json({
                form,
                questionsCreated: adapted.questions.length,
                unmappedFields: adapted.unmappedFields,
            });
        }

        // ── Standard web path: simple form creation ──
        const { title, description } = body;

        if (!title) {
            return NextResponse.json({ error: "Title is required" }, { status: 400 });
        }

        const shortId = nanoid(8);

        const form = await Form.create({
            userId,
            title,
            description,
            shortId,
            status: "draft",
            settings: {},
            styling: {},
        });

        return NextResponse.json(form);
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function GET(req: Request) {
    try {
        const userIdOrError = await resolveUserId(req);
        if (userIdOrError instanceof NextResponse) return userIdOrError;
        const userId = userIdOrError;

        await connectMongo();

        const forms = await Form.find({ userId })
            .sort({ updatedAt: -1 })
            .lean();

        return NextResponse.json(forms);
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
