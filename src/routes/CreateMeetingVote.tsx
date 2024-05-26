import {Alert, Button, IconButton, Input, InputLabel, Link, MenuItem, Select, Switch, TextField, Tooltip} from "@mui/material";
import '../styles/CreateVote.css';
import '../styles/App.css';
import {FormEvent, useContext, useEffect, useState} from "react";
import { useNavigate, useParams } from "react-router-dom";
import {UserSessionContext} from "../contexts/user-session";
import Header from "./components/Header";
import { Footer } from "./components/Footer";
import HelpIcon from '@mui/icons-material/Help';
import AddBoxIcon from '@mui/icons-material/AddBox';
import DeleteIcon from '@mui/icons-material/Delete';

type CreateVoteData = {
    name: string,
    eliminationPerRound: number | null,
    isAbsoluteMajority: boolean,
    isAnonymous: boolean,
    nbWinners: number,
    nbPossibleVotes: number,
    quorum?: number | null,
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

    if (!userSession?.isLoggedIn) {
        navigate('/login')
    }

    if(!(userSession?.roles.includes("admin") || !userSession?.roles.includes("superadmin"))){
        navigate('/meetings')
    }

    function updateFields(fields: Partial<CreateVoteData>) {
        setData(prev => {
            return { ...prev, ...fields }
        })
    }

    function setVotesIfNotAlready(votes: string[], name: string) {
        if(name === "") {
            setErrorMessage("Erreur : Le choix ne peut pas être vide")
            return
        }
        if (!votes.includes(name)) {
            setVotes([...votes, name]);
        } else {
            setErrorMessage("Erreur : Ce choix existe déjà");
        }
    }

    function deleteVoteChoice(vote: string, key: number) {
        const newVotes = votes.filter((_, index) => index !== key);
        setVotes(newVotes);
    }

    function changeAbsoluteMajority() {
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
            return false
        }
        if (data.nbWinners < 1) {
            setErrorMessage("Erreur : Il doit y avoir au moins 1 gagnant")
            return false
        }
        if (data.nbPossibleVotes < 1) {
            setErrorMessage("Erreur : Il doit y avoir au moins 1 choix possible par votant")
            return false
        }
        if (data.quorum && data.quorum < 1) {
            setErrorMessage("Erreur : Il doit y avoir au moins 1 personne pour le quorum")
            return false
        }
        if (data.eliminationPerRound) {
            if (data.eliminationPerRound < 1) {
                setErrorMessage("Erreur : Il doit y avoir au moins 1 élimination par tour")
                return false
            }
            if ((votes.length % data.eliminationPerRound !== data.nbWinners) && data.nbWinners !== 1) {
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
            navigate('/meeting/' + id + '/votes')
        }
    }

    return (
        <div id="create-vote" className="main">
            <h1>Créer un Vote</h1>
            <form id="create-vote-form" onSubmit={onSubmit}>
                <TextField 
                    id="create-vote-title" 
                    label="Nom" 
                    variant="outlined"
                    size="small"
                    onChange={e => updateFields({ name: e.target.value })} 
                />
                <div>
                    <Input
                        id="create-vote-elimination"
                        type="number"
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
                    <Input
                        id="create-vote-nbWinners"
                        type="number"
                        placeholder="Nombre de gagnants"
                        onChange={e => updateFields({ nbWinners: parseInt(e.target.value) })}
                    />
                    <Tooltip title="Plusieurs gagnants dans un vote à majorité absolue relancera un vote pour chaque gagnants sans les précédents (par défault : 1)">
                        <IconButton>
                            <HelpIcon />
                        </IconButton>
                    </Tooltip>
                </div>
                <div>
                    <Input
                        id="create-vote-nbPossibleVotes"
                        type="number"
                        placeholder="Nombre de choix possibles"
                        onChange={e => updateFields({ nbWinners: parseInt(e.target.value) })}
                    />
                    <Tooltip title="Nombre de choix possible par votant (par défault : 1)">
                        <IconButton>
                            <HelpIcon />
                        </IconButton>
                    </Tooltip>
                </div>
                <div>
                    <Input
                        id="create-vote-quorum"
                        type="number"
                        placeholder="Quorum"
                        onChange={e => updateFields({ quorum: parseInt(e.target.value) })}
                    />
                    <Tooltip title="Nombre de personnes maximale à voter (ne pas remplir pour aucun maximal)">
                        <IconButton>
                            <HelpIcon />
                        </IconButton>
                    </Tooltip>
                </div>
                <div>
                    <InputLabel>Majorité absolue</InputLabel>
                    <Switch checked={data.isAbsoluteMajority} onChange={e => changeAbsoluteMajority()} color="primary" />
                </div>
                <div>
                    <InputLabel>Vote Anonyme</InputLabel>
                    <Switch checked={data.isAnonymous}  onChange={e => changeAnonymous()} color="primary" />
                </div>
                <div className="add-choice">
                    <TextField 
                        id="create-vote-title" 
                        label="Nom" 
                        variant="outlined"
                        size="small"
                        onChange={e => setName(e.target.value)} 
                    />
                    <Button variant="contained" color="primary" endIcon={<AddBoxIcon />} sx={{marginLeft: 2}} onClick={() => {setVotesIfNotAlready(votes, name)}}>Ajouter Choix</Button>
                </div>
                <div>
                    {votes.map((vote, key) => (
                        <div>
                            <li>{key +1} : {vote} <Button variant="outlined" color="secondary" endIcon={<DeleteIcon color="primary" />} onClick={() => {deleteVoteChoice(vote, key)}}></Button></li>
                        </div>
                    ))}
                </div>
                <Button 
                type="submit" 
                variant="contained" 
                color="primary"
                onClick={onSubmit}
                >Soumettre</Button>
            </form>
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