import {
    Alert,
    Button,
    Link,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow
} from "@mui/material";
import {useContext, useEffect, useState} from "react";
import {ConfigContext} from "../../index";
import {UserSessionContext} from "../../contexts/user-session";
import Snackbar from "@mui/material/Snackbar";
import {Download} from "@mui/icons-material";
import LoadingSpinner from "../components/LoadingSpinner";
import "../../styles/Stripe.css";

type WebSetting = {
    name: string,
    value: string,
    description: string,
    type: string
}

type Subscription = {
    id?: string,
    product?: any,
    status?: string,
    created_at?: number,
    cancel_at?: number,
    current_period_end?: number,
    current_period_start?: number,
    price?: any,
}
export function MySubscription(){

    const [connectedAccountId, setConnectedAccountId] = useState("");
    const [subscription, setSubscription] = useState<Subscription>({});
    const [invoices, setInvoices] = useState([]);
    const [payments, setPayments] = useState([]);
    const [isDataFetched, setIsDataFetched] = useState(false);
    const userSession = useContext(UserSessionContext)?.userSession;
    const [open, setOpen] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const config = useContext(ConfigContext);
    const [pageLoaded, setPageLoaded] = useState(false);

    async function getSettings() {
        const response = await fetch(`${config.apiURL}/websiteSettings`);
        const data: WebSetting[] = await response.json();
        return data.find(item => item.name === 'stripe_account_id')?.value || "";
    }


    const confirmCancel = async (subscriptionID: string | undefined) => {
        if (window.confirm("Voulez-vous vraiment vous désabonner ? Vous n'aurez plus accès aux services de l'association.")){
            // Call the API to cancel the subscription
            const bearer = "Bearer " + userSession?.loginToken;
            const userId = userSession?.userId;
            if (!subscriptionID || !connectedAccountId){
                return;
            }
            try {
                const response = await fetch(`${config.apiURL}/stripe/subscriptions/${userId}?subscriptionId=${subscriptionID}&accountId=${connectedAccountId}`, {
                    method: "DELETE",
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': bearer
                    },
                });
                if (!response.ok) {
                    setErrorMessage("Erreur lors de la suppression de l'abonnement. Veuillez réessayer.");
                    return;
                }
                setErrorMessage("Abonnement annulé avec succès.");
            }catch (e){
                setErrorMessage("Erreur" + e)
            }finally {
                setOpen(true);
            }
        }else{

            return;
        }
    }

    useEffect(()=> {
        getSettings().then((data) => {
            setConnectedAccountId(data);
            setIsDataFetched(true);
        });

    }, []);

    useEffect(() => {
        const getSubscription = async () => {
            // Call the API to get the subscription
            const bearer = "Bearer " + userSession?.loginToken;
            const customerId = userSession?.customerId;
            const userId = userSession?.userId;
            if (!customerId || !connectedAccountId){
                return {};
            }
            try {
                const response = await fetch(`${config.apiURL}/stripe/subscriptions/${userId}?customerId=${customerId}&accountId=${connectedAccountId}`, {
                    method: "GET",
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': bearer
                    },
                });
                if (!response.ok) {
                    return {};
                }
                const data: Subscription = await response.json();
                return data;

            } catch (e) {
                setErrorMessage("Erreur de récupération des données.");
                setOpen(true);
                return {};
            }
        }

        const getInvoices = async () => {
            // Call the API to get the invoices
            const bearer = "Bearer " + userSession?.loginToken;
            const customerId = userSession?.customerId;
            const userId = userSession?.userId;
            if (!customerId || !connectedAccountId){
                return;
            }
            try {
                const response = await fetch(`${config.apiURL}/stripe/invoices/${userId}?customerId=${customerId}&accountId=${connectedAccountId}`, {
                    method: "GET",
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': bearer
                    },
                });
                if (!response.ok) {
                    return;
                }
                const data = await response.json();
                return data;

            } catch (e) {
                setErrorMessage("Erreur de récupération des données.");
                setOpen(true);
            }
        }

        getSubscription().then((data) => {
            setSubscription(data);
        })
        getInvoices().then((data) => {
            setInvoices(data.invoices);
            setPayments(data.payments);
            setPageLoaded(true);
        });


    }, [isDataFetched]);

    return (
        <div>
            <Snackbar
                open={open}
                autoHideDuration={3000}
                onClose={() => setOpen(false)}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                <Alert
                    onClose={() => setOpen(false)}
                    severity={errorMessage.includes("Erreur") ? "error" : "success"}
                    variant="filled"
                    sx={{ width: '100%' }}
                >{errorMessage}</Alert>
            </Snackbar>
            <h2>Ma cotisation mensuelle</h2>
            {

                !pageLoaded ?
                    (
                        <div><LoadingSpinner message="Chargement.."/></div>
                    )
                    :
                    (
                        <div>
                            {(subscription && subscription.price && subscription.id) ?
                                <div>
                                    <div className="cotisation-div">

                                        <h2>{subscription.product.name}</h2>
                                        <div>
                                            <p>Description: {subscription.product.description}</p>
                                            <p>Coût: {subscription.price.unit_amount /100} €</p>
                                            <p>Depuis le {new Date((subscription.created_at || 0) * 1000 ).toLocaleDateString()}</p>
                                            <p>Prochaine facturation le {new Date((subscription.current_period_end || 0 )* 1000).toLocaleDateString()}</p>
                                        </div>
                                    </div>

                                    <p>Rappel: Chaque cotisation octroie les mêmes droits pour les adhérents.</p>
                                    <Link href="/users/subscribe" style={{marginRight: "3em"}}>Changer de type d'abonnement</Link>
                                    <Button variant="contained" color="primary" onClick={() => confirmCancel(subscription.id)}>Se désabonner</Button>

                                </div>
                                :
                                <p>Cet utilisateur ne paie pas de cotisation.</p>
                            }
                            <h2>Historique des paiements</h2>
                            <TableContainer component={Paper} style={{maxHeight: "70vh", overflowY:"scroll"}}>
                                <Table sx={{minWidth: 650}} aria-label="simple table">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Date du paiement</TableCell>
                                            <TableCell>Type</TableCell>
                                            <TableCell>Montant</TableCell>
                                            <TableCell>Status</TableCell>
                                            <TableCell>Facture</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {
                                            invoices && invoices.map((invoice: any) => {
                                                return (
                                                    <TableRow key={invoice.id}>
                                                        <TableCell>{new Date(invoice.created * 1000).toLocaleDateString()}</TableCell>
                                                        <TableCell>Cotisation</TableCell>
                                                        <TableCell>{invoice.amount_paid/100} {invoice.currency}</TableCell>
                                                        <TableCell>{invoice.status === "paid" ? "Finalisé": "Non-finalisé"}</TableCell>
                                                        <TableCell><a href={invoice.invoice_pdf} target="_blank" rel="noreferrer"><Download color="primary"/></a></TableCell>
                                                    </TableRow>
                                                )
                                            })
                                        }
                                        {
                                            payments && payments.map((payment: any) => {
                                                return (
                                                    <TableRow key={payment.id}>
                                                        <TableCell>{new Date(payment.created * 1000).toLocaleDateString()}</TableCell>
                                                        <TableCell>Don</TableCell>
                                                        <TableCell>{payment.amount/100} {payment.currency}</TableCell>
                                                        <TableCell>{payment.status === "paid" ? "Finalisé": "Non-finalisé"}</TableCell>
                                                        <TableCell>Envoyé par email</TableCell>
                                                    </TableRow>
                                                )
                                            })
                                        }
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </div>
                    )
            }
        </div>
    )
}