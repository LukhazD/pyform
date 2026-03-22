import { NextResponse } from "next/server";
import { formService } from "@/libs/services/formService";
import Form from "@/models/Form";
import { resolveUserId } from "@/libs/api/resolveUserId";

export async function GET(req: Request, props: { params: Promise<{ formId: string }> }) {
    const params = await props.params;
    const userIdOrError = await resolveUserId(req);
    if (userIdOrError instanceof NextResponse) return userIdOrError;
    const userId = userIdOrError;

    try {
        const form = await formService.getForm(params.formId);
        if (!form) return NextResponse.json({ error: "Form not found" }, { status: 404 });

        // Security Check: Ensure user owns the form
        if (form.userId.toString() !== userId) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        return NextResponse.json(form);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PATCH(req: Request, props: { params: Promise<{ formId: string }> }) {
    const params = await props.params;
    const userIdOrError = await resolveUserId(req);
    if (userIdOrError instanceof NextResponse) return userIdOrError;
    const userId = userIdOrError;

    try {
        const form = await formService.getForm(params.formId);
        if (!form) return NextResponse.json({ error: "Form not found" }, { status: 404 });

        // Security Check: Ensure user owns the form
        if (form.userId.toString() !== userId) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const body = await req.json();

        // Whitelist allowed fields to prevent mass assignment (C-3)
        const ALLOWED_FIELDS = ["title", "description", "status", "settings", "styling", "publishedAt"];
        const data: Record<string, unknown> = {};
        for (const key of ALLOWED_FIELDS) {
            if (key in body) {
                data[key] = body[key];
            }
        }

        let updatedForm;
        if (data.status === "published") {
            // Atomically increment formVersion when publishing/re-publishing
            const { status, ...rest } = data;
            updatedForm = await Form.findByIdAndUpdate(
                form._id,
                {
                    $set: { ...rest, status: "published" },
                    $inc: { formVersion: 1 }
                },
                { new: true }
            );
        } else {
            updatedForm = await formService.updateForm(params.formId, data);
        }

        return NextResponse.json(updatedForm);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(req: Request, props: { params: Promise<{ formId: string }> }) {
    const params = await props.params;
    const userIdOrError = await resolveUserId(req);
    if (userIdOrError instanceof NextResponse) return userIdOrError;
    const userId = userIdOrError;

    try {
        const form = await formService.getForm(params.formId);
        if (!form) return NextResponse.json({ error: "Form not found" }, { status: 404 });

        // Security Check: Ensure user owns the form
        if (form.userId.toString() !== userId) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const success = await formService.deleteForm(params.formId);
        return NextResponse.json({ success });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
