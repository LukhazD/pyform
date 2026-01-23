import { NextResponse } from "next/server";
import { auth } from "@/libs/next-auth";
// import { authOptions } from "@/libs/next-auth"; // Unused
import { formService } from "@/libs/services/formService";

export async function GET(req: Request, props: { params: Promise<{ formId: string }> }) {
    const params = await props.params;
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const form = await formService.getForm(params.formId);
        if (!form) return NextResponse.json({ error: "Form not found" }, { status: 404 });
        return NextResponse.json(form);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PATCH(req: Request, props: { params: Promise<{ formId: string }> }) {
    const params = await props.params;
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const data = await req.json();
        const form = await formService.updateForm(params.formId, data);
        return NextResponse.json(form);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(req: Request, props: { params: Promise<{ formId: string }> }) {
    const params = await props.params;
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const success = await formService.deleteForm(params.formId);
        return NextResponse.json({ success });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
