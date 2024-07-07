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
import {ConfigContext} from "../index";


type WebSetting = {
    name: string,
    value: string,
    description: string,
    type: string
}
export function Donate() {

    const config = useContext(ConfigContext);
    const userSession = useContext(UserSessionContext)?.userSession;
    const [formStep, setFormStep] = useState(0);
    const [clientSecret, setClientSecret] = useState("");
    const [amount, setAmount] = useState(15);
    const [reloadPaymentIntent, setReloadPaymentIntent] = useState(false);
    const [connectedAccountId, setConnectedAccountId] = useState("");
    const [customerEmail, setCustomerEmail] = useState(userSession?.email || "");
    const [isPageLoaded, setIsPageLoaded] = useState(false);
    const [isDataFetched, setIsDataFetched] = useState(false);

    useEffect(() => {
        if (isDataFetched) {
            setTimeout(() => {
                setIsPageLoaded(true);
            }, 100);
        }
    }, [isDataFetched]);

    async function getSettings() {
        console.log(userSession);
        const response = await fetch(`${config.apiURL}/websiteSettings`);
        const data: WebSetting[] = await response.json();
        return data.find(item => item.name === 'stripe_account_id')?.value || "";
    }

    useEffect(
        () => {
            getSettings().then((data) => setConnectedAccountId(data));
            setIsDataFetched(true);
        }, []
    )

    const stripePromise = loadStripe("pk_test_51PPPaZBvbnM6p69y9VGLCmAkev3tT3Plbw8JPtnf78iiJxiGtsTXNPOEPn3M9OktpiKeuTqx1XwcoKoVUty97nr600GCnOjcBt",
        {
            stripeAccount: connectedAccountId
        });

    const handlePayButton1 = async (e: FormEvent) => {
        e.preventDefault();
        initiatePayment(amount).then(() => {
            console.log("Payment intent reloaded")
        });
    }

    const handleFreeAmount = (e: React.ChangeEvent<HTMLInputElement>) => {
        setAmount(parseInt(e.target.value));
    }
    async function initiatePayment(amount: number) {
        const bearer = "Bearer " + userSession?.loginToken;

        const response = await fetch(`${config.apiURL}/stripe/createPaymentIntent?amount=${amount}&accountId=${connectedAccountId}&customerEmail=${customerEmail}`, {
            method: "GET",
            headers: {
                'Content-Type': 'application/json',
                'Authorization': bearer
            },
        });
        if (response.status !== 200) {
            return;
        }
        const data = await response.json();
        setClientSecret(data.client_secret);
        setFormStep(1);
    }

    if (!isPageLoaded) {
        return (
            <div>
                <Header/>
                <div className="main">
                    <div className="loading">Chargement...</div>
                </div>
                <Footer/>
            </div>
        )
    }else {
        return (
            <div>
                <Header/>
                <div className={"main"}>
                    <Paper elevation={1} className={"paper"}>
                        <div style={{minWidth: "60vw"}}>

                            <form className={"donate-form"} onSubmit={handlePayButton1}>

                                <h1>Faire un don</h1>
                                <p>Un grand merci pour votre aide !</p>
                                <TextField label={"Votre adresse email"} value={customerEmail} type="email" required
                                           name={"customerEmail"}
                                           onChange={(e) => setCustomerEmail(e.target.value)}></TextField>
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
                                <Button type={"submit"} variant={"contained"} disabled={!Number.isInteger(amount)}>Faire
                                    un
                                    don de {amount}€</Button>
                            </form>

                            {(formStep === 1 && clientSecret) ?
                                <Elements stripe={stripePromise}
                                          options={{
                                              clientSecret: clientSecret
                                          }}>
                                    <StripePayementForm clientSecret={clientSecret} amount={amount}/>
                                </Elements>
                                :
                                <div style={{display: "flex"}}>
                                    <p style={{alignSelf: "center"}}>Veuillez sélectionner ou entrez un montant pour
                                        votre don</p>
                                </div>
                            }
                        </div>
                    </Paper>
                </div>
                <Footer/>
            </div>
        )
    }
}