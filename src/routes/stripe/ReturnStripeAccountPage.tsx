import React, {useContext, useEffect, useState} from "react";
import Header from "../components/Header";
import {Footer} from "../components/Footer";
import {Elements, useStripe} from "@stripe/react-stripe-js";
import {loadStripe} from "@stripe/stripe-js";
import {ConfigContext} from "../../index";
import {Link} from "@mui/material";

type WebSetting = {
    name: string,
    value: string,
    description: string,
    type: string
}
export default function ReturnStripeAccountPage() {
    const config = useContext(ConfigContext);
    const [connectedAccountId, setConnectedAccountId] = useState("");
    const clientSecret = new URLSearchParams(window.location.search).get(
        'payment_intent_client_secret'
    );

    async function getSettings() {
        const response = await fetch(`${config.apiURL}/websiteSettings`);
        const data: WebSetting[] = await response.json();
        return data.find(item => item.name === 'stripe_account_id')?.value || "";
    }

    useEffect(
        () => {
            getSettings().then((data) => setConnectedAccountId(data));
        }, []
    )

    const stripePromise = loadStripe("pk_live_51PPPaZBvbnM6p69y7vH2KFYTrszO7Mu94ZlkdSl2hJqk4nJszkBoCEM26kytyJLg1Wk4W6YJ33YwjUjcaenutVqj005pVjqnpO",
        {
            stripeAccount: connectedAccountId
        }
    );
    if (!clientSecret) {
        return (
            <div>
                <Header/>
                <div className="main">
                    <h1>Erreur</h1>
                    <p>Le paiement n'a pas pu être effectué. Veuillez réessayer.</p><br/>
                    <Link href="/donate">Retour à la page de don</Link>
                    <br/>
                    <br/>
                    <Link href="/users/subscribe">Retour à la page des cotisations</Link>
                </div>
                <Footer/>
            </div>
        );
    }

    return (
        <div>
            <Header/>
            <div className="main">
                <Elements stripe={stripePromise}>
                    <PaymentStatus clientSecret={clientSecret}/>
                </Elements>
            </div>
            <Footer/>
        </div>
    );
}

export function PaymentStatus({clientSecret}: any) {
    const stripe = useStripe();
    const [message, setMessage] = useState("");
    const [fetched, setFetched] = useState(false);

    useEffect(() => {
        if (!stripe) {
            return;
        }
        if (fetched){
            return;
        }
        // Retrieve the PaymentIntent
        stripe
            .retrievePaymentIntent(clientSecret)
            .then(({paymentIntent}) => {
                switch (paymentIntent?.status) {
                    case 'succeeded':
                        setMessage("Merci de votre don ! La transaction a été effectuée avec succès ! Vous allez recevoir un reçu par mail.");
                        setFetched(true);
                        break;

                    case 'processing':
                        setMessage("Votre paiement est en cours de traitement. Vous recevrez un email de confirmation dès que la transaction sera effectuée.");
                        break;

                    case 'requires_payment_method':
                        setMessage('Votre paiement a échoué. Veuillez réessayer.');
                        break;

                    default:
                        setMessage('Une erreur est survenue lors du traitement de votre paiement. Veuillez réessayer. ' + paymentIntent?.status);
                        break;
                }
            });
    }, [stripe]);

    return (
        <div>
            <h1>Statut du paiement</h1>
            <p>{message}</p>
        </div>
    );
}