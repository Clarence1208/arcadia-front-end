import {Alert, Button, Link, TextField} from "@mui/material";
import '../../styles/CreateArticle.css';
import '../../styles/App.css';
import React, {FormEvent, useContext, useEffect, useState} from "react";
import { useNavigate } from "react-router-dom";
import {UserSessionContext} from "../../contexts/user-session";
import Header from "../components/Header";
import { Footer } from "../components/Footer";
import FeedIcon from '@mui/icons-material/Feed';
import {ArrowBack, FileUpload} from "@mui/icons-material";
import Paper from "@mui/material/Paper";

type CreateArticleData = {
    title: string,
    text: string,
}
type CreateArticleFile = {
    file: File | null
}

const body : CreateArticleData = {
    title: "",
    text: "",
}

const file : CreateArticleFile = {
    file: null
}

function CreateArticleForm() {
    const userSession = useContext(UserSessionContext)?.userSession
    const navigate = useNavigate();

    const [ErrorMessage, setErrorMessage] = useState("")
    const [data, setData] = useState(body)
    const [fileData, setFileData] = useState(file)

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
    function updateFile(fields: Partial<CreateArticleFile>) {
        setFileData(prev => {
            return { ...prev, ...fields }
        })
    }
    async function onSubmit(e: FormEvent) {
        e.preventDefault()
        const bearer = "Bearer " + userSession?.loginToken;
        const response: Response = await fetch( process.env.REACT_APP_API_URL+"/articles?currentUserId="+userSession?.userId, {
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
        // if (fileData.file) {
        //     const formData = new FormData();
        //     formData.append("file", fileData.file);
        //     const responseFile: Response = await fetch( process.env.REACT_APP_API_URL+"/articles/"+(await response.json()).id+"/media", {method: "POST", body: formData});
        //     if (!responseFile.ok) {
        //         const error =  await responseFile.json()
        //         setErrorMessage("Erreur : " + await error.message);
        //         return
        //     }
        // }
        setErrorMessage("");
        navigate('/blog')
    }

    return (
        <div id="create-article" className="main">
            <div onClick={() => window.history.back()} style={{ alignItems:"center" ,display: "flex", cursor: "pointer", width:"20vw"}}>
                <ArrowBack />
                <p style={{marginLeft:"1em"}}>Retour</p>
            </div>
            <Paper elevation={1} className={"paper"} >
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
                    onChange={e => updateFields({ text: e.target.value })} 
                />
                 <Button
                    variant="outlined"
                    component="label"
                    startIcon={<FileUpload />}
                    style={{ width: "20vw", marginBottom: "2vh"}}
                >
                Ajouter un média(wip)
                <input
                    type="file"
                    hidden
                    onChange={e => updateFile({ file: e.target.files?.item(0) })}
                />
                </Button>

                <Button 
                type="submit" 
                variant="contained" 
                color="primary"
                onClick={onSubmit}
                >
                    Soumettre
                </Button>
            </form>
            </Paper>
        </div>
    );
}
export function CreateArticle() {
    return (
        <div>
            <Header />
                <CreateArticleForm />
            <Footer />
        </div>
    );
}