import {Alert, Button, Link, TextField} from "@mui/material";
import '../styles/LogIn.css';
import '../styles/App.css';
import {FormEvent, useContext, useState} from "react";
import { useNavigate } from "react-router-dom";
import {UserSessionContext} from "../contexts/user-session";

type LogInData = {
    email: string,
    password: string
}
const body : LogInData = {
    email: "",
    password: ""
}

function LogInForm() {
    let navigate = useNavigate();
    const sessionContext = useContext(UserSessionContext)

    const [ErrorMessage, setErrorMessage] = useState("")
    const [data, setData] = useState(body)

    function updateFields(fields: Partial<LogInData>) {
        setData(prev => {
            return { ...prev, ...fields }
        })
    }
    async function onSubmit(e: FormEvent) {
        e.preventDefault()
        const response: Response = await fetch( process.env.REACT_APP_API_URL+"/users/login", {method: "POST", body: JSON.stringify(data), headers: {"Content-Type": "application/json"}});
        if (!response.ok) {
            const error =  await response.json()
            setErrorMessage("Erreur : " + await error.message);
            return
        }
        setErrorMessage("");
        const res = await response.json();
        if (sessionContext){
            const roles : string[] = []
            for(const role of res.roles.split(",")){
                roles.push(role)
            }
            sessionContext.updateUserSession({ userId: res.id, loginToken: res.loginToken,
                fullName: res.firstName + " " + res.surname, isLoggedIn: true, roles: roles})
        }
        console.log(res)
        if (res.roles === "admin") {
            navigate('/adminDashboard')
        }else {
            navigate('/')

        }

    }

    function handlePasswordChange(){
        alert("flemme.")
    }

    return (
        <form id="formLogin" onSubmit={onSubmit}>
            <h1>Portail d'accès à l'administration de {process.env.REACT_APP_ASSOCIATION_NAME} </h1>
            {ErrorMessage ?? <Alert className={"alert"} severity="error" onClose={() => {}}>{ErrorMessage}</Alert>}

            <TextField id="loginEmailInput" label="E-mail" type="email" variant="outlined" onChange={e => updateFields({ email: e.target.value })} />
            <TextField id="loginPasswordInput" label="Mot de passe" type="password" variant="outlined" onChange={event => updateFields({password: event.target.value})}/>

            <div id="form-footer">
                <Button id="login-button" color="primary" variant="contained" type="submit" disableElevation >Se connecter</Button>
                <Link href="/" onClick={handlePasswordChange}>Mot de passe oublié ?</Link>
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