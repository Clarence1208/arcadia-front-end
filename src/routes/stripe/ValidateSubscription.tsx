import React, {useContext, useEffect, useState} from "react";
import {loadStripe} from "@stripe/stripe-js";
import {ConfigContext} from "../../index";
import {Elements, useStripe} from "@stripe/react-stripe-js";
import {Button, Link} from "@mui/material";
import {UserSessionContext} from "../../contexts/user-session";
import Header from "../components/Header";
import {Footer} from "../components/Footer";

type WebSetting = {
    name: string,
    value: string,
    description: string,
    type: string
}
export function ValidateSubscription(){
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
                <h1>Erreur</h1>
                <Link href="/users/subscribe">Retour à la page des cotisations</Link>
            </div>
        );
    }else {
        return (
            <div>
                <Elements stripe={stripePromise}>
                    <SubscriptionStatus clientSecret={clientSecret}/>
                </Elements>
            </div>
        )
    }
}

export function SubscriptionStatus({clientSecret}: {clientSecret: string | null}) {

    const stripe = useStripe();
    const [message, setMessage] = useState("");
    const userSession = useContext(UserSessionContext)?.userSession;
    const updateSession = useContext(UserSessionContext)?.updateUserSession;
    const config = useContext(ConfigContext);
    const [updateUser, setUpdateUser] = useState(false);
    const [fetched, setFetched] = useState(false);

    async function changeRole(userId: number, role: string) {
        //UPDATE USER ROLE
        const res = await fetch(`${config.apiURL}/users/${userId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + userSession?.loginToken
            },
            body: JSON.stringify({roles: role})
        })

        if (res.ok) {
            const user = await res.json();
            const newRoles = user.roles.split(", ");

            //update session
            if (!updateSession) return false;
            updateSession({
                roles: newRoles
            })
            return true;
        }

        return false
    }


    useEffect(() => {
        if (!stripe) {
            return;
        }
        if (!clientSecret) {
            return;
        }
        if (fetched) {
            return;
        }
        // Retrieve the PaymentIntent
        stripe
            .retrievePaymentIntent(clientSecret)
            .then(({paymentIntent}) => {
                switch (paymentIntent?.status) {
                    case 'succeeded':
                        setMessage("Vous avez bien souscrit à la cotisation pour l'association. Vous recevrez un email de confirmation dès que la transaction sera effectuée.");

                        if (!userSession?.userId){
                            setMessage(message + " Une erreur est survenu, veuillez contacter un administrateur.")
                            break;
                        }
                        setUpdateUser(true);
                        setFetched(true);
                        break;

                    case 'processing':
                        setMessage("Votre paiement est en cours de traitement. Vous recevrez un email de confirmation dès que la transaction sera effectuée.");
                        break;

                    case 'requires_payment_method':
                        setMessage('Votre paiement a échoué. Veuillez réessayer.');
                        break;

                    default:
                        setMessage('Une erreur est survenue lors du traitement de votre paiement. Veuillez réessayer.');
                        break;
                }
            })

            .catch((error) => {
                setMessage('Une erreur est survenue lors du traitement de votre paiement. Veuillez réessayer');
            });

    }, [stripe]);

    useEffect(() => {

        if (!updateUser || !userSession?.userId) return;
        changeRole(userSession?.userId, "adherent").then(updated => {
            if (updated) {
                setMessage("Vous avez bien souscrit à la cotisation pour l'association. Vous recevrez un email de confirmation dès que la transaction sera effectuée.");
            }else{
                setMessage("Une erreur est survenue lors de la mise à jour de votre compte. Veuillez contacter un administrateur.")
            }
        });

    }, [updateUser]);

    if (!clientSecret) {
        return (
            <div>
                <h1>Erreur</h1>
                <p>Le paiement n'a pas pu être effectué. Veuillez réessayer.</p><br/>
                <br/>
                <br/>
                <Link href="/users/subscribe">Retour à la page des cotisations</Link>
            </div>
        );
    }
    return (
        <div>
            <Header/>
            <div className="main">
                <h1>Validation de la cotisation</h1>
                <p>{message}</p>
                <br/>
                <Button variant="contained" color="primary" href="/memberDashboard">Accès au tableau de bord adhérent</Button>
            </div>
            <Footer/>
        </div>
    )
}