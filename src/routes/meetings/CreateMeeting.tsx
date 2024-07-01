import {Alert, Button, Input, InputLabel, Link, MenuItem, Select, TextField} from "@mui/material";
import '../../styles/CreateMeeting.css';
import '../../styles/App.css';
import React, {FormEvent, useContext, useEffect, useState} from "react";
import { useNavigate } from "react-router-dom";
import {UserSessionContext} from "../../contexts/user-session";
import Header from "./../components/Header";
import { Footer } from "./../components/Footer";
import { DatePicker } from "@mui/x-date-pickers";
import { Dayjs, isDayjs } from "dayjs";
import Paper from "@mui/material/Paper";
import {Groups3} from "@mui/icons-material";
import Snackbar from "@mui/material/Snackbar";
import {ConfigContext} from "../../index";


type CreateMeetingData = {
    name: string,
    description: string,
    startDate: Date,
    endDate: Date,
    capacity: number,
    premisesId?: number | null,
}

type TempMeetingData = {
    tempDate: Dayjs | null,
    startHour: number,
    endHour: number,

}

type Premise = {
    id: number,
    name: string,
}

const body : CreateMeetingData = {
    name: "",
    description: "",
    startDate: new Date(),
    endDate: new Date(),
    capacity: 0,
    premisesId: null,
}

const tempBody : TempMeetingData = {
    tempDate: null,
    startHour: 0,
    endHour: 0,
}

function CreateMeetingForm() {
    const userSession = useContext(UserSessionContext)?.userSession
    const navigate = useNavigate();
    const config = useContext(ConfigContext);

    const [ErrorMessage, setErrorMessage] = useState("")
    const [open, setOpen] = useState(false);
    const [data, setData] = useState(body)
    const [tempData, setTempData] = useState(tempBody)
    const [premises, setPremises] = useState<Premise[]>([])

    useEffect(() => {
        if (!userSession?.loginToken) {
            return;
        }
        const getPremises = async (): Promise<Premise[]> => {
            const bearer = "Bearer " + userSession?.loginToken;
            const response: Response = await fetch(`${config.apiURL}/premises`, {
            headers: {
                "Authorization": bearer,
                "Content-Type": "application/json"
            }
        });
        if (!response.ok) {
            const error = await response.json()
            setErrorMessage("Erreur : " + await error.message);
            return []
        }
        const res = await response.json();
        if (res.length === 0) {
            setErrorMessage("Aucune salle trouvée")
        }
        return res;
        }
        getPremises().then(setPremises)
    }, [userSession?.loginToken]);

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

    function updateTempFields(fields: Partial<TempMeetingData>) {
        setTempData(prev => {
            return { ...prev, ...fields }
        })
    }

    function transformToCreateData(temp: TempMeetingData, data: CreateMeetingData): CreateMeetingData {
        const { tempDate, startHour, endHour } = temp;
        data.startDate = tempDate ? tempDate.hour(startHour).toDate() : new Date();
        data.endDate = tempDate ? tempDate.hour(endHour).toDate() : new Date();
        
        return data;
    }

    async function onSubmit(e: FormEvent) {
        e.preventDefault()
        const bearer = "Bearer " + userSession?.loginToken;
        const req = transformToCreateData(tempData, data);
        const response: Response = await fetch( config.apiURL + "/meetings", {method: "POST", body: JSON.stringify(req), headers: {"Content-Type": "application/json"}});
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
            <h1><Groups3 fontSize={"large"}/> Créer une Assemblée Générale</h1>
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

                <div className="select-hours-div">
                    <DatePicker
                        label="Date de l'assemblée générale"
                        onChange={(newValue) => {
                            if (isDayjs(newValue) || newValue === null) {
                                updateTempFields({ tempDate: newValue });
                            }
                        }}
                    />
                    <div>
                        <InputLabel id="select-label">Heure de début</InputLabel>
                            <Select
                                labelId="select-label"
                                id="select-début"
                                value={tempData.startHour}
                                label="Heure de début"
                                onChange={(e) => updateTempFields({ startHour: e.target.value as number })}
                            >
                                {Array.from({length: 24}, (_, i) => i).map((hour) => (
                                    <MenuItem key={hour} value={hour}>{hour}:00</MenuItem>
                                ))}
                            </Select>
                        </div>
                        <div>
                            <InputLabel id="select-label">Heure de fin</InputLabel>
                            <Select
                                labelId="select-label"
                                id="select-fin"
                                value={tempData.endHour}
                                label="Heure de début"
                                onChange={(e) => updateTempFields({ endHour: e.target.value as number })}
                            >
                                {Array.from({length: 24}, (_, i) => i).map((hour) => (
                                    <MenuItem key={hour} value={hour}>{hour}:00</MenuItem>
                                ))}
                            </Select>
                        </div>
                </div>
                {premises.length > 0 && (
                            <div>
                                <InputLabel id="select-label">Salle</InputLabel>
                                <Select
                                    labelId="select-label"
                                    id="select-premises"
                                    value={data.premisesId}
                                    label="Salle"
                                    onChange={(e) => updateFields({ premisesId: e.target.value as number })}
                                >
                                    {premises.map((premise) => (
                                        <MenuItem key={premise.id} value={premise.id}>{premise.name}</MenuItem>
                                    ))}
                                </Select>
                            </div>
                            )}
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
export function CreateMeeting() {
    const [isPageLoaded, setIsPageLoaded] = useState(false);

    useEffect(() => {
        setTimeout(() => {
            setIsPageLoaded(true);
        }, 100);
    }, []);

    return (
        <div>
            { isPageLoaded && 
            <div>
                <Header />
                    <CreateMeetingForm />
                <Footer />
            </div>
            }
        </div>
    );
}