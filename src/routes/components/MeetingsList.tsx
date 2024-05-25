import { Pagination } from "@mui/material";
import { Meeting } from "./Meeting";
import { useEffect, useState } from "react";
import '../../styles/MeetingsList.css';

interface Meeting {
    id: number,
    name: string,
    description: string,
    startDate: Date,
    endDate: Date,
    capacity: number,
}

type Filters = {
    page?: number,
    limit?: number,
}


const getMeetings = async (filters?: Filters): Promise<Meeting[]> => {
    const response: Response = await fetch(`${process.env.REACT_APP_API_URL}/meetings${filters?.page ? "?limit=10&page=" + filters?.page : ""}`, {
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

export function MeetingsList() {

    const [meetings, setMeetings] = useState<Meeting[]>([])
    const [page, setPage] = useState(1);

    const handleChangePage = (event: React.ChangeEvent<unknown>, value: number) => {
        setPage(value);
    };

    useEffect(() => {
        getMeetings({ page: page }).then(setMeetings)
    }, [page]);

    return (
        <div className={"meetings-list"}>
            {meetings.length === 0 ? <div>Chargement ou pas d'assemblée générale...</div> :
                <div>
                    {meetings.map((meeting) => (
                        <a href={`/meeting/${meeting.id}`} key={meeting.id} className="meeting-link">
                            <Meeting meeting={meeting} />
                        </a>
                    ))}
                </div>
            }
            <div style={{marginTop: "2vh"}}>
                <Pagination count={10} page={page} onChange={handleChangePage}/>
            </div>
        </div>
    )
}