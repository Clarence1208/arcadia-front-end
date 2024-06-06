import {Alert, IconButton, MenuItem, Select, TextField, Tooltip} from "@mui/material";
import Collapse from '@mui/material/Collapse';
import HelpIcon from '@mui/icons-material/Help';
import "../../styles/Form.css"
import {useContext, useState} from "react";
import {DatePicker} from "@mui/x-date-pickers";
import {Dayjs, isDayjs} from "dayjs";
import {UserSessionContext} from "../../contexts/user-session";

type UserData = {
    firstName: string
    surname: string
    email: string
    password: string,
    confirmPassword?: string,
    birthDate: Dayjs | null,
    roles?: string
}

type UserFormProps = UserData & {
    formTitle: string,
    formDescription: string,
    formError: string,
    updateFields: (fields: Partial<UserData>) => void
}

export function UserRegisterForm(props: UserFormProps){
    const [open, setOpen] = useState(true);
    const userSession = useContext(UserSessionContext)?.userSession;


    return (
        <div className="form-base">
            <div className="form-header">
                <h2>{props.formTitle}</h2>
                <Tooltip title="Pour créer un compte avec d'autres droits, veuillez contacter un administrateur">
                    <IconButton>
                        <HelpIcon />
                    </IconButton>
                </Tooltip>
            </div>
            <p>{props.formDescription}</p>
            {props.formError && <Collapse in={open}><Alert className="alert" onClose={() => setOpen(false)} severity="error">{props.formError}</Alert></Collapse>}
            <div className="form-inputs">
                <TextField color="primary" variant="outlined" label="Prénom" autoFocus required type="text" value={props.firstName} onChange={e => props.updateFields({ firstName: e.target.value })} />
                <TextField variant="outlined" label="Nom de famille" required type="text" value={props.surname} onChange={e => props.updateFields({ surname: e.target.value })} />
                <TextField variant="outlined" label="E-mail" required type="email" value={props.email} onChange={e => props.updateFields({email: e.target.value})}/>
                <TextField variant="outlined" label="Mot de passe" required type="password" value={props.password} onChange={e => props.updateFields({password: e.target.value})}/>
                <TextField variant="outlined" label="Confirmation du mot de passe" required type="password" onChange={e => props.updateFields({confirmPassword: e.target.value})}/>

                {userSession?.roles.includes("admin") &&
                    <Select variant="outlined" label="Role" value={props.roles} style={{width: "13vw"}} onChange={e => props.updateFields({roles: e.target.value})}>
                        <MenuItem value="adherent">Adhérent</MenuItem>
                        <MenuItem value="admin">Admin</MenuItem>
                        {userSession?.roles.includes("superAdmin") && <MenuItem value="superAdmin">Super admin</MenuItem> }
                        <MenuItem value="servicesManager">Gestionnaire de contenus</MenuItem>
                    </Select>}

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