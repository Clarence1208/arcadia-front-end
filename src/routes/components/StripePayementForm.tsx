import {Elements, PaymentElement, useElements, useStripe} from "@stripe/react-stripe-js";
import {Alert, Button, Snackbar} from "@mui/material";
import React, {useEffect, useState} from "react";
import {loadStripe} from "@stripe/stripe-js";

type FormProps = {
    clientSecret: string,
    amount: number
}

export default function StripePayementForm({amount, clientSecret}: FormProps) {

    const stripe = useStripe();
    const elements = useElements(); //
    const [errorMessage, setErrorMessage] = useState("");
    const [open, setOpen] = useState(false);

    async function handlePayButton(e: React.FormEvent) {
        e.preventDefault();
        if (stripe && elements) {
            const {error} = await stripe.confirmPayment({
                //`Elements` instance that was used to create the Payment Element
                elements,
                confirmParams: {
                    return_url: `${window.location.origin}/stripe/return`,
                },
            });

            if (error) {
                // This point will only be reached if there is an immediate error when
                // confirming the payment. Show error to your customer (for example, payment
                // details incomplete)
                setErrorMessage(error.message || "Une erreur indéfinie est survenue");
                setOpen(true);
            }
        } else {
            console.log("Stripe or elements not loaded")
        }
    }

    return (
        <div className={"stripe-div"}>
            <Snackbar
                open={open}
                autoHideDuration={3000}
                onClose={() => setOpen(false)}
                anchorOrigin={{vertical: 'top', horizontal: 'right'}}
            >
                <Alert
                    onClose={() => setOpen(false)}
                    severity="error"
                    variant="filled"
                    sx={{width: '100%'}}
                >{errorMessage}</Alert>
            </Snackbar>
            <h2>Procéder au paiement</h2>
            <form onSubmit={handlePayButton}>
                <PaymentElement/>
                <Button variant={"contained"} type="submit" disabled={!stripe}>Je fais un don de {amount}€</Button>
            </form>
        </div>
    )

}