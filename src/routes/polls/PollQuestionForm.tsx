import {Checkbox, FormControlLabel, TextField} from "@mui/material";
import { useState } from "react";

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

    const isVoteChoiceChecked = (voteChoice: VoteChoice) => {
        return props.responses.some(response => response.id === voteChoice.id);
    };

    const handleChangeName = (e: any) => {
        if(name !== "") {
            props.updateFields({id: 0, name: name, isAlive: false, step: props.question.step, type: "Poll", pollQuestion: props.question}, props.question.nbPossibleVotes)
        }
        if (e.target.value !== "") {
            props.updateFields({id: 0, name: e.target.value, isAlive: false, step: props.question.step, type: "Poll", pollQuestion: props.question}, props.question.nbPossibleVotes)
        }
        setName(e.target.value)
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
                            <label>Autre choix</label>
                            <input type="text" onChange={e => handleChangeName(e)} />
                    </div>

                )}
            </div>
        </div>
    )
}