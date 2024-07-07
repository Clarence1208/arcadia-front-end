import {Link} from "@mui/material";

export function MySubscription(){
    return (
        <div>
            <h1>Ma cotisation mensuelle</h1>


            <p>Vous pouvez changer de type d'abonnement en cliquant sur le bouton ci-dessous</p>
            <Link href="/users/subscribe">Changer de type d'abonnement</Link>

        </div>
    )
}