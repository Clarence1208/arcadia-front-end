import {Alert, Button, Snackbar} from "@mui/material";
import React, {useContext, useEffect, useState} from "react";
import {UserSessionContext} from "../../contexts/user-session";
import LoadingSpinner from "../components/LoadingSpinner";

export default function StripeSettings() {
    const userSession = useContext(UserSessionContext)?.userSession;
    const [accountCreatePending, setAccountCreatePending] = useState(false);
    const [connectedAccountId, setConnectedAccountId] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [openError, setOpenError] = useState(false);
    const [createStripeAccountData, setcreateStripeAccountData] = useState({
        country: "FR",
        email: "loriane.hilderal@gmail.com",
    });

    async function getStripeAccount() {
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/websiteSettings`);
            const data = await response.json();
            return data
        } catch (e) {
            console.warn(e)
        }
    }

    async function createStripeAccount() {
        const bearer = `Bearer ${userSession?.loginToken}`;
        setAccountCreatePending(true);
        await fetch(`${process.env.REACT_APP_API_URL}/stripe/connectedAccounts`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: bearer,
            },
            body: JSON.stringify({
                createStripeAccountData
            }),
        }).then((response) => response.json())
            .then((json) => {
                setAccountCreatePending(false);

                const {account, message} = json;

                if (account) {
                    setConnectedAccountId(account);
                } else {
                    setErrorMessage(message);
                    setOpenError(true)
                }
            });
    }

    async function handleStripeAccountLink() {
        const bearer = `Bearer ${userSession?.loginToken}`;
        await fetch(`${process.env.REACT_APP_API_URL}/stripe/accountLinks`, {
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
                const {url} = json;
                window.location.href = url;
            })
            .catch((error) => {
                console.error("Error:", error);
                setErrorMessage(error);
                setOpenError(true);
            });
    }

    useEffect(
        () => {
            getStripeAccount().then(data => {
                setConnectedAccountId(data[4].value)
            })
        }, []
    )
    return (
        <div>
            <Snackbar
                open={openError}
                autoHideDuration={3000}
                onClose={() => setOpenError(false)}
                anchorOrigin={{vertical: 'top', horizontal: 'right'}}
            >
                <Alert
                    onClose={() => setOpenError(false)}
                    severity="warning"
                    variant="filled"
                    sx={{width: '100%'}}
                >{errorMessage}</Alert>
            </Snackbar>

            <h2>Lien à Stripe: </h2>
            <p>Vous pouvez gérer le lien de paiement Stripe d'ici</p>


            {!connectedAccountId &&
                <div>
                    <p>Lors de votre 1ère visite sur cette page, veuillez créer un compte Stripe (Bouton "Créer un
                        compte Stripe") pour utiliser la fonctionalité "Dons" du site.</p>
                    <p>Vous pouvez ensuite personaliser le compte avec vos informations depuis le bouton "Modifier les
                        informations du compte Stripe"</p>
                    {accountCreatePending && <LoadingSpinner message={"Création du compte en cours..."}/>}

                    <Button
                        variant="contained"
                        onClick={createStripeAccount}
                    >Créer un compte Stripe
                    </Button>

                    <Button
                        variant="contained"
                        onClick={handleStripeAccountLink}
                    >Modifier les informations du compte Stripe (ouvre un nouvel onglet)
                    </Button>
                </div>
            }

            {connectedAccountId &&
                <Button
                    variant="contained"
                    onClick={() => window.location.href = `https://dashboard.stripe.com/login`}
                >Accès au dashboard Stripe (ouvre un nouvel onglet)
                </Button>
            }

            <h2>Dons & adhésions</h2>
            <p>Todo: afficher les paiements (les dons donc)</p>
            <a href={"https://docs.stripe.com/connect/supported-embedded-components/payments"}>docs de l'api stripe </a>
        </div>
    )
}