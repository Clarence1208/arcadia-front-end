// src/hooks/useS3Config.ts
import { useContext } from "react";
import { ConfigContext } from "../index";
import { IConfig } from "react-aws-s3-typescript/dist/types";

export const getS3Config = (): IConfig => {
    const config = useContext(ConfigContext);

    return {
        bucketName: 'arcadia-bucket',
        dirName: config.associationName || "",
        region: 'eu-west-3',
        accessKeyId: config.s3AccessKeyId || "",
        secretAccessKey: config.s3SecretAccessKey || "",
    };
};
