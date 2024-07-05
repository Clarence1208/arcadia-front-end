import { S3Client, PutObjectCommand, DeleteObjectCommand, ListObjectsV2Command, GetObjectCommand } from "@aws-sdk/client-s3";

const ACCESS_KEY_ID = import.meta.env.VITE_S3_ACCESS_KEY_ID;
const SECRET_ACCESS_KEY = import.meta.env.VITE_S3_SECRET_ACCESS_KEY;
const s3 = new S3Client({ region: "eu-west-3", credentials: { accessKeyId: ACCESS_KEY_ID, secretAccessKey: SECRET_ACCESS_KEY }});
const BUCKET = "arcadia-bucket";

export const uploadToS3 = async (file: File, key: string) => {

    const command = new PutObjectCommand({ ACL:"public-read-write", Bucket: BUCKET, Key: key, Body: file, ContentType: file.type });

    try {
        await s3.send(command);
    } catch (error) {
        console.error("Error uploading file: ", error);
    }
}

export const deleteToS3 = async (key: string) => {
    const command = new DeleteObjectCommand({ Bucket: BUCKET, Key: key });

    try {
        await s3.send(command);
    } catch (error) {
        console.error("Error deleting file: ", error);
    }
}

export const listFilesS3 = async () => {
    const command = new ListObjectsV2Command({ Bucket: BUCKET });

    try {
        return await s3.send(command);
    } catch (error) {
        console.error("Error listing files: ", error);
    }
}

export const getObjectS3 = async (key: string) => {
    const command = new GetObjectCommand({ Bucket: BUCKET, Key: key });

    try {
        return await s3.send(command);
    } catch (error) {
        console.error("Error getting file: ", error);
    }
}