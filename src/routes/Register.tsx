import {UserRegisterForm} from "./components/UserRegisterForm"
import {useState} from "react";
import Header from "./components/Header";
import {Footer} from "./components/Footer";
import {Button} from "@mui/material";
import {Dayjs} from "dayjs";
import { useNavigate } from "react-router-dom";

type FormData = {
    firstName: string
    surname: string
    email: string
    password: string,
    birthDate: Dayjs | null,
}

const body: FormData = {
    firstName: "",
    surname: "",
    email: "",
    password: "",
    birthDate: null,
}

export function Register(){
    const navigate = useNavigate();

    const [data, setData] = useState(body)
    const [errorMessage, setErrorMessage] = useState("")

    function updateFields(fields: Partial<FormData>) {
        setData(prev => {
            return { ...prev, ...fields }
        })
    }

    async function createUser(userData: FormData) {

        const response: Response = await fetch(process.env.REACT_APP_API_URL+"/users/register", {method: "POST", body: JSON.stringify(userData), headers: {"Content-Type": "application/json"}});
        if (!response.ok) {
            const error =  await response.json()
            setErrorMessage("Erreur lors de la création du compte: " + await error.message);
            return
        }
        navigate("/login")
    }
    async function handleSubmit(){
        await createUser(data);
    }

    return (
        <div>
            <Header />
            <div className="main">
                <UserRegisterForm {...data} formTitle={"Créer un compte"} formDescription={"Création de compte adhérent"} formError={errorMessage} updateFields={updateFields} />
                <Button variant="contained" type={"submit"} onClick={handleSubmit} >Valider</Button>
            </div>
            <Footer />
        </div>
    )
}