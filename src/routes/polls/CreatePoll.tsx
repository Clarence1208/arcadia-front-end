import {Alert, Button, IconButton, Input, InputLabel, Link, MenuItem, Select, Switch, TextField, Tooltip, Paper} from "@mui/material";
import '../../styles/CreatePoll.css';
import '../../styles/App.css';
import React, {FormEvent, useContext, useEffect, useState} from "react";
import { useNavigate, useParams } from "react-router-dom";
import {UserSessionContext} from "../../contexts/user-session";
import Header from "./../components/Header";
import { Footer } from "./../components/Footer";
import HelpIcon from '@mui/icons-material/Help';
import AddBoxIcon from '@mui/icons-material/AddBox';
import DeleteIcon from '@mui/icons-material/Delete';
import Snackbar from "@mui/material/Snackbar";
import {ConfigContext} from "../../index";

type CreatePollData = {
    name: string,
    description: string,
    isAnonymous: boolean,
    pollQuestions?: PollQuestion[],
}

type VoteChoice = {
    name: string,
    type: string,
}

type PollQuestion = {
    name: string,
    step: number,
    nbPossibleVotes: number,
    canFreeVote: boolean,
    voteChoices: VoteChoice[],
}


const body : CreatePollData = {
    name: "",
    description: "",
    isAnonymous: false,
}

function CreatePollForm() {
    const userSession = useContext(UserSessionContext)?.userSession
    const navigate = useNavigate();

    const [ErrorMessage, setErrorMessage] = useState("")
    const [data, setData] = useState(body)
    const [name, setName] = useState("")
    const [names, setNames] = useState<string[]>([])
    const [open, setOpen] = useState(false);
    const [pollQuestions, setPollQuestions] = useState<PollQuestion[]>([]);
    const config = useContext(ConfigContext);

    if (!userSession?.isLoggedIn) {
        navigate('/login')
    }

    if((!userSession?.roles.includes("admin") && !userSession?.roles.includes("superadmin") && !userSession?.roles.includes("manager"))){
        navigate('/')
    }

    function updateFields(fields: Partial<CreatePollData>) {
        setData(prev => {
            return { ...prev, ...fields }
        })
    }

    function updatePollQuestionFields(fields: Partial<PollQuestion>, key: number) {
        if (fields.nbPossibleVotes && fields.nbPossibleVotes > pollQuestions[key].voteChoices.length) {
            setErrorMessage("Erreur : Le nombre de choix possible ne peut pas être supérieur au nombre de choix possibles")
            setOpen(true);
            fields.nbPossibleVotes = pollQuestions[key].voteChoices.length
        }
        const newPollQuestions = [...pollQuestions]
        newPollQuestions[key] = { ...newPollQuestions[key], ...fields }
        setPollQuestions(newPollQuestions)
    }
        

    function setPollQuestionIfNotAlready(pollQuestions: PollQuestion[], name: string) {
        if (name === "") {
            setErrorMessage("Erreur : Le choix ne peut pas être vide");
            setOpen(true);
            return;
        }
    
        const duplicateFound = pollQuestions.some(pollQuestion => {
            if (pollQuestion.name === name) {
                setErrorMessage("Erreur : Le choix existe déjà");
                setOpen(true);
                return true;
            }
            return false;
        });
    
        if (duplicateFound) {
            return;
        }
        const newPollQuestions = [...pollQuestions, { name: name, nbPossibleVotes: 1, canFreeVote: false, step:pollQuestions.length, voteChoices: [] }];
        setPollQuestions(newPollQuestions);
        setName("");
    }
    

    function setPollAnswerIfNotAlready(pollQuestion: PollQuestion, name: string) {
        if(name === "") {
            setErrorMessage("Erreur : Le choix ne peut pas être vide")
            setOpen(true);
            return
        }
        const duplicatedFound = pollQuestion.voteChoices.some(voteChoice => {
            if(voteChoice.name === name) {
                setErrorMessage("Erreur : Le choix existe déjà")
                setOpen(true);
                return true;
            }
        });
        if(duplicatedFound) {
            return;
        }
        const newVoteChoices = [...pollQuestion.voteChoices, {name: name, type: "Poll"}]
        const newPollQuestions = [...pollQuestions]
        newPollQuestions[pollQuestions.indexOf(pollQuestion)].voteChoices = newVoteChoices
        setPollQuestions(newPollQuestions)
        const newNames = [...names]
        newNames[pollQuestions.indexOf(pollQuestion)] = ""
        setNames(newNames)
    }

    function deleteVoteChoice(pollQuestion: PollQuestion, name: string, key: number) {
        const newPollQuestions = [...pollQuestions]
        const newVoteChoices = [...pollQuestion.voteChoices]
        newVoteChoices.splice(key, 1)
        newPollQuestions[pollQuestions.indexOf(pollQuestion)].voteChoices = newVoteChoices
        setPollQuestions(newPollQuestions)
    }

    function checkFields(): boolean {
        if(data.name === "") {
            setErrorMessage("Erreur : Le nom du vote ne peut pas être vide")
            setOpen(true);
            return false
        }
        if(pollQuestions.length < 1) {
            setErrorMessage("Erreur : Il doit y avoir au moins 1 question")
            setOpen(true);
            return false
        }
        pollQuestions.forEach(pollQuestion => {
            if(pollQuestion.voteChoices.length < 1) {
                setErrorMessage("Erreur : Il doit y avoir au moins 1 choix par question")
                setOpen(true);
                return false
            }
        });
        return true
    }

    async function onSubmit(e: FormEvent) {
        e.preventDefault()
        const isValid = checkFields()
        if (!isValid) {
            return
        }
        if (userSession?.loginToken) {
            const bearer = "Bearer " + userSession?.loginToken;
            const response: Response = await fetch( config.apiURL + "/polls", {method: "POST", body: JSON.stringify(data),                     headers: {
                    "Authorization": bearer,
                    "Content-Type": "application/json"
                }});
            if (!response.ok) {
                const error =  await response.json()
                setErrorMessage("Erreur : " + await error.message);
                return
            }
            const pollResponse = await response.json()
            pollQuestions.forEach(async pollQuestion => {
                const bearer = "Bearer " + userSession?.loginToken;
                const response: Response = await fetch( config.apiURL + "/polls/" + pollResponse.id + "/pollQuestions", {method: "POST", body: JSON.stringify(pollQuestion),                     headers: {
                        "Authorization": bearer,
                        "Content-Type": "application/json"
                    }});
                if (!response.ok) {
                    const error =  await response.json()
                    setErrorMessage("Erreur : " + await error.message);
                    return
                }
                const pollQuestionResponse = await response.json()
                pollQuestion.voteChoices.forEach(async voteChoice => {
                    const bearer = "Bearer " + userSession?.loginToken;
                    const response: Response = await fetch( config.apiURL + "/votes/" + pollQuestionResponse.id + "/voteChoices", {method: "POST", body: JSON.stringify(voteChoice),                     headers: {
                            "Authorization": bearer,
                            "Content-Type": "application/json"
                        }});
                    if (!response.ok) {
                        const error =  await response.json()
                        setErrorMessage("Erreur : " + await error.message);
                        return
                    }
                });
            });
            navigate('/adminDashboard')
        }
    }

    const addPollQuestion = (e : React.MouseEvent<HTMLButtonElement>) => {
        setPollQuestionIfNotAlready(pollQuestions, name)
    }
    const handleClose = () => {
        setOpen(false);
        setErrorMessage("")
    }

    const addPollAnswer = (e : React.MouseEvent<HTMLButtonElement>, key: number) => {
        setPollAnswerIfNotAlready(pollQuestions[key], names[key])
    }

    function changeAnonymous() {
        setData(prev => {
            return { ...prev, isAnonymous: !prev.isAnonymous }
        })
    }

    function setNamesPollQuestion(names: string[], key: number, name: string) {
        const newNames = [...names]
        newNames[key] = name
        setNames(newNames)
    }

    function deletePollQuestion(pollQuestions: PollQuestion[], key: number) {
        const newPollQuestions = [...pollQuestions]
        newPollQuestions.splice(key, 1)
        setPollQuestions(newPollQuestions)
    }

    return (
        <div id="create-vote" className="main">
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

            <Paper elevation={3}  style={{minHeight: "100vh", padding: "4em"}}>
            <h1>Créer un Sondage</h1>
            <form id="create-poll-form" onSubmit={onSubmit}>
                <div>
                <section>
                    <h3>Propriétés du sondage</h3>
                    <TextField
                        id="create-vote-title"
                        label="Intitulé du sondage"
                        variant="outlined"
                        size="small"
                        style={{marginBottom: "2em"}}
                        onChange={e => updateFields({ name: e.target.value })}
                    />
                    <TextField
                        id="create-vote-title"
                        label="Description du sondage"
                        variant="outlined"
                        size="small"
                        style={{marginBottom: "2em"}}
                        onChange={e => updateFields({ description: e.target.value })}
                    />
                    <div className={"row"}>
                    <div>
                        <InputLabel>Sondage Anonyme</InputLabel>
                        <Switch checked={data.isAnonymous}  onChange={e => changeAnonymous()} color="primary" />
                    </div>
                    </div>
                </section>

                <section>
                    <h3>Ajout d'étape pour le sondage</h3>
                    <div className="add-step">
                        <TextField
                            id="create-vote-title"
                            label="Question de l'étape"
                            variant="outlined"
                            size="small"
                            value={name}
                            onChange={e => setName(e.target.value)}
                        />
                        <Button variant="contained" color="primary" endIcon={<AddBoxIcon />} sx={{marginLeft: 2}} onClick={addPollQuestion}>Ajouter</Button>
                    </div>

                </section>

                </div>


                <div className={"polls-choices-list"}>
                    {pollQuestions.map((pollQuestion, key) => (
                        <div key={key} className={"answer"}>
                            <div className="question-title">
                                <h3>Etape {key+1} : {pollQuestions[key].name}</h3>
                                <Button variant="outlined" color="secondary" endIcon={<DeleteIcon color="primary" />} onClick={() => {deletePollQuestion(pollQuestions, key)}}></Button>
                            </div>
                            <div className="add-answer">
                                <TextField
                                    id="create-vote-title"
                                    label="Choix de réponse"
                                    variant="outlined"
                                    size="small"
                                    value={names[key]}
                                    onChange={e => setNamesPollQuestion(names, key, e.target.value)}
                                />
                                <Button variant="contained" color="primary" endIcon={<AddBoxIcon />} sx={{marginLeft: 2}} onClick={(e) => {addPollAnswer(e, key)}}>Ajouter</Button>
                            </div>
                            <div  className={"row"}>
                                <div>

                                    <InputLabel>Nombre maximum de choix possible</InputLabel>
                                    <Input
                                        id="create-vote-nbPossibleVotes"
                                        type="number"
                                        value={pollQuestions[key].nbPossibleVotes}
                                        placeholder="Nombre de choix possibles"
                                        onChange={e => updatePollQuestionFields({ nbPossibleVotes: parseInt(e.target.value) }, key)}
                                    />
                                    <Tooltip title="Nombre de choix possible par votant (par défault : 1)">
                                        <IconButton>
                                            <HelpIcon />
                                        </IconButton>
                                    </Tooltip>
                                </div>
                                <div>
                                    <InputLabel>Réponse Ouverte</InputLabel>
                                    <Switch checked={pollQuestions[key].canFreeVote}  onChange={e => updatePollQuestionFields({ canFreeVote: !pollQuestions[key].canFreeVote }, key)} color="primary" />
                                </div>
                            </div>
                            <div className={"choices-list"}>
                                {pollQuestions[key].voteChoices.map((voteChoice, keyVote) => (
                                    <div key={keyVote}>
                                        <li>{keyVote +1} : {voteChoice.name} <Button variant="outlined" color="secondary" endIcon={<DeleteIcon color="primary" />} onClick={() => {deleteVoteChoice(pollQuestions[key], voteChoice.name, keyVote)}}></Button></li>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
                <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    onClick={onSubmit}
                >Créer ce sondage</Button>

            </form>
            </Paper>

            </div>
    );
}

export function CreatePoll() {
    const [isPageLoaded, setIsPageLoaded] = useState(false);

    useEffect(() => {
        setTimeout(() => {
            setIsPageLoaded(true);
        }, 100);
    }, []);
    
    return (
        <div>
            <Header />
                {isPageLoaded &&
            <div>
                    <CreatePollForm />
            </div>
            }
            <Footer />
        </div>
    );
}