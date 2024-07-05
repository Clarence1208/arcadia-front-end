import { Alert, Pagination, Snackbar } from "@mui/material";
import { Meeting } from "../meetings/Meeting";
import { useContext, useEffect, useState } from "react";
import '../../styles/MeetingsList.css';
import { UserSessionContext } from "../../contexts/user-session";
import { Premise } from "./Premise";
import { ConfigContext } from "../../index";

interface Premise {
    name: string,
    description: string,
    adress: string,
    type: string,
    capacity: number,
}

type Filters = {
    page?: number,
    limit?: number,
}

export function PremisesList() {

    const [premises, setPremises] = useState<Premise[]>([])
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
        const getPremises = async (filters?: Filters): Promise<Premise[]> => {
            const bearer = "Bearer " + userSession?.loginToken;
            const response: Response = await fetch(`${config.apiURL}/premises${filters?.page ? "?limit=10&page=" + filters?.page : ""}`, {
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
            setErrorMessage("Aucune salle trouvée")
        }
        setTotal(res.total)
        return res.data;
        }
        getPremises({ page: page }).then(setPremises)
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
            {premises.length === 0 ? <div>Chargement ou pas de salles...</div> :
                <div>
                    {premises.map((premise) => (
                        <Premise premise={premise} />
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