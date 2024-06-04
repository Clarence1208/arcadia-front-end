import {useParams} from "react-router-dom";
import Header from "../components/Header";
import React, {useContext, useEffect, useState} from "react";
import {Footer} from "../components/Footer";
import Paper from '@mui/material/Paper';
import catBanner from "../../images/cat-banner.jpg";
import {UserSessionContext} from "../../contexts/user-session";
import LoadingSpinner from "../components/LoadingSpinner";
import {ArrowBack} from "@mui/icons-material";
import { useTheme } from "@mui/material";

type Article = {
    id: number,
    title: string,
    text: string,
    createdAt: Date,
    user: string,
}
export function ShowArticle(){
    const {articleId}=useParams();
    const [article, setArticle] = useState<Article>();
    const [errorMessage, setErrorMessage] = useState(null);
    const userSession = useContext(UserSessionContext)?.userSession
    const theme = useTheme();

    useEffect(() => {
    const getArticle = async (): Promise<Article> => {
        const bearer = "Bearer " + userSession?.loginToken;
        const response: Response = await fetch(`${process.env.REACT_APP_API_URL}/articles/${articleId}`, {
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
    getArticle().then(setArticle).catch((error) => setErrorMessage(error.message));

}, [articleId,userSession?.loginToken]);

        return (
            <div>
                <Header />
                <div className={"main"}>
                    <div onClick={() => window.history.back()} style={{ alignItems:"center" ,display: "flex", cursor: "pointer", width:"20vw"}}>
                        <ArrowBack />
                        <p style={{marginLeft:"1em"}}>Retour</p>
                    </div>
                    <Paper elevation={1}>
                        <div style={{backgroundImage: `url(${catBanner})`, backgroundColor:theme.palette.primary.main ,borderRadius:"4px", height: "30vh", backgroundSize: "contain", backgroundRepeat:"no-repeat", backgroundPosition: "center"}}/>

                        {!article ? errorMessage && <div>{errorMessage}</div> :
                        <div style={{padding: "4vh"}}>
                            <h1>Article {article.title}</h1>
                            <h4>Publié le {new Date(article.createdAt).toLocaleDateString()}</h4>
                            <p>{article.text}</p>
                        </div>
                        }
                    </Paper>
                </div>
                <Footer/>
            </div>
        )
}