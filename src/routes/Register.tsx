import {UserRegisterForm} from "./components/UserRegisterForm"
import React, {useContext, useEffect, useState} from "react";
import Header from "./components/Header";
import {Footer} from "./components/Footer";
import {Alert, Button} from "@mui/material";
import {Dayjs} from "dayjs";
import {useNavigate, useSearchParams} from "react-router-dom";
import Paper from "@mui/material/Paper";
import "../styles/Memberships.css";
import {ConfigContext} from "../index";
import emailjs from "@emailjs/browser";
import {UserSessionContext} from "../contexts/user-session";
import Snackbar from "@mui/material/Snackbar";

type FormData = {
    firstName: string
    surname: string
    email: string
    password: string,
    confirmPassword?: string,
    birthDate: Dayjs | null,
    roles?: string
}

const body: FormData = {
    firstName: "",
    surname: "",
    email: "",
    password: "",
    birthDate: null,
    roles : "user"
}

type WebSetting = {
    name: string,
    value: string,
    description: string,
    type: string
}
type StripePriceDto = {
    currency: string;
    unit_amount: number;
    recurring: {
        interval: string;
        interval_count: number;
    };
}

export function Register(){
    const navigate = useNavigate();


    const userSession = useContext(UserSessionContext)?.userSession;
    const config = useContext(ConfigContext);
    const [data, setData] = useState(body)
    const [errorMessage, setErrorMessage] = useState("")
    const [open, setOpen] = useState(false);
    const [isPageLoaded, setIsPageLoaded] = useState(false);


    function updateFields(fields: Partial<FormData>) {
        setData(prev => {
            return { ...prev, ...fields }
        })
    }

    function sendEmail(userData: FormData) {
        emailjs.send(import.meta.env.VITE_MAIL_SERVICE_ID, "template_xukeys6", {
            associationName: config.associationName,
            emailFrom: config.associationName + "@gmail.com",
            emailTo: userData.email,
            message: "Merci d'avoir créé un compte sur notre site, vous pouvez dès à présent vous connecter et payer votre cotisation pour accéder à votre espace adhérent."
        }, import.meta.env.VITE_MAIL_PUBLIC_KEY)
    }

    async function createUser(userData: FormData): Promise<any> {

        if (userData.password !== userData.confirmPassword) {
            setErrorMessage("Les mots de passe ne correspondent pas");
            setOpen(true);
            return;
        }

        delete userData.confirmPassword;
        const response: Response = await fetch(`${config.apiURL}/users/register`, {method: "POST", body: JSON.stringify(userData), headers: {"Content-Type": "application/json"}});
        if (!response.ok) {
            const error =  await response.json()
            setErrorMessage("Erreur lors de la création du compte: " + await error.message);
            setOpen(true);
            return;
        }
        sendEmail(userData)
        if (userSession?.roles.includes("admin") || userSession?.roles.includes("superadmin")) {
            navigate('/adminDashboard?successMessage=true')
        }else{
            navigate("/login?successMessage=true")
        }
    }
    async function handleSubmit(){
        await createUser(data);
    }
    useEffect(() => {
        setTimeout(() => {
            setIsPageLoaded(true);
        }, 100);
    }, []);


    return (
        <div>
            <Header />
            <div className="main" style={{marginBottom: "15vw"}}>
                {isPageLoaded ?
                <Paper elevation={1} className="paper" style={{width: "40vw", marginTop: "5vw"}}>
                    <div className="form-and-button">
                    <UserRegisterForm {...data} formTitle={"Créer un compte"} formDescription={"Accéder aux actualités, vos historiques de paiements et participer aux assemblées générales"} formError={errorMessage} updateFields={updateFields}  />
                    <Button variant="contained" type={"submit"} onClick={handleSubmit} style={{width: "20vw", marginTop: "3vh"}}>Créer mon compte</Button>
                    </div>
                </Paper> :
                    <div className="loading">
                        <h1>Chargement...</h1>
                    </div>
                }
            </div>
            <Footer />
        </div>
    )
}