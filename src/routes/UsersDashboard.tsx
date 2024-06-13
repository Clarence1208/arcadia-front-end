import {Footer} from "./components/Footer";
import Header from "./components/Header";
import {
    Link,
    TableContainer,
    TableCell,
    Table,
    TableRow,
    TableHead,
    TableBody,
    Button,
    Paper,
    Alert
} from "@mui/material";
import {AddCircleOutline, Edit, Delete} from '@mui/icons-material';
import React, {useContext, useEffect, useState} from "react";
import {UserSessionContext} from "../contexts/user-session";
import Snackbar from "@mui/material/Snackbar";

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
    const [open, setOpen] = useState(false)
    const [users, setUsers] = useState<User[]>([])
    const userSession = useContext(UserSessionContext)?.userSession
    const userToken = userSession?.loginToken
    const userId = userSession?.userId

    async function deleteItem(id: number) {
        const bearer = "Bearer " + userSession?.loginToken;
        const response = await fetch(`${import.meta.env.VITE_API_URL}/users/${id}`, {
            method: "DELETE",
            headers: {
                "Authorization": bearer,
                "Content-Type": "application/json"
            }
        });
        if (!response.ok) {
            const error = await response.json()
            setErrorMessage("Erreur : " + await error.message);
            setOpen(true)
            return
        }
        const res = await response.json();
        setUsers(users.filter((user) => user.id !== id))
        setErrorMessage("Utilisateur supprimé")
        setOpen(true)
    }

    useEffect(() => {
            if (userToken && userId) {
                const getUsers = async (filters?: Filters): Promise<User[]> => {
                    const bearer = "Bearer " + userToken;
                    const response: Response = await fetch(`${import.meta.env.VITE_API_URL}/users`, {
                        headers: {
                            "Authorization": bearer,
                            "Content-Type": "application/json"
                        }
                    });
                    if (!response.ok) {
                        const error = await response.json()
                        setErrorMessage("Erreur : " + await error.message);
                        setOpen(true);
                        return []
                    }
                    const res = await response.json();
                    if (res.length === 0) {
                        setErrorMessage("Aucun utilisateur trouvé")
                        setOpen(true)
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
                    <Snackbar
                        open={open}
                        autoHideDuration={3000}
                        onClose={() => setOpen(false)}
                        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                    >
                        <Alert
                            onClose={() => setOpen(false)}
                            severity="error"
                            variant="filled"
                            sx={{ width: '100%' }}
                        >{errorMessage}</Alert>
                    </Snackbar>
                    <h2>Gestion des utilisateurs</h2>
                    <div style={{display: "flex", alignItems: "center"}}>
                        <p>Vous pouvez gérer les utilisateurs d'ici</p>
                        <Link href={"/register"} style={{marginLeft: "3vw"}}
                              title={"Ajouter un utilisateur"}><AddCircleOutline/></Link>
                    </div>

                    <TableContainer component={Paper} style={{maxHeight: "70vh", overflowY:"scroll"}}>
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
                                            <Button title={"Supprimer"} onClick={()=>deleteItem(user.id)}>{<Delete/>}</Button>
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