import {FormEvent, useContext, useEffect, useState} from "react";
import {useMultiStepForm} from "../components/MultipleStepForm";
import Header from "../components/Header";
import {Footer} from "../components/Footer";
import {Alert, Button, Snackbar, Paper} from "@mui/material";
import {UserSessionContext} from "../../contexts/user-session";
import {useNavigate, useParams} from "react-router-dom";
import { PollQuestionForm } from "./PollQuestionForm";
import { JSX } from "react/jsx-runtime";
import {ConfigContext} from "../../index";

type FormData = {
    responses: VoteChoice[]
}

const body: FormData = {
    responses: []
}

interface Poll {
    id: number,
    name: string,
    description: string,
    users?: User[],
    questions : PollQuestion[]
}

type VoteChoice = {
    id: number,
    name: string,
    isAlive: boolean,
    step: number,
    type: string,
    pollQuestion : PollQuestion,
}

type PollQuestion = {
    id: number,
    name: string,
    step: number,
    nbPossibleVotes: number,
    canFreeVote: boolean,
    voteChoices: VoteChoice[],
}

interface User {
    id: number,
    firstName: string,
    lastName: string,
    email: string,
    roles: string[],
}


export function PollVoteApply() {
    const navigate = useNavigate()
    const userSession = useContext(UserSessionContext)?.userSession
    const [data, setData] = useState(body)
    const [poll, setPoll] = useState<Poll>()
    const [pollQuestions, setPollQuestions] = useState<PollQuestion[]>()
    const [ErrorMessage, setErrorMessage] = useState("")
    const [open, setOpen] = useState(false);
    const {id} = useParams()
    const config = useContext(ConfigContext);
    const [isPageLoaded, setIsPageLoaded] = useState(false);

    useEffect(() => {
        setTimeout(() => {
            setIsPageLoaded(true);
        }, 100);
    }, []);

    async function updateFields(voteChoiceData: VoteChoice, limit: number) {
        setData(prev => {
            let responses = [...prev.responses];
            let stepResponses = 0;
    
            const existingIndex = responses.findIndex(voteChoice => voteChoice.id === voteChoiceData.id);
            if (existingIndex !== -1) {
                responses = responses.filter(voteChoice => voteChoice.id !== voteChoiceData.id);
                return { ...prev, responses };
            }
    
            responses.forEach(voteChoice => {
                if (voteChoice.step === voteChoiceData.step) {
                    stepResponses++;
                }
            });
    
            if (stepResponses >= limit) {
                setErrorMessage("Vous avez atteint le nombre maximum de choix pour cette question");
                setOpen(true);
                return prev;
            }
    
            responses.push(voteChoiceData);
            return { ...prev, responses };
        });
    }

    useEffect(() => {
        if(userSession?.loginToken) {
            const getPoll = async (): Promise<Poll> => {
                const bearer = "Bearer " + userSession?.loginToken;
                const response: Response = await fetch(`${config.apiURL}/polls/${id}`, {method: "GET",
                    headers: {
                        "Authorization": bearer,
                        "Content-Type": "application/json"
                    }
                });
                if (!response.ok) {
                    const error = await response.json()
                    setErrorMessage("Erreur : " + await error.message);
                    return {} as Poll;
                }
                const res = await response.json();
                if (res.length === 0) {
                    setErrorMessage("Aucun sondage trouvé")
                }
                return res;
            }
        getPoll().then(setPoll)
        }
    }, [userSession?.loginToken, id]);

    useEffect(() => {
        if(userSession?.loginToken) {
            const getPollQuestions = async (): Promise<PollQuestion[]> => {
                const bearer = "Bearer " + userSession?.loginToken;
                const response: Response = await fetch(`${config.apiURL}/polls/${id}/pollQuestions`, {method: "GET",
                    headers: {
                        "Authorization": bearer,
                        "Content-Type": "application/json"
                    }
                });
                if (!response.ok) {
                    const error = await response.json()
                    setErrorMessage("Erreur : " + await error.message);
                    return {} as PollQuestion[];
                }
                const res = await response.json();
                if (res.length === 0) {
                    setErrorMessage("Aucune question trouvée")
                }
                return res;
            }
        getPollQuestions().then(setPollQuestions)
        }
    }, [poll]);

    let forms: JSX.Element[] = [];
    pollQuestions?.forEach(question => {
        forms.push(
            <PollQuestionForm 
                {...data}
                question={question} 
                updateFields={updateFields} 
            />
        );
    });
    const { steps, currentStepIndex, step, isFirstStep, isLastStep, back, next } = useMultiStepForm(forms)

    const handleClose = () => {
        setOpen(false);
    };

    async function onSubmit(e: FormEvent) {
        e.preventDefault()
        if (userSession?.loginToken) {
            const bearer = "Bearer " + userSession?.loginToken;
            const response: Response = await fetch( config.apiURL + "/polls/" + id + "/join/" + userSession.userId, {method: "POST",
                headers: {
                    "Authorization": bearer,
                    "Content-Type": "application/json"
                }});
            if (!response.ok) {
                const error =  await response.json()
                setErrorMessage("Erreur : " + await error.message);
                return
            }

            const responseVoteChoices: Response = await fetch( config.apiURL +"/polls/" + id + "/voteChoices/apply/" + userSession.userId, {method: "POST", body: JSON.stringify(data.responses),
                headers: {
                "Authorization": bearer,
                "Content-Type": "application/json"
            }});
            if (!response.ok) {
                const error =  await responseVoteChoices.json()
                setErrorMessage("Erreur : " + await error.message);
                return
            }
        }
        navigate("/blog");
    }

    return (
        <div>
            <Header />
            {isPageLoaded && 
            <div>
                <div id={"create-website-page"} className={"main"}>
                    <div>
                        <h1>{poll?.name} :</h1>
                    </div>
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
                        <div style={{ display: "flex", justifyContent: "center"}}>
                            <span>{poll?.description}</span>
                        </div>
                    <div style={{ display: "flex", justifyContent: "center"}}>
                       <Paper className={"paper"} style={{ minWidth: "40vw", minHeight:"30vh"}}>
                            <form onSubmit={onSubmit}>
                                <div style={{ position: "absolute", top: ".5rem", right: ".5rem" }}>
                                    Etape {currentStepIndex + 1} / {steps.length}
                                </div>
                                {step}
                                <div style={{
                                    marginTop: "1rem",
                                    display: "flex",
                                    gap: ".5rem",
                                    justifyContent: "flex-end"
                                }}>

                                    {!isFirstStep && (
                                        <Button id="back-button" color="primary" variant={"outlined"} disableElevation onClick={back}>Retour</Button>

                                    )}
                                    {isLastStep && (
                                        <Button id="submit-button" color="primary" variant="contained" disableElevation onClick={onSubmit}>Terminer</Button>
                                    ) || 
                                    <Button id="next-button" color="primary" variant="contained" disableElevation onClick={next}>Suivant</Button>
                                    }
                                </div>
                            </form>
                        </Paper>
                        </div>
                </div>
            </div>
            }
            <Footer />
        </div>
    )
}