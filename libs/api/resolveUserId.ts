import { NextResponse } from "next/server";
import { auth } from "@/libs/next-auth";
import { authenticateApiKey } from "@/libs/api/authenticateApiKey";
import { checkActiveSubscription, SUBSCRIPTION_INACTIVE_ERROR } from "@/libs/api/requireActiveSubscription";

/**
 * Resolve the authenticated userId from either:
 * 1. x-api-key header (external plugins like Claude)
 * 2. NextAuth session (web app)
 *
 * Returns userId on success, or a NextResponse error to return immediately.
 */
export async function resolveUserId(req: Request): Promise<string | NextResponse> {
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
