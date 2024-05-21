import {Footer} from "../components/Footer";
import Header from "../components/Header";
import React, {useContext, useEffect, useState} from "react";
import {UserSessionContext} from "../contexts/user-session";
import {ArticlesPage} from "./features/ArticlesPage";
import {Pagination} from "@mui/material";

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

const getArticles = async (filters?: Filters): Promise<Article[]> => {
    //const bearer = "Bearer " + userToken;
    const response: Response = await fetch(`${process.env.REACT_APP_API_URL}/articles${filters?.page ? "?limit=10&page="+filters?.page : ""}`, {
        headers: {
            //"Authorization": bearer,
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
        console.log("Aucun site web trouvé")
        //setErrorMessage("Aucun site web trouvé")
    }
    return res;
}
export function Blog(){

    //const userSession = useContext(UserSessionContext)?.userSession
    const [articles, setArticles] = useState<Article[]>([])
    const [page, setPage] = useState(1);

    const handleChangePage = (event: React.ChangeEvent<unknown>, value: number) => {
        setPage(value);
    };

    useEffect(() => {
        getArticles({page: page}).then(setArticles)
    }, [page]);

    return (
        <div>
          <Header />

            <div className={"main"}>
                {articles.length === 0 ? <div>Loading or no articles...</div> :
                    <ArticlesPage articles={articles}/>
                }
                <Pagination count={10} page={page} onChange={handleChangePage} />

            </div>

          <Footer />
        </div>
    )
}