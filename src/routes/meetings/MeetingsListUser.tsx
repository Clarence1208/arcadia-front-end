import '../../styles/MeetingsList.css';
import {ConfigContext} from "../../index";
import {Alert, Button, Pagination, Snackbar} from "@mui/material";
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
    adress: string,
    type: string,
    capacity: number,
}

type Filters = {
    page?: number,
    limit?: number,
}

export function MeetingsListUser() {

    const userSession = useContext(UserSessionContext)?.userSession
    const [meetings, setMeetings] = useState<Meeting[]>([])
    const [pastMeetings, setPastMeetings] = useState<Meeting[]>([])
    const [currentMeetings, setCurrentMeetings] = useState<Meeting[]>([])
    const [futureMeetings, setFutureMeetings] = useState<Meeting[]>([])
    const [page, setPage] = useState(1);
    const [open, setOpen] = useState(false);
    const [ErrorMessage, setErrorMessage] = useState("")

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

    const handleClose = () => {
        setOpen(false)
    }

    const [showMeetings, setShowMeetings] = useState([{
        past: false,
        current: true,
        future: false,
    }])
    const changeDisplayedMeetings = (event: React.MouseEvent<HTMLButtonElement>) => {
        const button = event.currentTarget;

        if (button.textContent === "Passées") {
            setShowMeetings([{
                past: true,
                current: false,
                future: false
            }])
        } else if (button.textContent === "En cours") {
            setShowMeetings([{
                past: false,
                current: true,
                future: false
            }])
        } else {
            setShowMeetings([{
                past: false,
                current: false,
                future: true
            }])
        }

    }

    useEffect(() => {
        if (!userSession?.loginToken) {
            return;
        }
        const getMeetings = async (filters?: Filters): Promise<Meeting[]> => {
            const config = useContext(ConfigContext);
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
            return res;
        }
        getMeetings({ page: page }).then(setDateMeetings)
    }, [page, userSession?.loginToken]);

    return (
            <div className={""}>
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
                    <div className={"meetings-list-user"}>
                        <h2 className={""}>Liste des assemblées générales :</h2>
                        <div>
                            <Button className={"active"} onClick={changeDisplayedMeetings}>En cours</Button>
                            <Button onClick={changeDisplayedMeetings}>Passées</Button>
                            <Button onClick={changeDisplayedMeetings}>Futures</Button>
                        </div>

                        {
                            showMeetings[0].past ?
                                <div style={{minHeight: "50vh"}}>
                                <h3>Assemblées générales passées :</h3>
                                    {pastMeetings.map((meeting) => (
                                        <Meeting meeting={meeting} />
                                    ))}
                                    <Pagination style={{marginTop: "10vh"}} count={10} page={page} onChange={handleChangePage}/>
                            </div> : null
                        }

                        {
                            showMeetings[0].current ?
                                <div style={{minHeight: "50vh"}}>
                                <h3>Assemblées générales en cours :</h3>
                                    {currentMeetings.map((meeting) => (
                                        <Meeting meeting={meeting} />
                                    ))}
                                    <Pagination style={{marginTop: "10vh"}} count={10} page={page} onChange={handleChangePage}/>
                            </div> : null
                        }

                        {
                            showMeetings[0].future ?
                                <div style={{minHeight: "50vh"}}>
                                <h3>Assemblées générales à venir :</h3>
                                    {futureMeetings.map((meeting) => (
                                        <Meeting meeting={meeting} />
                                    ))}
                                    <Pagination style={{marginTop: "10vh"}} count={10} page={page} onChange={handleChangePage}/>
                            </div> : null
                        }
                    </div>
            </div>
    )
}