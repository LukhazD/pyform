import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/libs/next-auth";
import config from "@/config";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const ticketSchema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email address"),
    phone: z.string().min(1, "Phone is required"),
    subject: z.string().min(1, "Subject is required"),
    message: z.string().min(1, "Message is required"),
});

export async function POST(req: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const validation = ticketSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json(
                { error: "Validation failed", details: validation.error.format() },
                { status: 400 }
            );
        }

        const { name, email, phone, subject, message } = validation.data;

        const supportEmail = config.resend.supportEmail;
        if (!supportEmail) {
            console.error("Support email not configured in config.ts");
            return NextResponse.json(
                { error: "Support configuration missing" },
                { status: 500 }
            );
        }

        // Clean up support email string (remove < > if present)
        const toEmail = supportEmail.replace(/[<>]/g, "");

        const { data, error } = await resend.emails.send({
            from: config.resend.fromAdmin,
            to: toEmail,
            replyTo: email,
            subject: `[Soporte] ${subject}`,
            html: `
        <h2>Nuevo Ticket de Soporte</h2>
        <p><strong>De:</strong> ${name} (<a href="mailto:${email}">${email}</a>)</p>
        <p><strong>Teléfono:</strong> ${phone}</p>
        <hr />
        <h3>${subject}</h3>
        <p style="white-space: pre-wrap;">${message}</p>
        <hr />
        <p><em>Enviado desde el dashboard de ${config.appName}</em></p>
      `,
        });

        if (error) {
            console.error("Resend error:", error);
            return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
        }

        return NextResponse.json({ success: true, data });
    } catch (error) {
        console.error("Support ticket error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
