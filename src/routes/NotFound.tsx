import Header from "./components/Header";
import {Footer} from "./components/Footer";

export function NotFound(){
    return (
        <div>
            <Header />
            <div className={"main"}>
                <h1>Erreur 404 -Cette page n'existe pas.</h1>
            </div>
            <Footer />
        </div>
    );
}