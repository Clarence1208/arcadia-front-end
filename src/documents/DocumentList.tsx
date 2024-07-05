import {useContext, useEffect, useState, useRef} from "react";
import {UserSessionContext} from "./../contexts/user-session";
import {Alert, Button, InputAdornment, Modal, Paper, Snackbar, TextField} from "@mui/material";
import {styled} from '@mui/material/styles';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { uploadToS3, deleteToS3, listFilesS3 } from "../utils/s3";
import './../styles/DocumentList.css';
import {Delete, Download} from '@mui/icons-material';
import {wait} from "@testing-library/user-event/dist/utils";
import VisibilityIcon from '@mui/icons-material/Visibility';
import LoadingSpinner from "../routes/components/LoadingSpinner";
import timeout from "../utils/timeout";
import SearchIcon from '@mui/icons-material/Search';
import {ConfigContext} from "./../index";
import { _Object } from "@aws-sdk/client-s3";

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

export enum SupportedImageType {
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

export enum SupportedVideoType {
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
    const [privateSearch, setSearchPrivate] = useState("");
    const [publicSearch, setSearchPublic] = useState("");
    const [openVideoModal, setOpenVideoModal] = useState(false);
    const [userFiles, setUserFiles] = useState<Array<{ Key: string, publicUrl: string }>>([]);
    const [publicFiles, setPublicFiles] = useState<Array<{ Key: string, publicUrl: string }>>([]);
    const [uploaded, setUploaded] = useState(false);
    const [image, setImage] = useState<string>("");
    const [video, setVideo] = useState<string>("");
    const [loading, setLoading] = useState(false);
    const config = useContext(ConfigContext);

    useEffect(() => {
        const fetchData = async () => {
            setUserFiles([]);
            setPublicFiles([]);
            try {
                const fileList = await listFilesS3();
                fileList?.Contents?.forEach((value: _Object, index: number, array: _Object[]) => {
                    if (!value?.Key) {
                        return;
                    }
                    const check = value.Key.split("/");
                    if ((check[0] === config.associationName) && (check[1] === "users") && (check[2] === String(userSession?.userId))) {
                        setUserFiles((prev) => {
                            console.log(value)
                            if (!prev.some(existingFile => existingFile.Key === check[3]) && check[3].includes(privateSearch)) {
                                const name = check.slice(3).join("/");
                                return [...prev, {Key: name, publicUrl: "https://arcadia-bucket.s3.eu-west-3.amazonaws.com/" + value.Key}];
                            }
                            return prev;
                        });
                    }
                    if ((check[0] === config.associationName) && (check[1] === "public")) {
                        setPublicFiles((prev) => {
                            if ((!prev.some(existingFile => existingFile.Key === check[2]) && check[2] !== "") && check[2].includes(publicSearch)) {
                                const name = check.slice(2).join("/");
                                return [...prev, {Key: name, publicUrl: "https://arcadia-bucket.s3.eu-west-3.amazonaws.com/" + value.Key}];
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

    const searchPrivate = async (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchPrivate(event.target.value);
        setUploaded(!uploaded);
    }

    const searchPublic = async (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchPublic(event.target.value);
        setUploaded(!uploaded);
    }

    const uploadFile = async () => {
        const key = config.associationName + "/users/" + userSession?.userId + "/" + fileRef.current!.name;
        try {
            await uploadToS3(fileRef.current!, key);
            setErrorMessage("Fichier chargé avec succès.");
            setOpen(true);
            await timeout(100);
            setUploaded(!uploaded);
        } catch (error) {
            console.error("Error uploading file: ", error);
            setErrorMessage("Erreur lors du chargement du file: " + error);
            setOpen(true);
        }
    };

    const deleteFile = async (fileName: string, directory: string) => {
        const key = config.associationName + '/' + directory + "/" + fileName;

        try {
            console.log("Deleting file:", key)
            await deleteToS3(key);
            setErrorMessage("Fichier supprimé avec succès.");
            setOpen(true);
            await timeout(100);               
            setUploaded(!uploaded);
        } catch (error) {
            console.log(error)
            setErrorMessage("Erreur lors de la supression du fichier: " + error);
            setOpen(true);
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
        console.log("Image url:", url);
        setOpenModal(true);
    }

    const showVideo = (url: string) => {
        setVideo(url);
        setOpenVideoModal(true);
    }

    const truncate = (input: string, length: number) => {
        if (input.length > length) {
            return input.substring(0, length) + '...';
        }
        return input;
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
                <Paper elevation={1} className={"paper"}>
                    <img src={image} alt="image" style={{maxWidth: "50vh"}}/>
                </Paper>
            </Modal>
            <Modal
                open={openVideoModal}
                onClose={handleCloseVideoModal}
                aria-labelledby="modal-create-setting"
                aria-describedby="modale to create a setting"
                id="modal-create-setting"
            >
                <Paper elevation={1} className={"paper"}>
                    <video controls>
                        <source src={video} type="video/mp4"/>
                    </video>
                </Paper>
            </Modal>
            <Snackbar
                open={open}
                autoHideDuration={3000}
                onClose={handleClose}
                anchorOrigin={{vertical: 'top', horizontal: 'right'}}
            >
                <Alert
                    onClose={handleClose}
                    severity={errorMessage.includes("Erreur") ? "error" : "success"}
                    variant="filled"
                    sx={{width: '100%'}}
                >{errorMessage}</Alert>
            </Snackbar>
            <div style={{display: "flex", flexDirection: "row", justifyContent: "space-between"}}>
                <h1>Mes documents :</h1>
                
            </div>
            <Button
                            component="label"
                            role="button"
                            variant="contained"
                            tabIndex={-1}
                            startIcon={<CloudUploadIcon/>}
                        >
                            Charger un document
                            <VisuallyHiddenInput
                                type="file"
                                onChange={handleFileChange}
                            />
                        </Button>
            <div className="file-lists">
                <div className="file-list">
                    <div>
                        <h2>Mes fichiers privés :</h2>
                        <div className="header-public-safe">
                        <TextField InputProps={{startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon />
                            </InputAdornment>
                        )}} id="outlined-basic" label="Rechercher un fichier privé" variant="outlined" onChange={searchPrivate}/>
                        </div>
                        </div>
                    <ul className="file-list-ul">
                        {userFiles.length === 0 && <h4>Aucun fichier trouvé</h4>}
                        {userFiles.map((file) => (
                            <li key={file.Key} className="file-list-li">
                                {truncate(file.Key, 30)}
                                <div>
                                    {Object.values(SupportedImageType).includes(file.publicUrl.split('.').pop() as string) &&
                                        <Button title={"Voir l'image"} onClick={() => showImage(file.publicUrl)}>{
                                            <VisibilityIcon/>}</Button>}
                                    {Object.values(SupportedVideoType).includes(file.publicUrl.split('.').pop() as string) &&
                                        <Button title={"Voir la vidéo"} onClick={() => showVideo(file.publicUrl)}>{
                                            <VisibilityIcon/>}</Button>}
                                    <Button title={"Télécharger"}
                                            onClick={() => handleDownload(file.publicUrl, file.Key)}>{
                                        <Download/>}</Button>
                                    <Button title={"Supprimer"}
                                            onClick={() => deleteFile(file.Key, "users/" + String(userSession?.userId))}>{
                                        <Delete/>}</Button>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="file-list">
                    <div>
                        <h2>Fichiers publics :</h2>
                        <div className="header-public-safe">
                        <TextField InputProps={{startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon />
                            </InputAdornment>
                        )}} id="outlined-basic" label="Rechercher un fichier public" variant="outlined" onChange={searchPublic}/>
                    </div>
                    </div>
                    <ul className="file-list-ul">
                        {publicFiles.length === 0 && <h4>Aucun fichier public ou aucun fichier trouvé</h4>}
                        {publicFiles.map((file) => (
                            <li key={file.Key} className="file-list-li">
                                {truncate(file.Key, 30)}
                                <div>
                                {Object.values(SupportedImageType).includes(file.publicUrl.split('.').pop() as string) &&
                                    <Button title={"Voir l'image"} onClick={() => showImage(file.publicUrl)}>{
                                        <VisibilityIcon/>}</Button>}
                                {Object.values(SupportedVideoType).includes(file.publicUrl.split('.').pop() as string) &&
                                    <Button title={"Voir la vidéo"} onClick={() => showVideo(file.publicUrl)}>{
                                        <VisibilityIcon/>}</Button>}
                                <Button title={"Télécharger"} onClick={() => handleDownload(file.publicUrl, file.Key)}>{
                                    <Download/>}</Button>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}
