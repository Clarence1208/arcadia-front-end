import React, {useContext, useEffect, useState, useRef} from "react";
import {UserSessionContext} from "./../contexts/user-session";
import {Alert, Button, IconButton, InputAdornment, Modal, Paper, Snackbar, TextField, Tooltip} from "@mui/material";
import {styled} from '@mui/material/styles';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { uploadToS3, deleteToS3, listFilesS3 } from "../utils/s3";
import './../styles/DocumentListAdmin.css';
import {Delete, Download} from '@mui/icons-material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import FolderIcon from '@mui/icons-material/Folder';
import LoadingSpinner from "../routes/components/LoadingSpinner";
import PublicIcon from '@mui/icons-material/Public';
import LockIcon from '@mui/icons-material/Lock';
import HelpIcon from "@mui/icons-material/Help";
import timeout from "../utils/timeout";
import SearchIcon from '@mui/icons-material/Search';
import {ConfigContext} from "./../index";
import { _Object } from "@aws-sdk/client-s3";

interface File extends Blob {
    readonly lastModified: number;
    readonly name: string;
    readonly webkitRelativePath: string;
}

type User = {
    id: number,
    firstName: string,
    surname: string,
    email: string,
    roles: string,
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

export function DocumentListAdmin() {
    const userSession = useContext(UserSessionContext)?.userSession;
    const fileRef = useRef<File | null>(null);
    const [errorMessage, setErrorMessage] = useState("");
    const [open, setOpen] = useState(false);
    const [openModal, setOpenModal] = useState(false);
    const [openVideoModal, setOpenVideoModal] = useState(false);
    const [privateFiles, setPrivateFiles] = useState<Array<{ Key: string, publicUrl: string }>>([]);
    const [publicFiles, setPublicFiles] = useState<Array<{ Key: string, publicUrl: string }>>([]);
    const [userFiles, setUserFiles] = useState<Array<{ Key: string, publicUrl: string }>>([]);
    const [uploaded, setUploaded] = useState(false);
    const [dowloadingPending, setDowloadingPending] = useState(false);
    const [image, setImage] = useState<string>("");
    const [video, setVideo] = useState<string>("");
    const [loading, setLoading] = useState(false);
    const [users, setUsers] = useState<User[]>([]);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [privateSearch, setSearchPrivate] = useState("");
    const [publicSearch, setSearchPublic] = useState("");
    const [userSearch, setSearchUser] = useState("");
    const config = useContext(ConfigContext);

    useEffect(() => {
        const fetchData = async () => {
            setPrivateFiles([]);
            setPublicFiles([]);
            setUserFiles([]);
            try {
                const fileList = await listFilesS3();
                fileList?.Contents?.forEach((value: _Object, index: number, array: _Object[]) => {
                    if (!value?.Key) {
                        return;
                    }
                    const check = value.Key.split("/");
                    if ((check[0] === config.associationName) && (check[1] === "private")) {
                        setPrivateFiles((prev) => {
                            if (!prev.some(existingFile => existingFile.Key === check[2]) && check[2].includes(privateSearch)) {
                                const name = check.slice(2).join("/");
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
                    if (selectedUser) {
                        if ((check[0] === config.associationName) && (check[1] === "users") && (check[2] === String(selectedUser.id))) {
                            setUserFiles((prev) => {
                                if ((!prev.some(existingFile => existingFile.Key === check[3]) && check[3] !== "") && check[3].includes(userSearch)) {
                                    const name = check.slice(3).join("/");
                                    return [...prev, {Key: name, publicUrl: "https://arcadia-bucket.s3.eu-west-3.amazonaws.com/" + value.Key}];
                                }
                                return prev;
                            });
                        }
                    }
                });
            } catch (error) {
                setErrorMessage("Erreur : " + error);
                setOpen(true);
            }
        };
        fetchData();
    }, [userSession?.loginToken, uploaded, selectedUser]);

    useEffect(() => {
            if (userSession?.loginToken) {
                const getUsers = async (): Promise<User[]> => {
                    const bearer = "Bearer " + userSession?.loginToken;
                    const response: Response = await fetch(`${config.apiURL}/users`, {
                        headers: {
                            "Authorization": bearer,
                            "Content-Type": "application/json"
                        }
                    });
                    if (!response.ok) {
                        const error = await response.json()
                        setErrorMessage("Erreur : " + await error.message);
                        setOpen(true);
                        return []
                    }
                    const res = await response.json();
                    if (res.length === 0) {
                        setErrorMessage("Aucun utilisateur trouvé")
                        setOpen(true)
                    }
                    return res;
                }
                getUsers().then(setUsers)
            }
        }, [userSession?.loginToken, userSession?.userId])

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>, directory: string) => {
        const file = event.target.files?.[0];
        if (file) {
            fileRef.current = file;
            uploadFile(directory);
        }
    };

    const uploadFile = async (directory: string) => {
        const key = config.associationName + "/" + directory + "/" + fileRef.current!.name;
        try {
            await uploadToS3(fileRef.current!, key);
            setErrorMessage("Fichier chargé avec succès.");
            setOpen(true);
            await timeout(100);
            setUploaded(!uploaded);
        } catch (error) {
            setErrorMessage("Erreur lors du chargement du file: " + error);
            setOpen(true);
        }
    };

    const deleteFile = async (fileName: string, directory: string) => {
        const key = config.associationName + '/' + directory + "/" + fileName;

        try {
            await deleteToS3(key);
            setErrorMessage("Fichier supprimé avec succès.");
            setOpen(true);
            await timeout(100);               
            setUploaded(!uploaded);
        } catch (error) {
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

    const searchPrivate = async (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchPrivate(event.target.value);
        setUploaded(!uploaded);
    }

    const searchPublic = async (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchPublic(event.target.value);
        setUploaded(!uploaded);
    }

    const searchUser = async (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchUser(event.target.value);
        setUploaded(!uploaded);
    }

    const handleDownload = async (url: string, fileName: string) => {
        setDowloadingPending(true); // TODO: fix: prevent multiple downloads
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
            setErrorMessage("Erreur : " + error);
        } finally
        {
            setDowloadingPending(false);
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
                <h2>Gestion des documents de {config.associationName} :</h2>
            </div>
            <div className="file-lists">
                <div className="file-list">
                    <h2><PublicIcon/> Documents publics : <Tooltip title="Visible par tout le monde"
                                                                  children={<IconButton>
                                                                      <HelpIcon/>
                                                                  </IconButton>}/></h2>
                    <div className="header-public-safe">
                    <Button
                        component="label"
                        role="button"
                        variant="contained"
                        startIcon={<CloudUploadIcon/>}
                    >
                        Charger un document public
                        <VisuallyHiddenInput
                            type="file"
                            onChange={(e) => handleFileChange(e, "public")}
                        />
                    </Button>
                    <TextField InputProps={{startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon />
                            </InputAdornment>
                        )}} id="search-bar-public" label="Rechercher un fichier public" variant="outlined" onChange={searchPublic}
                        style={{marginTop: "2em"}}
                    />
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
                                    <Button title={"Télécharger"}
                                            onClick={() => handleDownload(file.publicUrl, file.Key)} disabled={dowloadingPending}>{
                                        <Download/>}</Button>
                                    <Button title={"Supprimer"} onClick={() => deleteFile(file.Key, "public")}>{
                                        <Delete/>}</Button>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="file-list">
                    <h2><LockIcon/> Documents internes : <Tooltip title="Seulement visibles par les admin"
                                                                  children={<IconButton>
                                                                      <HelpIcon/>
                                                                  </IconButton>}/></h2>
                    <div className="header-public-safe">
                    <Button
                        component="label"
                        role="button"
                        variant="contained"
                        startIcon={<CloudUploadIcon/>}
                    >
                        Charger un document privé
                        <VisuallyHiddenInput
                            type="file"
                            onChange={(e) => handleFileChange(e, "private")}
                        />
                    </Button>
                    <TextField InputProps={{startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon />
                            </InputAdornment>
                        )}} id="search-bar-private" label="Rechercher un fichier privé" variant="outlined" onChange={searchPrivate}
                               style={{marginTop: "2em"}}/>
                    </div>
                    <ul className="file-list-ul">
                        {privateFiles.length === 0 && <h4>Aucun fichier privé ou aucun fichier trouvé</h4>}
                        {privateFiles.map((file) => (
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
                                            onClick={() => handleDownload(file.publicUrl, file.Key)} disabled={dowloadingPending}>{
                                        <Download/>}</Button>
                                    <Button title={"Supprimer"} onClick={() => deleteFile(file.Key, "private")}>{
                                        <Delete/>}</Button>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
            <div style={{display: "flex", flexDirection: "row", justifyContent: "space-between"}}>
                <h1>Gestion des documents des utilisateurs :</h1>
            </div>
            <div className="users-documents">
                <div className="user-list">
                    <h2>Utilisateurs :</h2>
                    <ul className="user-select-list">
                        {users.map((user) => (
                            <Button key={user.id} startIcon={<FolderIcon></FolderIcon>}
                                    onClick={() => setSelectedUser(user)}>{user.firstName + " " + user.surname}</Button>
                        ))}
                    </ul>
                </div>
                {selectedUser ?
                    <div className="user-files">
                        <div className="header-safe">
                        <h2>Documents de {selectedUser?.firstName + " " + selectedUser?.surname} :</h2>
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
                                onChange={(e) => handleFileChange(e, "users/" + String(selectedUser.id))}
                            />
                        </Button>
                        </div>

                        <div className="documents-actions">
                        <TextField InputProps={{startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon />
                                </InputAdornment>
                            )}} id="search-bar-user-files" label="Rechercher un fichier" variant="outlined" onChange={searchUser}
                        />
                        </div>

                        <ul className="file-list-ul">
                            {userFiles.length === 0 &&
                                <h4>{selectedUser.firstName + " " + selectedUser.surname} n'a pas de documents ou pas de fichier trouvé</h4>}
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
                                                onClick={() => deleteFile(file.Key, "users/" + String(selectedUser.id))}>{
                                            <Delete/>}</Button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                    :

                    <p>Veuillez séléctionner un utilisateur pour accéder à son espace document</p>
                }
            </div>
        </div>
    );
}
