import {useNavigate, useParams} from "react-router-dom";
import Header from "../components/Header";
import React, {FormEvent, useContext, useEffect, useState} from "react";
import {Footer} from "../components/Footer";
import FeedIcon from "@mui/icons-material/Feed";
import {Alert, Button, TextField} from "@mui/material";
import {ArrowBack, FileUpload} from "@mui/icons-material";
import Paper from "@mui/material/Paper";
import {UserSessionContext} from "../../contexts/user-session";
import Snackbar from "@mui/material/Snackbar";

type PatchArticle = {
    title?: string,
    text?: string,
}
type Article = {
    id: number,
    title: string,
    text: string,
    createdAt: Date,
    user: string,
}

const body : PatchArticle = {}
export function EditArticle() {
    const {articleId} = useParams();
    const userSession = useContext(UserSessionContext)?.userSession
    const [ErrorMessage, setErrorMessage] = useState("")
    const [open, setOpen] = useState(false);
    const handleClose = () => {
        setOpen(false)
    }
    const [data, setData] = useState(body)
    //const [article, setArticle] = useState<PatchArticle>(body)
    function updateFields(fields: Partial<PatchArticle>) {
        setData(prev => {
            return { ...prev, ...fields }
        })
    }

    async function onSubmit(e: FormEvent) {
        e.preventDefault()
        const bearer = "Bearer " + userSession?.loginToken;
        const response: Response = await fetch( import.meta.env.VITE_API_URL+`/articles/${articleId}`, {
            method: "PATCH",
            body: JSON.stringify(data),
            headers: {
                "Content-Type": "application/json",
                "Authorization": bearer,
            }
        });
        if (!response.ok) {
            const error =  await response.json()
            setErrorMessage("Erreur : " + await error.message);
            setOpen(true)
            return
        }
        setErrorMessage("Article modifié avec succès");
        setOpen(true)

    }

    useEffect(() => {
        const getArticle = async (): Promise<PatchArticle> => {
            const bearer = "Bearer " + userSession?.loginToken;
            const response: Response = await fetch(`${import.meta.env.VITE_API_URL}/articles/${articleId}`, {
                headers: {
                    "Authorization": bearer,
                    "Content-Type": "application/json"
                }
            });
            if (!response.ok) {
                const error = await response.json()
                throw new Error("Erreur : " + await error.message);
            }
            return await response.json();
        }
        getArticle().then(setData).catch((error) => {setErrorMessage(error.message); setOpen(true)});
    }, [articleId,userSession?.loginToken]);

    return (
        <div>
            <Header />

            <Snackbar
                open={open}
                autoHideDuration={3000}
                onClose={handleClose}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                <Alert
                    onClose={handleClose}
                    severity="success"
                    variant="filled"
                    sx={{ width: '100%' }}
                >{ErrorMessage}</Alert>
            </Snackbar>

            <div className={"main"}>
                <div onClick={() => window.history.back()} style={{alignSelf:"start", alignItems:"center" ,display: "flex", cursor: "pointer", width:"20vw"}}>
                    <ArrowBack />
                    <p style={{marginLeft:"1em"}}>Retour</p>
                </div>
                <Paper elevation={1} className={"paper"} >
                    <h1><FeedIcon /> Editer l'article </h1>
                    <form id="create-article-form" onSubmit={onSubmit}>
                        <TextField
                            id="create-article-title"
                            label="Titre"
                            variant="outlined"
                            size="small"
                            value={data.title}
                            style={{ width: "60vw"}}
                            onChange={e => updateFields({ title: e.target.value })}
                        />
                        <TextField
                            label="Texte"
                            variant="outlined"
                            multiline
                            rows={10}
                            value={data.text}
                            style={{ width: "60vw"}}
                            onChange={e => updateFields({ text: e.target.value })}
                        />
                        {/*TODO: Add file upload?*/}

                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            style={{width: "60vw"}}
                            onClick={onSubmit}
                        >
                            Soumettre
                        </Button>
                    </form>
                </Paper>
            </div>
            <Footer />
        </div>
    )
}