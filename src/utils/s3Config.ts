import { useContext } from "react";
import { ConfigContext } from "../index";

const config = useContext(ConfigContext);

export const s3Config = {
    bucketName:  'arcadia-bucket',
    dirName: config.associationName || "",
    region: 'eu-west-3',
    accessKeyId: config.s3AccessKeyId || "",
    secretAccessKey: config.s3SecretAccessKey || "",
}