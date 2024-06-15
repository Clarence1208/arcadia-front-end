import {Alert, Button, Link, TextField, useTheme} from "@mui/material";
import '../styles/LogIn.css';
import '../styles/App.css';
import {FormEvent, Fragment, useContext, useEffect, useState} from "react";
import {useNavigate, useParams, useSearchParams} from "react-router-dom";
import {UserSessionContext} from "../contexts/user-session";
import Collapse from "@mui/material/Collapse";
import Snackbar from '@mui/material/Snackbar';
import {ConfigContext} from "../index";


type LogInData = {
    email: string,
    password: string
}
const body: LogInData = {
    email: "",
    password: ""
}

function LogInForm() {
    let navigate = useNavigate();
    const [open, setOpen] = useState(true);
    const sessionContext = useContext(UserSessionContext)
    const config = useContext(ConfigContext);
    const [errorMessage, setErrorMessage] = useState("")
    const [data, setData] = useState(body)
    function updateFields(fields: Partial<LogInData>) {
        setData(prev => {
            return {...prev, ...fields}
        })
    }

    async function onSubmit(e: FormEvent) {
        e.preventDefault()
        const response: Response = await fetch(`${config.apiURL}/users/login`, {
            method: "POST",
            body: JSON.stringify(data),
            headers: {"Content-Type": "application/json"}
        });
        if (!response.ok) {
            const error = await response.json()
            setErrorMessage("Erreur : " + await error.message);
            setOpen(true)
            return
        }
        setErrorMessage("");
        const res = await response.json();
        if (sessionContext) {
            const roles: string[] = []
            for (const role of res.roles.split(",")) {
                roles.push(role)
            }
            sessionContext.updateUserSession({
                userId: res.id, loginToken: res.loginToken,
                fullName: res.firstName + " " + res.surname, isLoggedIn: true,
                roles: roles, email: res.email
            })
        }
        if (res.roles === "admin") {
            navigate('/adminDashboard')
        } else {
            navigate('/memberDashboard')

        }

    }

    function handlePasswordChange() {
        alert("flemme.")
    }

    const handleClose = () => {
        setOpen(false);
        setErrorMessage("");
    };

    return (
        <form id="formLogin" onSubmit={onSubmit} style={{maxWidth: "40vw"}}>
            <Snackbar
                open={open}
                autoHideDuration={3000}
                onClose={handleClose}
                anchorOrigin={{vertical: 'top', horizontal: 'right'}}
            >
                <Alert
                    onClose={handleClose}
                    severity={errorMessage.includes("Erreur") ? "error" : "success"}
                    variant="filled"
                    sx={{width: '100%'}}
                >{errorMessage}</Alert>
            </Snackbar>
            <h1>Portail d'accès à l'administration de {config.associationName} </h1>

            <TextField id="loginEmailInput" label="E-mail" type="email" variant="outlined"
                       onChange={e => updateFields({email: e.target.value})}/>
            <TextField id="loginPasswordInput" label="Mot de passe" type="password" variant="outlined"
                       onChange={event => updateFields({password: event.target.value})}/>

            <div id="form-footer">
                <Button id="login-button" color="primary" variant="contained" type="submit" disableElevation>Se
                    connecter</Button>
                <Link href="/" onClick={handlePasswordChange}>Mot de passe oublié ?</Link>
                <Link href={"/register"}>Créer un compte ?</Link>
            </div>


        </form>
    );
}

export function LogIn() {

    const [queryParameters] = useSearchParams();
    const [open, setOpen] = useState(queryParameters.get('successMessage') === "true");
    const theme = useTheme();
    const [isPageLoaded, setIsPageLoaded] = useState(false);

    useEffect(() => {
        setTimeout(() => {
            setIsPageLoaded(true);
        }, 100);
    }, []);

    const handleClose = (event: React.SyntheticEvent | Event, reason?: string) => {
        if (reason === 'clickaway') {
            return;
        }
        setOpen(false);
    };

    return (
        <div>
            {isPageLoaded && 
            <div className="containerRow">
                    <div className="rotated-text" style={{color: theme.palette.primary.main}}>ADMIN</div>
                    <div className="green-separator" style={{backgroundColor: theme.palette.primary.main}} />
                    <div className="containerCol">
                        <Snackbar
                            open={open}
                            autoHideDuration={3000}
                            onClose={handleClose}
                            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                        >
                        <Alert
                            onClose={handleClose}
                            severity="success"
                            variant="filled"
                            sx={{ width: '100%' }}
                        >Le compte a été créé avec succès</Alert>
                        </Snackbar>
                        <LogInForm />
                    </div>
            </div>
            }
        </div>
    );
}