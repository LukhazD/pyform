import dotenv from "dotenv";
import mongoose from "mongoose";
import User from "../models/User";
import Form from "../models/Form";
import Question, { questionTypes } from "../models/Question";
import Submission from "../models/Submission";
import FormAnalytics from "../models/FormAnalytics";
import Subscription from "../models/Subscription";
import connectMongo from "../libs/mongoose";

// Load environment variables
dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

const seedDatabase = async () => {
    try {
        console.log("🌱 Connecting to MongoDB...");
        await connectMongo();

        console.log("🧹 Clearing existing data...");
        await User.deleteMany({});
        await Form.deleteMany({});
        await Question.deleteMany({});
        await Submission.deleteMany({});
        await FormAnalytics.deleteMany({});
        await Subscription.deleteMany({});

        console.log("👥 Creating Users...");
        const users = await User.insertMany([
            {
                name: "Alice Admin",
                email: "alice@example.com",
                googleId: "google_123",
                role: "admin",
                subscriptionTier: "pro",
                formLimit: 100,
            },
            {
                name: "Bob Builder",
                email: "bob@example.com",
                googleId: "google_456",
                role: "user",
                subscriptionTier: "free",
                formLimit: 3,
            },
            {
                name: "Super Admin",
                email: "superadmin@example.com",
                googleId: "google_789",
                role: "superadmin",
                subscriptionTier: "pro",
                formLimit: -1, // Unlimited
            },
        ]);

        console.log(`✅ Created ${users.length} users`);

        console.log("💳 Creating Subscriptions...");
        await (Subscription as any).create({
            userId: users[0]._id,
            stripeSubscriptionId: "sub_1234567890",
            stripePriceId: "price_1234567890",
            status: "active",
            billingCycle: "monthly",
            currentPeriodStart: new Date(),
            currentPeriodEnd: new Date(new Date().setMonth(new Date().getMonth() + 1)),
            cancelAtPeriodEnd: false,
            tier: "pro",
        });
        console.log("✅ Created Subscription for Admin");

        console.log("📝 Creating Forms...");
        const forms = await Form.insertMany([
            {
                userId: users[0]._id,
                title: "Customer Feedback",
                description: "We value your feedback!",
                status: "published",
                shortId: "f-feedback",
                settings: {
                    isConversational: true,
                    showProgressBar: true,
                    allowMultipleSubmissions: true,
                    requireAuth: false,
                    welcomeMessage: "We'd love to hear from you! Please share your feedback.",
                    thankYouMessage: "Thank you for your submission!",
                },
                styling: {
                    primaryColor: "#2563eb",
                    fontFamily: "Inter",
                    heroUIRadius: "full",
                    heroUIShadow: "sm",
                    customCSS: ".form-container { max-width: 600px; }",
                },
                publishedAt: new Date(),
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                userId: users[0]._id,
                title: "Event Registration",
                description: "Join us for the annual conference",
                status: "draft",
                shortId: "f-event",
                settings: {
                    requireAuth: true,
                    isConversational: false,
                    showProgressBar: true,
                    allowMultipleSubmissions: true,
                    welcomeMessage: "Welcome to our annual conference registration!",
                    thankYouMessage: "Thank you for registering!",
                    redirectUrl: "https://example.com/event-confirmation",
                    notificationEmail: "events@example.com",
                },
                styling: {
                    primaryColor: "#3b82f6",
                    fontFamily: "Inter",
                    heroUIRadius: "full",
                    heroUIShadow: "sm",
                },
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                userId: users[1]._id,
                title: "Simple Contact Form",
                status: "published",
                shortId: "f-contact",
                settings: {
                    isConversational: false,
                    showProgressBar: true,
                    allowMultipleSubmissions: true,
                    requireAuth: false,
                    welcomeMessage: "Got a question? Send us a message!",
                    thankYouMessage: "Thank you for your submission!",
                },
                styling: {
                    heroUIRadius: "md",
                    primaryColor: "#3b82f6",
                    fontFamily: "Inter",
                    heroUIShadow: "sm",
                },
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        ]);

        console.log(`✅ Created ${forms.length} forms`);

        console.log("❓ Creating Questions...");
        const questions = await Question.insertMany([
            // Feedback Form Questions
            {
                formId: forms[0]._id,
                type: "TEXT" as const,
                order: 0,
                title: "What is your name?",
                description: "Please enter your full name as it appears on official documents.",
                placeholder: "John Doe",
                isRequired: true,
                validation: {
                    minLength: 2,
                    maxLength: 100,
                },
            },
            {
                formId: forms[0]._id,
                type: "NUMBER" as const,
                order: 1,
                title: "How would you rate us (1-10)?",
                validation: {
                    min: 1,
                    max: 10,
                },
            },

            // Event Form Questions
            {
                formId: forms[1]._id,
                type: "EMAIL" as const,
                order: 0,
                title: "Email Address",
                description: "We will use this email to send you event updates.",
                placeholder: "you@company.com",
                isRequired: true,
                validation: {
                    pattern: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$",
                    customErrorMessage: "Please enter a valid email address.",
                },
            },
            {
                formId: forms[1]._id,
                type: "MULTIPLE_CHOICE" as const,
                order: 1,
                title: "Dietary Restrictions",
                options: [
                    { id: "opt1", label: "None", value: "none", order: 0 },
                    { id: "opt2", label: "Vegetarian", value: "veg", order: 1 },
                    { id: "opt3", label: "Vegan", value: "vegan", order: 2 },
                ]
            },
            {
                formId: forms[1]._id,
                type: "CHECKBOXES" as const,
                order: 2,
                title: "Topics of Interest",
                description: "Select all that apply",
                isRequired: false,
                options: [
                    { id: "t1", label: "Technology", value: "tech", order: 0 },
                    { id: "t2", label: "Design", value: "design", order: 1 },
                    { id: "t3", label: "Business", value: "business", order: 2 },
                ]
            },

            // Contact Form Questions
            {
                formId: forms[2]._id,
                type: "TEXTAREA" as const,
                order: 0,
                title: "Message",
                description: "Tell us how we can help you.",
                placeholder: "Type your message here...",
                isRequired: true,
                validation: {
                    minLength: 10,
                    maxLength: 2000,
                },
            }
        ]);

        console.log(`✅ Created ${questions.length} questions`);

        console.log("📝 Creating Submissions...");
        const submissions = await Submission.insertMany([
            {
                formId: forms[0]._id,
                status: "completed",
                submittedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
                completionTimeMs: 45000,
                metadata: {
                    ipAddress: "127.0.0.1",
                    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
                    referrer: "https://google.com/search?q=feedback+form",
                    utmParams: { utm_source: "google", utm_medium: "organic", utm_campaign: "brand" },
                    deviceType: "desktop",
                    browser: "Chrome",
                },
                answers: [
                    {
                        questionId: questions[0]._id,
                        questionType: "TEXT",
                        value: "John Doe",
                        answeredAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
                    },
                    {
                        questionId: questions[1]._id,
                        questionType: "NUMBER",
                        value: 9,
                        answeredAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
                    },
                ],
            },
            {
                formId: forms[0]._id,
                status: "completed",
                submittedAt: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
                completionTimeMs: 32000,
                metadata: {
                    ipAddress: "192.168.1.1",
                    userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)",
                    referrer: "https://twitter.com/company",
                    utmParams: { utm_source: "twitter", utm_medium: "social" },
                    deviceType: "mobile",
                    browser: "Safari",
                },
                answers: [
                    {
                        questionId: questions[0]._id,
                        questionType: "TEXT",
                        value: "Jane Smith",
                        answeredAt: new Date(Date.now() - 1000 * 60 * 60 * 5),
                    },
                    {
                        questionId: questions[1]._id,
                        questionType: "NUMBER",
                        value: 10,
                        answeredAt: new Date(Date.now() - 1000 * 60 * 60 * 5),
                    },
                ],
            },
            {
                formId: forms[1]._id,
                status: "partial",
                submittedAt: new Date(Date.now() - 1000 * 60 * 30), // 30 mins ago
                completionTimeMs: 15000,
                metadata: {
                    userAgent: "Mozilla/5.0",
                    referrer: "https://example.com/events",
                    deviceType: "desktop",
                    browser: "Firefox",
                },
                answers: [
                    {
                        questionId: questions[2]._id,
                        questionType: "EMAIL",
                        value: "partial@test.com",
                        answeredAt: new Date(Date.now() - 1000 * 60 * 30),
                    },
                    {
                        questionId: questions[3]._id,
                        questionType: "CHECKBOXES",
                        value: ["tech", "design"], // Demonstrating Array support
                        answeredAt: new Date(Date.now() - 1000 * 60 * 30),
                    }
                ],
            }
        ] as any);
        console.log(`✅ Created ${submissions.length} submissions`);

        console.log("📊 Creating Analytics...");
        await (FormAnalytics as any).create({
            formId: forms[0]._id,
            totalSubmissions: 2,
            completedSubmissions: 2,
            partialSubmissions: 0,
            completionRate: 1, // 100%
            averageCompletionTimeMs: 38500,
            dropOffByQuestion: [
                {
                    questionId: questions[0]._id,
                    questionTitle: "What is your name?",
                    order: 0,
                    viewCount: 2,
                    answerCount: 2,
                    dropOffRate: 0.0,
                },
                {
                    questionId: questions[1]._id,
                    questionTitle: "How would you rate us (1-10)?",
                    order: 1,
                    viewCount: 2,
                    answerCount: 1,
                    dropOffRate: 0.5, // Demonstrating Decimal support
                }
            ],
            submissionTimeline: [
                {
                    date: new Date(),
                    count: 2,
                }
            ]
        } as any);

        await (FormAnalytics as any).create({
            formId: forms[1]._id,
            totalSubmissions: 2,
            completedSubmissions: 0,
            partialSubmissions: 2,
            completionRate: 0,
            averageCompletionTimeMs: 0,
            dropOffByQuestion: [
                {
                    questionId: questions[2]._id,
                    questionTitle: "Email Address",
                    order: 0,
                    viewCount: 1,
                    answerCount: 1,
                    dropOffRate: 0,
                },
                {
                    questionId: questions[3]._id,
                    questionTitle: "Dietary Restrictions",
                    order: 1,
                    viewCount: 1,
                    answerCount: 0,
                    dropOffRate: 1.0, // Dropped off here
                },
                {
                    questionId: questions[4]._id,
                    questionTitle: "Topics of Interest",
                    order: 2,
                    viewCount: 1,
                    answerCount: 1,
                    dropOffRate: 0.0,
                }
            ],
            submissionTimeline: [
                {
                    date: new Date(),
                    count: 1,
                }
            ]
        } as any);
        console.log(`✅ Created Analytics for forms`);

        console.log("✨ database seeded successfully!");
        process.exit(0);
    } catch (error) {
        console.error("❌ Error seeding database:", error);
        process.exit(1);
    }
};

seedDatabase();
