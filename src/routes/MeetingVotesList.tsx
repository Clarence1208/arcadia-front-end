import { Button, Pagination } from "@mui/material";
import { useContext, useEffect, useState } from "react";
import '../styles/VotesList.css';
import { useNavigate, useParams } from "react-router-dom";
import { Footer } from "./components/Footer";
import Header from "./components/Header";
import {UserSessionContext} from "../contexts/user-session";
import AddBoxIcon from '@mui/icons-material/AddBox';
import { Vote } from "./components/Vote";

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
    meetingId: number,  
}

type Filters = {
    page?: number,
    limit?: number,
}

export function MeetingVotesList() {

    const userSession = useContext(UserSessionContext)?.userSession
    const [votes, setVotes] = useState<Vote[]>([])
    const navigate = useNavigate();
    const { id } = useParams();

    useEffect(() => {
        if (userSession?.loginToken) {
            const getVotes = async (filters?: Filters): Promise<Vote[]> => {
                const bearer = "Bearer " + userSession?.loginToken;
                const response: Response = await fetch(`${process.env.REACT_APP_API_URL}/meetings/${id}/votes`, {method: "GET",
                    headers: {
                        "Authorization": bearer,
                        "Content-Type": "application/json"
                    }
                });
                if (!response.ok) {
                    const error = await response.json()
                    // setErrorMessage("Erreur : " + await error.message);
                    return []
                }
                const res = await response.json();
                if (res.length === 0) {
                    console.log("Aucun site web trouvé")
                    //setErrorMessage("Aucun site web trouvé")
                }
                return res;
            }
            getVotes().then(setVotes)
            if(id !== undefined) {
                votes.forEach(vote => {
                    vote.meetingId = parseInt(id);
                });
            }
        }
    }, [userSession?.loginToken, id]);
    

    return (
        <div>
            <Header />
                <div className={"main"}>
                    <h1>Votes :</h1>
                        {userSession?.roles.includes("admin") || userSession?.roles.includes("superadmin") ?
                            <div>
                                <Button 
                                href={"/meeting/"+id+"/createVote"}
                                variant="contained"
                                color="primary"
                                endIcon={<AddBoxIcon />}>
                                    Créez un vote
                                </Button>
                            </div> : null
                        }
                        <div className={"votes-list"}>
                            {votes.length === 0 ? <div>Chargement ou pas de votes...</div> :
                                <div>
                                    {votes.map((vote) => (
                                        <Vote vote={vote} meetingId={id !== undefined ? parseInt(id) : undefined} />
                                    ))}
                                </div>
                            }
                        </div>
                </div>
            <Footer />
        </div>
    )
}
