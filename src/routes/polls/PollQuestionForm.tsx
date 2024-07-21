import {Checkbox, FormControlLabel, TextField} from "@mui/material";
import { useEffect, useState } from "react";

type VoteChoice = {
    id: number,
    name: string,
    isAlive: boolean,
    step: number,
    type: string,
    pollQuestion : PollQuestion,
}

type FormData = {
    responses: VoteChoice[]
}

type PollQuestion = {
    id: number,
    name: string,
    step: number,
    nbPossibleVotes: number,
    canFreeVote: boolean,
    voteChoices: VoteChoice[],
}

type PollQuestionFormProps = FormData & {
    question : PollQuestion,
    updateFields: (voteChoiceData: VoteChoice, limit: number) => void,
}

export function PollQuestionForm(props : PollQuestionFormProps) {

    const [name, setName] = useState("")

    useEffect(() => {
        setName("")
    } , [props.question])

    const isVoteChoiceChecked = (voteChoice: VoteChoice) => {
        return props.responses.some(response => response.id === voteChoice.id);
    };

    const handleChangeName = (value: string) => {
        if (value !== "") {
            props.updateFields({id: 0, name: value, isAlive: false, step: props.question.step, type: "Poll", pollQuestion: props.question}, props.question.nbPossibleVotes)
        }
        setName(value)
    }

    return (
        <div className="form-base">
            <h1>{props.question.name} :</h1>
            <h4>(Nombre de choix possibles : {props.question.nbPossibleVotes})</h4>
            <div>
            {props.question.voteChoices.map((voteChoice) =>
                voteChoice.isAlive &&
                    (
                        <div key={voteChoice.id}>
                            <FormControlLabel checked={isVoteChoiceChecked(voteChoice)} onChange={() => props.updateFields(voteChoice, props.question.nbPossibleVotes)} control={<Checkbox />} label={voteChoice.name} />
                        </div>
                    )
                )}
            </div>
            <div>
                {props.question.canFreeVote && (
                    <div>
                        <h4>Choix libre (faculatatif):</h4>
                            <label style={{marginRight: "1em"}}>Autre choix</label>
                            <input type="text" value={name} onChange={e => handleChangeName(e.target.value)} />
                    </div>

                )}
            </div>
        </div>
    )
}