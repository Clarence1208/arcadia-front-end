import { Button, ListItemText } from "@mui/material";
import '../../styles/Vote.css';
import {UserSessionContext} from "../../contexts/user-session";
import { useContext } from "react";
import HowToVoteIcon from '@mui/icons-material/HowToVote';
import TaskIcon from '@mui/icons-material/Task';

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
    eliminationPerRound?: number,
    nbWinners: number,
    nbPossibleVotes: number,
    quorum?: number,
    currentRound?: number,
    users?: User[],
}

export function Vote({vote, meetingId}: VoteProps){
    const userSession = useContext(UserSessionContext)?.userSession
    if(vote.users === undefined){
        vote.users = []
    }
    const userInVote = vote.users.find(user => user.id === userSession?.userId)
    const voteCanEnd = vote.quorum ? vote.users.length >= vote.quorum : true

    return (
        <div className="vote-div" >
            <ListItemText 
                primary={vote.name} 
            />
            {(userSession?.roles.includes("admin") || userSession?.roles.includes("superadmin")) && vote.quorum ? 
            <div>
                <span className="vote-admin">Quorum : {vote.users?.length}/{vote.quorum}</span>
            </div> : <></>
                }
            {!userInVote ?
                <Button 
                variant="contained" 
                color="primary" 
                href={`/meeting/${meetingId}/vote/${vote.id}`}
                endIcon={ <HowToVoteIcon></HowToVoteIcon>}
                >Voter</Button>
            : <Button
                variant="contained"
                color="primary"
                endIcon={<TaskIcon></TaskIcon>}
                disabled
            >Vote Fait</Button>
            }
            <br/>
            {userSession && (userSession.roles.includes("admin") || userSession.roles.includes("superadmin")) ? (
                voteCanEnd ? (
                    <Button variant="contained" color="primary" onClick={() => {}}>
                        Mettre fin au Vote
                    </Button>
                ) : (
                    <Button variant="contained" color="primary" onClick={() => {}} disabled>
                        Mettre fin au Vote
                    </Button>
                )
            ) : null}
        </div>
    )
}