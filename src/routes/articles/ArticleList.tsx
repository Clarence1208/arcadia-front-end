import {Alert, Button, ListItemButton, ListItemText} from "@mui/material";
import '../../styles/Article.css';
import {useContext, useState} from "react";
import {UserSessionContext} from "../../contexts/user-session";
import {Delete, Edit} from "@mui/icons-material";
import Snackbar from "@mui/material/Snackbar";

interface Article {
    id: number,
    title: string,
    text: string,
    createdAt: Date,
    user: string,
}

export function ArticleList({articles, deleteItem}: {articles: Article[], deleteItem: (id: number) => void}){
    const userSession = useContext(UserSessionContext)?.userSession
    const isAdmin = userSession?.roles.includes("admin") || userSession?.roles.includes("superadmin")


    return (
        <div className={"articles-list"}>
            {articles.map((article) => (

                <div key={article.id}>
                    <div className={"action-icons"}>
                        {isAdmin && <Button className={"icons"} onClick={() => deleteItem(article.id)}><Delete color={"primary"}/></Button>}
                        {isAdmin && <Button className={"icons"} href={`/articles/${article.id}/edit`}><Edit color={"primary"}/></Button>}
                    </div>
                <a href={`/articles/${article.id}`} className="article-link">
                    <div className="article-div" >
                        <div className="article-date">
                            <span className="article-date">Publié le {new Date(article.createdAt).toLocaleDateString()}</span>
                        </div>

                        <h2>{article.title.length > 15 ? article.title.substring(0,15) + "..." : article.title}</h2>

                        <div className="article-text">
                            <p>{article.text}</p>
                        </div>
                    </div>
                </a>
                </div>
            ))}
        </div>
    )
}