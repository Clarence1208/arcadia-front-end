import Header from "../components/Header";
import {Footer} from "../components/Footer";
import {useParams, useSearchParams} from "react-router-dom";
import {loadStripe} from "@stripe/stripe-js";
import {Elements, PaymentElement, useElements, useStripe} from "@stripe/react-stripe-js";
import {ConfigContext} from "../../index";
import {FormEvent, useContext, useEffect, useState} from "react";
import {Button} from "@mui/material";

export function SubscriptionPayment(){
    const {subscriptionId, clientSecret}= useParams();
    const [params] = useSearchParams();
    const connectedAccountId = params.get('accountId') || ""
    const config = useContext(ConfigContext);
    const [isPageLoaded, setIsPageLoaded] = useState(false);

    const stripePromise =
        loadStripe("pk_live_51PPPaZBvbnM6p69y7vH2KFYTrszO7Mu94ZlkdSl2hJqk4nJszkBoCEM26kytyJLg1Wk4W6YJ33YwjUjcaenutVqj005pVjqnpO",{
        stripeAccount: connectedAccountId
        });

    const options = {
            // passing the client secret obtained from the server
            clientSecret: clientSecret,
        };

    useEffect(() => {
        setTimeout(() => {
            setIsPageLoaded(true);
        }, 100);
    }, []);

    return (
        <div>
            <Header />
            {!isPageLoaded ? <div className="loading">Chargement...</div> :
            <div className="main">
                <h1>Procéder au paiement de votre abonnement</h1>
                {/*{DISPLAY SUBSCRIPTION INFO AGAIN}*/}
                <Elements stripe={stripePromise} options={options}>
                    <PaymentForm />
                </Elements>
            </div>
            }
            <Footer/>
        </div>
    )
}
export function PaymentForm(){
    const stripe = useStripe();
    const elements = useElements();

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        if (!stripe || !elements) {
            // Stripe.js hasn't yet loaded.
            return;
        }

        const result = await stripe.confirmPayment({
            //`Elements` instance that was used to create the Payment Element
            elements,
            confirmParams: {
                return_url: `${window.location.origin}/stripe/validateSubscription`,
            },
        });
    };
    return (
        <form onSubmit={handleSubmit}>
            <PaymentElement />
            <Button type="submit" variant="contained" color="primary">Payer</Button>
        </form>
    )
}