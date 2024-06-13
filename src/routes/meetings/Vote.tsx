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

interface VoteProps {
    vote: Vote;
    meetingId?: number;
}

interface User {
    id: number,
    firstName: string,
    lastName: string,
    email: string,
    roles: string[],
}

interface Vote {
    id: number,
    name: string,
    isAbsoluteMajority: boolean,
    isAnonymous: boolean,
    isClosed: boolean,
    eliminationPerRound?: number,
    nbWinners: number,
    nbPossibleVotes: number,
    quorum?: number,
    currentRound?: number,
    users?: User[],
}

export function Vote({vote, meetingId}: VoteProps){
    const [ErrorMessage, setErrorMessage] = useState("")
    const [open, setOpen] = useState(false);
    const navigate = useNavigate();
    const userSession = useContext(UserSessionContext)?.userSession
    if(vote.users === undefined){
        vote.users = []
    }
    const userInVote = vote.users.find(user => user.id === userSession?.userId)
    const voteCanEnd = vote.quorum ? vote.users.length >= vote.quorum : true
    const { id } = useParams();

    async function onSubmit(e: FormEvent, vote: Vote) {
        e.preventDefault()
        if (userSession?.loginToken) {
            const bearer = "Bearer " + userSession?.loginToken;
            const response: Response = await fetch( import.meta.env.VITE_API_URL+"/votes/" + vote.id + "/end", {method: "POST",
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
        navigate("/meeting/" + id + "/vote/" + vote.id + "/results");
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
            { vote.currentRound === 1 ? <h3>{vote.name}</h3> : <h3>{vote.name} - Tour {vote.currentRound}</h3>
            }
            {vote.isClosed ? (
                <Button
                    variant="contained"
                    color="primary"
                    href={`/meeting/${meetingId}/vote/${vote.id}/results`}
                    endIcon={<RemoveRedEyeIcon></RemoveRedEyeIcon>}
                >
                    Voir les résultats du vote
                </Button>
            ) : (
                <>
                    {(userSession?.roles.includes("admin") || userSession?.roles.includes("superadmin")) && vote.quorum ? (
                        <div>
                            <span className="vote-admin">Quorum : {vote.users?.length}/{vote.quorum}</span>
                        </div>
                    ) : null}

                    {!userInVote ? (
                        <Button
                            variant="contained"
                            color="primary"
                            href={`/meeting/${meetingId}/vote/${vote.id}`}
                            endIcon={<HowToVoteIcon></HowToVoteIcon>}
                        >
                            Voter
                        </Button>
                    ) : (
                        <Button
                            variant="contained"
                            color="primary"
                            endIcon={<TaskIcon></TaskIcon>}
                            disabled
                        >
                            A voté
                        </Button>
                    )}
                    <br />
                    {userSession && (userSession.roles.includes("admin") || userSession.roles.includes("superadmin")) ? (
                        voteCanEnd ? (
                            <Button variant="contained" color="primary" onClick={(e) => { onSubmit(e, vote) }}>
                                Mettre fin au Vote
                            </Button>
                        ) : (
                            <Button variant="contained" color="primary" endIcon={<CancelIcon></CancelIcon>} onClick={(e) => { displayError("Le quorum n\'a pas été atteint")}}>
                                Mettre fin au Vote
                            </Button>
                        )
                    ) : null}
                </>
            )}
        </div>
    )
}