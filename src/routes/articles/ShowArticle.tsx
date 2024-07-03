import { useParams } from "react-router-dom";
import Header from "../components/Header";
import React, { useContext, useEffect, useState } from "react";
import { Footer } from "../components/Footer";
import Paper from '@mui/material/Paper';
import { UserSessionContext } from "../../contexts/user-session";
import LoadingSpinner from "../components/LoadingSpinner";
import {ConfigContext} from "../../index";
import { Alert, Snackbar, useTheme, CircularProgress, Box } from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import { uploadToS3, listFilesS3 } from "../../utils/s3";
import { _Object } from "@aws-sdk/client-s3";

type Article = {
    id: number,
    title: string,
    text: string,
    createdAt: Date,
    user: string,
}

export function ShowArticle() {
    const { articleId } = useParams();
    const [article, setArticle] = useState<Article | null>(null);
    const [errorMessage, setErrorMessage] = useState("");
    const userSession = useContext(UserSessionContext)?.userSession;
    const theme = useTheme();
    const [open, setOpen] = useState(false);
    const [file, setFile] = useState("");
    const [isPageLoaded, setIsPageLoaded] = useState(false);
    const config = useContext(ConfigContext);

    const handleClose = () => {
        setOpen(false);
        setErrorMessage("");
    };

    useEffect(() => {
        if (!userSession?.loginToken) {
            return;
        }
        const getArticle = async (): Promise<Article> => {
            const bearer = "Bearer " + userSession?.loginToken;
            const response: Response = await fetch(`${config.apiURL}/articles/${articleId}`, {
                headers: {
                    "Authorization": bearer,
                    "Content-Type": "application/json"
                }
            });
            if (!response.ok) {
                const error = await response.json();
                throw new Error("Erreur : " + await error.message);
            }
            return await response.json();
        };

        getArticle().then(setArticle).catch((error) => {
            setErrorMessage(error.message);
            setOpen(true);
        });
    }, [articleId, userSession?.loginToken]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const fileList = await listFilesS3();
                fileList?.Contents?.forEach((value: _Object, index: number, array: _Object[]) => {
                    if (!value?.Key) {
                        return;
                    }
                    const check = value.Key.split("/");
                    if ((check[0] === config.associationName) && (check[1] === "articles") && (check[2] === article?.id.toString())) {
                        setFile("https://arcadia-bucket.s3.eu-west-3.amazonaws.com/" + value?.Key);
                        return;
                    }
                });
                setFile("");
            } catch (error) {
                setErrorMessage("Erreur : " + error);
                setOpen(true);
            }
        };

        if (articleId) {
            fetchData().then(() => setIsPageLoaded(true));
        }
    }, [articleId, article]);

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
                            severity={errorMessage.includes("Erreur") ? "error" : "success"}
                            variant="filled"
                            sx={{ width: '100%' }}
                        >
                            {errorMessage}
                        </Alert>
                    </Snackbar>
                    <div className={"main"}>
                        <div onClick={() => window.history.back()} style={{ alignItems: "center", display: "flex", cursor: "pointer", width: "20vw" }}>
                            <ArrowBack />
                            <p style={{ marginLeft: "1em" }}>Retour</p>
                        </div>
                        <Paper elevation={1}>
                            {file && <img src={file} alt="article banner" style={{ width: "100%", height: "30vh", objectFit: "cover" }} />}
                            {article ? (
                                <div style={{ padding: "4vh" }}>
                                    <h1>Article {article.title}</h1>
                                    <h4>Publié le {new Date(article.createdAt).toLocaleDateString()}</h4>
                                    <p>{article.text}</p>
                                </div>
                            ) : (
                                <div>{errorMessage}</div>
                            )}
                        </Paper>
                    </div>
                </div>
            )}
            <Footer />
        </>
    );
}
