import { Button, Pagination } from "@mui/material";
import { useContext, useEffect, useState } from "react";
import '../styles/VoteChoiceList.css';
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

interface VoteChoice {
    id: number,
    name: string,
}

type Filters = {
    page?: number,
    limit?: number,
}

export function MeetingVoteApply() {

    const userSession = useContext(UserSessionContext)?.userSession
    const [vote, setVote] = useState<Vote>();
    const [voteChoices, setVoteChoices] = useState<VoteChoice[]>([]);
    const navigate = useNavigate();
    const { voteId } = useParams();

    useEffect(() => {
        if(!userSession?.roles) {
            return;
        }
        if(userSession?.roles.includes("admin") || userSession?.roles.includes("superadmin") || userSession?.roles.includes("adherent")) {
            const getVote = async (filters?: Filters): Promise<Vote> => {
                const bearer = "Bearer " + userSession?.loginToken;
                const response: Response = await fetch(`${process.env.REACT_APP_API_URL}/votes/${voteId}`, {method: "GET",
                    headers: {
                        "Authorization": bearer,
                        "Content-Type": "application/json"
                    }
                });
                if (!response.ok) {
                    const error = await response.json()
                    // setErrorMessage("Erreur : " + await error.message);
                    return {} as Vote;
                }
                const res = await response.json();
                if (res.length === 0) {
                    console.log("Aucun site web trouvé")
                    //setErrorMessage("Aucun site web trouvé")
                }
                return res;
            }
            getVote().then(setVote)
            const getVoteChoices = async (filters?: Filters): Promise<VoteChoice[]> => {
                const bearer = "Bearer " + userSession?.loginToken;
                const response: Response = await fetch(`${process.env.REACT_APP_API_URL}/votes/${voteId}/voteChoices?type=Vote`, {method: "GET",
                    headers: {
                        "Authorization": bearer,
                        "Content-Type": "application/json"
                    }
                });
                if (!response.ok) {
                    const error = await response.json()
                    // setErrorMessage("Erreur : " + await error.message);
                    return [];
                }
                const res = await response.json();
                if (res.length === 0) {
                    console.log("Aucun site web trouvé")
                    //setErrorMessage("Aucun site web trouvé")
                }
                return res;
            }
            getVoteChoices().then(setVoteChoices)
            if (voteChoices.length === 0) {
                console.log("Aucun choix trouvé")
                //navigate("/meeting/" + vote?.meetingId + "/votes");
            }
            return;
        } else {
           return;
        }
    }, [userSession, voteId]);
    

    return (
        <div>
            <Header />
                <div className={"main"}>
                    <div>
                        <h1>{vote?.name}</h1><br />
                        <h2>Choix :</h2><h3>(nombre de choix possible : {vote?.nbPossibleVotes})    </h3>
                    </div>
                    <div className={"vote-choice-list"}>
                        <div>
                            {voteChoices.map((choice) => (
                                <div>
                                    <input type="checkbox" id={choice.id.toString()} name={choice.name} value={choice.name} />
                                    <label htmlFor={choice.id.toString()}>{choice.name}</label><br />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            <Footer />
        </div>
    )
}
