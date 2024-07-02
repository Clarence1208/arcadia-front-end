import { Button, ListItemButton, ListItemText } from "@mui/material";
import '../../styles/Meeting.css';
import {UserSessionContext} from "../../contexts/user-session";
import { useContext } from "react";
import AddBoxIcon from '@mui/icons-material/AddBox';
import HowToVoteIcon from '@mui/icons-material/HowToVote';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';

interface Premise {
    name: string,
    description: string,
    adress: string,
    type: string,
    capacity: number,
}

export function Premise({premise}: {premise: Premise}){
    const userSession = useContext(UserSessionContext)?.userSession
    return (
        <div className="meeting-div-user" >

            <div className="meeting-content">

                <h4>{premise.name}</h4>
                <p>Type : {premise.type}</p>
                <p>Adresse : {premise.adress}</p>
                <p>{premise.description}</p>
                { userSession?.roles.includes("admin") || userSession?.roles.includes("superadmin") ?
                    <p>Capacité : {premise.capacity} places</p> :
                    null
                }
            </div>
        </div>
    )
}