import { ListItemButton, ListItemText } from "@mui/material";
import '../../styles/Article.css';

interface Article {
    id: number,
    title: string,
    text: string,
    createdAt: Date,
    user: string,
}

export function ArticlesPage({articles}: {articles: Article[]}){
    return (
        <div>
            {articles.map((article) => (
                <a href={`/article/${article.id}`} key={article.id} className="article-link">
                    <div className="article-div" >
                        <div className="article-date">
                            <span className="article-date">{new Date(article.createdAt).toLocaleDateString()}</span>
                        </div>
                        {article.text.length < 50 ? <ListItemText primary={article.title} secondary={article.text} />:
                                <ListItemText 
                                primary={article.title} 
                                secondary={article.text.substring(0, 50) + '...'}  
                                sx={{ display: 'row', alignItems: 'center', justifyContent: 'center' }}
                            />
                        }
                    </div>
                </a>
            ))}
        </div>
    )
}