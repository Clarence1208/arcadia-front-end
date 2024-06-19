import {Button, TextField} from "@mui/material";
import Paper from "@mui/material/Paper";
import Header from "./components/Header";
import {Footer} from "./components/Footer";
import {loadStripe} from "@stripe/stripe-js";
import {Elements, PaymentElement} from "@stripe/react-stripe-js";
import '../styles/Donations.css';
import React, {FormEvent, useContext, useEffect, useState} from "react";
import StripePayementForm from "./components/StripePayementForm";
import {UserSessionContext} from "../contexts/user-session";


type WebSetting = {
    name: string,
    value: string,
    description: string,
    type: string
}
export function Donate() {

    const [formStep, setFormStep] = useState(0);
    const userSession = useContext(UserSessionContext)?.userSession;
    const [clientSecret, setClientSecret] = useState("");
    const [amount, setAmount] = useState(10);
    const [reloadPaymentIntent, setReloadPaymentIntent] = useState(false);
    const [connectedAccountId, setConnectedAccountId] = useState("");

    async function getSettings() {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/websiteSettings`);
        const data: WebSetting[] = await response.json();
        return data.find(item => item.name === 'stripe_account_id')?.value || "";
    }

    useEffect(
        () => {
            getSettings().then((data) => setConnectedAccountId(data));
        }, []
    )

    const stripePromise = loadStripe("pk_test_51PPPaZBvbnM6p69y9VGLCmAkev3tT3Plbw8JPtnf78iiJxiGtsTXNPOEPn3M9OktpiKeuTqx1XwcoKoVUty97nr600GCnOjcBt",
        {
            stripeAccount: connectedAccountId
        });

    const handlePayButton1 = async (e: FormEvent) => {
        e.preventDefault();
        setReloadPaymentIntent(true);
    }

    const handleFreeAmount = (e: React.ChangeEvent<HTMLInputElement>) => {
        setAmount(parseInt(e.target.value));
        console.log(e.target.value);
    }

    useEffect(() => {
        async function initiatePayment(amount: number) {
            const bearer = "Bearer " + userSession?.loginToken;

            const response = await fetch(`${process.env.REACT_APP_API_URL}/stripe/createPaymentIntent?amount=${amount}&accountId=${connectedAccountId}`, {
                method: "GET",
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': bearer
                },
            });
            if (response.status !== 200) {
                console.warn("Error while creating payement intent");
                return;
            }
            const data = await response.json();
            console.log(data.client_secret);
            setClientSecret(data.client_secret);
            setFormStep(1);
        }

        //TO DO FIX THE RELOAD PAYMENT INTENT STUFF LA HEIN C'EST DE LA D
        if (reloadPaymentIntent){
            console.log("Reload payment intent");
            initiatePayment(amount);
        }

    }, [reloadPaymentIntent]);

    return (
        <div>

            <Header/>
            <div className={"main"}>
                <Paper elevation={1} className={"paper"}>
                    <div style={{width: "65vw"}}>

                        <form className={"donate-form"} onSubmit={handlePayButton1}>

                            <h1>Faire un don</h1>
                            <p>Un grand merci pour votre aide !</p>
                            <h3>Choisissez un montant en euros:</h3>
                            <div className={"amounts-predefined"}>
                                <Button variant={"outlined"} onClick={(e) => setAmount(15)}><input hidden
                                                                                                   name={"amount-15"}/>15</Button>
                                <Button variant={"outlined"} onClick={() => setAmount(25)}><input hidden
                                                                                                  name={"amount-25"}/>25</Button>
                                <Button variant={"outlined"} onClick={() => setAmount(100)}><input hidden
                                                                                                   name={"amount-100"}/>100</Button>
                            </div>
                            <TextField label={"Définir un montant libre"}
                                       color={Number.isInteger(amount) ? "primary" : "error"} name={"free-amount"}
                                       onChange={handleFreeAmount}></TextField>
                            <Button type={"submit"} variant={"contained"} disabled={!Number.isInteger(amount)}>Faire un
                                don de {amount}€</Button>
                        </form>

                        {(formStep === 1 && clientSecret) &&
                            <Elements stripe={stripePromise}
                                      options={{
                                          clientSecret: clientSecret
                                      }}>
                                <StripePayementForm clientSecret={clientSecret} amount={amount}/>
                            </Elements>
                        }
                    </div>

                </Paper>
            </div>
            <Footer/>
        </div>
    )
}