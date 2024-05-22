import {Alert, Button, Link, TextField} from "@mui/material";
import '../styles/CreateArticle.css';
import '../styles/App.css';
import {FormEvent, useContext, useEffect, useState} from "react";
import { useNavigate } from "react-router-dom";
import {UserSessionContext} from "../contexts/user-session";
import Header from "../components/Header";
import { Footer } from "../components/Footer";
import { FileUpload } from "@mui/icons-material";

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
        const response: Response = await fetch( process.env.REACT_APP_API_URL+"/articles?currentUserId="+userSession?.userId, {method: "POST", body: JSON.stringify(data), headers: {"Content-Type": "application/json"}});
        if (!response.ok) {
            const error =  await response.json()
            setErrorMessage("Erreur : " + await error.message);
            return
        }
        if (fileData.file) {
            const formData = new FormData();
            formData.append("file", fileData.file);
            const responseFile: Response = await fetch( process.env.REACT_APP_API_URL+"/articles/"+(await response.json()).id+"/media", {method: "POST", body: formData});
            if (!responseFile.ok) {
                const error =  await responseFile.json()
                setErrorMessage("Erreur : " + await error.message);
                return
            }
        }
        setErrorMessage("");
        // navigate('/blog')
    }

    return (
        <div id="create-article">
            <h1>Créer un article</h1>
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
                    rows={20}
                    style={{ width: "100vh", margin: "8px 0", padding: "8px", height: "50vh" }}
                    InputProps={{ style: { height: "50vh" } }}  // Ensures height takes priority
                    onChange={e => updateFields({ text: e.target.value })} 
                />
                <Button
                    variant="contained"
                    component="label"
                    startIcon={<FileUpload />}
                >
                Upload File
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