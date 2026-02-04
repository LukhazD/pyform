import { S3Client } from "@aws-sdk/client-s3";

const s3Client = new S3Client({
    region: process.env.S3_REGION || "us-east-1",
    endpoint: process.env.S3_ENDPOINT, // e.g., "https://minio.yourserver.com"
    forcePathStyle: true, // Required for MinIO
    credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY || "",
        secretAccessKey: process.env.S3_SECRET_KEY || "",
    },
});

export default s3Client;
