import { useParams} from 'react-router-dom';
import {useContext, useEffect, useState} from "react";
import {UserSessionContext} from "../../contexts/user-session";
import {ConfigContext} from "../../index";

export function RefreshStripe(){
    const config = useContext(ConfigContext);
        const userSession = useContext(UserSessionContext)?.userSession;
        const {connectedAccountId} = useParams();
        const [accountLinkCreatePending, setAccountLinkCreatePending] = useState(false);
        const [error, setError] = useState(false);

    async function handleStripeAccountLink() {
        const bearer = `Bearer ${userSession?.loginToken}`;
        await fetch(`${config.apiURL}/stripe/accountLinks`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": bearer,
            },
            body: JSON.stringify({
                accountId: connectedAccountId,
            }),
        })
            .then((response) => response.json())
            .then((json) => {
                const { url } = json;
                window.location.href = url;
            })
            .catch((error) => {
                setError(true);
            });
    }

        useEffect(() => {
            if (connectedAccountId) {
                handleStripeAccountLink();
            }
        }, [connectedAccountId])


    return (
        <div className="container">
            <div className="banner">
                <h2>Arcadia Solutions</h2>
            </div>
            <div className="content">
                <h2>Add information to start accepting money</h2>
                <p>Arcadia Solutions is the world's leading air travel platform: join our team of pilots to help people travel faster.</p>
                {error && <p className="error">Something went wrong!</p>}
            </div>
            <div className="dev-callout">
                {connectedAccountId && <p>Your connected account ID is: <code className="bold">{connectedAccountId}</code></p>}
                {accountLinkCreatePending && <p>Creating a new Account Link...</p>}
            </div>
        </div>
    );
}