import { useContext, useEffect, useState, useRef } from "react";
import { UserSessionContext } from "./../contexts/user-session";
import { Alert, Button, Modal, Paper, Snackbar } from "@mui/material";
import { styled } from '@mui/material/styles';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import ReactS3Client from 'react-aws-s3-typescript';
import { s3Config } from './s3Config';
import './../styles/DocumentList.css';
import {Delete, Download} from '@mui/icons-material';
import { wait } from "@testing-library/user-event/dist/utils";
import VisibilityIcon from '@mui/icons-material/Visibility';
import LoadingSpinner from "../routes/components/LoadingSpinner";

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

export enum SupportedImageType{
    jpg,
    JPG,
    png,
    PNG,
    jpeg,
    JPEG,
    gif,
    GIF,
    bmp,
    BMP,
    webp,
    WEBP,
}

export enum SupportedVideoType{
    mp4,
    MP4,
    avi,
    AVI,
    mkv,
    MKV,
    mov,
    MOV,
    wmv,
    WMV,
}

export function DocumentList() {
    const userSession = useContext(UserSessionContext)?.userSession;
    const fileRef = useRef<File | null>(null);
    const [errorMessage, setErrorMessage] = useState("");
    const [open, setOpen] = useState(false);
    const [openModal, setOpenModal] = useState(false);
    const [openVideoModal, setOpenVideoModal] = useState(false);
    const [userFiles, setUserFiles] = useState<Array<{ Key: string, publicUrl: string}>>([]);
    const [publicFiles, setPublicFiles] = useState<Array<{ Key: string, publicUrl: string }>>([]);
    const [uploaded, setUploaded] = useState(false);
    const [image, setImage] = useState<string>("");
    const [video, setVideo] = useState<string>("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            setUserFiles([]);
            setPublicFiles([]);
            const s3 = new ReactS3Client(s3Config);
            try {
                const fileList = await s3.listFiles();
                console.log('File list:', fileList);
                fileList.data.Contents.forEach((file: { Key: string, publicUrl: string }) => {
                    const check = file.Key.split("/");
                    if ((check[0] === process.env.REACT_APP_ASSOCIATION_NAME) && (check[1] === String(userSession?.userId))) {
                        setUserFiles((prev) => {
                            if (!prev.some(existingFile => existingFile.Key === check[2])) {
                                file.Key = check.slice(2).join("/");
                                return [...prev, file];
                            }
                            return prev;
                        });
                    }
                    if ((check[0] === process.env.REACT_APP_ASSOCIATION_NAME) && (check[1] === "public")) {
                        setPublicFiles((prev) => {
                            if (!prev.some(existingFile => existingFile.Key === check[2]) && check[2] !== "") {
                                file.Key = check.slice(2).join("/");
                                return [...prev, file];
                            }
                            return prev;
                        });
                    }
                });
            } catch (error) {
                console.error('List error:', error);
                setErrorMessage("Erreur : " + error);
                setOpen(true);
            }
        };
        fetchData();
    }, [userSession?.loginToken, uploaded]);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            console.log('File details:', {
                name: file.name,
                size: file.size,
                type: file.type,
                lastModified: file.lastModified,
            });
            fileRef.current = file;
            console.log('File reference:', fileRef.current);
            uploadFile();
        }
    };

    const uploadFile = async () => {

        setLoading(true);
        
        if (!fileRef.current) {
            setErrorMessage("No file selected.");
            setOpen(true);
            return;
        }

        const s3 = new ReactS3Client({
            ...s3Config,
            dirName: s3Config.dirName + "/" + userSession?.userId,
        });
        let filename = fileRef.current.name;
        let parts = filename.split('.');
        if (parts.length > 1) {
            parts.pop();
        }
        let nameWithoutExtension = parts.join('.');
        
        try {
            const res = await s3.uploadFile(fileRef.current, nameWithoutExtension);
            setErrorMessage("Fichier chargé avec succès.");
            setOpen(true);
            setUploaded(!uploaded);
            setLoading(false);
        } catch (error) {
            console.error('Upload error:', error);
            setErrorMessage("Erreur : " + error);
            setOpen(true);
            setLoading(false);
        }
    };

    const deleteFile = async (fileName: string, directory: string) => {
        const s3 = new ReactS3Client(s3Config);
        const filepath = '' + process.env.REACT_APP_ASSOCIATION_NAME + '/' + directory + '/' + fileName;

        try {
            const res = await s3.deleteFile(filepath);
            setErrorMessage("Fichier supprimé avec succès.");
            setOpen(true);
            await setUploaded(!uploaded);
        } catch (exception) {
            console.log(exception);
        }
    }

    const handleClose = () => {
        setOpen(false);
        setErrorMessage("");
    };

    const handleCloseModal = () => {
        setOpenModal(false);
    }

    const handleCloseVideoModal = () => {
        setOpenVideoModal(false);
    }

    const handleDownload = async (url: string, fileName: string) => {
        console.log('Downloading file:', url);
        console.log('File name:', fileName);
        try {
          const response = await fetch(url);
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
    
          const blob = await response.blob();
          const blobUrl = window.URL.createObjectURL(blob);
          
          const link = document.createElement('a');
          link.href = blobUrl;
          link.download = fileName || 'downloaded-file';
          link.style.display = 'none'; // Ensure link is not visible
          document.body.appendChild(link);
    
          link.click(); // Trigger the download
    
          // Cleanup
          document.body.removeChild(link);
          window.URL.revokeObjectURL(blobUrl);
        } catch (error) {
          console.error('Error fetching the file:', error);
        }
    }

    const showImage = (url: string) => {
        setImage(url);
        setOpenModal(true);
    }

    const showVideo = (url: string) => {
        setVideo(url);
        setOpenVideoModal(true);
    }

    return (
        <div>
            {loading && <LoadingSpinner message={"Chargement..."}/>}
            <Modal
            open={openModal}
            onClose={handleCloseModal}
            aria-labelledby="modal-create-setting"
            aria-describedby="modale to create a setting"
            id="modal-create-setting"
        >
                <Paper elevation={1} className={"paper"} >
                    <img src={image} alt="image" />
                </Paper>
        </Modal>
        <Modal
            open={openVideoModal}
            onClose={handleCloseVideoModal}
            aria-labelledby="modal-create-setting"
            aria-describedby="modale to create a setting"
            id="modal-create-setting"
        >
                <Paper elevation={1} className={"paper"} >
                    <video controls >
                        <source src={video} type="video/mp4"/>
                    </video>
                </Paper>
        </Modal>
            <Snackbar
                open={open}
                autoHideDuration={3000}
                onClose={handleClose}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                <Alert
                    onClose={handleClose}
                    severity={errorMessage.includes("Erreur") ? "error" : "success"}
                    variant="filled"
                    sx={{ width: '100%' }}
                >{errorMessage}</Alert>
            </Snackbar>
            <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between" }}>
                <h1>Mes documents :</h1>
                <Button
                    component="label"
                    role="button"
                    variant="contained"
                    tabIndex={-1}
                    startIcon={<CloudUploadIcon />}
                >
                    Charger un document
                    <VisuallyHiddenInput
                        type="file"
                        onChange={handleFileChange}
                    />
                </Button>
            </div>
            <div className="file-lists">
                <div className="file-list">
                    <h2>Fichiers privés :</h2>
                    <ul className="file-list-ul">
                    {userFiles.length === 0 && <h4>Aucun fichier privé</h4>}
                    {userFiles.map((file) => (
                            <li key={file.Key} className="file-list-li">
                                {file.Key}
                                {Object.values(SupportedImageType).includes(file.publicUrl.split('.').pop() as string) && <Button title={"Voir l'image"} onClick={()=>showImage(file.publicUrl)}>{<VisibilityIcon/>}</Button>}
                                {Object.values(SupportedVideoType).includes(file.publicUrl.split('.').pop() as string) && <Button title={"Voir la vidéo"} onClick={()=>showVideo(file.publicUrl)}>{<VisibilityIcon/>}</Button>}
                                <Button title={"Télécharger"} onClick={()=>handleDownload(file.publicUrl, file.Key)}>{<Download/>}</Button>
                                <Button title={"Supprimer"} onClick={()=>deleteFile(file.Key, String(userSession?.userId))}>{<Delete/>}</Button>
                                </li>
                        ))}
                    </ul>
                </div>
                <div className="file-list">
                    <h2>Fichiers publics :</h2>
                    <ul className="file-list-ul">
                    {publicFiles.length === 0 && <h4>Aucun fichier public</h4>}
                        {publicFiles.map((file) => (
                            <li key={file.Key} className="file-list-li">
                                {file.Key}
                                {Object.values(SupportedImageType).includes(file.publicUrl.split('.').pop() as string) && <Button title={"Voir l'image"} onClick={()=>showImage(file.publicUrl)}>{<VisibilityIcon/>}</Button>}
                                {Object.values(SupportedVideoType).includes(file.publicUrl.split('.').pop() as string) && <Button title={"Voir la vidéo"} onClick={()=>showVideo(file.publicUrl)}>{<VisibilityIcon/>}</Button>}
                                <Button title={"Télécharger"} onClick={()=>handleDownload(file.publicUrl, file.Key)}>{<Download/>}</Button>
                                </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}
