import { NextResponse } from "next/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import s3Client from "@/libs/s3";
import { nanoid } from "nanoid";
import Form from "@/models/Form";
import connectMongo from "@/libs/mongoose";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { formId, fileType, fileName } = body;

        if (!formId || !fileType) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        if (!process.env.S3_BUCKET_NAME) {
            console.error("S3_BUCKET_NAME is not defined in env");
            return NextResponse.json({ error: "Server Configuration Error" }, { status: 500 });
        }

        await connectMongo();
        const form = await Form.findById(formId);

        if (!form) {
            return NextResponse.json({ error: "Form not found" }, { status: 404 });
        }

        // Clean filename to prevent weird chars
        const safeName = (fileName || 'file').replace(/[^a-zA-Z0-9.-]/g, '_');
        const key = `uploads/${formId}/${nanoid()}_${safeName}`;

        const command = new PutObjectCommand({
            Bucket: process.env.S3_BUCKET_NAME,
            Key: key,
            ContentType: fileType,
        });

        // URL valid for 10 minutes
        const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 600 });

        return NextResponse.json({ uploadUrl, key });
    } catch (e) {
        console.error("Presigned URL Error:", e);
        return NextResponse.json({ error: "Server Error" }, { status: 500 });
    }
}
