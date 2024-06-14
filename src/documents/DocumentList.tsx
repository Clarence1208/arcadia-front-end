import { useContext, useEffect, useState, useRef } from "react";
import { UserSessionContext } from "./../contexts/user-session";
import { Alert, Button, Snackbar } from "@mui/material";
import { styled } from '@mui/material/styles';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import ReactS3Client from 'react-aws-s3-typescript';
import { s3Config } from './s3Config';

interface User {
    id: number,
    firstName: string,
    lastName: string,
    email: string,
    roles: string[],
}

interface File extends Blob {
    readonly lastModified: number;
    readonly name: string;
    readonly webkitRelativePath: string;
}

const VisuallyHiddenInput = styled('input')({
    clip: 'rect(0 0 0 0)',
    clipPath: 'inset(50%)',
    height: 1,
    overflow: 'hidden',
    position: 'absolute',
    bottom: 0,
    left: 0,
    whiteSpace: 'nowrap',
    width: 1,
});

export function DocumentList() {
    const userSession = useContext(UserSessionContext)?.userSession;
    const fileRef = useRef<File | null>(null);
    const [errorMessage, setErrorMessage] = useState("");
    const [open, setOpen] = useState(false);

    useEffect(() => {}, [userSession?.loginToken]);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            console.log('File details:', {
                name: file.name,
                size: file.size,
                type: file.type,
                lastModified: file.lastModified
            });
            fileRef.current = file;
        }
    };

    const uploadFile = async () => {
        if (!fileRef.current) {
            setErrorMessage("No file selected.");
            setOpen(true);
            return;
        }

        const s3 = new ReactS3Client(s3Config);
        const filename = fileRef.current.name;

        try {
            const res = await s3.uploadFile(fileRef.current, filename);
            console.log('Upload response:', res);
        } catch (error) {
            console.error('Upload error:', error);
            setErrorMessage("Erreur : " + error);
            setOpen(true);
        }
    };

    const handleClose = () => {
        setOpen(false);
        setErrorMessage("");
    };

    return (
        <div>
            <Snackbar
                open={open}
                autoHideDuration={3000}
                onClose={handleClose}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                <Alert
                    onClose={handleClose}
                    severity="error"
                    variant="filled"
                    sx={{ width: '100%' }}
                >{errorMessage}</Alert>
            </Snackbar>
            <div style={{ display: "flex", flexDirection: "column" }}>
                <Button
                    component="label"
                    role="button"
                    variant="contained"
                    tabIndex={-1}
                    startIcon={<CloudUploadIcon />}
                >
                    Upload file
                    <VisuallyHiddenInput
                        type="file"
                        onChange={handleFileChange}
                    />
                </Button>
                <Button
                    onClick={uploadFile}
                    variant="contained"
                    startIcon={<CloudUploadIcon />}
                >
                    Send File to S3
                </Button>
            </div>
        </div>
    );
}
