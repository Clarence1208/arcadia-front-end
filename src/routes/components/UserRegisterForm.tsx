import {Alert, IconButton, InputAdornment, InputLabel, MenuItem, OutlinedInput, Select, TextField, Tooltip} from "@mui/material";
import Collapse from '@mui/material/Collapse';
import HelpIcon from '@mui/icons-material/Help';
import "../../styles/Form.css"
import {useContext, useState} from "react";
import {DatePicker} from "@mui/x-date-pickers";
import {Dayjs, isDayjs} from "dayjs";
import {UserSessionContext} from "../../contexts/user-session";
import { Visibility, VisibilityOff } from "@mui/icons-material";

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
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleClickShowPassword = () => setShowPassword((show) => !show);
    const handleClickShowConfirmPassword = () => setShowConfirmPassword((show) => !show);

    const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
      };

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
                <TextField className="form-input" color="primary" variant="outlined" label="Prénom" autoFocus required type="text" value={props.firstName} onChange={e => props.updateFields({ firstName: e.target.value })} />
                <TextField className="form-input" variant="outlined" label="Nom de famille" required type="text" value={props.surname} onChange={e => props.updateFields({ surname: e.target.value })} />
                <TextField className="form-input" variant="outlined" label="E-mail" required type="email" value={props.email} onChange={e => props.updateFields({email: e.target.value})}/>
                <div>
                <InputLabel htmlFor="outlined-adornment-password">Password</InputLabel>
                <OutlinedInput
                    id="outlined-adornment-password"
                    type={showPassword ? 'text' : 'password'}
                    onChange={e => props.updateFields({password: e.target.value})}
                    sx={{width: '25vw'}} 
                    endAdornment={
                    <InputAdornment position="end">
                        <IconButton
                        aria-label="toggle password visibility"
                        onClick={handleClickShowPassword}
                        onMouseDown={handleMouseDownPassword}
                        edge="end"
                        >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                    </InputAdornment>
                    }
                    label="Password"
                    />
                </div>
                <div>
                <InputLabel htmlFor="outlined-adornment-password">Confirm Password</InputLabel>
                <OutlinedInput
                    id="outlined-adornment-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    onChange={e => props.updateFields({confirmPassword: e.target.value})}
                    sx={{width: '25vw'}} 
                    endAdornment={
                    <InputAdornment position="end">
                        <IconButton
                        aria-label="toggle password visibility"
                        onClick={handleClickShowConfirmPassword}
                        onMouseDown={handleMouseDownPassword}
                        edge="end"
                        >
                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                    </InputAdornment>
                    }
                    label="Confirm Password"
                    />
                </div>

                {userSession?.roles.includes("admin") &&
                    <div>
                        <InputLabel id="role-select-label">Rôle</InputLabel>
                        <Select className="form-input" variant="outlined" label="Role" value={props.roles} style={{width: "13vw"}} onChange={e => props.updateFields({roles: e.target.value})}>
                            <MenuItem value="adherent">Adhérent</MenuItem>
                            <MenuItem value="admin">Admin</MenuItem>
                            {userSession?.roles.includes("superadmin") && <MenuItem value="superadmin">Super admin</MenuItem> }
                            <MenuItem value="servicesManager">Gestionnaire de contenus</MenuItem>
                        </Select>
                    </div>}

                <DatePicker
                    className="form-input"
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