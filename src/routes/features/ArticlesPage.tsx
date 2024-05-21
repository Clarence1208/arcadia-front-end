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
                <div style={{borderColor: "green"}} key={article.id}>
                    <h2>{article.title}</h2>
                    <p>{article.text}</p>
                    <p>{article.user}</p>
                </div>))
            }
        </div>
    )
}