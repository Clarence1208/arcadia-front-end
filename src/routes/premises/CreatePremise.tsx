import {Alert, Button, Input, InputLabel, Link, MenuItem, Select, TextField} from "@mui/material";
import '../../styles/CreateMeeting.css';
import '../../styles/App.css';
import React, {FormEvent, useContext, useEffect, useState} from "react";
import { useNavigate } from "react-router-dom";
import {UserSessionContext} from "../../contexts/user-session";
import Header from "../components/Header";
import { Footer } from "../components/Footer";
import { DatePicker } from "@mui/x-date-pickers";
import { Dayjs, isDayjs } from "dayjs";
import Paper from "@mui/material/Paper";
import {Groups3} from "@mui/icons-material";
import Snackbar from "@mui/material/Snackbar";
import {ConfigContext} from "../../index";


type CreatePremiseData = {
    name: string,
    description: string,
    address: string,
    type: string,
    capacity: number,
}

const body : CreatePremiseData = {
    name: "",
    description: "",
    address: "",
    type: "",
    capacity: 0,
}

function CreatePremiseForm() {
    const userSession = useContext(UserSessionContext)?.userSession
    const navigate = useNavigate();

    const [ErrorMessage, setErrorMessage] = useState("")
    const [open, setOpen] = useState(false);
    const [data, setData] = useState(body)
    const config = useContext(ConfigContext);

    if (!userSession?.isLoggedIn) {
        navigate('/login')
    }

    if((!userSession?.roles.includes("admin") && !userSession?.roles.includes("superadmin"))){
        navigate('/')
    }

    function updateFields(fields: Partial<CreatePremiseData>) {
        setData(prev => {
            return { ...prev, ...fields }
        })
    }

    async function onSubmit(e: FormEvent) {
        e.preventDefault()
        const bearer = "Bearer " + userSession?.loginToken;
        const response: Response = await fetch( config.apiURL+"/premises", {method: "POST", body: JSON.stringify(data),
            headers: {
                "Authorization": bearer,
                "Content-Type": "application/json"
            }
        });
        if (!response.ok) {
            const error =  await response.json()
            setErrorMessage("Erreur : " + await error.message);
            setOpen(true)
            return
        }
        setErrorMessage("");
        navigate('/adminDashboard')
    }

    const handleClose = () => {
        setOpen(false)
    }

    return (
        <div id="create-meeting" className="main">
            <Snackbar
                open={open}
                autoHideDuration={3000}
                onClose={handleClose}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                <Alert
                    onClose={handleClose}
                    severity="error"
                    variant="filled"
                    sx={{ width: '100%' }}
                >{ErrorMessage}</Alert>
            </Snackbar>

            <Paper elevation={1} className={"paper"} >
            <h1><Groups3 fontSize={"large"}/> Créer une Salle</h1>
            <form id="create-meeting-form" onSubmit={onSubmit}>

            <div style={{width:"50vw",display:"flex", justifyContent:"space-between", alignItems:"center"}}>
                <TextField
                        id="create-meeting-title"
                        label="Nom"
                        variant="outlined"
                        size="small"
                        style={{width: "30vw", marginBottom: "1em"}}
                        onChange={e => updateFields({ name: e.target.value })}
                    />
               </div>
               <div style={{width:"50vw",display:"flex", justifyContent:"space-between", alignItems:"center"}}>
                <TextField
                        id="create-meeting-address"
                        label="Addresse"
                        variant="outlined"
                        size="small"
                        style={{width: "30vw", marginBottom: "1em"}}
                        onChange={e => updateFields({ address: e.target.value })}
                    />
               </div>
               <div style={{width:"50vw",display:"flex", justifyContent:"space-between", alignItems:"center"}}>
                <TextField
                        id="create-meeting-type"
                        label="Type de salle (ex : Salle de réunion, Salle de conférence, Distanciel...)"
                        variant="outlined"
                        size="small"
                        style={{width: "30vw", marginBottom: "1em"}}
                        onChange={e => updateFields({ type: e.target.value })}
                    />
               </div>
               <div style={{width:"50vw",display:"flex", justifyContent:"space-between", alignItems:"center"}}>
               <Input
                    type="number"
                    placeholder="Capacité maximale"
                    onChange={e => updateFields({ capacity: parseInt(e.target.value) })}
                    />
               </div>
               <TextField 
                    label="Description" 
                    variant="outlined"
                    multiline
                    rows={5}
                    style={{width: "30vw", marginBottom: "1em"}}
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
            </Paper>
        </div>
    );
}
export function CreatePremise() {
    const [isPageLoaded, setIsPageLoaded] = useState(false);

    useEffect(() => {
        setTimeout(() => {
            setIsPageLoaded(true);
        }, 100);
    }, []);

    return (
        <div>
            <Header />
            { isPageLoaded && 
            <div>
                    <CreatePremiseForm />
            </div>
            }
            <Footer />
        </div>
    );
}