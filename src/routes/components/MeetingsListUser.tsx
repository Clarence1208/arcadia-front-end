import { Pagination } from "@mui/material";
import { Meeting } from "./Meeting";
import { useContext, useEffect, useState } from "react";
import '../../styles/MeetingsList.css';
import Header from "./Header";
import { Footer } from "./Footer";
import { UserSessionContext } from "../../contexts/user-session";

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

export function MeetingsListUser() {

    const [meetings, setMeetings] = useState<Meeting[]>([])
    const [pastMeetings, setPastMeetings] = useState<Meeting[]>([])
    const [currentMeetings, setCurrentMeetings] = useState<Meeting[]>([])
    const [futureMeetings, setFutureMeetings] = useState<Meeting[]>([])
    const [page, setPage] = useState(1);

    const handleChangePage = (event: React.ChangeEvent<unknown>, value: number) => {
        setPage(value);
    };

    const setDateMeetings = (meetings: Meeting[]) => {
        setMeetings(meetings)
        setPastMeetings([])
        setCurrentMeetings([])
        setFutureMeetings([])
        meetings.forEach(meeting => {
            if (new Date(meeting.endDate) < new Date()) {
                setPastMeetings((pastMeetings) => [...pastMeetings, meeting])
            } else if (new Date(meeting.startDate) < new Date()) {
                setCurrentMeetings((currentMeetings) => [...currentMeetings, meeting])
            } else {
                setFutureMeetings((futureMeetings) => [...futureMeetings, meeting])
            }
        });
    }

    useEffect(() => {
        getMeetings({ page: page }).then(setDateMeetings)
    }, [page]);

    return (
        <div>
            <Header />
            <div className={"main"}>
                    <div className={"meetings-list"}>
                        <h1 className={"title"}>Liste des assemblées générales :</h1>
                        {meetings.length === 0 ? <div>Chargement ou pas d'assemblée générale...</div> :
                            <div>
                                {futureMeetings.length !== 0 ?
                                    <div>
                                        <h2>Assemblées générales à venir :</h2>
                                            {futureMeetings.map((meeting) => (
                                                <Meeting meeting={meeting} />
                                            ))}
                                    </div>
                                    : null}
                                {currentMeetings.length !== 0 ?
                                <div>
                                    <h2>Assemblées générales en cours :</h2>
                                        {currentMeetings.map((meeting) => (
                                            <Meeting meeting={meeting} />
                                        ))}
                                </div>
                                : null}
                                {pastMeetings.length !== 0 ?
                                <div>
                                    <h2>Assemblées générales passées :</h2>
                                        {pastMeetings.map((meeting) => (
                                            <Meeting meeting={meeting} />
                                        ))}
                                </div>
                                : null}
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