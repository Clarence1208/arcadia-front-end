import { Button, ListItemButton, ListItemText } from "@mui/material";
import '../../styles/Meeting.css';
import {UserSessionContext} from "../../contexts/user-session";
import { useContext } from "react";
import AddBoxIcon from '@mui/icons-material/AddBox';
import HowToVoteIcon from '@mui/icons-material/HowToVote';

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
    meeting.endDate = new Date(meeting.endDate)
    meeting.startDate = new Date(meeting.startDate)
    console.log(userSession)
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
                <span>Début : {meeting.startDate.toLocaleDateString()}</span>
                <span>Fin : {meeting.endDate.toLocaleDateString()}</span>
            </div>
            { userSession?.roles.includes("admin") || userSession?.roles.includes("superadmin") ?
                <div>
                    { meeting.endDate > now ?
                    <Button 
                    variant="contained" 
                    color="primary" 
                    href={`/meeting/${meeting.id}/votes`}
                    endIcon={ <AddBoxIcon></AddBoxIcon>}
                    >Ajouter un vote</Button>
                :<Button 
                variant="contained" 
                color="primary" 
                href={`/meeting/${meeting.id}/votes/results`}
                endIcon={ <HowToVoteIcon></HowToVoteIcon>}
                >Voir les résultats des votes</Button>
                }
                </div>
                : null}
            { userSession?.roles.includes("adherent") && (meeting.startDate < now && meeting.endDate > now) ?
            <Button 
            variant="contained" 
            color="primary" 
            href={`/meeting/${meeting.id}/votes`}
            endIcon={ <HowToVoteIcon></HowToVoteIcon>}
            >Voir les votes</Button>
            : null }
        </div>
    )
}