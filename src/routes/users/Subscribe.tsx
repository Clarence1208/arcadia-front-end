import Header from "../components/Header";
import {Footer} from "../components/Footer";
import {ConfigContext} from "../../index";
import {useContext, useEffect, useState} from "react";
import {Button} from "@mui/material";
import {UserSessionContext} from "../../contexts/user-session";
import {useNavigate} from "react-router-dom";

type MembershipDTO = {
    id?: string
    name: string;
    description: string;
    default_price: StripePriceDto;
    active: boolean;
}

type StripePriceDto = {
    id?: string;
    currency: string;
    unit_amount: number;
    recurring: {
        interval: string;
        interval_count: number;
    };
}

type WebSetting = {
    name: string,
    value: string,
    description: string,
    type: string
}


type StripeData = {
    priceId: string,
    subscriptionId: string,
    clientSecret: string
}

type CustomError = {
    message: string
}

export function MembershipCard({data, selectedItem, handleClick}: {data: MembershipDTO, selectedItem: MembershipDTO | null, handleClick: (item: MembershipDTO) => void}) {

    return (
        <div key={data.default_price.id} className="membership-card" onClick={() => handleClick(data)}>
            <h3>{data.name}</h3>
            <p>{data.description}</p>
            <p>{data.default_price.unit_amount / 100}€</p>
            {selectedItem?.id === data.id && <Button variant="contained">Sélectionné</Button>}
        </div>
    )
}
export function Subscribe(){
    const config = useContext(ConfigContext);
    const userSession = useContext(UserSessionContext)?.userSession
    const [memberships, setMemberships] = useState([]);
    const [selectedMembership, setSelectedMembership] = useState<MembershipDTO | null>(null);
    const [connectedAccountId, setConnectedAccountId] = useState<string>("");
    const navigate = useNavigate() ;

    const selectItem = (item: MembershipDTO) => {
        if (selectedMembership?.id === item.id) {
            setSelectedMembership(null);
        }else{
            setSelectedMembership(item);
        }
    }
    async function getSettings() {
        const response = await fetch(`${config.apiURL}/websiteSettings`);
        const data: WebSetting[] = await response.json();
        return data.find(item => item.name === 'stripe_account_id')?.value || "";
    }
    async function fetchMemberships() {

        const response = await fetch(`${config.apiURL}/stripe/memberships?accountId=${connectedAccountId}`,
            {
                headers: {
                    "Content-Type": "application/json",
                }
            }
        );
        const data = await response.json();
        return data.filter((membership: MembershipDTO) => membership.active);
    }


    async function getPaymentIntent() {

        const bearer = "Bearer " + userSession?.loginToken;
        const response = await fetch(`${config.apiURL}/stripe/subscriptionIntents`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": bearer
            },
            body: JSON.stringify({
                priceId: selectedMembership?.default_price.id || "",
                customerId: userSession?.customerId || "",
                email: userSession?.email || ""
            })
        });

        if (!response.ok) {
            const error: CustomError = await response.json();
            return;
        }

        const data: StripeData = await response.json();
        navigate("/users/subscribe/"+ data.subscriptionId +"/"+ data.clientSecret +"?priceId="+ data.priceId + "&accountId=" + connectedAccountId)
    }

    useEffect(
        () => {
            getSettings().then((data) => setConnectedAccountId(data));
        }, []
    )

    useEffect(() => {
        if (connectedAccountId !== "") {
            fetchMemberships().then((data) => {
                    setMemberships(data);
                    setSelectedMembership(data[0]);
            }
            );
        }
    }, [connectedAccountId]);
    return (
        <div>
            <Header />
            <div className="main">
                <h1>Sélectionner le montant de votre cotisation mensuelle</h1>
                <p>L'accès au tableau de bord des adhérents est accessible uniquement aux utilisateurs qui paient une cotisation mensuelle.</p>

                <div className="list-memberships">
                    {memberships.map((membership: any) => {
                        return <MembershipCard data={membership} selectedItem={selectedMembership} handleClick={selectItem}/>
                    })}
                </div>

                <Button variant="outlined" onClick={getPaymentIntent}>Je passe au paiement</Button>
            </div>

            <Footer/>
        </div>
    )
}