import connectMongo from "@/libs/mongoose";
import ApiKey from "@/models/ApiKey";
import User, { type IUser } from "@/models/User";
import { hasActiveProAccess } from "@/libs/subscriptionUtils";
import { NextResponse } from "next/server";

export interface ApiKeyAuthResult {
    authenticated: true;
    user: IUser;
}

export interface ApiKeyAuthError {
    authenticated: false;
    response: NextResponse;
}

/**
 * Authenticate an incoming request via the `x-api-key` header.
 *
 * Returns the user if the key is valid and subscription is active.
 * Returns a ready-to-send NextResponse on failure (401, 402, 500).
 *
 * Usage in a route handler:
 * ```ts
 * const result = await authenticateApiKey(req);
 * if (!result.authenticated) return result.response;
 * const user = result.user;
 * ```
 */
export async function authenticateApiKey(
    req: Request
): Promise<ApiKeyAuthResult | ApiKeyAuthError> {
    const apiKey = req.headers.get("x-api-key");

    if (!apiKey) {
        return {
            authenticated: false,
            response: NextResponse.json(
                { error: "API Key requerida en el header x-api-key" },
                { status: 401 }
            ),
        };
    }

    try {
        await connectMongo();

        const keyDoc = await ApiKey.findByRawKey(apiKey);
        if (!keyDoc) {
            return {
                authenticated: false,
                response: NextResponse.json(
                    { error: "API Key inválida o revocada" },
                    { status: 401 }
                ),
            };
        }

        const user = await User.findById(keyDoc.userId);
        if (!user) {
            return {
                authenticated: false,
                response: NextResponse.json(
                    { error: "Usuario asociado no encontrado" },
                    { status: 401 }
                ),
            };
        }

        // Business rule: check active subscription
        if (!hasActiveProAccess(user)) {
            return {
                authenticated: false,
                response: NextResponse.json(
                    {
                        error:
                            "Suscripción inactiva. Renueva tu plan para usar pyform.",
                    },
                    { status: 402 }
                ),
            };
        }

        return { authenticated: true, user };
    } catch (e) {
        console.error("[authenticateApiKey]", e);
        return {
            authenticated: false,
            response: NextResponse.json(
                { error: "Error interno de autenticación" },
                { status: 500 }
            ),
        };
    }
}
