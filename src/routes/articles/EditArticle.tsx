import {useParams} from "react-router-dom";
import Header from "../components/Header";
import React from "react";
import {Footer} from "../components/Footer";

export function EditArticle() {
    const {articleId} = useParams();
    return (
        <div>
            <Header />
            <div className={"main"}>
                EDIT THE ARTICLE {articleId}
            </div>
            <Footer />
        </div>
    )
}