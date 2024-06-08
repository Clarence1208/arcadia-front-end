import {Alert, Button, IconButton, Input, InputLabel, Link, MenuItem, Select, Switch, TextField, Tooltip, Paper} from "@mui/material";
import '../../styles/CreateVote.css';
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

type CreateVoteData = {
    name: string,
    eliminationPerRound: number | null,
    isAbsoluteMajority: boolean,
    isAnonymous: boolean,
    nbWinners: number,
    nbPossibleVotes: number,
    quorum?: number | null,
}

type VoteChoice = {
    name: string,
    type: string,
}


const body : CreateVoteData = {
    name: "",
    eliminationPerRound: null,
    isAbsoluteMajority: false,
    isAnonymous: false,
    nbWinners: 1,
    nbPossibleVotes: 1,
    quorum: null,
}

function CreateMeetingVoteForm() {
    const userSession = useContext(UserSessionContext)?.userSession
    const navigate = useNavigate();
    const { id } = useParams();

    const [ErrorMessage, setErrorMessage] = useState("")
    const [data, setData] = useState(body)
    const [votes, setVotes] = useState<string[]>([])
    const [name, setName] = useState("")
    const [open, setOpen] = useState(false);

    if (!userSession?.isLoggedIn) {
        navigate('/login')
    }

    if(!(userSession?.roles.includes("admin") || !userSession?.roles.includes("superadmin"))){
        navigate('/meetings')
    }

    function updateFields(fields: Partial<CreateVoteData>) {
        if(fields.nbWinners && fields.nbWinners > 1 && data.isAbsoluteMajority) {
            setErrorMessage("Erreur : Un vote à majorité absolue ne peut avoir qu'un seul gagnant")
            setOpen(true);
            fields.nbWinners = 1
        }
        setData(prev => {
            return { ...prev, ...fields }
        })
    }

    function setVotesIfNotAlready(votes: string[], name: string) {
        if(name === "") {
            setErrorMessage("Erreur : Le choix ne peut pas être vide")
            setOpen(true);
            return
        }
        if (!votes.includes(name)) {
            setVotes([...votes, name]);
            setName("")
        } else {
            setErrorMessage("Erreur : Ce choix existe déjà");
            setOpen(true);
        }
    }

    function deleteVoteChoice(vote: string, key: number) {
        const newVotes = votes.filter((_, index) => index !== key);
        setVotes(newVotes);
    }

    function changeAbsoluteMajority() {
        if (data.nbWinners > 1) {
            setErrorMessage("Erreur : Un vote à majorité absolue ne peut avoir qu'un seul gagnant")
            setOpen(true);
            return
        }
        setData(prev => {
            return { ...prev, isAbsoluteMajority: !prev.isAbsoluteMajority }
        })
    }

    function changeAnonymous() {
        setData(prev => {
            return { ...prev, isAnonymous: !prev.isAnonymous }
        })
    }

    function checkFields(): boolean {
        if(votes.length < 2) {
            setErrorMessage("Erreur : Il doit y avoir au moins 2 choix")
            setOpen(true);
            return false
        }
        if (data.nbWinners < 1) {
            setErrorMessage("Erreur : Il doit y avoir au moins 1 gagnant")
            setOpen(true);
            return false
        }
        if (data.nbPossibleVotes < 1) {
            setErrorMessage("Erreur : Il doit y avoir au moins 1 choix possible par votant")
            setOpen(true);
            return false
        }
        if (data.quorum && data.quorum < 1) {
            setErrorMessage("Erreur : Il doit y avoir au moins 1 personne pour le quorum")
            setOpen(true);
            return false
        }
        if (data.eliminationPerRound) {
            if (data.eliminationPerRound < 1) {
                setErrorMessage("Erreur : Il doit y avoir au moins 1 élimination par tour")
                setOpen(true);
                return false
            }
            let i = votes.length
            while (i > data.nbWinners) {
                i -= data.eliminationPerRound
            }
            if (i !== data.nbWinners) {
                setErrorMessage("Erreur : Le nombre de gagnants n'est pas compatible avec le nombre d'élimination par tour")
                return false
                }
            }
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
            const response: Response = await fetch( process.env.REACT_APP_API_URL+"/meetings/" + id + "/votes", {method: "POST", body: JSON.stringify(data),                     headers: {
                    "Authorization": bearer,
                    "Content-Type": "application/json"
                }});
            if (!response.ok) {
                const error =  await response.json()
                setErrorMessage("Erreur : " + await error.message);
                return
            }
            const vote = await response.json()
            for(let i = 0; i < votes.length; i++) {
                const voteChoice : VoteChoice = {
                    name: votes[i],
                    type: "Vote"
                }
                const responseVoteChoices: Response = await fetch(process.env.REACT_APP_API_URL+"/votes/" + vote.id + "/voteChoices", {method: "POST", body: JSON.stringify(voteChoice), headers: {
                        "Authorization": bearer,
                        "Content-Type": "application/json"
                    }});
                if (!responseVoteChoices.ok) {
                    const error =  await responseVoteChoices.json()
                    setErrorMessage("Erreur : " + await error.message);
                    setOpen(true);
                    return
                }
            }
            navigate('/meeting/' + id + '/votes')
        }
    }

    const addVoteChoice = (e : React.MouseEvent<HTMLButtonElement>) => {
        setVotesIfNotAlready(votes, name)
    }
    const handleClose = () => {
        setOpen(false);
        setErrorMessage("")
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
            <Paper elevation={3} className="paper">
            <h1>Créer un Vote</h1>
            <form id="create-vote-form" onSubmit={onSubmit}>
                <div>
                <section>
                    <h3>Propriétés du vote</h3>
                    <TextField
                        id="create-vote-title"
                        label="Intitulé du vote"
                        variant="outlined"
                        size="small"
                        style={{marginBottom: "2em"}}
                        onChange={e => updateFields({ name: e.target.value })}
                    />
                    <div  className={"row"}>
                        <div>

                            <InputLabel>Nombre d'élimination par tour</InputLabel>
                            <Input
                                id="create-vote-elimination"
                                type="number"
                                value={data.eliminationPerRound}
                                placeholder="Élimination par tour"
                                onChange={e => updateFields({ eliminationPerRound: parseInt(e.target.value) })}

                            />
                            <Tooltip title="Entrer une valeur ici fera de votre vote un vote à tour multiple">
                                <IconButton>
                                    <HelpIcon />
                                </IconButton>
                            </Tooltip>
                        </div>
                        <div>
                            <InputLabel>Nombre de gagnants</InputLabel>
                            <Input
                                id="create-vote-nbWinners"
                                type="number"
                                placeholder="Nombre de gagnants"
                                value={data.nbWinners}
                                onChange={e => updateFields({ nbWinners: parseInt(e.target.value) })}
                            />
                            <Tooltip title="Plusieurs gagnants dans un vote à majorité absolue relancera un vote pour chaque gagnants sans les précédents (par défault : 1)">
                                <IconButton>
                                    <HelpIcon />
                                </IconButton>
                            </Tooltip>
                        </div>
                    </div>

                    <div  className={"row"}>
                    <div>

                        <InputLabel>Nombre maximum de choix possible</InputLabel>
                        <Input
                            id="create-vote-nbPossibleVotes"
                            type="number"
                            value={data.nbPossibleVotes}
                            placeholder="Nombre de choix possibles"
                            onChange={e => updateFields({ nbPossibleVotes: parseInt(e.target.value) })}
                        />
                        <Tooltip title="Nombre de choix possible par votant (par défault : 1)">
                            <IconButton>
                                <HelpIcon />
                            </IconButton>
                        </Tooltip>
                    </div>
                    <div>

                        <InputLabel>Quorum</InputLabel>
                        <Input
                            id="create-vote-quorum"
                            type="number"
                            value={data.quorum}
                            placeholder="Quorum"
                            onChange={e => updateFields({ quorum: parseInt(e.target.value) })}
                        />
                        <Tooltip title="Nombre de personnes maximale à voter (ne pas remplir pour aucun maximal)">
                            <IconButton>
                                <HelpIcon />
                            </IconButton>
                        </Tooltip>
                    </div>
                    </div>

                    <div className={"row"}>
                    <div>
                        <InputLabel>Majorité absolue</InputLabel>
                        <Switch checked={data.isAbsoluteMajority} onChange={e => changeAbsoluteMajority()} color="primary" />
                    </div>
                    <div>
                        <InputLabel>Vote Anonyme</InputLabel>
                        <Switch checked={data.isAnonymous}  onChange={e => changeAnonymous()} color="primary" />
                    </div>
                    </div>
                </section>

                <section>
                    <h3>Ajout d'options pour le vote</h3>
                    <div className="add-choice">
                        <TextField
                            id="create-vote-title"
                            label="Nom"
                            variant="outlined"
                            size="small"
                            value={name}
                            onChange={e => setName(e.target.value)}
                        />
                        <Button variant="contained" color="primary" endIcon={<AddBoxIcon />} sx={{marginLeft: 2}} onClick={addVoteChoice}>Ajouter</Button>
                    </div>
                    <div className={"choices-list"}>
                        {votes.map((vote, key) => (
                            <div key={key}>
                                <li>{key +1} : {vote} <Button variant="outlined" color="secondary" endIcon={<DeleteIcon color="primary" />} onClick={() => {deleteVoteChoice(vote, key)}}></Button></li>
                            </div>
                        ))}
                    </div>

                </section>

                </div>
                <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    onClick={onSubmit}
                >Soumettre</Button>

            </form>
            </Paper>
        </div>
    );
}

export function CreateMeetingVote() {
    return (
        <div>
            <Header />
                <CreateMeetingVoteForm />
            <Footer />
        </div>
    );
}