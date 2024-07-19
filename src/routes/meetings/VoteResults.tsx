import { Button, InputLabel, Switch } from "@mui/material";
import { SetStateAction, useContext, useEffect, useState } from "react";
import '../../styles/VoteResults.css';
import { useNavigate, useParams } from "react-router-dom";
import { Footer } from "../components/Footer";
import Header from "../components/Header";
import {UserSessionContext} from "../../contexts/user-session";
import AddBoxIcon from '@mui/icons-material/AddBox';
import { Vote } from "./Vote";
import { PieChart } from '@mui/x-charts';
import {ConfigContext} from "../../index";


type User = {
    id: number,
    surname: string,
    firstName: string,
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
    meetingId: number,
    users: User[],
}

interface VoteChoice {
    id: number,
    name?: string,
    users: User[],
}

export function VoteResults() {

    const userSession = useContext(UserSessionContext)?.userSession
    const { voteId } = useParams();
    const [voteChoices, setVoteChoices] = useState<VoteChoice[]>([]);
    const [vote, setVote] = useState<Vote>();
    const [winners, setWinners] = useState<VoteChoice[]>([]);
    const [loosers, setLooser] = useState<VoteChoice[]>([]);
    const [isLastVote , setIsLastVote] = useState<boolean>(false);
    const [isVoteResultVisible, setIsVoteResultVisible] = useState<boolean>(false);
    const config = useContext(ConfigContext);
    const [isPageLoaded, setIsPageLoaded] = useState(false);

    useEffect(() => {
        setTimeout(() => {
            setIsPageLoaded(true);
        }, 100);
    }, []);

    useEffect(() => {
        // Fetch vote data and vote choices
        const fetchData = async () => {
            if (!userSession?.roles) {
                return;
            }
            if (userSession?.roles.includes("admin") || userSession?.roles.includes("superadmin") || userSession?.roles.includes("adherent")) {
                const fetchData = async () => {
                    try {
                        const bearer = "Bearer " + userSession?.loginToken;
                        
                        // Fetch vote information
                        const voteResponse = await fetch(`${config.apiURL}/votes/${voteId}`, {
                            method: "GET",
                            headers: {
                                "Authorization": bearer,
                                "Content-Type": "application/json"
                            }
                        });
                        if (!voteResponse.ok) {
                            console.error("Error fetching vote data");
                            return;
                        }
                        setVote(await voteResponse.json());
        
                        // Fetch vote choices
                        const voteChoicesResponse = await fetch(`${config.apiURL}/votes/${voteId}/voteChoices?type=Vote`, {
                            method: "GET",
                            headers: {
                                "Authorization": bearer,
                                "Content-Type": "application/json"
                            }
                        });
                        if (!voteChoicesResponse.ok) {
                            console.error("Error fetching vote choices");
                            return;
                        }
                        setVoteChoices(await voteChoicesResponse.json());
                    } catch (error) {
                        console.error("Error fetching data", error);
                    }
                }
                fetchData();
            }
        };
    
        if (userSession?.roles && userSession.roles.includes("admin")) {
            fetchData();
        }
    }, [userSession, voteId]);

    useEffect(() => {
        orderVoteChoices(voteChoices);
        if (vote?.isAbsoluteMajority) {
            getMajority(vote, voteChoices);
        } else {
            if (vote?.eliminationPerRound) {
                getRemainingVoteChoices(vote, voteChoices);
            } else {
                if (vote) {
                    getWinners(vote, voteChoices);
                }
            }
        }
    }, [voteChoices, vote]);
    
    async function orderVoteChoices(voteChoices: VoteChoice[]) {
        voteChoices.sort((a, b) => {
            if (a.users && b.users) {
                return b.users.length - a.users.length;
            }
            return 0;
        });
    }

    async function getMajority(vote: Vote, voteChoices: VoteChoice[]) {
        const winners: VoteChoice[] = [];
        const loosers: VoteChoice[] = [];

        voteChoices.forEach(voteChoice => {
            if (voteChoice.users && vote.users) {
                if (voteChoice.users.length > vote.users.length / 2) {
                    winners.push(voteChoice);
                } else {
                    loosers.push(voteChoice);
                }
            }
        });

        setWinners(winners);
        setLooser(loosers);
    }

    async function getRemainingVoteChoices(vote: Vote, voteChoices: VoteChoice[]) {
        if (vote.users) {
            if (vote.eliminationPerRound) {
                const updatedWinners: VoteChoice[] = [];
                const updatedLoosers: VoteChoice[] = [];
    
                if (voteChoices.length - vote.eliminationPerRound > vote.nbWinners) {
                    setIsLastVote(false);
                } else {
                    setIsLastVote(true);
                }
    
                for (let i = 0; i < voteChoices.length; i++) {
                    if (i < voteChoices.length - vote.eliminationPerRound) {
                        updatedWinners.push(voteChoices[i]);
                    } else {
                        updatedLoosers.push(voteChoices[i]);
                    }
                }
    
                setWinners(updatedWinners);
                setLooser(updatedLoosers);
            }
        }
    }

    async function getWinners(vote: Vote, voteChoices: VoteChoice[]) {
        setIsLastVote(true);
        const updatedWinners: VoteChoice[] = [];
        for (let i = 0; i < voteChoices.length; i++) {
            if (i < vote.nbWinners) {
                if (voteChoices[i]) {
                    updatedWinners.push(voteChoices[i]);
                }
            } else {
                if (voteChoices[i].users.length == voteChoices[i-1].users.length) {
                    updatedWinners.push(voteChoices[i]);
                } else {
                    setWinners(updatedWinners);
                    return;
                }
            }
        }
        setWinners(updatedWinners);
    }

    // Determine the winners heading based on vote state
    const winnersHeading = vote?.isAbsoluteMajority ? "Gagnants (majorité absolue) :" : isLastVote
    ? winners.length !== vote?.nbWinners
        ? "Gagnants (avec égalité) :"
        : "Gagnants :"
    : winners.length !== vote?.nbWinners
        ? "Choix passant au tour suivant (avec égalité) : (Un nouveau vote est disponible !)"
        : "Choix passant au tour suivant : (Un nouveau vote est disponible !)";

    return (
        <div>
            <Header />
            {isPageLoaded &&
            <div className="main">
                {vote?.users.length === 0 ? (
                    <h1>Pas de participant</h1>
                ) : (
                    <>
                        <div className={"vote-result-header"}>
                            <h1>Résultats du vote : {vote?.name}</h1>
                            <h2>Nombre de participants : {vote?.users.length}</h2>
                            {!vote?.isAnonymous && (
                                <div>
                                    <InputLabel>Voir les votes des utilisateurs</InputLabel>
                                    <Switch checked={isVoteResultVisible} onChange={e => setIsVoteResultVisible(!isVoteResultVisible)} color="primary" />
                                </div>
                            )}
                        </div>
                        {winners.length > 0 && (
                            <div>
                                <h2>{winnersHeading}</h2>
                                <ul>
                                    {winners.map((winner, index) => (
                                        <li key={index}>{winner.name} : {winner.users.length}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        {loosers.length > 0 && (
                            <div>
                                <h2>Eliminées à ce tour :</h2>
                                <ul>
                                    {loosers.map((looser, index) => (
                                        <li key={index}>{looser.name} : {looser.users.length}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        <div>
                        <PieChart
                            series={[
                                {
                                    data: voteChoices
                                        .filter(voteChoice => voteChoice.users && voteChoice.users.length > 0)
                                        .map(voteChoice => ({
                                            id: voteChoice.id,
                                            value: voteChoice.users.length,
                                            label: voteChoice.name,
                                        })),
                                    arcLabel: (item) => `${item.label} (${item.value})`,
                                    arcLabelMinAngle: 20,
                                    highlightScope: { faded: 'global', highlighted: 'item' },
                                    faded: { innerRadius: 30, additionalRadius: -30, color: 'gray' },
                                },
                            ]}
                            width={600}
                            height={400}
                        />
                        </div>
                    </>
                )}
                {isVoteResultVisible && (
                    <div className="users-vote-div">
                        <h2>Votes des utilisateurs :</h2>
                            <div className="users-vote-list">
                            {voteChoices.map((voteChoice, index) => (
                                <div>
                                    <h3>{voteChoice.name} :</h3>
                                    <ul>
                                        {voteChoice.users.map((user, index) => (
                                            <li key={index}>{user.firstName} {user.surname}</li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                            </div>
                    </div>
                )}
            </div>
            }
            <Footer />
        </div>
    );
}
