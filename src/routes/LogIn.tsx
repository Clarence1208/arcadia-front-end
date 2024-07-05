import {Alert, Button, IconButton, InputAdornment, InputLabel, Link, OutlinedInput, TextField, useTheme} from "@mui/material";
import '../styles/LogIn.css';
import '../styles/App.css';
import {FormEvent, Fragment, useContext, useEffect, useState} from "react";
import {useNavigate, useParams, useSearchParams} from "react-router-dom";
import {UserSessionContext} from "../contexts/user-session";
import Collapse from "@mui/material/Collapse";
import Snackbar from '@mui/material/Snackbar';
import {ConfigContext} from "../index";
import { Visibility, VisibilityOff } from "@mui/icons-material";


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
    const [open, setOpen] = useState(false);
    const sessionContext = useContext(UserSessionContext)
    const config = useContext(ConfigContext);
    const [errorMessage, setErrorMessage] = useState("")
    const [data, setData] = useState(body)
    const [showPassword, setShowPassword] = useState(false);
    function updateFields(fields: Partial<LogInData>) {
        setData(prev => {
            return {...prev, ...fields}
        })
    }

    async function onSubmit(e: FormEvent) {
        e.preventDefault()
        try {
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
            const res = await response.json();
            if (sessionContext) {
                const roles: string[] = []
                for (const role of res.roles.split(",")) {
                    roles.push(role)
                }
                sessionContext.updateUserSession({
                    userId: res.id, loginToken: res.loginToken,
                    fullName: res.firstName + " " + res.surname, isLoggedIn: true,
                    roles: roles, email: res.email, customerId: res.customerId
                })
            } if (res.roles === "admin") {
            navigate('/adminDashboard')
        } else {
            navigate('/memberDashboard')

            }
        } catch (e) {
            setErrorMessage("Erreur : " + e);
            setOpen(true)
        }

    }

    function handlePasswordChange() {
        alert("flemme.")
    }

    const handleClickShowPassword = () => setShowPassword((show) => !show);

    const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
      };

    return (
        <form id="formLogin" onSubmit={onSubmit} style={{maxWidth: "40vw"}}>
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
            <h1>Portail d'accès à {config.associationName} </h1>

            <div>
                <InputLabel htmlFor="outlined-adornment-password">E-mail</InputLabel>
                <TextField id="loginEmailInput" type="email" variant="outlined" fullWidth
                        onChange={e => updateFields({email: e.target.value})}/>
            </div>
                        <div>
            <InputLabel htmlFor="outlined-adornment-password">Password</InputLabel>
                <OutlinedInput
                    id="outlined-adornment-password"
                    type={showPassword ? 'text' : 'password'}
                    onChange={e => updateFields({password: e.target.value})}
                    sx={{width: '100%'}} 
                    endAdornment={
                    <InputAdornment position="end">
                        <IconButton
                        aria-label="toggle password visibility"
                        onClick={handleClickShowPassword}
                        onMouseDown={handleMouseDownPassword}
                        edge="end"
                        >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                    </InputAdornment>
                    }
                    label="Password"
                />
            </div>

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
                    <div className="rotated-text" style={{color: theme.palette.primary.main}}>CONNEXION</div>
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