import { Alert, InputLabel, Snackbar, Switch } from "@mui/material";
import { PieChart } from "@mui/x-charts";
import { useContext, useEffect, useState } from "react";
import {UserSessionContext} from "../../contexts/user-session";

type VoteChoice = {
    id: number,
    name: string,
    step: number,
    type: string,
    users: User[],
}

type User = {
    id: number,
    surname: string,
    firstName: string,
}

type PollQuestion = {
    id: number,
    name: string,
    step: number,
    nbPossibleVotes: number,
    voteChoices: VoteChoice[],
}

interface Poll {
    id: number,
    name: string,
    isAnonymous: boolean;
    users?: User[],
    questions : PollQuestion[]
}

type PollQuestionFormProps = {
    poll : Poll,
    question : PollQuestion,
}

export function PollQuestionResult(props : PollQuestionFormProps) {
    const [isVoteResultVisible, setIsVoteResultVisible] = useState<boolean>(false);
    const userSession = useContext(UserSessionContext)?.userSession
    const [ErrorMessage, setErrorMessage] = useState("")
    const [voteChoices, setVoteChoices] = useState<VoteChoice[]>()
    const [open, setOpen] = useState(false);

    useEffect(() => {
        if(userSession?.loginToken) {
            const getPollQuestions = async (): Promise<VoteChoice[]> => {
                const bearer = "Bearer " + userSession?.loginToken;
                const response: Response = await fetch(`${import.meta.env.VITE_API_URL}/votes/${props.question.id}/voteChoices?type=Poll`, {method: "GET",
                    headers: {
                        "Authorization": bearer,
                        "Content-Type": "application/json"
                    }
                });
                if (!response.ok) {
                    const error = await response.json()
                    setErrorMessage("Erreur : " + await error.message);
                    return {} as VoteChoice[];
                }
                const res = await response.json();
                if (res.length === 0) {
                    setErrorMessage("Aucune question trouvée")
                }
                return res;
            }
        getPollQuestions().then(setVoteChoices)
        }
    }, [props.question]);

    const handleClose = () => {
        setOpen(false);
    };

    return (
        <div>
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
            <div className="main">
                <h1>{props.question.name}</h1>
                {!props.poll?.isAnonymous && (
                        <div>
                            <InputLabel>Voir les votes des utilisateurs</InputLabel>
                            <Switch checked={isVoteResultVisible} onChange={e => setIsVoteResultVisible(!isVoteResultVisible)} color="primary" />
                        </div>
                    )}
                <div className={"vote-result-header"}>
                    <ul>
                    {voteChoices?.map((voteChoice) => (
                        voteChoice.users && (
                            <li key={voteChoice.id}>
                                {voteChoice.name} : {voteChoice.users.length}
                            </li>
                        )
                    ))}
                    </ul>
                        <PieChart
                            series={[
                                {
                                    data: voteChoices?.filter(voteChoice => voteChoice.users && voteChoice.users.length > 0)
                                        .filter(voteChoice => voteChoice.users && voteChoice.users.length > 0)
                                        .map(voteChoice => ({
                                            id: voteChoice.id,
                                            value: voteChoice.users.length,
                                            label: voteChoice.name,
                                        })) || [],
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
                {isVoteResultVisible && (
                    <div className="users-vote-div">
                        <h2>Votes des utilisateurs :</h2>
                            <div className="users-vote-list">
                            {voteChoices?.map((voteChoice, index) => (
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
        </div>
    );
}