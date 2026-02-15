import { auth } from "@/libs/next-auth";
import connectMongo from "@/libs/mongoose";
import Form from "@/models/Form";
import { NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { checkActiveSubscription, SUBSCRIPTION_INACTIVE_ERROR } from "@/libs/api/requireActiveSubscription";

export async function POST(req: Request) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Check subscription status
        if (!checkActiveSubscription(session)) {
            return NextResponse.json(SUBSCRIPTION_INACTIVE_ERROR, { status: 403 });
        }

        const body = await req.json();
        const { title, description } = body;

        if (!title) {
            return NextResponse.json({ error: "Title is required" }, { status: 400 });
        }

        await connectMongo();

        const shortId = nanoid(8);

        const form = await Form.create({
            userId: session.user.id,
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
