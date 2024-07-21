import {FormEvent, useContext, useEffect, useState} from "react";
import {useMultiStepForm} from "../components/MultipleStepForm";
import Header from "../components/Header";
import {Footer} from "../components/Footer";
import {Alert, Button, CircularProgress, Snackbar} from "@mui/material";
import {UserSessionContext} from "../../contexts/user-session";
import {useNavigate, useParams} from "react-router-dom";
import { PollQuestionForm } from "./PollQuestionForm";
import { JSX } from "react/jsx-runtime";
import { PollQuestionResult } from "./PollQuestionResult";
import {ConfigContext} from "../../index";

interface Poll {
    id: number,
    name: string,
    isAnonymous: boolean;
    users: User[],
    questions : PollQuestion[]
}

type VoteChoice = {
    id: number,
    name: string,
    step: number,
    isAlive: boolean,
    type: string,
    users: User[],
}

type PollQuestion = {
    id: number,
    name: string,
    step: number,
    nbPossibleVotes: number,
    canFreeVote: boolean,
    voteChoices: VoteChoice[],
}

type User = {
    id: number,
    surname: string,
    firstName: string,
}


export function PollResults() {
    const navigate = useNavigate()
    const userSession = useContext(UserSessionContext)?.userSession
    const [poll, setPoll] = useState<Poll>()
    const [pollQuestions, setPollQuestions] = useState<PollQuestion[]>()
    const [ErrorMessage, setErrorMessage] = useState("")
    const [open, setOpen] = useState(false);
    const config = useContext(ConfigContext);
    const {id} = useParams()
    const [isPageLoaded, setIsPageLoaded] = useState(false);

    useEffect(() => {
        setTimeout(() => {
            setIsPageLoaded(true);
        }, 100);
    }, []);

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
    if(poll) {
        pollQuestions?.forEach(question => {
            forms.push(
                <PollQuestionResult 
                    poll={poll}
                    question={question}
                />
            );
        });
    }
    const { steps, currentStepIndex, step, isFirstStep, isLastStep, back, next } = useMultiStepForm(forms)

    const handleClose = () => {
        setOpen(false);
    };

    async function onSubmit(e: FormEvent) {
        navigate("/blog");
    }

    return (
        <div>
            <Header />
            {isPageLoaded && 
            <div>
                <div id={"create-website-page"}>
                    <div style={{ display: "flex", justifyContent: "center"}}>
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
                        <div style={{ minWidth: "40vw", position: "relative", border: "1px solid black", padding: "2rem", margin: "1rem", borderRadius: ".5rem", maxWidth: "max-content" }}>

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
                                    {/* {!isFirstStep && (
                                        <Button id="back-button" color="primary" variant={"outlined"} disableElevation onClick={back}>Back</Button>

                                    )} */}
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
                        </div>
                    </div>
                </div>
            </div>
            }
            <Footer />
        </div>
    )
}