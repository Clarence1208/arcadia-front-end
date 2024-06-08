import {Button, TextField} from "@mui/material";
import Paper from "@mui/material/Paper";
import Header from "./components/Header";
import {Footer} from "./components/Footer";
import {loadStripe} from "@stripe/stripe-js";
import {Elements, PaymentElement} from "@stripe/react-stripe-js";
const publicKey = process.env.REACT_APP_STRIPE_PUBLIC_KEY || "pk_test_51PPPaZBvbnM6p69y9VGLCmAkev3tT3Plbw8JPtnf78iiJxiGtsTXNPOEPn3M9OktpiKeuTqx1XwcoKoVUty97nr600GCnOjcBt";
const stripePromise = loadStripe(publicKey, {
        stripeAccount: 'acct_1PPSByR1DVn2pKme'
    });
export function Donate(){

    const options = {
            // pass the client secret from the previous step
            clientSecret: '',
            // Fully customizable with the Appearance API
            appearance: {},
    };
    const amount =10;
    return (
        <div>

        <Header />
        <div className={"main"}>
            <Paper elevation={1} className={"paper"}>
            <h1>Faire un don</h1>
            <p>Un grand merci pour votre aide !</p>
            <form>
                <Button><input hidden name={"amount-15"}/>15</Button>
                <Button><input hidden name={"amount-25"}/>25</Button>
                <Button><input hidden name={"amount-100"}/>100</Button>
                <TextField label={"Définir un montant libre"} name={"free-amount"}></TextField>

                {/*<Elements stripe={stripePromise} options={options}>
                    <PaymentElement />
                </Elements>*/}
                <Button type={"submit"}>Faire un don de {amount}€</Button>

            </form>


            </Paper>
        </div>
            <Footer/>
        </div>
    )
}