import {Alert, Button, ListItemText} from "@mui/material";
import '../../styles/Vote.css';
import {UserSessionContext} from "../../contexts/user-session";
import React, { FormEvent, useContext, useState } from "react";
import HowToVoteIcon from '@mui/icons-material/HowToVote';
import TaskIcon from '@mui/icons-material/Task';
import { useNavigate, useParams } from "react-router-dom";
import Snackbar from "@mui/material/Snackbar";
import CancelIcon from '@mui/icons-material/Cancel';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';

interface PollProps {
    poll: Poll;
}

interface User {
    id: number,
    firstName: string,
    lastName: string,
    email: string,
    roles: string[],
}

interface Poll {
    id: number,
    name: string,
    isClosed: boolean,
    users?: User[],
}

export function Poll({poll}: PollProps){
    const [ErrorMessage, setErrorMessage] = useState("")
    const [open, setOpen] = useState(false);
    const navigate = useNavigate();
    const userSession = useContext(UserSessionContext)?.userSession
    if(poll.users === undefined){
        poll.users = []
    }
    const userInPoll = poll.users.find(user => user.id === userSession?.userId)

    async function onSubmit(e: FormEvent, poll: Poll) {
        e.preventDefault()
        if (userSession?.loginToken) {
            const bearer = "Bearer " + userSession?.loginToken;
            const response: Response = await fetch( process.env.REACT_APP_API_URL+"/polls/" + poll.id + "/end", {method: "POST",
                headers: {
                    "Authorization": bearer,
                    "Content-Type": "application/json"
                }});
            if (!response.ok) {
                const error =  await response.json()
                setErrorMessage("Erreur : " + await error.message);
                return
            }
        }
        navigate("/adminDashboard");
    }

    function displayError(message: string) {
        setErrorMessage(message);
        setOpen(true);
    }
    const handleClose = () => {
        setOpen(false);
    };

    return (
        <div className="vote-div" >
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
            <h2>{poll.name}</h2>
                    {(userSession?.roles.includes("admin") || userSession?.roles.includes("superadmin")) ? (
                        <div>
                            <span className="vote-admin">Nombre de réponses : {poll.users?.length}</span>
                        </div>
                    ) : null}

                    {!poll.isClosed ? (
                        !userInPoll ? (
                            <Button
                                variant="contained"
                                color="primary"
                                href={`/polls/${poll.id}/vote`}
                                endIcon={<HowToVoteIcon></HowToVoteIcon>}
                            >
                                Repondre
                            </Button>
                        ) : (
                            <Button
                                variant="contained"
                                color="primary"
                                endIcon={<TaskIcon></TaskIcon>}
                                disabled
                            >
                                Déjà répondu
                            </Button>
                        )
                    ) : (
                        null
                    )}
                    <Button
                        variant="contained"
                        color="primary"
                        href={`/poll/${poll.id}/results`}
                        endIcon={<RemoveRedEyeIcon></RemoveRedEyeIcon>}>
                        Voir les résultats du sondage
                    </Button>
                    {userSession && (userSession.roles.includes("admin") || userSession.roles.includes("superadmin")) ? (
                        <Button variant="contained" color="primary" endIcon={<CancelIcon></CancelIcon>} onClick={(e) => { onSubmit(e, poll) }}>
                            Mettre fin au sondage
                        </Button>
                    ) : null}
        </div>
    )
}