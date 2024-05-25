import { Button, Pagination } from "@mui/material";
import { useContext, useEffect, useState } from "react";
import '../styles/VotesList.css';
import { useNavigate, useParams } from "react-router-dom";
import { Footer } from "./components/Footer";
import Header from "./components/Header";
import {UserSessionContext} from "../contexts/user-session";
import AddBoxIcon from '@mui/icons-material/AddBox';
import { Vote } from "./components/Vote";

interface Vote {
    name: string,
}

type Filters = {
    page?: number,
    limit?: number,
}


const getMeetings = async (meetingId: string, filters?: Filters): Promise<Vote[]> => {
    const response: Response = await fetch(`${process.env.REACT_APP_API_URL}/votes/${meetingId}${filters?.page ? "?limit=10&page=" + filters?.page : ""}`, {
        headers: {
            //"Authorization": bearer,
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

export function MeetingVotesList() {

    const userSession = useContext(UserSessionContext)?.userSession
    const [votes, setVotes] = useState<Vote[]>([])
    const [page, setPage] = useState(1);
    const navigate = useNavigate();
    const { id } = useParams();

    const handleChangePage = (event: React.ChangeEvent<unknown>, value: number) => {
        setPage(value);
    };

    useEffect(() => {
        if(id === null || id === undefined || id === ""){
            navigate('/meetings')
            return
        }
        getMeetings(id, { page: page}).then(setVotes)
    }, [page]);

    return (
        <div>
            <Header />
                <div className={"main"}>
                    <h1>Votes :</h1>
                        {userSession?.roles.includes("admin") || userSession?.roles.includes("superadmin") ?
                            <div>
                                <Button 
                                href={"/meeting/"+id+"/createVote"}
                                variant="contained"
                                color="primary"
                                endIcon={<AddBoxIcon />}>
                                    Créez un vote
                                </Button>
                            </div> : null
                        }
                        <div className={"votes-list"}>
                            {votes.length === 0 ? <div>Chargement ou pas de votes...</div> :
                                <div>
                                    {votes.map((vote) => (
                                        <Vote vote={vote} />
                                    ))}
                                </div>
                            }
                            <div style={{marginTop: "2vh"}}>
                                <Pagination count={10} page={page} onChange={handleChangePage}/>
                            </div>
                        </div>
                </div>
            <Footer />
        </div>
    )
}
