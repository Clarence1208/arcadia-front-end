import {Button, Link} from "@mui/material";

export function MySubscription(){

    const confirmCancel = () => {
        if (window.confirm("Voulez-vous vraiment vous désabonner ?")) {
            // Call the API to cancel the subscription



        }
    }

    return (
        <div>
            <h1>Ma cotisation mensuelle</h1>


            <p>Vous pouvez changer de type d'abonnement en cliquant sur le bouton ci-dessous</p>
            <Link href="/users/subscribe">Changer de type d'abonnement</Link>
            <Button variant="contained" color="primary" href="/users/unsubscribe" onClick={confirmCancel}>Se désabonner</Button>

        </div>
    )
}