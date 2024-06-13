import React from "react";
import Header from "../components/Header";
import {Footer} from "../components/Footer";

export default function ReturnStripeAccountPage() {

    return (
        <div>
            <Header/>
            <div className="main">
                <p>
                    Merci de votre don ! La transaction a été effectuée avec succès !
                </p>
            </div>
            <Footer/>
        </div>
    );
}