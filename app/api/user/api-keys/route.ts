import { auth } from "@/libs/next-auth";
import connectMongo from "@/libs/mongoose";
import ApiKey from "@/models/ApiKey";
import { NextResponse } from "next/server";

const MAX_KEYS_PER_USER = 5;

/**
 * GET /api/user/api-keys
 * List all active (non-revoked) API keys for the authenticated user.
 * Returns prefix + metadata only — never the full key.
 */
export async function GET() {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await connectMongo();

        const keys = await ApiKey.find({
            userId: session.user.id,
            revokedAt: null,
        })
            .select("name keyPrefix lastUsedAt createdAt")
            .sort({ createdAt: -1 })
            .lean();

        return NextResponse.json({ keys });
    } catch (e) {
        console.error("[api-keys GET]", e);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

/**
 * POST /api/user/api-keys
 * Generate a new API key. Returns the raw key ONCE.
 * Body: { name: string }
 */
export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const name = typeof body.name === "string" ? body.name.trim() : "";

        if (!name || name.length > 64) {
            return NextResponse.json(
                { error: "name es requerido (máx 64 caracteres)" },
                { status: 400 }
            );
        }

        await connectMongo();

        // Enforce per-user key limit
        const activeCount = await ApiKey.countDocuments({
            userId: session.user.id,
            revokedAt: null,
        });
        if (activeCount >= MAX_KEYS_PER_USER) {
            return NextResponse.json(
                { error: `Máximo ${MAX_KEYS_PER_USER} API keys activas permitidas.` },
                { status: 400 }
            );
        }

        const { rawKey, doc } = await ApiKey.generateKey(session.user.id, name);

        return NextResponse.json({
            key: rawKey,
            id: doc._id,
            name: doc.name,
            keyPrefix: doc.keyPrefix,
            createdAt: doc.createdAt,
        });
    } catch (e) {
        console.error("[api-keys POST]", e);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

/**
 * DELETE /api/user/api-keys
 * Revoke an API key.
 * Body: { keyId: string }
 */
export async function DELETE(req: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const keyId = typeof body.keyId === "string" ? body.keyId.trim() : "";

        if (!keyId) {
            return NextResponse.json({ error: "keyId es requerido" }, { status: 400 });
        }

        await connectMongo();

        const result = await ApiKey.findOneAndUpdate(
            { _id: keyId, userId: session.user.id, revokedAt: null },
            { $set: { revokedAt: new Date() } },
            { new: true }
        );

        if (!result) {
            return NextResponse.json({ error: "API Key no encontrada" }, { status: 404 });
        }

        return NextResponse.json({ success: true });
    } catch (e) {
        console.error("[api-keys DELETE]", e);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
