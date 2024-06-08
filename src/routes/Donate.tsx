import {Button, TextField} from "@mui/material";
import Paper from "@mui/material/Paper";
import Header from "./components/Header";
import {Footer} from "./components/Footer";
import {loadStripe} from "@stripe/stripe-js";
import {Elements, PaymentElement} from "@stripe/react-stripe-js";
import '../styles/Donations.css';
import React, {FormEvent, useContext, useState} from "react";
import StripePayementForm from "./components/StripePayementForm";
import {UserSessionContext} from "../contexts/user-session";
export function Donate(){

    const [formStep, setFormStep] = useState(0);
    const userSession = useContext(UserSessionContext)?.userSession;
    const [clientSecret, setClientSecret] = useState("");
    const [amount, setAmount] = useState(10);
    const initiatePayement = async (e : FormEvent) => {
        e.preventDefault();
        const bearer = "Bearer " + userSession?.loginToken;

        const response = await fetch(`${process.env.REACT_APP_API_URL}/stripe/createPaymentIntent?amount=${amount}`, {
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

    const handleFreeAmount = (e: React.ChangeEvent<HTMLInputElement>) => {
        setAmount(parseInt(e.target.value));
        console.log(e.target.value);
    }
    return (
        <div>

        <Header />
        <div className={"main"}>
            <Paper elevation={1} className={"paper"}>
                <div style={{width:"65vw"}}>

            <form className={"donate-form"} onSubmit={initiatePayement}>

                <h1>Faire un don</h1>
                <p>Un grand merci pour votre aide !</p>
                <h3>Choisissez un montant en euros:</h3>
                <div className={"amounts-predefined"}>
                    <Button variant={"outlined"} onClick={(e) => setAmount(15)}><input hidden name={"amount-15"}/>15</Button>
                    <Button variant={"outlined"} onClick={()=>setAmount(25)}><input hidden name={"amount-25"}/>25</Button>
                    <Button variant={"outlined"} onClick={()=>setAmount(100)}><input hidden name={"amount-100"}/>100</Button>
                </div>
                <TextField label={"Définir un montant libre"} color={Number.isInteger(amount)? "primary": "error"}  name={"free-amount"} onChange={handleFreeAmount}></TextField>
                <Button type={"submit"} variant={"contained"} disabled={!Number.isInteger(amount)} >Faire un don de {amount}€</Button>
            </form>

                {(formStep === 1 && clientSecret) && <StripePayementForm clientSecret={clientSecret} />
                }
                </div>

            </Paper>
        </div>
            <Footer/>
        </div>
    )
}