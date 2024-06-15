export const s3Config = {
    bucketName:  'arcadia-bucket',
    dirName: process.env.REACT_APP_ASSOCIATION_NAME || "",
    region: 'eu-west-3',
    accessKeyId: process.env.REACT_APP_S3_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.REACT_APP_S3_SECRET_ACCESS_KEY || "",
}