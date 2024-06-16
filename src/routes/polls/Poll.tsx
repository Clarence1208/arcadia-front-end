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
import {ConfigContext} from "../../index";

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
    questions : PollQuestion[]
}


type PollQuestion = {
    id: number,
    name: string,
}

export function Poll({poll}: PollProps){
    const [ErrorMessage, setErrorMessage] = useState("")
    const [open, setOpen] = useState(false);
    const navigate = useNavigate();
    const config = useContext(ConfigContext);
    const userSession = useContext(UserSessionContext)?.userSession
    if(poll.users === undefined){
        poll.users = []
    }
    const userInPoll = poll.users.find(user => user.id === userSession?.userId)

    async function onSubmit(e: FormEvent, poll: Poll) {
        e.preventDefault()
        if (userSession?.loginToken) {
            const bearer = "Bearer " + userSession?.loginToken;
            const response: Response = await fetch( config.apiURL + "/polls/" + poll.id + "/end", {method: "POST",
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
        (userSession?.roles.includes("admin") || userSession?.roles.includes("superadmin") || !poll.isClosed) ? (
            <div className="vote-div">
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
                    >
                        {ErrorMessage}
                    </Alert>
                </Snackbar>
                <h2>{poll.name}</h2>
                {(userSession?.roles.includes("admin") || userSession?.roles.includes("superadmin")) ? (
                <div>
                    <div style={{marginBottom: "1vh"}}>
                        <span className="vote-admin">Nombre de questions : {poll.questions.length}</span>
                    </div>
                    <div style={{marginBottom: "1vh"}}>
                        <span className="vote-admin">Nombre de personnes ayant répondu : {poll.users?.length}</span>
                    </div>
                </div>
                ) : null}
    
                {!poll.isClosed ? (
                    !userInPoll ? (
                        <Button
                            variant="contained"
                            color="primary"
                            href={`/polls/${poll.id}/vote`}
                            endIcon={<HowToVoteIcon />}
                            sx={{marginBottom: "1vh"}}
                        >
                            Repondre
                        </Button>
                    ) : (
                        <Button
                            variant="contained"
                            color="primary"
                            endIcon={<TaskIcon />}
                            sx={{marginBottom: "1vh"}}
                            disabled
                        >
                            Déjà répondu
                        </Button>
                    )
                ) : null}
    
                {(userSession?.roles.includes("admin") || userSession?.roles.includes("superadmin")) ? (
                    <Button
                        variant="contained"
                        color="primary"
                        href={`/poll/${poll.id}/results`}
                        sx={{marginBottom: "1vh"}}
                        endIcon={<RemoveRedEyeIcon />}
                    >
                        Voir les résultats du sondage
                    </Button>
                ) : null}
    
                {(userSession && (userSession.roles.includes("admin") || userSession.roles.includes("superadmin"))) && !poll.isClosed ? (
                    <Button
                        variant="contained"
                        color="primary"
                        endIcon={<CancelIcon />}
                        sx={{marginBottom: "1vh"}}
                        onClick={(e) => { onSubmit(e, poll) }}
                    >
                        Mettre fin au sondage
                    </Button>
                ) : null}
            </div>
        ) : null
    )
    
}