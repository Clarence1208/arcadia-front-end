import {Footer} from "./components/Footer";
import Header from "./components/Header";
import React, {useContext, useEffect, useState} from "react";
import {UserSessionContext} from "../contexts/user-session";
import {ArticleList} from "./articles/ArticleList";
import {Pagination, List, Button, Alert, CircularProgress, Box, useTheme} from "@mui/material";
import '../styles/Blog.css';
import {Add} from "@mui/icons-material";
import Snackbar from "@mui/material/Snackbar";
import {useNavigate} from "react-router-dom";
import {Chatbot} from "./components/Chatbot";
import {PollList} from "./polls/PollList";
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

export function Blog() {
    const userSession = useContext(UserSessionContext)?.userSession;
    const [articles, setArticles] = useState<Article[]>([]);
    const [page, setPage] = useState(1);
    const [flashMessage, setFlashMessage] = useState<string>("");
    const [open, setOpen] = useState(false);
    const navigate = useNavigate();
    const config = useContext(ConfigContext);
    const [ErrorMessage, setErrorMessage] = useState("")
    const [isPageLoaded, setIsPageLoaded] = useState(false);
    const theme = useTheme();
    const [total, setTotal] = useState(0);

    useEffect(() => {
        setTimeout(() => {
            setIsPageLoaded(true);
        }, 100);
    }, []);

    const handleClose = () => {
        setOpen(false);
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
                    const error = await response.json();
                    setFlashMessage("Erreur : " + await error.message);
                    return [];
                }
                const res = await response.json();
                setTotal(res.total);
                return res.data;
            }
            getArticles({page: page}).then((data) => {
                setArticles(data);
            });
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
            const error = await response.json();
            setFlashMessage("Erreur : " + await error.message);
            setOpen(true);
            return;
        }
        await response.json();
        setFlashMessage("Article supprimé");
        setOpen(true);
        setArticles(articles.filter((article) => article.id !== id));
    }

    return (
        <>
            <Header />
                    {!isPageLoaded ? (
                <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height="100vh">
                    <CircularProgress/>
                    <div>Loading...</div>
                </Box>
            ) : (
                <div>

                    <Snackbar
                        open={open}
                        autoHideDuration={3000}
                        onClose={handleClose}
                        anchorOrigin={{vertical: 'top', horizontal: 'right'}}
                    >
                        <Alert
                            onClose={handleClose}
                            severity="success"
                            variant="filled"
                            sx={{width: '100%'}}
                        >{flashMessage}</Alert>
                    </Snackbar>

                    <div className={"main article-page"}>
                        <div id={"title-blog"}>
                            <h1>Actualités</h1>
                            {(userSession?.roles.includes("admin") || userSession?.roles.includes("superadmin")) && (
                                <div className={"create-article"}>
                                    <Button
                                        href={"/createArticle"}
                                        variant="contained"
                                        startIcon={<Add/>}
                                    >
                                        Créer un article
                                    </Button>
                                </div>
                            )}
                        </div>

                        {articles.length === 0 ? (
                            <div>No articles available. Please check back later.</div>
                        ) : (
                            <ArticleList articles={articles} deleteItem={deleteItem}/>
                        )}
                        { total > 6 &&
                            <div style={{marginTop: "2vh", alignSelf:"center"}}>
                                <Pagination count={(Math.ceil(total / 6))} page={page} onChange={handleChangePage}/>
                            </div>
                        }

                        <div style={{
                            backgroundColor: theme.palette.primary.main,
                            height: "0.25em",
                            width: "auto",
                            margin: "6em 0"
                        }}></div>

                        <PollList/>
                    </div>
                    <Chatbot />
                </div>
            )}
        <Footer />
    </>
    );
}