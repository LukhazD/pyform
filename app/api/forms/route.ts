import { auth } from "@/libs/next-auth";
import connectMongo from "@/libs/mongoose";
import Form from "@/models/Form";
import User from "@/models/User";
import config from "@/config";
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



        // ...

        await connectMongo();

        // 1. Fetch User to check limits
        const user = await User.findById(session.user.id);
        if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

        // 2. Count existing forms
        const formCount = await Form.countDocuments({ userId: session.user.id });

        // 3. Determine Limit (with Hotfix for existing Annual users who might have limit=5)
        let limit = user.formLimit ?? 5; // Default to 5 if undefined

        const annualPriceId = config.stripe.plans.find(p => p.name === "Pro Anual")?.priceId;

        // If user is on Annual plan but has a limit of 5 (legacy/bug), treat as unlimited (-1)
        if (user.stripePriceId === annualPriceId && limit === 5) {
            limit = -1;
            // Optionally update DB lazily?
            // await User.findByIdAndUpdate(user._id, { formLimit: -1 });
        }

        // 4. Enforce Limit
        // If limit is not -1 (unlimited) and count >= limit
        if (limit !== -1 && formCount >= limit) {
            return NextResponse.json({
                error: "Limit reached",
                message: `Has alcanzado el límite de ${limit} formularios. Actualiza a Pro Anual para ilimitados.`
            }, { status: 403 });
        }

        const shortId = nanoid(8); // Generate short ID for public URL

        const form = await Form.create({
            userId: session.user.id,
            title,
            description,
            shortId,
            status: "draft",
            settings: {}, // Defaults from schema
            styling: {}, // Defaults from schema
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
