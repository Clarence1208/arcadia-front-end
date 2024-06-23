import React, {useEffect, useState} from "react";
import Header from "../components/Header";
import {Footer} from "../components/Footer";
import {Elements, useStripe} from "@stripe/react-stripe-js";
import {loadStripe} from "@stripe/stripe-js";


type WebSetting = {
    name: string,
    value: string,
    description: string,
    type: string
}
export default function ReturnStripeAccountPage() {

    const [connectedAccountId, setConnectedAccountId] = useState("");
    const stripePromise = loadStripe("pk_test_51PPPaZBvbnM6p69y9VGLCmAkev3tT3Plbw8JPtnf78iiJxiGtsTXNPOEPn3M9OktpiKeuTqx1XwcoKoVUty97nr600GCnOjcBt",
        {
            stripeAccount: connectedAccountId
        }
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
    const clientSecret = new URLSearchParams(window.location.search).get(
        'payment_intent_client_secret'
    ) || '';

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
    const [message, setMessage] = useState("Pas de message");

    useEffect(() => {
        if (!stripe) {
            return;
        }

        // Retrieve the "payment_intent_client_secret" query parameter appended to
        // your return_url by Stripe.js


        // Retrieve the PaymentIntent
        stripe
            .retrievePaymentIntent(clientSecret)
            .then(({paymentIntent}) => {
                // Inspect the PaymentIntent `status` to indicate the status of the payment
                // to your customer.
                //
                // Some payment methods will [immediately succeed or fail][0] upon
                // confirmation, while others will first enter a `processing` state.
                //
                // [0]: https://stripe.com/docs/payments/payment-methods#payment-notification
                switch (paymentIntent?.status) {
                    case 'succeeded':
                        setMessage("Merci de votre don ! La transaction a été effectuée avec succès !");
                        break;

                    case 'processing':
                        setMessage("Votre paiement est en cours de traitement. Vous recevrez un email de confirmation dès que la transaction sera effectuée.");
                        break;

                    case 'requires_payment_method':
                        // Redirect your user back to your payment page to attempt collecting
                        // payment again
                        setMessage('Votre paiement a échoué. Veuillez réessayer.');
                        break;

                    default:
                        setMessage('Une erreur est survenue lors du traitement de votre paiement. Veuillez réessayer.');
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