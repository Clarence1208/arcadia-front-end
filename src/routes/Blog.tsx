import {Footer} from "./components/Footer";
import Header from "./components/Header";
import React, {useContext, useEffect, useState} from "react";
import {UserSessionContext} from "../contexts/user-session";
import {ArticlesPage} from "./components/ArticlesPage";
import {Pagination, List, Button} from "@mui/material";
import '../styles/Blog.css';
import { Add } from "@mui/icons-material";

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

    const handleChangePage = (event: React.ChangeEvent<unknown>, value: number) => {
        setPage(value);
    };

    useEffect(() => {
        if (userSession?.loginToken) {
            const getArticles = async (filters?: Filters): Promise<Article[]> => {
                const bearer = "Bearer " + userSession?.loginToken;
                const response: Response = await fetch(`${process.env.REACT_APP_API_URL}/articles${filters?.page ? "?limit=6&page=" + filters?.page : ""}`, {
                    headers: {
                        "Authorization": bearer,
                        "Content-Type": "application/json"
                    }
                });
                if (!response.ok) {
                    const error = await response.json()
                    console.log(error)
                    //setErrorMessage("Erreur : " + await error.message);
                    return []
                }
                const res = await response.json();
                if (res.length === 0) {
                    console.log("Aucun article trouvé")
                    //setErrorMessage("Aucun site web trouvé")
                }
                return res;
            }
            getArticles({page: page}).then(setArticles)
        }
    }, [page, userSession?.loginToken]);

    return (
        <div>
          <Header />


            <div className={"main article-page"}>
                <div id={"title-blog"}>
                    <h1>Actualités</h1>
                    {userSession?.roles.includes("admin") || userSession?.roles.includes("superadmin") ?
                        <div className={"create-article"}>
                            <Button
                                href={"/createArticle"}
                                variant="outlined"
                                startIcon={<Add />}>
                                Créer un article
                            </Button>
                        </div> : null
                    }
                </div>

                    {
                        articles.length === 0 ?
                        <div>Loading or no articles...</div> :
                        <ArticlesPage articles={articles}/>
                    }
                <Pagination style={{alignSelf: "center"}} count={10} page={page} onChange={handleChangePage} />
            </div>

          <Footer />
        </div>
    )
}