import {Alert, Button, Link, Snackbar, TextField} from "@mui/material";
import '../../styles/CreateArticle.css';
import '../../styles/App.css';
import { styled } from '@mui/material/styles';
import React, {FormEvent, useContext, useEffect, useRef, useState} from "react";
import { useNavigate } from "react-router-dom";
import {UserSessionContext} from "../../contexts/user-session";
import Header from "../components/Header";
import { Footer } from "../components/Footer";
import FeedIcon from '@mui/icons-material/Feed';
import {ArrowBack, FileUpload} from "@mui/icons-material";
import Paper from "@mui/material/Paper";
import {ConfigContext} from "../../index";
import { uploadToS3 } from "../../utils/s3";

type CreateArticleData = {
    title: string,
    text: string,
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

interface File extends Blob {
    readonly lastModified: number;
    readonly name: string;
    readonly webkitRelativePath: string;
}

const body : CreateArticleData = {
    title: "",
    text: "",
}

function CreateArticleForm() {
    const userSession = useContext(UserSessionContext)?.userSession
    const navigate = useNavigate();
    const config = useContext(ConfigContext);

    const [open, setOpen] = useState(false);
    const [ErrorMessage, setErrorMessage] = useState("")
    const [data, setData] = useState(body)
    const fileRef = useRef<File | null>(null);
    const [fileName, setFileName] = useState<string>("");

    if (!userSession?.isLoggedIn) {
        navigate('/login')
    }

    if(!(userSession?.roles.includes("admin") || !userSession?.roles.includes("superadmin"))){
        navigate('/blog')
    }

    function updateFields(fields: Partial<CreateArticleData>) {
        setData(prev => {
            return { ...prev, ...fields }
        })
    }

    const uploadFile = async (directory: string) => {

        if (!fileRef.current) {
            setErrorMessage("No file selected.");
            setOpen(true);
            return;
        }

        const key = config.associationName + "/articles/" + directory + "/" + fileRef.current.name;
        try {
            await uploadToS3(fileRef.current!, key);
        } catch (error) {
            setErrorMessage("Erreur lors du chargement du file: " + error);
            setOpen(true);
        }
    };

    const checkFile = (filename: string | undefined) => {
        if (filename) {
            let parts = filename.split('.');
            let extension = parts[parts.length - 1];
            if (!["jpg", "png", "jpeg", "bmp", "webp"].includes(extension)) {
                setErrorMessage("Le fichier doit être une image (jpg, png, jpeg, bmp, webp).");
                setOpen(true);
                return;
            }
        }
    }

    async function onSubmit(e: FormEvent) {
        e.preventDefault()
        if (fileRef.current) {
            checkFile(fileRef.current?.name)
        }
        const bearer = "Bearer " + userSession?.loginToken;
        const response: Response = await fetch( config.apiURL + "/articles?currentUserId="+userSession?.userId, {
            method: "POST",
            body: JSON.stringify(data),
            headers: {
                "Content-Type": "application/json",
                "Authorization": bearer,
            }
        });
        if (!response.ok) {
            const error =  await response.json()
            setErrorMessage("Erreur : " + await error.message);
            return
        }
        const article = await response.json();
        if (fileRef.current) {
            await uploadFile(article.id.toString());
        }
        setErrorMessage("");
        navigate('/blog')
    }

    const handleClose = () => {
        setOpen(false);
        setErrorMessage("");
    };

    const updateFile = () => {
        fileRef.current = null;
        setFileName("");
    }

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            fileRef.current = file;
            setFileName(file.name);
        }
    };

    return (
        <div id="create-article" className="main" style={{height: "80vh"}}>
                <Snackbar
                    open={open}
                    autoHideDuration={3000}
                    onClose={handleClose}
                    anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                >
                    <Alert
                        onClose={handleClose}
                        severity={ErrorMessage.includes("Erreur") ? "error" : "success"}
                        variant="filled"
                        sx={{ width: '100%' }}
                    >{ErrorMessage}</Alert>
                </Snackbar>
                <div onClick={() => window.history.back()} style={{ alignItems:"center" ,display: "flex", cursor: "pointer", width:"20vw"}}>
                    <ArrowBack />
                    <p style={{marginLeft:"1em"}}>Retour</p>
                </div>
                <Paper elevation={1} className={"paper"} sx={{height: "70vh"}}>
                <h1><FeedIcon />  Créer un article </h1>
                <form id="create-article-form" onSubmit={onSubmit}>
                    <TextField
                        id="create-article-title" 
                        label="Titre" 
                        variant="outlined"
                        size="small"
                        onChange={e => updateFields({ title: e.target.value })} 
                    />
                    <TextField 
                        label="Texte" 
                        variant="outlined"
                        multiline
                        rows={10}
                        style={{ width: "60vw"}}
                        sx={{ mt: 1, mb: 1 }}
                        onChange={e => updateFields({ text: e.target.value })} 
                    />
                    <div style={{display: "flex", flexDirection: "column", alignItems:"center", justifyContent: "center"}}>
                        {fileRef.current && 
                        <div style={{display: "flex", alignItems:"center", justifyContent: "center"}}>
                            <Button
                                component="label"
                                onClick={updateFile}
                            >X</Button>
                            <p>{fileRef.current?.name}</p>
                        </div>
                        }
                        <Button
                        component="label"
                        role="button"
                        variant="contained"
                        tabIndex={-1}
                        startIcon={<FileUpload />}
                        sx={{ mt: 1, mb: 1 }}
                    >
                        Ajouter un média (jpg, png, jpeg, bmp, webp)
                        <VisuallyHiddenInput
                            type="file"
                            onChange={(event) => handleFileChange(event)}
                        />
                    </Button>
                    </div>

                    <Button 
                    type="submit" 
                    variant="contained" 
                    color="primary"
                    onClick={onSubmit}
                    sx={{ mt: 1, mb: 1 }}
                    >
                        Soumettre
                    </Button>
                </form>
                </Paper>
        </div>
    );
}

export function CreateArticle() {
    const [isPageLoaded, setIsPageLoaded] = useState(false);

    useEffect(() => {
        setTimeout(() => {
            setIsPageLoaded(true);
        }, 100);
    }, []);

    return (
        <div>
            <Header />
            { isPageLoaded ? (
                <div>
                        <CreateArticleForm />
                </div>
            ) : (
                <div className="loading">
                    <div>Loading...</div>
                </div>
            )}
            <Footer />
        </div>
    );
}