import {Button, TextField, useTheme} from "@mui/material";
import '../styles/LogIn.css';
import '../styles/App.css';

function LogInForm() {
    return (
            <form id="formLogin">
                <h1>Portail d'accès au panneau de gestion</h1>

                <TextField id="loginEmailInput" label="E-mail" variant="outlined"/>
                <TextField id="loginPasswordInput" label="Mot de passe" variant="outlined"/>

                <div id="form-footer">
                    <Button id="login-button" color="primary" variant="contained" disableElevation >Se connecter</Button>
                    <a href="/">Mot de passe oublié ?</a>
                </div>


            </form>
    );
}
export function LogIn() {
    return (
        <div className="containerRow">
            <div className="rotated-text">ADMIN</div>
            <div className="green-separator" />
            <div className="containerCol">
                <LogInForm />
            </div>
        </div>
    );
}