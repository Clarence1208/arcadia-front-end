import { useContext, useEffect, useState } from "react";
import '../../styles/PollsList.css';
import {UserSessionContext} from "../../contexts/user-session";
import 'react-clock/dist/Clock.css';
import { Poll } from "./Poll";
import { Pagination } from "@mui/material";

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

    const handleChangePage = (event: React.ChangeEvent<unknown>, value: number) => {
        setPage(value);
    };

    useEffect(() => {
        if (userSession?.loginToken) {
            const getPolls = async (filters?: Filters): Promise<Poll[]> => {
                const bearer = "Bearer " + userSession?.loginToken;
                const response: Response = await fetch(`${process.env.REACT_APP_API_URL}/polls${filters?.page ? "?limit=10&page=" + filters?.page : ""}`, {method: "GET",
                    headers: {
                        "Authorization": bearer,
                        "Content-Type": "application/json"
                    }
                });
                if (!response.ok) {
                    const error = await response.json()
                    // setErrorMessage("Erreur : " + await error.message);
                    return []
                }
                const res = await response.json();
                if (res.length === 0) {
                    console.log("Aucun site web trouvé")
                    //setErrorMessage("Aucun site web trouvé")
                }
                return res;
            }
            getPolls({ page: page }).then(setPolls)
        }
    }, [userSession?.loginToken, page]);

    return (
            <div style={{display:"flex", flexDirection:"column"}}>
                <h1>Sondages :</h1>
                    <div className={"polls-list"}>
                        {polls.length === 0 ? <div>Pas de sondages disponibles...</div> :
                            polls.map(poll => {
                                return <Poll key={poll.id} poll={poll} />
                            })
                        }
                    </div>
                <div style={{marginTop: "2vh", alignSelf:"center"}}>
                    <Pagination count={10} page={page} onChange={handleChangePage}/>
                </div>
            </div>
    )
}
