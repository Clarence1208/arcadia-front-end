import { Button, ListItemButton, ListItemText } from "@mui/material";
import '../../styles/Meeting.css';
import {UserSessionContext} from "../../contexts/user-session";
import { useContext } from "react";
import AddBoxIcon from '@mui/icons-material/AddBox';

interface Meeting {
    id: number,
    name: string,
    description: string,
    startDate: Date,
    endDate: Date,
    capacity: number,
}

export function Meeting({meeting}: {meeting: Meeting}){
    const now = new Date()
    const userSession = useContext(UserSessionContext)?.userSession
    return (
        <div className="meeting-div" >
            {meeting.description.length < 50 ? <ListItemText primary={meeting.name} secondary={meeting.description} />:
                    <ListItemText 
                    primary={meeting.name} 
                    secondary={meeting.description.substring(0, 50) + '...'}
                />
            }
            <span className="meeting-capacity">Capacité : {meeting.capacity}</span>
            <div className="meeting-date">
                <span>Début : {new Date(meeting.startDate).toLocaleDateString()}</span>
                <span>Fin : {new Date(meeting.endDate).toLocaleDateString()}</span>
            </div>
            { userSession?.roles.includes("admin") || userSession?.roles.includes("superadmin") ? 
            <Button 
            variant="contained" 
            color="primary" 
            href={`/meeting/${meeting.id}/votes`}
            endIcon={ <AddBoxIcon></AddBoxIcon>}
            >Ajouter un vote</Button>
            : null }
            { userSession?.roles.includes("adherent") && (meeting.startDate < now && meeting.endDate > now) ?
            <Button 
            variant="contained" 
            color="primary" 
            href={`/meeting/${meeting.id}/votes`}
            endIcon={ <AddBoxIcon></AddBoxIcon>}
            >Voir les votes</Button>
            : null }
        </div>
    )
}