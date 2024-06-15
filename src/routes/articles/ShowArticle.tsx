import { useParams } from "react-router-dom";
import Header from "../components/Header";
import React, { useContext, useEffect, useState } from "react";
import { Footer } from "../components/Footer";
import Paper from '@mui/material/Paper';
import { UserSessionContext } from "../../contexts/user-session";
import LoadingSpinner from "../components/LoadingSpinner";
import {ConfigContext} from "../../index";
import { ArrowBack } from "@mui/icons-material";
import { Alert, Snackbar, useTheme } from "@mui/material";
import ReactS3Client from "react-aws-s3-typescript";
import { s3Config } from './../../utils/s3Config';

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
            const response: Response = await fetch(`${process.env.REACT_APP_API_URL}/articles/${articleId}`, {
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
            const s3 = new ReactS3Client(s3Config);
            try {
                const fileList = await s3.listFiles();
                for (const file of fileList.data.Contents) {
                    const check = file.Key.split("/");
                    if ((check[0] === process.env.REACT_APP_ASSOCIATION_NAME) && (check[1] === "articles") && (check[2] === article?.id.toString())) {
                        setFile(file.publicUrl);
                        return;
                    }
                }
                setFile(""); // No file found
            } catch (error) {
                setErrorMessage("Erreur : " + error);
                setOpen(true);
            }
        };
        if (articleId) {
            fetchData();
        }
    }, [articleId, article]);

    return (
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
            <Header />
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
            <Footer />
        </div>
    );
}
