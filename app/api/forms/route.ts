import { auth } from "@/libs/next-auth";
import connectMongo from "@/libs/mongoose";
import Form from "@/models/Form";
import Question from "@/models/Question";
import { NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { checkActiveSubscription, SUBSCRIPTION_INACTIVE_ERROR } from "@/libs/api/requireActiveSubscription";
import { authenticateApiKey } from "@/libs/api/authenticateApiKey";
import { adaptPyformSchema, parsePyformPayload } from "@/adapters/PyformAdapter";

/**
 * Resolve the authenticated userId from either:
 * 1. x-api-key header (external plugins like Claude)
 * 2. NextAuth session (web app)
 *
 * Returns userId on success, or a NextResponse error to return immediately.
 */
async function resolveUserId(req: Request): Promise<string | NextResponse> {
    // Path 1: API Key auth (check header first — avoids session overhead for plugins)
    const apiKeyHeader = req.headers.get("x-api-key");
    if (apiKeyHeader) {
        const result = await authenticateApiKey(req);
        if (result.authenticated === false) return result.response;
        if (result.authenticated === true) return result.user._id.toString();
    }

    // Path 2: Session auth (web app)
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!checkActiveSubscription(session)) {
        return NextResponse.json(SUBSCRIPTION_INACTIVE_ERROR, { status: 403 });
    }
    return session.user.id;
}

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
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await connectMongo();

        const forms = await Form.find({ userId: session.user.id })
            .sort({ updatedAt: -1 })
            .lean();

        return NextResponse.json(forms);
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
