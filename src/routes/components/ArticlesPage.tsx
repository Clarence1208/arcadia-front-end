import { ListItemButton, ListItemText } from "@mui/material";
import '../../styles/Article.css';
import {useContext} from "react";
import {UserSessionContext} from "../../contexts/user-session";
import {Delete, Edit} from "@mui/icons-material";

interface Article {
    id: number,
    title: string,
    text: string,
    createdAt: Date,
    user: string,
}

export function ArticlesPage({articles}: {articles: Article[]}){

    const userSession = useContext(UserSessionContext)?.userSession
    const isAdmin = userSession?.roles.includes("admin") || userSession?.roles.includes("superadmin")
    return (
        <div className={"articles-list"}>
            {articles.map((article) => (

                <a href={`/articles/${article.id}`} key={article.id} className="article-link">
                    <div>
                        {isAdmin && <Delete color={"primary"}/>}
                        {isAdmin && <Edit color={"primary"}/>}
                    </div>
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
            ))}
        </div>
    )
}