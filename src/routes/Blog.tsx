import {Footer} from "./components/Footer";
import Header from "./components/Header";
import React, {useContext, useEffect, useState} from "react";
import {UserSessionContext} from "../contexts/user-session";
import {ArticleList} from "./articles/ArticleList";
import {Pagination, List, Button, Alert} from "@mui/material";
import '../styles/Blog.css';
import { Add } from "@mui/icons-material";
import Snackbar from "@mui/material/Snackbar";
import {useNavigate} from "react-router-dom";
import {Chatbot} from "./components/Chatbot";
import { PollList } from "./polls/PollList";
import theme from "../utils/theme";
import {ConfigContext} from "../index";

interface Article {
    id: number,
    title: string,
    text: string,
    createdAt: Date,
    user: string,
}

type Filters = {
    page?: number,
    limit?: number,
}
export function Blog(){

    const userSession = useContext(UserSessionContext)?.userSession
    const [articles, setArticles] = useState<Article[]>([])
    const [page, setPage] = useState(1);
    const [flashMessage, setFlashMessage] = useState<string>("")
    const [open, setOpen] = useState(false);
    const navigate = useNavigate();
    const config = useContext(ConfigContext);
    const [ErrorMessage, setErrorMessage] = useState("")

    const handleClose = () => {
        setOpen(false)
    }
    const handleChangePage = (event: React.ChangeEvent<unknown>, value: number) => {
        setPage(value);
    };

    useEffect(() => {
        if (userSession?.loginToken) {
            const getArticles = async (filters?: Filters): Promise<Article[]> => {
                const bearer = "Bearer " + userSession?.loginToken;
                const response: Response = await fetch(`${config.apiURL}/articles${filters?.page ? "?limit=6&page=" + filters?.page : ""}`, {
                    headers: {
                        "Authorization": bearer,
                        "Content-Type": "application/json"
                    }
                });
                if (!response.ok) {
                    const error = await response.json()
                    console.log(error)
                    setFlashMessage("Erreur : " + await error.message);
                    return []
                }
                const res = await response.json();
                return res;
            }
            getArticles({page: page}).then(setArticles)
            console.log(articles)
        }
    }, [page, userSession?.loginToken]);

    async function deleteItem(id: number) {
        const bearer = "Bearer " + userSession?.loginToken;
        const response = await fetch(`${config.apiURL}/articles/${id}`, {
            method: "DELETE",
            headers: {
                "Authorization": bearer,
                "Content-Type": "application/json"
            }
        });
        if (!response.ok) {
            const error = await response.json()
            setFlashMessage("Erreur : " + await error.message);
            setOpen(true)
            return
        }
        const res = await response.json();
        setFlashMessage("Article supprimé")
        setOpen(true)
        setArticles(articles.filter((article) => article.id !== id))
    }

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
                >{flashMessage}</Alert>
            </Snackbar>

            <div className={"main article-page"}>
                <div id={"title-blog"}>
                    <h1>Actualités</h1>
                    {userSession?.roles.includes("admin") || userSession?.roles.includes("superadmin") ?
                        <div className={"create-article"}>
                            <Button
                                href={"/createArticle"}
                                variant="contained"
                                startIcon={<Add />}>
                                Créer un article
                            </Button>
                        </div> : null
                    }
                </div>

                    {
                        articles.length === 0 ?
                        <div>Loading or no articles...</div> :
                        <ArticleList articles={articles} deleteItem={deleteItem}/>
                    }
                <Pagination style={{alignSelf: "center"}} count={10} page={page} onChange={handleChangePage} />

                <div style={{backgroundColor: "pink", height:"0.25em", width:"auto", margin:"6em 0"}}></div>
                {/*TODO: CHANGE COLOR LA JE VAIS CHERCHER MA PIZZA*/}

                <PollList />
            </div>
            <Chatbot />
          <Footer />
        </div>
    )
}