import {UserRegisterForm} from "./components/UserRegisterForm"
import React, {useContext,useEffect, useState} from "react";
import Header from "./components/Header";
import {Footer} from "./components/Footer";
import {Alert, Button, Snackbar} from "@mui/material";
import {Dayjs} from "dayjs";
import { useNavigate } from "react-router-dom";
import Paper from "@mui/material/Paper";
import {Elements, PaymentElement, useElements, useStripe} from "@stripe/react-stripe-js";
import StripePayementForm from "./components/StripePayementForm";
import {loadStripe} from "@stripe/stripe-js";
import {UserSessionContext} from "../contexts/user-session";
import "../styles/Memberships.css";
import {ConfigContext} from "../index";

type FormData = {
    firstName: string
    surname: string
    email: string
    password: string,
    confirmPassword?: string,
    birthDate: Dayjs | null,
    roles?: string
}

const body: FormData = {
    firstName: "",
    surname: "",
    email: "",
    password: "",
    birthDate: null,
}

type WebSetting = {
    name: string,
    value: string,
    description: string,
    type: string
}
type StripePriceDto = {
    currency: string;
    unit_amount: number;
    recurring: {
        interval: string;
        interval_count: number;
    };
}
type MembershipDTO = {
    id?: string
    name: string;
    description: string;
    default_price: StripePriceDto;
}


export function Register(){
    const navigate = useNavigate();
    const config = useContext(ConfigContext);

    const [data, setData] = useState(body)
    const [errorMessage, setErrorMessage] = useState("")

    function updateFields(fields: Partial<FormData>) {
        setData(prev => {
            return { ...prev, ...fields }
        })
    }
    const [isPageLoaded, setIsPageLoaded] = useState(false);
    const [selectedMembership, setSelectedMembership] = useState<MembershipDTO | null>(null);
    const [connectedAccountId, setConnectedAccountId] = useState("");
    const [memberships, setMemberships] = useState([]);
    async function getSettings() {
        const response = await fetch(`${config.apiURL}/websiteSettings`);
        const data: WebSetting[] = await response.json();
        return data.find(item => item.name === 'stripe_account_id')?.value || "";
    }


    useEffect(() => {
        setTimeout(() => {
            setIsPageLoaded(true);
        }, 100);
    }, []);

    useEffect(
        () => {
            getSettings().then((data) => setConnectedAccountId(data));
        }, []
    )
    useEffect(() => {
        async function fetchMemberships() {

            const response = await fetch(`${config.apiURL}/stripe/memberships?accountId=${connectedAccountId}`,
                {
                    headers: {
                        "Content-Type": "application/json",
                    }
                }
            );
            const data = await response.json();
            console.log(data)
            setSelectedMembership(data[0]);
            return data;
        }

        fetchMemberships().then((data) => setMemberships(data));
    }, [connectedAccountId]);


    const stripePromise = loadStripe("pk_test_51PPPaZBvbnM6p69y9VGLCmAkev3tT3Plbw8JPtnf78iiJxiGtsTXNPOEPn3M9OktpiKeuTqx1XwcoKoVUty97nr600GCnOjcBt",
        {
            stripeAccount: "acct_1PPSByR1DVn2pKme"
        });

    return (
        <div>
            <Header />
            <div className="main">
                {isPageLoaded ?
                <Paper elevation={1} className={""} style={{width: "40vw"}}>
                    <UserRegisterForm {...data} formTitle={"Créer un compte"} formDescription={"Accéder aux actualités, vos historiques de paiements et participer aux assemblées générales"} formError={errorMessage} updateFields={updateFields}  />
                    {selectedMembership &&
                    <Elements stripe={stripePromise} options={{
                        mode: "subscription",
                        currency: "eur",
                        amount: selectedMembership?.default_price.unit_amount *100,
                    }}>
                        <PaymentInfoForm userData={data} accountID={connectedAccountId} memberships={memberships} selectedMembership={selectedMembership} setSelectedMembership={setSelectedMembership}/>
                    </Elements>
                    }
                 </Paper> :
                    <div className="loading">
                        <h1>Chargement...</h1>
                    </div>
                }
            </div>
            <Footer />
        </div>
    )
}

export function PaymentInfoForm({userData,accountID,memberships, selectedMembership, setSelectedMembership}: {userData: FormData, accountID: string, memberships: MembershipDTO[], selectedMembership: MembershipDTO | null, setSelectedMembership(item: MembershipDTO | null): void}) {

    const config = useContext(ConfigContext);
    const stripe = useStripe();
    const elements = useElements();
    async function createUser(userData: FormData): Promise<any> {

        if (userData.password !== userData.confirmPassword) {
            // setErrorMessage("Les mots de passe ne correspondent pas");
            return
        }

        delete userData.confirmPassword;
        const response: Response = await fetch(`${config.apiURL}/users/register`, {method: "POST", body: JSON.stringify(userData), headers: {"Content-Type": "application/json"}});
        //const response: Response = await fetch(config.apiURL+`/users/register?paymentMethodId=${"la"}&priceId=${"price_1PS0fiR1DVn2pKmeWcLGL7vb"}`, {method: "POST", body: JSON.stringify(userData), headers: {"Content-Type": "application/json"}});
        if (!response.ok) {
            const error =  await response.json()
            // setErrorMessage("Erreur lors de la création du compte: " + await error.message);
            return
        }
        console.log("User created")
        const clientSecret = await response.text();
        console.log(clientSecret)
        // return await response.text()
        if (stripe && elements) {
            const {error} = await stripe?.confirmPayment({
            //const {error} = await stripe.confirmSetup({
                elements,
                clientSecret,
                confirmParams: {
                    return_url: `${window.location.origin}/stripe/return`,
                },
            });
            if (error) {
                console.log(error)
            }
        }else{
            console.log("Stripe or elements not loaded")
        }
        // navigate("/login?successMessage=true")
    }
    async function handleSubmit(){
        await createUser(userData);
    }

    const selectItem = (item: MembershipDTO) => {
        if (selectedMembership?.id === item.id) {
            setSelectedMembership(null);
        }else{
            setSelectedMembership(item);
        }
    }
    const createSUbscription = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Creating subscription FUNC")
        await createUser(userData);

    }

    return (

        <form onSubmit={createSUbscription}>

            <div className="list-memberships">
                {memberships.map((membership: any) => {
                    return <MembershipCard data={membership} selectedItem={selectedMembership} handleClick={selectItem}/>
                })}
            </div>

            <PaymentElement/>

            <Button variant="contained" type={"submit"} onClick={handleSubmit} style={{width: "10vw"}}>Créer mon compte</Button>

        </form>
    )
}

export function MembershipCard({data, selectedItem, handleClick}: {data: MembershipDTO, selectedItem: MembershipDTO | null, handleClick: (item: MembershipDTO) => void}) {

    return (
        <div key={data.id} className="membership-card" onClick={() => handleClick(data)}>
            <h3>{data.name}</h3>
            <p>{data.description}</p>
            <p>{data.default_price.unit_amount / 100}€</p>
            {selectedItem?.id === data.id && <Button variant="contained">Sélectionné</Button>}
        </div>
    )
}