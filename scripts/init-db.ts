// Database Initialization Script
// Creates collections with JSON Schema validators and indexes (no seed data)
// Run with: pnpm init-db

import "dotenv/config";
import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI!;

async function initDatabase() {
    console.log("🚀 Initializing database structure...\n");

    await mongoose.connect(MONGODB_URI, { dbName: "pyform" });
    const db = mongoose.connection.db!;

    // ============================================================
    // USERS COLLECTION
    // ============================================================
    console.log("📦 Creating 'users' collection...");
    try {
        await db.createCollection("users", {
            validator: {
                $jsonSchema: {
                    bsonType: "object",
                    required: ["email"],
                    properties: {
                        name: { bsonType: "string" },
                        email: { bsonType: "string" },
                        image: { bsonType: "string" },
                        googleId: { bsonType: "string" },
                        role: { enum: ["user", "admin", "superadmin"] },
                        subscriptionTier: { enum: ["pro", null] },
                        subscriptionStatus: { enum: ["active", "canceled", "past_due", "trialing", null] },
                        stripeCustomerId: { bsonType: "string" },
                        stripeSubscriptionId: { bsonType: "string" },
                        stripePriceId: { bsonType: "string" },
                        formLimit: { bsonType: "int" },
                        onboardingCompleted: { bsonType: "bool" },
                        createdAt: { bsonType: "date" },
                        updatedAt: { bsonType: "date" },
                    },
                },
            },
        });
    } catch (e: any) {
        if (e.codeName === "NamespaceExists") {
            console.log("   ⚠️  Collection exists, updating validator...");
            await db.command({
                collMod: "users",
                validator: {
                    $jsonSchema: {
                        bsonType: "object",
                        required: ["email"],
                        properties: {
                            name: { bsonType: "string" },
                            email: { bsonType: "string" },
                            role: { enum: ["user", "admin", "superadmin"] },
                            subscriptionTier: { enum: ["pro", null] },
                            subscriptionStatus: { enum: ["active", "canceled", "past_due", "trialing", null] },
                        },
                    },
                },
            });
        } else throw e;
    }
    await db.collection("users").createIndex({ email: 1 }, { unique: true });
    await db.collection("users").createIndex({ googleId: 1 }, { unique: true, sparse: true });
    console.log("   ✅ users: validator + indexes created\n");

    // ============================================================
    // SUBSCRIPTIONS COLLECTION
    // ============================================================
    console.log("📦 Creating 'subscriptions' collection...");
    try {
        await db.createCollection("subscriptions", {
            validator: {
                $jsonSchema: {
                    bsonType: "object",
                    required: ["userId", "stripeSubscriptionId", "status", "tier"],
                    properties: {
                        userId: { bsonType: "objectId" },
                        stripeSubscriptionId: { bsonType: "string" },
                        stripePriceId: { bsonType: "string" },
                        status: { enum: ["active", "canceled", "past_due", "trialing"] },
                        tier: { enum: ["pro"] },
                        currentPeriodStart: { bsonType: "date" },
                        currentPeriodEnd: { bsonType: "date" },
                        cancelAtPeriodEnd: { bsonType: "bool" },
                    },
                },
            },
        });
    } catch (e: any) {
        if (e.codeName !== "NamespaceExists") throw e;
        console.log("   ⚠️  Collection exists, skipping...");
    }
    await db.collection("subscriptions").createIndex({ userId: 1 });
    await db.collection("subscriptions").createIndex({ stripeSubscriptionId: 1 }, { unique: true });
    console.log("   ✅ subscriptions: validator + indexes created\n");

    // ============================================================
    // FORMS COLLECTION
    // ============================================================
    console.log("📦 Creating 'forms' collection...");
    try {
        await db.createCollection("forms", {
            validator: {
                $jsonSchema: {
                    bsonType: "object",
                    required: ["userId", "title", "shortId"],
                    properties: {
                        userId: { bsonType: "objectId" },
                        title: { bsonType: "string" },
                        description: { bsonType: "string" },
                        status: { enum: ["draft", "published", "closed"] },
                        shortId: { bsonType: "string" },
                        settings: { bsonType: "object" },
                        styling: { bsonType: "object" },
                        publishedAt: { bsonType: "date" },
                    },
                },
            },
        });
    } catch (e: any) {
        if (e.codeName !== "NamespaceExists") throw e;
        console.log("   ⚠️  Collection exists, skipping...");
    }
    await db.collection("forms").createIndex({ userId: 1 });
    await db.collection("forms").createIndex({ shortId: 1 }, { unique: true });
    await db.collection("forms").createIndex({ status: 1 });
    await db.collection("forms").createIndex({ userId: 1, createdAt: -1 });
    console.log("   ✅ forms: validator + indexes created\n");

    // ============================================================
    // QUESTIONS COLLECTION
    // ============================================================
    console.log("📦 Creating 'questions' collection...");
    const questionTypes = [
        "TEXT", "EMAIL", "NUMBER", "PHONE", "URL", "TEXTAREA",
        "MULTIPLE_CHOICE", "CHECKBOXES", "DROPDOWN", "DATE", "FILE_UPLOAD"
    ];
    try {
        await db.createCollection("questions", {
            validator: {
                $jsonSchema: {
                    bsonType: "object",
                    required: ["formId", "type", "order", "title"],
                    properties: {
                        formId: { bsonType: "objectId" },
                        type: { enum: questionTypes },
                        order: { bsonType: "int" },
                        title: { bsonType: "string" },
                        description: { bsonType: "string" },
                        isRequired: { bsonType: "bool" },
                        validation: { bsonType: "object" },
                        options: { bsonType: "array" },
                        placeholder: { bsonType: "string" },
                    },
                },
            },
        });
    } catch (e: any) {
        if (e.codeName !== "NamespaceExists") throw e;
        console.log("   ⚠️  Collection exists, skipping...");
    }
    await db.collection("questions").createIndex({ formId: 1 });
    await db.collection("questions").createIndex({ formId: 1, order: 1 });
    console.log("   ✅ questions: validator + indexes created\n");

    // ============================================================
    // SUBMISSIONS COLLECTION
    // ============================================================
    console.log("📦 Creating 'submissions' collection...");
    try {
        await db.createCollection("submissions", {
            validator: {
                $jsonSchema: {
                    bsonType: "object",
                    required: ["formId", "status", "metadata", "completionTimeMs"],
                    properties: {
                        formId: { bsonType: "objectId" },
                        status: { enum: ["completed", "partial"] },
                        answers: { bsonType: "array" },
                        metadata: {
                            bsonType: "object",
                            required: ["userAgent", "deviceType", "browser"],
                            properties: {
                                deviceType: { enum: ["desktop", "mobile", "tablet"] },
                            },
                        },
                        submittedAt: { bsonType: "date" },
                        completionTimeMs: { bsonType: "int" },
                    },
                },
            },
        });
    } catch (e: any) {
        if (e.codeName !== "NamespaceExists") throw e;
        console.log("   ⚠️  Collection exists, skipping...");
    }
    await db.collection("submissions").createIndex({ formId: 1 });
    await db.collection("submissions").createIndex({ formId: 1, submittedAt: -1 });
    await db.collection("submissions").createIndex({ status: 1 });
    await db.collection("submissions").createIndex({ "answers.questionId": 1 });
    console.log("   ✅ submissions: validator + indexes created\n");

    // ============================================================
    // FORMANALYTICS COLLECTION
    // ============================================================
    console.log("📦 Creating 'formanalytics' collection...");
    try {
        await db.createCollection("formanalytics", {
            validator: {
                $jsonSchema: {
                    bsonType: "object",
                    required: ["formId"],
                    properties: {
                        formId: { bsonType: "objectId" },
                        totalSubmissions: { bsonType: "int" },
                        completedSubmissions: { bsonType: "int" },
                        partialSubmissions: { bsonType: "int" },
                        completionRate: { bsonType: "double" },
                        averageCompletionTimeMs: { bsonType: "int" },
                        dropOffByQuestion: { bsonType: "array" },
                        submissionTimeline: { bsonType: "array" },
                    },
                },
            },
        });
    } catch (e: any) {
        if (e.codeName !== "NamespaceExists") throw e;
        console.log("   ⚠️  Collection exists, skipping...");
    }
    await db.collection("formanalytics").createIndex({ formId: 1 }, { unique: true });
    console.log("   ✅ formanalytics: validator + indexes created\n");

    // ============================================================
    // VERIFICATION
    // ============================================================
    console.log("🔍 Verifying collections...");
    const collections = await db.listCollections().toArray();
    const ourCollections = ["users", "subscriptions", "forms", "questions", "submissions", "formanalytics"];

    for (const name of ourCollections) {
        const exists = collections.some((c) => c.name === name);
        console.log(`   ${exists ? "✅" : "❌"} ${name}`);
    }

    console.log("\n✨ Database initialized successfully!");
    await mongoose.disconnect();
    process.exit(0);
}

initDatabase().catch((err) => {
    console.error("❌ Initialization failed:", err);
    process.exit(1);
});
