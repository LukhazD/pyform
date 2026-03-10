import { NextResponse } from "next/server";
import { auth } from "@/libs/next-auth";
import { formService } from "@/libs/services/formService";
import Form from "@/models/Form";
import { checkActiveSubscription, SUBSCRIPTION_INACTIVE_ERROR } from "@/libs/api/requireActiveSubscription";

export async function GET(req: Request, props: { params: Promise<{ formId: string }> }) {
    const params = await props.params;
    const session = await auth();
    if (!session || !session.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const form = await formService.getForm(params.formId);
        if (!form) return NextResponse.json({ error: "Form not found" }, { status: 404 });

        // Security Check: Ensure user owns the form
        if (form.userId.toString() !== session.user.id) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        return NextResponse.json(form);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PATCH(req: Request, props: { params: Promise<{ formId: string }> }) {
    const params = await props.params;
    const session = await auth();
    if (!session || !session.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Check subscription status
    if (!checkActiveSubscription(session)) {
        return NextResponse.json(SUBSCRIPTION_INACTIVE_ERROR, { status: 403 });
    }

    try {
        const form = await formService.getForm(params.formId);
        if (!form) return NextResponse.json({ error: "Form not found" }, { status: 404 });

        // Security Check: Ensure user owns the form
        if (form.userId.toString() !== session.user.id) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const data = await req.json();

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
    const session = await auth();
    if (!session || !session.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Check subscription status
    if (!checkActiveSubscription(session)) {
        return NextResponse.json(SUBSCRIPTION_INACTIVE_ERROR, { status: 403 });
    }

    try {
        const form = await formService.getForm(params.formId);
        if (!form) return NextResponse.json({ error: "Form not found" }, { status: 404 });

        // Security Check: Ensure user owns the form
        if (form.userId.toString() !== session.user.id) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const success = await formService.deleteForm(params.formId);
        return NextResponse.json({ success });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
