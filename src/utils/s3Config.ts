export const s3Config = {
    bucketName:  'arcadia-bucket',
    dirName: import.meta.env.VITE_APP_NAME || "",
    region: 'eu-west-3',
    accessKeyId: import.meta.env.VITE_S3_ACCESS_KEY_ID || "",
    secretAccessKey: import.meta.env.VITE_S3_SECRET_ACCESS_KEY || "",
}