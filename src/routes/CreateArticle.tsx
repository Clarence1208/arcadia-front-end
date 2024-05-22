import {Alert, Button, Link, TextField} from "@mui/material";
import '../styles/CreateArticle.css';
import '../styles/App.css';
import {FormEvent, useContext, useEffect, useState} from "react";
import { useNavigate } from "react-router-dom";
import {UserSessionContext} from "../contexts/user-session";
import Header from "../components/Header";
import { Footer } from "../components/Footer";

type CreateArticleData = {
    title: string,
    text: string
}
const body : CreateArticleData = {
    title: "",
    text: ""
}

function CreateArticleForm() {
    const userSession = useContext(UserSessionContext)?.userSession
    const navigate = useNavigate();

    const [ErrorMessage, setErrorMessage] = useState("")
    const [data, setData] = useState(body)

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
    async function onSubmit(e: FormEvent) {
        e.preventDefault()
        const response: Response = await fetch( process.env.REACT_APP_API_URL+"/articles?currentUserId="+userSession?.userId, {method: "POST", body: JSON.stringify(data), headers: {"Content-Type": "application/json"}});
        if (!response.ok) {
            const error =  await response.json()
            setErrorMessage("Erreur : " + await error.message);
            return
        }
        setErrorMessage("");
        const res = await response.json();
        navigate('/blog')
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