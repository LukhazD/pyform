import { NextResponse } from "next/server";
import Question from "@/models/Question";
import connectMongo from "@/libs/mongoose";
import { formService } from "@/libs/services/formService";
import { resolveUserId } from "@/libs/api/resolveUserId";

/**
 * Normalizes a question object so that data arriving in the pyform plugin
 * field format (label, options without id/value) is converted to the internal
 * Mongoose schema format (title, options with id/value/order).
 *
 * This is necessary because external tools (Cowork, API keys) may send
 * questions via PUT using the raw pyform schema instead of the editor format.
 */
function normalizeQuestion(q: Record<string, any>): Record<string, any> {
    const out = { ...q };

    // Map `label` → `title` when title is absent (pyform schema uses `label`)
    if (!out.title && out.label) {
        out.title = out.label;
        delete out.label;
    }

    // Map `required` → `isRequired` (pyform schema uses `required`)
    if (out.isRequired === undefined && out.required !== undefined) {
        out.isRequired = !!out.required;
        delete out.required;
    }

    // Normalize options: ensure each has id, value, and order
    if (Array.isArray(out.options)) {
        const seen = new Set<string>();
        out.options = out.options.map((opt: any, index: number) => {
            const label = typeof opt.label === "string" ? opt.label : `Option ${index + 1}`;

            // Generate value from label if missing/empty
            let value =
                typeof opt.value === "string" && opt.value.trim() !== ""
                    ? opt.value
                    : label
                        .toLowerCase()
                        .normalize("NFD")
                        .replace(/[\u0300-\u036f]/g, "")
                        .replace(/[^a-z0-9]+/g, "_")
                        .replace(/^_|_$/g, "") || `option_${index}`;

            // Deduplicate values
            const base = value;
            let suffix = 2;
            while (seen.has(value)) {
                value = `${base}_${suffix++}`;
            }
            seen.add(value);

            return {
                id: typeof opt.id === "string" && opt.id ? opt.id : `opt_${index}`,
                label,
                value,
                order: typeof opt.order === "number" ? opt.order : index,
            };
        });
    }

    return out;
}

export async function POST(req: Request, props: { params: Promise<{ formId: string }> }) {
    const params = await props.params;
    const userIdOrError = await resolveUserId(req);
    if (userIdOrError instanceof NextResponse) return userIdOrError;
    const userId = userIdOrError;

    try {
        await connectMongo();
        const { formId } = params;

        const form = await formService.getForm(formId);
        if (!form) return NextResponse.json({ error: "Form not found" }, { status: 404 });

        // Security Check
        if (form.userId.toString() !== userId) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const body = await req.json();
        const normalized = normalizeQuestion(body);

        // Whitelist allowed fields to prevent mass assignment (C-4)
        const ALLOWED_QUESTION_FIELDS = ["type", "order", "title", "description", "isRequired", "validation", "options", "placeholder", "showConfetti", "id"];
        const data: Record<string, unknown> = {};
        for (const key of ALLOWED_QUESTION_FIELDS) {
            if (key in normalized) {
                data[key] = normalized[key];
            }
        }

        const question = await Question.create({
            ...data,
            formId: form._id, // Always set by server, never from client
        });

        return NextResponse.json(question, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function GET(req: Request, props: { params: Promise<{ formId: string }> }) {
    const params = await props.params;
    const userIdOrError = await resolveUserId(req);
    if (userIdOrError instanceof NextResponse) return userIdOrError;
    const userId = userIdOrError;

    try {
        await connectMongo();

        const form = await formService.getForm(params.formId);
        if (!form) return NextResponse.json({ error: "Form not found" }, { status: 404 });

        // Security Check
        if (form.userId.toString() !== userId) {
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
    const userIdOrError = await resolveUserId(req);
    if (userIdOrError instanceof NextResponse) return userIdOrError;
    const userId = userIdOrError;

    try {
        await connectMongo();
        const { formId } = params;

        const form = await formService.getForm(formId);
        if (!form) return NextResponse.json({ error: "Form not found" }, { status: 404 });

        // Security Check
        if (form.userId.toString() !== userId) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const questions = await req.json();

        // 1. Get current questions from DB to track what needs deletion
        const currentQuestions = await Question.find({ formId: form._id }, '_id id');
        const currentIds = currentQuestions.map(q => q.id);

        const updatedIds: string[] = [];
        const seenIds = new Set<string>();

        // 2. Upsert each incoming question
        const upsertPromises = questions.map(async (raw: any) => {
            const q = normalizeQuestion(raw);
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
