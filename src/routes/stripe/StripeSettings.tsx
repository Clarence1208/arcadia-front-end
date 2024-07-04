import {
    Alert,
    Button,
    Paper,
    Snackbar,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow
} from "@mui/material";
import React, {useContext, useEffect, useState} from "react";
import {UserSessionContext} from "../../contexts/user-session";
import LoadingSpinner from "../components/LoadingSpinner";
import {AddCircleOutline, Delete, Edit} from "@mui/icons-material";
import {EditMembershipModal} from "./memberships/EditMembershipModal";
import {CreateMembershipModal} from "./memberships/CreateMembershipModal";
import {ConfigContext} from "../../index";

type WebSetting = {
    name: string,
    value: string,
    description: string,
    type: string
}
export default function StripeSettings() {
    const config = useContext(ConfigContext);
    const userSession = useContext(UserSessionContext)?.userSession;
    const [accountCreatePending, setAccountCreatePending] = useState(false);
    const [connectedAccountId, setConnectedAccountId] = useState(null);
    const [errorMessage, setErrorMessage] = useState("");
    const [openError, setOpenError] = useState(false);
    const [createStripeAccountData, setcreateStripeAccountData] = useState({
        country: "FR",
        email: userSession?.email,
    });

    async function getStripeAccount() {
        try {
            const response = await fetch(`${config.apiURL}/websiteSettings`);
            const data: WebSetting[] = await response.json();
            return data.find(item => item.name === 'stripe_account_id')?.value || null;
        } catch (e) {
            console.warn(e)
        }
    }

    async function createStripeAccount() {
        const bearer = `Bearer ${userSession?.loginToken}`;
        setAccountCreatePending(true);
        await fetch(`${config.apiURL}/stripe/connectedAccounts`, {
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
                //@ts-ignore
                setConnectedAccountId(data)
            }).catch((e) => {
                console.warn(e)
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

            { (!connectedAccountId || connectedAccountId === "") ?
                <div>
                    <p>Lors de votre 1ère visite sur cette page, veuillez créer un compte Stripe (Bouton "Créer un
                        compte Stripe") pour utiliser la fonctionalité "Dons" du site.</p><br/>
                    <p>Vous pouvez personaliser le compte avec vos informations depuis le bouton "Modifier les
                        informations du compte Stripe"</p>
                    {accountCreatePending && <LoadingSpinner message={"Création du compte en cours..."}/>}

                    {!accountCreatePending &&
                        <Button
                            variant="contained"
                            onClick={createStripeAccount}
                        >Créer un compte Stripe
                        </Button>
                    }

                    <Button
                        variant="contained"
                        onClick={handleStripeAccountLink}
                    >Modifier les informations du compte Stripe (ouvre un nouvel onglet)
                    </Button>

                </div>

                :
                <div>
                    <Button
                        variant="contained"
                        onClick={() => window.location.href = `https://dashboard.stripe.com/login`}
                    >
                        Accès au dashboard Stripe (ouvre un nouvel onglet)
                    </Button>


                    <h2>Configuration des adhésions</h2>
                    {/*   /*<p>Todo: afficher les paiements (les dons donc)</p>*/
                        /*<a href={"https://docs.stripe.com/connect/supported-embedded-components/payments"}>Docs de l'api stripe </a>*/}
                    <Button variant={"contained"}>Créer un type d'adhésion</Button>
                    <ListMemberships accountID={connectedAccountId}/>
                </div>

            }
        </div>
    )
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

export function ListMemberships({
                                    accountID
                                }: {
    accountID: string
}) {

    const config = useContext(ConfigContext);
    const [openModal, setOpenModal] = useState(false)
    const [openEditModal, setOpenEditModal] = useState(false)
    const handleOpenModal = () => setOpenModal(true)
    const handleCloseModal = () => setOpenModal(false)
    const handleCloseEditModal = () => setOpenEditModal(false)
    const [errorMessage, setErrorMessage] = useState<string>("")
    const [openError, setOpenError] = useState(false)
    const userSession = useContext(UserSessionContext)?.userSession
    const userToken = userSession?.loginToken
    const [selectedSetting, setSelectedSetting] = useState<MembershipDTO>()

    function handleEditClicked(setting: MembershipDTO) {
        setSelectedSetting(setting)
        setOpenEditModal(true)
    }

    const [memberships, setMemberships] = useState<MembershipDTO[]>([]);

    useEffect(() => {
        async function fetchMemberships() {
            const bearer = `Bearer ${userSession?.loginToken}`;

            const response = await fetch(`${config.apiURL}/stripe/memberships?accountId=${accountID}`,
                {
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": bearer,
                    }
                }
            );
            const data = await response.json();
            console.log(data)
            return data;
        }

        fetchMemberships().then((data) => setMemberships(data));
    }, [accountID]);

    return (
        <div>

            <EditMembershipModal open={openEditModal} handleClose={handleCloseEditModal}
                                 setErrorMessage={setErrorMessage}
                                 loginToken={userToken}
                                 setOpenError={setOpenError}
                                 setMemberships={setMemberships}
                                 settings={memberships}
                                 setting={selectedSetting}/>
            <CreateMembershipModal open={openModal} handleClose={handleCloseModal}
                                   setErrorMessage={setErrorMessage}
                                   loginToken={userToken}
                                   setOpenError={setOpenError}
                                   setMemberships={setMemberships}
                                   memberships={memberships}
                                   accountId={accountID}/>
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
            <div>
                <div style={{display: "flex", alignItems: "center"}}>
                    <p>Vous pouvez gérer les adhésions d'ici</p>
                    <Button onClick={handleOpenModal} title={"Ajouter un type d'adhésion"}><AddCircleOutline/></Button>
                </div>

                <TableContainer component={Paper}>
                    <Table aria-label="memberships settings table">
                        <TableHead>
                            <TableRow>
                                <TableCell align="left">Nom</TableCell>
                                <TableCell align="right">Description</TableCell>
                                <TableCell align="right">Coût par mois(€)</TableCell>
                                <TableCell align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {memberships.map((membership) => (
                                <TableRow
                                    key={membership.id}
                                    sx={{'&:last-child td, &:last-child th': {border: 0}}}
                                >
                                    <TableCell scope="row">
                                        {membership.name}
                                    </TableCell>
                                    <TableCell align="right">{membership.description}</TableCell>
                                    <TableCell align="right">{membership.default_price.unit_amount / 100} €</TableCell>
                                    <TableCell align="right">
                                        <Button title={"Modifier"} onClick={() => handleEditClicked(membership)}><Edit/></Button>
                                        <Button title={"Supprimer"}>{<Delete/>}</Button>
                                        <Button title={"Blocker"}>{<Delete/>}</Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </div>
        </div>
    )
}
