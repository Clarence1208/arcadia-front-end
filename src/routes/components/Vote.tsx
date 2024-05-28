import { Button, ListItemText } from "@mui/material";
import '../../styles/Vote.css';
import {UserSessionContext} from "../../contexts/user-session";
import { useContext } from "react";
import HowToVoteIcon from '@mui/icons-material/HowToVote';

interface VoteProps {
    vote: Vote;
    meetingId?: number;
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
}

export function Vote({vote, meetingId}: VoteProps){
    const userSession = useContext(UserSessionContext)?.userSession
    return (
        <div className="vote-div" >
            <ListItemText 
                primary={vote.name} 
            />
            <Button 
            variant="contained" 
            color="primary" 
            href={`/meeting/${meetingId}/vote/${vote.id}`}
            endIcon={ <HowToVoteIcon></HowToVoteIcon>}
            >Voter</Button>
        </div>
    )
}