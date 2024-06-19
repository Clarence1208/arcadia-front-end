import { Button, ListItemButton, ListItemText, Modal, Paper } from "@mui/material";
import '../../styles/Meeting.css';
import {UserSessionContext} from "../../contexts/user-session";
import { useContext, useState } from "react";
import AddBoxIcon from '@mui/icons-material/AddBox';
import HowToVoteIcon from '@mui/icons-material/HowToVote';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import PlaceIcon from '@mui/icons-material/Place';
import { Premise } from "../premises/Premise";

interface Meeting {
    id: number,
    name: string,
    description: string,
    startDate: Date,
    endDate: Date,
    capacity: number,
    premise : Premise,
}

interface Premise {
    name: string,
    description: string,
    adress: string,
    type: string,
    capacity: number,
}

export function Meeting({meeting}: {meeting: Meeting}){
    const now = new Date()
    const userSession = useContext(UserSessionContext)?.userSession
    meeting.endDate = new Date(meeting.endDate)
    meeting.startDate = new Date(meeting.startDate)
    const startTime = meeting.startDate.toLocaleTimeString()
    const endTime = meeting.endDate.toLocaleTimeString()
    const [openModal, setOpenModal] = useState(false);

    const handleCloseModal = () => {
        setOpenModal(false);
    }

    const showPremise = () => {
        setOpenModal(true);
    }

    return (
        <div className="meeting-div-user" >
            <Modal
                open={openModal}
                onClose={handleCloseModal}
                aria-labelledby="modal-create-setting"
                aria-describedby="modale to create a setting"
                id="modal-create-setting"
            >
                <Paper elevation={1} className={"paper"}>
                    <Premise premise={meeting.premise}></Premise>
                </Paper>
            </Modal>

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
                { meeting.premise ?
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={showPremise}
                        endIcon={ <PlaceIcon></PlaceIcon>}
                        disableElevation={true}
                        >Voir le lieu</Button>:
                    null
                }
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
                                endIcon={ <RemoveRedEyeIcon></RemoveRedEyeIcon>}
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