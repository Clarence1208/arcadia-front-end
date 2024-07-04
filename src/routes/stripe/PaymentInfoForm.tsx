/*
import React, {useContext, useEffect, useState} from "react";
import {ConfigContext} from "../../index";
import {PaymentElement, useElements, useStripe} from "@stripe/react-stripe-js";
import {Button} from "@mui/material";

const [memberships, setMemberships] = useState([]);
const [selectedMembership, setSelectedMembership] = useState<MembershipDTO | null>(null);
export function PaymentInfoForm({userData,accountID,memberships, selectedMembership, setSelectedMembership}: {userData: FormData, accountID: string, memberships: MembershipDTO[], selectedMembership: MembershipDTO | null, setSelectedMembership(item: MembershipDTO | null): void}) {

    const config = useContext(ConfigContext);
    const stripe = useStripe();
    const elements = useElements();
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
            return data;
        }

        fetchMemberships().then((data) => setMemberships(data));
    }, [connectedAccountId]);
    async function createUser(userData: FormData): Promise<any> {

        // if (userData.password !== userData.confirmPassword) {
        //     // setErrorMessage("Les mots de passe ne correspondent pas");
        //     return
        // }

        // delete userData.confirmPassword;
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
        </form>
    )
}

type MembershipDTO = {
    id?: string
    name: string;
    description: string;
    default_price: StripePriceDto;
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
}*/
export default {}