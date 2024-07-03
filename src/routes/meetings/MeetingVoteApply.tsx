import {Alert, Button, InputLabel, MenuItem, Pagination, Select, Snackbar, Switch} from "@mui/material";
import {FormEvent, useContext, useEffect, useState} from "react";
import '../../styles/VoteChoiceList.css';
import {useNavigate, useParams} from "react-router-dom";
import {Footer} from "./../components/Footer";
import Header from "./../components/Header";
import {UserSessionContext} from "../../contexts/user-session";
import {Vote} from "./Vote";
import Paper from "@mui/material/Paper";
import {ConfigContext} from "../../index";

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
    name?: string,
}

type Filters = {
    page?: number,
    limit?: number,
}

export function MeetingVoteApply() {

    const userSession = useContext(UserSessionContext)?.userSession
    const [ErrorMessage, setErrorMessage] = useState("")
    const [vote, setVote] = useState<Vote>();
    const [data, setData] = useState<VoteParams>({isWhiteVote: false});
    const [voteChoices, setVoteChoices] = useState<VoteChoice[]>([]);
    const [results, setResults] = useState<VoteChoice[]>([]);
    const [open, setOpen] = useState(false);
    const config = useContext(ConfigContext);
    const [isPageLoaded, setIsPageLoaded] = useState(false);

    useEffect(() => {
        setTimeout(() => {
            setIsPageLoaded(true);
        }, 100);
    }, []);

    const navigate = useNavigate();
    const {voteId, id} = useParams();

    function changeWhiteVote() {
        setData(prev => {
            return {...prev, isWhiteVote: !prev.isWhiteVote}
        })
    }

    useEffect(() => {
        if (!userSession?.roles) {
            return;
        }
        if (userSession?.roles.includes("admin") || userSession?.roles.includes("superadmin") || userSession?.roles.includes("adherent")) {
            const getVote = async (filters?: Filters): Promise<Vote> => {
                const bearer = "Bearer " + userSession?.loginToken;
                const response: Response = await fetch(`${config.apiURL}/votes/${voteId}`, {
                    method: "GET",
                    headers: {
                        "Authorization": bearer,
                        "Content-Type": "application/json"
                    }
                });
                if (!response.ok) {
                    const error = await response.json()
                    setErrorMessage("Erreur : " + await error.message);
                    return {} as Vote;
                }
                const res = await response.json();
                if (res.length === 0) {
                    setErrorMessage("Aucun site web trouvé")
                }
                return res;
            }
            getVote().then(setVote)
            const getVoteChoices = async (filters?: Filters): Promise<VoteChoice[]> => {
                const bearer = "Bearer " + userSession?.loginToken;
                const response: Response = await fetch(`${config.apiURL}/votes/${voteId}/voteChoices?type=Vote`, {
                    method: "GET",
                    headers: {
                        "Authorization": bearer,
                        "Content-Type": "application/json"
                    }
                });
                if (!response.ok) {
                    const error = await response.json()
                    setErrorMessage("Erreur : " + await error.message);
                    return [];
                }
                const res = await response.json();
                if (res.length === 0) {
                    setErrorMessage("Aucun choix trouvé")
                }
                return res;
            }
            getVoteChoices().then(setVoteChoices)
            if (voteChoices.length === 0) {
                navigate("/meeting/" + vote?.meetingId + "/votes");
            }
            return;
        } else {
            return;
        }
    }, [userSession, voteId]);

    function checkFields() {
        const uniqueValues = new Set();
        return !results.some(result => {
            if (uniqueValues.has(result.id)) {
                setErrorMessage("Les choix doivent être uniques");
                return true;
            }
            uniqueValues.add(result.id);
            return false;
        });
    }


    async function onSubmit(e: FormEvent) {
        const isValid = checkFields()
        if (!isValid) {
            return
        }
        e.preventDefault()
        if (userSession?.loginToken) {
            const bearer = "Bearer " + userSession?.loginToken;
            const response: Response = await fetch(config.apiURL + "/votes/" + voteId + "/join", {
                method: "POST",
                headers: {
                    "Authorization": bearer,
                    "Content-Type": "application/json"
                }
            });
            if (!response.ok) {
                const error = await response.json()
                setErrorMessage("Erreur : " + await error.message);
                return
            }

            if (!data.isWhiteVote) {
                let voteChoicesIds = results.map((result) => result.id);
                const response: Response = await fetch(config.apiURL + "/votes/" + voteId + "/voteChoices/apply", {
                    method: "POST", body: JSON.stringify(voteChoicesIds),
                    headers: {
                        "Authorization": bearer,
                        "Content-Type": "application/json"
                    }
                });
                if (!response.ok) {
                    const error = await response.json()
                    setErrorMessage("Erreur : " + await error.message);
                    return
                }
            }
        }
        navigate("/meeting/" + id + "/votes");
    }

    const handleClose = () => {
        setOpen(false)
    }

    return (
        <div>
            <Header />
            { isPageLoaded && 
            <div>
                <div className={"main"}>
                <Snackbar
                    open={open}
                    autoHideDuration={3000}
                    onClose={handleClose}
                    anchorOrigin={{vertical: 'top', horizontal: 'right'}}
                >
                    <Alert
                        onClose={handleClose}
                        severity="error"
                        variant="filled"
                        sx={{width: '100%'}}
                    >{ErrorMessage}</Alert>
                </Snackbar>
                <Paper elevation={1} className={"content"}>
                    <div>
                        <h1>{vote?.name}</h1><br/>
                        <h2>Veuillez faire votre choix :</h2>
                        <p>(Il est possible de choisir jusqu'à : {vote?.nbPossibleVotes} choix maximum)</p>
                    </div>
                    <div className={"vote-choice-list"}>
                        <div className={"custom-choice"}>
                            {Array.from({length: vote?.nbPossibleVotes || 0}).map((_, i) => {
                                return (<div><InputLabel id="select-label">Choix n°{i + 1}</InputLabel>
                                    <Select
                                        labelId="select-label"
                                        className="select-vote-choice"
                                        value={results[i]?.name}
                                        onChange={(e) => {
                                            const newResults = [...results];
                                            if (newResults[i]) {
                                                newResults[i].id = parseInt(e.target.value);
                                            } else {
                                                newResults[i] = {id: parseInt(e.target.value)}
                                            }
                                            setResults(newResults);
                                        }}
                                    >
                                        {voteChoices.map((voteChoice) => {
                                            return <MenuItem value={voteChoice.id}>{voteChoice.name}</MenuItem>
                                        })}
                                    </Select>
                                </div>)
                            })}
                        </div>
                        <p>OU</p>
                        <div>
                            <InputLabel>Vote Blanc</InputLabel>
                            <Switch checked={data.isWhiteVote} onChange={e => changeWhiteVote()} color="primary"/>
                        </div>
                    </div>
                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            size={"large"}
                            style={{width: "20vw", alignSelf:"center", height: "5vh"}}
                            onClick={onSubmit}
                        >Soumettre</Button>
                    </Paper>
                </div>
            </div>
            }
            <Footer />
        </div>
    )
}
