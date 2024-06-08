import {Elements, PaymentElement, useElements, useStripe} from "@stripe/react-stripe-js";
import {Button} from "@mui/material";
import {useEffect, useState} from "react";
import {loadStripe} from "@stripe/stripe-js";

type FormProps = {
    clientSecret: string
}
const stripePromise = loadStripe("pk_test_51PPPaZBvbnM6p69y9VGLCmAkev3tT3Plbw8JPtnf78iiJxiGtsTXNPOEPn3M9OktpiKeuTqx1XwcoKoVUty97nr600GCnOjcBt",
    {
        stripeAccount: 'acct_1PPSByR1DVn2pKme'

    });

export default function StripePayementForm({clientSecret}:FormProps) {
    const options = {
        clientSecret: clientSecret
    }
    return (
        <div className={"stripe-div"}>
            <h1>Procéder au paiement</h1>
            <form>
                {clientSecret &&
                <Elements stripe={stripePromise} options={options}>
                    <PaymentElement />
                    <Button variant={"contained"}>Submit</Button>
                </Elements>
                }
            </form>

        </div>
    )

}