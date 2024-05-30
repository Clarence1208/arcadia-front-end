import { Button, InputLabel, MenuItem, Pagination, Select, Switch } from "@mui/material";
import { FormEvent, useContext, useEffect, useState } from "react";
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

interface VoteParams {
    isWhiteVote: boolean,
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
    const [ErrorMessage, setErrorMessage] = useState("")
    const [vote, setVote] = useState<Vote>();
    const [data, setData] = useState<VoteParams>({ isWhiteVote: false });
    const [voteChoices, setVoteChoices] = useState<VoteChoice[]>([]);
    const [results, setResults] = useState<VoteChoice[]>(Array.from({ length: vote?.nbPossibleVotes || 0 }, () => ({ id: 0, name: '' })));

    const navigate = useNavigate();
    const { voteId } = useParams();

    function changeWhiteVote() {
        setData(prev => {
            return { ...prev, isWhiteVote: !prev.isWhiteVote }
        })
    }

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


    async function onSubmit(e: FormEvent) {
        e.preventDefault()
        if (userSession?.loginToken) {
            // TO DO : Ajouter user au vote et si pas voteBlanc alors ajouter les choix
            // const bearer = "Bearer " + userSession?.loginToken;
            // const response: Response = await fetch( process.env.REACT_APP_API_URL+"/meetings/" + id + "/votes", {method: "POST", body: JSON.stringify(data),                     headers: {
            //         "Authorization": bearer,
            //         "Content-Type": "application/json"
            //     }});
            // if (!response.ok) {
            //     const error =  await response.json()
            //     setErrorMessage("Erreur : " + await error.message);
            //     return
            // }
        }
    }
    

    return (
        <div>
            <Header />
                <div className={"main"}>
                    <div>
                        <h1>{vote?.name}</h1><br />
                        <h2>Choix :</h2><h3>(Nombre de choix possible max : {vote?.nbPossibleVotes})    </h3>
                    </div>
                    <div className={"vote-choice-list"}>
                        <div>
                        {Array.from({ length: vote?.nbPossibleVotes || 0 }).map((_, i) => {
                            return <div><InputLabel id="select-label">Choix n°{i+1}</InputLabel>
                            <Select
                                labelId="select-label"
                                id="select-vote-choice"
                                value={results[i]?.name}
                                onChange={(e) => {
                                    const newResults = [...results];
                                    if (newResults[i]) {
                                        newResults[i].name = e.target.value;
                                    }
                                    setResults(newResults);
                                }}
                            >
                                {voteChoices.map((voteChoice) => {
                                    return <MenuItem value={voteChoice.name}>{voteChoice.name}</MenuItem>
                                })}
                            </Select>
                        </div>
                        })}
                        </div>
                        <div>
                            <InputLabel>Vote Blanc</InputLabel>
                            <Switch checked={data.isWhiteVote} onChange={e => changeWhiteVote()} color="primary" />
                        </div>
                        <Button 
                        type="submit" 
                        variant="contained" 
                        color="primary"
                        onClick={onSubmit}
                        >Soumettre</Button>
                    </div>
                </div>
            <Footer />
        </div>
    )
}
