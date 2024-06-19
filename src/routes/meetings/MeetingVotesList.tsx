import { Alert, Button, Pagination, Snackbar } from "@mui/material";
import { useContext, useEffect, useState } from "react";
import '../../styles/VotesList.css';
import { useNavigate, useParams } from "react-router-dom";
import { Footer } from "./../components/Footer";
import Header from "./../components/Header";
import {UserSessionContext} from "../../contexts/user-session";
import AddBoxIcon from '@mui/icons-material/AddBox';
import { Vote } from "./Vote";
import Clock from 'react-clock'
import 'react-clock/dist/Clock.css';
import {ConfigContext} from "../../index";

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
}

interface Meeting {
    id: number,
    name: string,
    description: string,
    startDate: Date,
    endDate: Date,
    capacity: number,

}

type Filters = {
    page?: number,
    limit?: number,
}

export function MeetingVotesList() {

    const userSession = useContext(UserSessionContext)?.userSession
    const [votes, setVotes] = useState<Vote[]>([])
    const navigate = useNavigate();
    const [ErrorMessage, setErrorMessage] = useState("")
    const { id } = useParams();
    const [meeting, setMeeting] = useState<Meeting>();
    const [time, setTime] = useState(new Date());
    const config = useContext(ConfigContext);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        if (userSession?.loginToken) {
            const getVotes = async (filters?: Filters): Promise<Vote[]> => {
                const bearer = "Bearer " + userSession?.loginToken;
                const response: Response = await fetch(`${config.apiURL}/meetings/${id}/votes`, {method: "GET",
                    headers: {
                        "Authorization": bearer,
                        "Content-Type": "application/json"
                    }
                });
                if (!response.ok) {
                    const error = await response.json()
                    setErrorMessage("Erreur : " + await error.message);
                    return []
                }
                const res = await response.json();
                if (res.length === 0) {
                    console.log("Aucun site web trouvé")
                    setErrorMessage("Aucun site web trouvé")
                }
                return res;
            }
            getVotes().then(setVotes)
            if(id !== undefined) {
                votes.forEach(vote => {
                    vote.meetingId = parseInt(id);
                });
            }
            const getMeeting = async (filters?: Filters): Promise<Meeting> => {
                const bearer = "Bearer " + userSession?.loginToken;
                const response: Response = await fetch(`${config.apiURL}/meetings/${id}`, {method: "GET",
                    headers: {
                        "Authorization": bearer,
                        "Content-Type": "application/json"
                    }
                });
                if (!response.ok) {
                    const error = await response.json()
                    setErrorMessage("Erreur : " + await error.message);
                    return {} as Meeting
                }
                const res = await response.json();
                if (res.length === 0) {
                    setErrorMessage("")
                }
                return res;
            }
            getMeeting().then(setMeeting)
        }
    }, [userSession?.loginToken, id]);

    useEffect(() => {
        const interval = setInterval(() => setTime(new Date()), 1000);

        return () => {
            clearInterval(interval);
        };
    }, []);

    const handleClose = () => {
        setOpen(false)
    }

    return (
        <div>
            <Header />
                <div className={"main"}>
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
                    {meeting && <h1>Votes de l'assemblée générale {meeting.name} :</h1>}

                            {userSession?.roles.includes("admin") || userSession?.roles.includes("superadmin") ?
                                <div>
                                    <Button 
                                    href={"/meeting/"+id+"/createVote"}
                                    variant="contained"
                                    color="primary"
                                    style={{marginBottom: "3em"}}
                                    endIcon={<AddBoxIcon />}>
                                        Créer un vote
                                    </Button>
                                </div> : null
                            }
                    <div style={{display:"flex", justifyContent:"space-between"}}>
                        <div className={"votes-list"}>
                            {votes.length === 0 ? <div>Chargement ou pas de votes...</div> :
                                votes.map(vote => {
                                    return <Vote key={vote.id} vote={vote} meetingId={id !== undefined ? parseInt(id) : undefined} />
                                })
                            }
                        </div>


                        <div>
                            {meeting && <p>Fin de l'assemblée générale prévue à {new Date(meeting.endDate).getHours() + " h 0" + new Date(meeting.endDate).getMinutes()}</p>}
                            <Clock value={time} renderNumbers={true}/>
                        </div>
                    </div>
                </div>
            <Footer />
        </div>
    )
}
