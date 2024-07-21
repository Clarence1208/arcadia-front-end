import { useContext, useEffect, useState } from "react";
import '../../styles/PollsList.css';
import {UserSessionContext} from "../../contexts/user-session";
import 'react-clock/dist/Clock.css';
import { Poll } from "./Poll";
import {ConfigContext} from "../../index";
import { Alert, Pagination, Snackbar } from "@mui/material";

interface Poll {
    id: number,
    name: string,
    isClosed: boolean,
    users?: User[],
    questions : PollQuestion[]
}

interface User {
    id: number,
    firstName: string,
    lastName: string,
    email: string,
    roles: string[],
}

type PollQuestion = {
    id: number,
    name: string,
}

type Filters = {
    page?: number,
    limit?: number,
}

export function PollList() {

    const userSession = useContext(UserSessionContext)?.userSession
    const [polls, setPolls] = useState<Poll[]>([])
    const [page, setPage] = useState(1);
    const config = useContext(ConfigContext);
    const [ErrorMessage, setErrorMessage] = useState("")
    const [open, setOpen] = useState(false);
    const [total, setTotal] = useState(0);

    const handleChangePage = (event: React.ChangeEvent<unknown>, value: number) => {
        setPage(value);
    };

    useEffect(() => {
        if (userSession?.loginToken) {
            const getPolls = async (filters?: Filters): Promise<Poll[]> => {
                const bearer = "Bearer " + userSession?.loginToken;
                const response: Response = await fetch(`${config.apiURL}/polls${filters?.page ? "?limit=10&page=" + filters?.page : ""}`, {method: "GET",
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
                setTotal(res.total)
                return res.data;
            }
            getPolls({ page: page }).then(setPolls)
        }
    }, [userSession?.loginToken, page]);

    const handleClose = () => {
        setOpen(false);
    };

    return (
            <div style={{display:"flex", flexDirection:"column"}}>
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
                    >
                        {ErrorMessage}
                    </Alert>
                </Snackbar>
                <h2
                >Sondages :</h2>
                { polls.length === 0 && <div>Pas de sondages disponibles...</div>}
                {polls && polls.length > 0 &&
                    <div className={"polls-list"}>
                            {polls.map(poll => {
                                return <Poll key={poll.id} poll={poll} />
                            })}
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
