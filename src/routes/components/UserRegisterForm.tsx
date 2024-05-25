import {Alert, IconButton, TextField, Tooltip} from "@mui/material";
import Collapse from '@mui/material/Collapse';
import HelpIcon from '@mui/icons-material/Help';
import "../../styles/Form.css"
import {useState} from "react";
import {DatePicker} from "@mui/x-date-pickers";
import {Dayjs, isDayjs} from "dayjs";

type UserData = {
    firstName: string
    surname: string
    email: string
    password: string,
    birthDate: Dayjs | null
}

type UserFormProps = UserData & {
    formTitle: string,
    formDescription: string,
    formError: string,
    updateFields: (fields: Partial<UserData>) => void
}

export function UserRegisterForm(props: UserFormProps){
    const [open, setOpen] = useState(true);

    return (
        <div className="form-base">
            <div className="form-header">
                <h2>{props.formTitle}</h2>
                <Tooltip title="Enter details about the user account.">
                    <IconButton>
                        <HelpIcon />
                    </IconButton>
                </Tooltip>
            </div>
            <p>{props.formDescription}</p>
            {props.formError && <Collapse in={open}><Alert className="alert" onClose={() => setOpen(false)} severity="error">{props.formError}</Alert></Collapse>}
            <div className="form-inputs">
                <TextField color="primary" variant="outlined" label="First name" autoFocus required type="text" value={props.firstName} onChange={e => props.updateFields({ firstName: e.target.value })} />
                <TextField variant="outlined" label="Surname" required type="text" value={props.surname} onChange={e => props.updateFields({ surname: e.target.value })} />
                <TextField variant="outlined" label="Email" required type="email" value={props.email} onChange={e => props.updateFields({email: e.target.value})}/>
                <TextField variant="outlined" label="Password" required type="password" value={props.password} onChange={e => props.updateFields({password: e.target.value})}/>
                <TextField variant="outlined" label="Confirm password" required type="password" value={props.password} onChange={e => props.updateFields({password: e.target.value})}/>
                <DatePicker
                    label="Birthdate"
                    onChange={(newValue) => {
                        if (isDayjs(newValue) || newValue === null) {
                            props.updateFields({ birthDate: newValue });
                        }
                    }}
                />
            </div>
        </div>
    )
}