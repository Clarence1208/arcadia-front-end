import Header from "../components/Header";
import {Footer} from "../components/Footer";

export function NotFound(){
    return (
        <div>
            <Header />

            <h1>Erreur 404 -Cette page n'existe pas.</h1>

            <Footer />
        </div>
    );
}