import { NextResponse } from "next/server";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import s3Client from "@/libs/s3";
import { auth } from "@/libs/next-auth";
import Form from "@/models/Form";
import connectMongo from "@/libs/mongoose";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const key = searchParams.get("key");

        if (!key) {
            return NextResponse.json({ error: "Missing key" }, { status: 400 });
        }

        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Security Check: Key format should be "uploads/FORM_ID/..."
        const parts = key.split("/");
        if (parts.length < 3 || parts[0] !== "uploads") {
            return NextResponse.json({ error: "Invalid key format" }, { status: 400 });
        }

        const formId = parts[1];

        await connectMongo();
        const form = await Form.findById(formId);

        if (!form || String(form.userId) !== session.user.id) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const command = new GetObjectCommand({
            Bucket: process.env.S3_BUCKET_NAME,
            Key: key,
        });

        // 15 minutes validity
        const url = await getSignedUrl(s3Client, command, { expiresIn: 900 });

        return NextResponse.redirect(url);
    } catch (e) {
        console.error("View File Error:", e);
        return NextResponse.json({ error: "Server Error" }, { status: 500 });
    }
}
