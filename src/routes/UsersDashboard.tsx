import {Footer} from "./components/Footer";
import Header from "./components/Header";
import {Link, TableContainer, TableCell, Table, TableRow, TableHead, TableBody, Button, Paper} from "@mui/material";
import {AddCircleOutline, Edit, Delete} from '@mui/icons-material';
import {useContext, useEffect, useState} from "react";
import {UserSessionContext} from "../contexts/user-session";

type User = {
    id: number,
    firstName: string,
    surname: string,
    email: string,
    roles: string,
}
type Filters ={
    page?: number,
    limit?: number,
}
export function UsersDashboard() {
    const [errorMessage, setErrorMessage] = useState<string>("")
    const [users, setUsers] = useState<User[]>([])
    const userSession = useContext(UserSessionContext)?.userSession
    const userToken = userSession?.loginToken
    const userId = userSession?.userId

    useEffect(() => {
            if (userToken && userId) {
                const getUsers = async (filters?: Filters): Promise<User[]> => {
                    const bearer = "Bearer " + userToken;
                    const response: Response = await fetch(`${process.env.REACT_APP_API_URL}/users`, {
                        headers: {
                            "Authorization": bearer,
                            "Content-Type": "application/json"
                        }
                    });
                    if (!response.ok) {
                        const error = await response.json()
                        console.log(error)
                        setErrorMessage("Erreur : " + await error.message);
                        return []
                    }
                    const res = await response.json();
                    if (res.length === 0) {
                        setErrorMessage("Aucun site web trouvé")
                    }
                    return res;
                }
                getUsers().then(setUsers)
            }
        }
        , [userToken, userId])

    if (users.length === 0) {
        return <div>Loading...</div>
    } else {
        return (

                <div>
                    <h2>Gestion des utilisateurs</h2>
                    <div style={{display: "flex", alignItems: "center"}}>
                        <p>Vous pouvez gérer les utilisateurs d'ici</p>
                        <Link href={"/users/new"} style={{marginLeft: "3vw"}}
                              title={"Ajouter un utilisateur"}><AddCircleOutline/></Link>
                    </div>
                    {errorMessage && <div className="error">{errorMessage}</div>}

                    <TableContainer component={Paper}>
                        <Table sx={{minWidth: 650}} aria-label="simple table">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Nom complet</TableCell>
                                    <TableCell align="right">E-mail</TableCell>
                                    <TableCell align="right">Role</TableCell>
                                    <TableCell align="right">Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {users.map((user) => (
                                    <TableRow
                                        key={user.id}
                                        sx={{'&:last-child td, &:last-child th': {border: 0}}}
                                    >
                                        <TableCell component="th" scope="row">
                                            {user.firstName + " " + user.surname}
                                        </TableCell>
                                        <TableCell component="th" scope="row">
                                            {user.email}
                                        </TableCell>
                                        <TableCell align="right">
                                            {user.roles}
                                        </TableCell>
                                        <TableCell align="right">
                                            <Button title={"Modifier"}><Edit/></Button>
                                            <Button title={"Supprimer"}>{<Delete/>}</Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </div>
        )
    }
}