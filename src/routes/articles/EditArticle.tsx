import { useNavigate, useParams } from "react-router-dom";
import Header from "../components/Header";
import React, { FormEvent, useContext, useEffect, useState } from "react";
import { Footer } from "../components/Footer";
import FeedIcon from "@mui/icons-material/Feed";
import { Alert, Button, TextField, CircularProgress, Box } from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import Paper from "@mui/material/Paper";
import { UserSessionContext } from "../../contexts/user-session";
import Snackbar from "@mui/material/Snackbar";
import {ConfigContext} from "../../index";

type PatchArticle = {
    title?: string,
    text?: string,
};

const body: PatchArticle = {};

export function EditArticle() {
    const { articleId } = useParams();
    const userSession = useContext(UserSessionContext)?.userSession;
    const [ErrorMessage, setErrorMessage] = useState("");
    const [open, setOpen] = useState(false);
    const config = useContext(ConfigContext);
    const [data, setData] = useState(body);
    const [isPageLoaded, setIsPageLoaded] = useState(false);

    const handleClose = () => {
        setOpen(false);
    };

    function updateFields(fields: Partial<PatchArticle>) {
        setData(prev => {
            return { ...prev, ...fields };
        });
    }

    async function onSubmit(e: FormEvent) {
        e.preventDefault();
        if (!userSession?.loginToken) {
            return;
        }
        const bearer = "Bearer " + userSession?.loginToken;
        const response: Response = await fetch( config.apiURL + `/articles/${articleId}`, {
            method: "PATCH",
            body: JSON.stringify(data),
            headers: {
                "Content-Type": "application/json",
                "Authorization": bearer,
            },
        });

        if (!response.ok) {
            const error = await response.json();
            setErrorMessage("Erreur : " + await error.message);
            setOpen(true);
            return;
        }

        setErrorMessage("Article modifié avec succès");
        setOpen(true);
    }

    useEffect(() => {
        if (!userSession?.loginToken) {
            return;
        }
        const getArticle = async (): Promise<PatchArticle> => {
            const bearer = "Bearer " + userSession?.loginToken;
            const response: Response = await fetch(`${config.apiURL}/articles/${articleId}`, {
                headers: {
                    "Authorization": bearer,
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error("Erreur : " + await error.message);
            }

            return await response.json();
        };

        getArticle()
            .then((article) => {
                setData(article);
                setIsPageLoaded(true);
            })
            .catch((error) => {
                setErrorMessage(error.message);
                setOpen(true);
            });
    }, [articleId, userSession?.loginToken]);

    return (
        <>
            <Header />
                    {!isPageLoaded ? (
                <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height="100vh">
                    <CircularProgress />
                    <div>Loading...</div>
                </Box>
            ) : (
                <div>

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
                        >
                            {ErrorMessage}
                        </Alert>
                    </Snackbar>

                    <div className={"main"}>
                        <div onClick={() => window.history.back()} style={{ alignSelf: "start", alignItems: "center", display: "flex", cursor: "pointer", width: "20vw" }}>
                            <ArrowBack />
                            <p style={{ marginLeft: "1em" }}>Retour</p>
                        </div>
                        <Paper elevation={1} className={"paper"}>
                            <h1><FeedIcon /> Editer l'article </h1>
                            <form id="create-article-form" onSubmit={onSubmit}>
                                <TextField
                                    id="create-article-title"
                                    label="Titre"
                                    variant="outlined"
                                    size="small"
                                    value={data.title}
                                    style={{ width: "60vw" }}
                                    onChange={e => updateFields({ title: e.target.value })}
                                />
                                <TextField
                                    label="Texte"
                                    variant="outlined"
                                    multiline
                                    rows={10}
                                    value={data.text}
                                    style={{ width: "60vw" }}
                                    onChange={e => updateFields({ text: e.target.value })}
                                />

                                <Button
                                    type="submit"
                                    variant="contained"
                                    color="primary"
                                    style={{ width: "60vw" }}
                                >
                                    Soumettre
                                </Button>
                            </form>
                        </Paper>
                    </div>
                </div>
            )}
            <Footer />
        </>
    );
}
