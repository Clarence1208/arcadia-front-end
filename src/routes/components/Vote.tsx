import { ListItemText } from "@mui/material";
import '../../styles/Vote.css';
import {UserSessionContext} from "../../contexts/user-session";
import { useContext } from "react";

interface Vote {
    name: string,
}

export function Vote({vote}: {vote: Vote}){
    const userSession = useContext(UserSessionContext)?.userSession
    return (
        <div className="vote-div" >
            <ListItemText 
                primary={vote.name} 
            />
        </div>
    )
}