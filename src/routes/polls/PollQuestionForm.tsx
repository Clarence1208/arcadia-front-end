import {Checkbox, FormControlLabel} from "@mui/material";

type VoteChoice = {
    id: number,
    name: string,
    step: number,
    type: string,
}

type FormData = {
    responses: VoteChoice[]
}

type PollQuestion = {
    id: number,
    name: string,
    step: number,
    nbPossibleVotes: number,
    voteChoices: VoteChoice[],
}

type PollQuestionFormProps = FormData & {
    question : PollQuestion,
    updateFields: (voteChoiceData: VoteChoice, limit: number) => void,
}

export function PollQuestionForm(props : PollQuestionFormProps) {

    const isVoteChoiceChecked = (voteChoice: VoteChoice) => {
        return props.responses.some(response => response.id === voteChoice.id);
    };

    return (
        <div className="form-base">
            <h1>{props.question.name} :</h1>
            <h4>(Nombre de choix possibles : {props.question.nbPossibleVotes})</h4>
            <div>
                {props.question.voteChoices.map((voteChoice, index) => {
                    return (
                        <div key={voteChoice.id}>
                            <FormControlLabel checked={isVoteChoiceChecked(voteChoice)} onChange={() => props.updateFields(voteChoice, props.question.nbPossibleVotes)} control={<Checkbox />} label={voteChoice.name} />
                        </div>
                    )
                })}
            </div>
        </div>
    )
}