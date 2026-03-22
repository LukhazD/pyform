import mongoose, { Schema } from "mongoose";
import crypto from "crypto";

export interface IApiKey extends mongoose.Document {
    userId: mongoose.Types.ObjectId;
    /** Display label set by the user (e.g. "Claude Plugin") */
    name: string;
    /** SHA-256 hash of the actual key — we never store the raw key */
    keyHash: string;
    /** First 8 chars of the key for display (e.g. "pyf_a3b1...") */
    keyPrefix: string;
    lastUsedAt?: Date;
    revokedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const apiKeySchema = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        name: {
            type: String,
            required: true,
            trim: true,
            maxlength: 64,
        },
        keyHash: {
            type: String,
            required: true,
            unique: true,
        },
        keyPrefix: {
            type: String,
            required: true,
        },
        lastUsedAt: {
            type: Date,
        },
        revokedAt: {
            type: Date,
        },
    },
    { timestamps: true }
);

// Compound index: fast lookup by userId + only active keys
apiKeySchema.index({ userId: 1, revokedAt: 1 });

// ----- Static helpers -----

/**
 * Generate a new API key and return both the raw key (show once) and the doc.
 * The raw key is NOT persisted — only its SHA-256 hash.
 */
apiKeySchema.statics.generateKey = async function (
    userId: string,
    name: string
): Promise<{ rawKey: string; doc: IApiKey }> {
    const rawKey = `pyf_${crypto.randomBytes(32).toString("hex")}`;
    const keyHash = crypto.createHash("sha256").update(rawKey).digest("hex");
    const keyPrefix = rawKey.slice(0, 12);

    const doc = await this.create({ userId, name, keyHash, keyPrefix });
    return { rawKey, doc };
};

/**
 * Find the active (non-revoked) ApiKey document for a raw key.
 * Also bumps `lastUsedAt`.
 */
apiKeySchema.statics.findByRawKey = async function (
    rawKey: string
): Promise<IApiKey | null> {
    const keyHash = crypto.createHash("sha256").update(rawKey).digest("hex");
    const doc = await this.findOneAndUpdate(
        { keyHash, revokedAt: null },
        { $set: { lastUsedAt: new Date() } },
        { new: true }
    );
    return doc;
};

// ----- Model export with statics typing -----

interface ApiKeyModel extends mongoose.Model<IApiKey> {
    generateKey(userId: string, name: string): Promise<{ rawKey: string; doc: IApiKey }>;
    findByRawKey(rawKey: string): Promise<IApiKey | null>;
}

const ApiKey = (mongoose.models.ApiKey ||
    mongoose.model<IApiKey, ApiKeyModel>("ApiKey", apiKeySchema)) as ApiKeyModel;

export default ApiKey;
