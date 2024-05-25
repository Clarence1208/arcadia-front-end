import { ListItemButton, ListItemText } from "@mui/material";
import '../../styles/Article.css';
import {UserSessionContext} from "../../contexts/user-session";
import { useContext } from "react";

interface Meeting {
    id: number,
    name: string,
    description: string,
    startDate: Date,
    endDate: Date,
    capacity: number,
}

export function Meeting({meeting}: {meeting: Meeting}){
    const userSession = useContext(UserSessionContext)?.userSession
    return (
        <div className="meeting-div" >
            <div className="meeting-date">
                <span className="meeting-date">{new Date(meeting.startDate).toLocaleDateString()}</span>
                <span className="meeting-date">{new Date(meeting.endDate).toLocaleDateString()}</span>
            </div>
            {meeting.description.length < 50 ? <ListItemText primary={meeting.name} secondary={meeting.description} />:
                    <ListItemText 
                    primary={meeting.name} 
                    secondary={meeting.description.substring(0, 50) + '...'}
                    sx={{ display: 'row', alignItems: 'center', justifyContent: 'center' }}
                />
            }
            <span className="meeting-capacity">{meeting.capacity}</span>
            { userSession?.roles.includes("admin") || userSession?.roles.includes("superadmin") ? <span>Ajouter un Vote</span> : null }
        </div>
    )
}