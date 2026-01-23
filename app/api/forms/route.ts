import { NextResponse } from "next/server";
import { auth } from "@/libs/next-auth";
// import { authOptions } from "@/libs/next-auth";
import { formService } from "@/libs/services/formService";

export async function POST(req: Request) {
    const session = await auth();

    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title } = await req.json();
    // Using user ID from session. Assuming session.user.id exists.
    // If not, we might need to fetch user from DB or adjust authOptions
    const userId = (session.user as any)?.id;

    if (!userId) {
        return NextResponse.json({ error: "User ID not found in session" }, { status: 400 });
    }

    try {
        const form = await formService.createForm(userId, title);
        return NextResponse.json(form, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function GET() { // Removed unused req
    const session = await auth();

    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any)?.id;

    try {
        const forms = await formService.listUserForms(userId);
        return NextResponse.json(forms);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
