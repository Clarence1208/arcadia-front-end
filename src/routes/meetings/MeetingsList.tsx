import '../../styles/MeetingsList.css';
import {ConfigContext} from "../../index";
import { Alert, Pagination, Snackbar } from "@mui/material";
import { Meeting } from "./Meeting";
import { useContext, useEffect, useState } from "react";
import '../../styles/MeetingsList.css';
import { UserSessionContext } from "../../contexts/user-session";

interface Meeting {
    id: number,
    name: string,
    description: string,
    startDate: Date,
    endDate: Date,
    capacity: number,
    premise : Premise,
}

interface Premise {
    name: string,
    description: string,
    address: string,
    type: string,
    capacity: number,
}  

type Filters = {
    page?: number,
    limit?: number,
}

export function MeetingsList() {

    const [meetings, setMeetings] = useState<Meeting[]>([])
    const [page, setPage] = useState(1);
    const userSession = useContext(UserSessionContext)?.userSession
    const [open, setOpen] = useState(false);
    const [ErrorMessage, setErrorMessage] = useState("")
    const config = useContext(ConfigContext);
    const [total, setTotal] = useState(0);

    const handleChangePage = (event: React.ChangeEvent<unknown>, value: number) => {
        setPage(value);
    };

    useEffect(() => {
        if (!userSession?.loginToken) {
            return;
        }
        const getMeetings = async (filters?: Filters): Promise<Meeting[]> => {
            const bearer = "Bearer " + userSession?.loginToken;
            const response: Response = await fetch(`${config.apiURL}/meetings${filters?.page ? "?limit=10&page=" + filters?.page : ""}`, {
            headers: {
                "Authorization": bearer,
                "Content-Type": "application/json"
            }
        });
        if (!response.ok) {
            const error = await response.json()
            setErrorMessage("Erreur : " + await error.message);
            return []
        }
        const res = await response.json();
        if (res.length === 0) {
            setErrorMessage("Aucun site web trouvé")
        }
        setTotal(res.total)
        return res.data;
        }
        getMeetings({ page: page }).then(setMeetings)
    }, [page, userSession?.loginToken]);

    const handleClose = () => {
        setOpen(false)
    }

    return (
        <div className={"meetings-list"}>
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
            {!meetings ? <div>Chargement ou pas d'assemblée générale...</div> :
                <div>
                    {meetings.map((meeting) => (
                        <Meeting meeting={meeting} />
                    ))}
                </div>
            }
            { total > 10 &&
                <div style={{marginTop: "2vh", alignSelf:"center"}}>
                    <Pagination count={(Math.ceil(total / 10))} page={page} onChange={handleChangePage}/>
                </div>
            }
        </div>
    )
}