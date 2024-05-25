import {Alert, Button, Input, Link, TextField} from "@mui/material";
import '../styles/CreateMeeting.css';
import '../styles/App.css';
import {FormEvent, useContext, useEffect, useState} from "react";
import { useNavigate } from "react-router-dom";
import {UserSessionContext} from "../contexts/user-session";
import Header from "./components/Header";
import { Footer } from "./components/Footer";
import { Unstable_NumberInput as NumberInput } from '@mui/base/Unstable_NumberInput';

type CreateMeetingData = {
    name: string,
    description: string,
    startDate: Date,
    endDate: Date,
    capacity: number,
}

const body : CreateMeetingData = {
    name: "",
    description: "",
    startDate: new Date(),
    endDate: new Date(),
    capacity: 0,
}

function CreateMeetingForm() {
    const userSession = useContext(UserSessionContext)?.userSession
    const navigate = useNavigate();

    const [ErrorMessage, setErrorMessage] = useState("")
    const [data, setData] = useState(body)

    if (!userSession?.isLoggedIn) {
        navigate('/login')
    }

    if(!(userSession?.roles.includes("admin") || !userSession?.roles.includes("superadmin"))){
        navigate('/')
    }

    function updateFields(fields: Partial<CreateMeetingData>) {
        setData(prev => {
            return { ...prev, ...fields }
        })
    }

    async function onSubmit(e: FormEvent) {
        e.preventDefault()
        const response: Response = await fetch( process.env.REACT_APP_API_URL+"/meetings", {method: "POST", body: JSON.stringify(data), headers: {"Content-Type": "application/json"}});
        if (!response.ok) {
            const error =  await response.json()
            setErrorMessage("Erreur : " + await error.message);
            return
        }
        setErrorMessage("");
        navigate('/blog')
    }

    return (
        <div id="create-meeting" className="main">
            <h1>Créer une Assemblée Générale</h1>
            <form id="create-meeting-form" onSubmit={onSubmit}>
                <TextField 
                    id="create-meeting-title" 
                    label="Nom" 
                    variant="outlined"
                    size="small"
                    onChange={e => updateFields({ name: e.target.value })} 
                />
                <Input
                    id="create-meeting-start-date"
                    type="number"
                    onChange={e => updateFields({ capacity: parseInt(e.target.value) })}
                />
                <TextField 
                    label="Description" 
                    variant="outlined"
                    multiline
                    rows={10}
                    style={{ width: "50vh", margin: "8px 0", padding: "8px", height: "25vh" }}
                    InputProps={{ style: { height: "25vh" } }}  // Ensures height takes priority
                    onChange={e => updateFields({ description: e.target.value })} 
                />
                <Button 
                type="submit" 
                variant="contained" 
                color="primary"
                onClick={onSubmit}
                >
                    Soumettre
                </Button>
            </form>
        </div>
    );
}
export function CreateMeeting() {
    return (
        <div>
            <Header />
                <CreateMeetingForm />
            <Footer />
        </div>
    );
}