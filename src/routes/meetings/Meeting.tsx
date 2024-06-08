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
    const startTime = meeting.startDate.toLocaleTimeString()
    const endTime = meeting.endDate.toLocaleTimeString()
    console.log(meeting)
    return (
        <div className="meeting-div-user" >

            <div className="meeting-content">
                <div className="meeting-date">
                    <p>Du : {meeting.startDate.toLocaleDateString() + " à "}<b>{startTime}</b> au : {meeting.endDate.toLocaleDateString() +" à "}<b>{endTime}</b></p>
                    <p></p>
                </div>

                <h4>{meeting.name}</h4>
                <p>{meeting.description}</p>
                { userSession?.roles.includes("admin") || userSession?.roles.includes("superadmin") ?
                    <p>Capacité : {meeting.capacity} places</p> :
                    null
                }
            </div>
            <div className="meeting-actions">
                { userSession?.roles.includes("admin") || userSession?.roles.includes("superadmin") ?
                    <div>
                        { meeting.endDate > now ?
                            <Button
                                variant="contained"
                                color="primary"
                                href={`/meeting/${meeting.id}/votes`}
                                endIcon={ <AddBoxIcon></AddBoxIcon>}
                                disableElevation={true}

                            >Voir les votes</Button>
                            :<Button
                                variant="contained"
                                color="primary"
                                href={`/meeting/${meeting.id}/votes`}
                                disableElevation={true}
                                endIcon={ <HowToVoteIcon></HowToVoteIcon>}
                            >Résultats des votes</Button>
                        }
                    </div>
                    : null}
                { userSession?.roles.includes("adherent") && (meeting.startDate < now && meeting.endDate > now) ?
                    <Button
                        variant="contained"
                        color="primary"
                        href={`/meeting/${meeting.id}/votes`}
                        endIcon={ <HowToVoteIcon></HowToVoteIcon>}
                        disableElevation={true}
                    >Voir les votes</Button>
                    : null }
            </div>
        </div>
    )
}