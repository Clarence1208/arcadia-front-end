import {UserRegisterForm} from "./components/UserRegisterForm"
import React, {useContext, useEffect, useState} from "react";
import Header from "./components/Header";
import {Footer} from "./components/Footer";
import {Button} from "@mui/material";
import {Dayjs} from "dayjs";
import {useNavigate} from "react-router-dom";
import Paper from "@mui/material/Paper";
import "../styles/Memberships.css";
import {ConfigContext} from "../index";

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
        navigate("/login?successMessage=true")
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
            <div className="main">
                {isPageLoaded ?
                <Paper elevation={1} className="paper" style={{width: "40vw"}}>
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