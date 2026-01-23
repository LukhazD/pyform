import { NextResponse } from "next/server";
import { auth } from "@/libs/next-auth";
// import { authOptions } from "@/libs/next-auth";
import { submissionService } from "@/libs/services/submissionService";

export async function GET(req: Request, props: { params: Promise<{ formId: string }> }) {
    const params = await props.params;
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const analytics = await submissionService.getAnalytics(params.formId);
        return NextResponse.json(analytics);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
