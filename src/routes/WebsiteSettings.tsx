import {
    Alert,
    Button,
    Modal,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Snackbar
} from "@mui/material";
import {AddCircleOutline, Delete, Edit, Settings} from "@mui/icons-material";
import React, {useContext, useEffect, useState} from "react";
import {UserSessionContext} from "../contexts/user-session";

import "../styles/WebsiteSettings.css";

type WebsiteSettings = {
    id?: number,
    name: string,
    description?: string,
    value: string,
    type?: string
}
type PatchSetting = {
    name?: string,
    description?: string,
    value?: string,
    type?: string

}

function CreateSettingModal({settings, setSettings, open, handleClose, loginToken, setErrorMessage, setOpenError}: {settings: WebsiteSettings[], setSettings: (settings: WebsiteSettings[]) => void, open: boolean, handleClose: () => void, loginToken: string | undefined, setErrorMessage: (message: string) => void, setOpenError: (open: boolean) => void}) {
    const [data, setData] = useState<WebsiteSettings>({
        name: "",
        value: "",
    })

    function updateFields(fields: Partial<WebsiteSettings>) {
        setData(prev => {
            return { ...prev, ...fields }
        })
    }
    async function onSubmit(e: React.FormEvent) {
        e.preventDefault()

        const bearer = "Bearer " + loginToken;
        const response: Response = await fetch( import.meta.env.VITE_API_URL+"/websiteSettings", {
            method: "POST",
            body: JSON.stringify(data),
            headers: {
                "Content-Type": "application/json",
                "Authorization": bearer,
            }
        });
        if (!response.ok) {
            const error =  await response.json()
            setErrorMessage("Erreur : " + await error.message);
            setOpenError(true)
            return;
        }
        const setting = await response.json() //new setting
        setSettings([...settings, setting])
        setErrorMessage("Paramètre créé avec succès");
        setOpenError(true);
        handleClose();
        return;

    }
    return (
        <Modal
            open={open}
            onClose={handleClose}
            aria-labelledby="modal-create-setting"
            aria-describedby="modale to create a setting"
            id="modal-create-setting"
        >
                <Paper elevation={1} className={"paper"} >
                    <h1><Settings />  Créer un paramètre </h1>
                    <form id="settings-form" onSubmit={onSubmit} >
                        <TextField
                            id="create-setting-title"
                            label="Titre"
                            variant="outlined"
                            size="small"
                            style={{ width: "30vw"}}
                            onChange={e => updateFields({ name: e.target.value })}
                        />
                        <TextField
                            label="Description"
                            variant="outlined"
                            multiline
                            rows={3}
                            style={{ width: "30vw"}}
                            onChange={e => updateFields({ description: e.target.value })}
                        /><TextField
                            label="Valeur"
                            variant="outlined"
                            multiline
                            style={{ width: "30vw"}}
                            onChange={e => updateFields({ value: e.target.value })}
                        />
                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            style={{ width: "20vw", marginBottom: "2vh"}}
                            // onClick={onSubmit}
                        >Soumettre</Button>
                    </form>
                </Paper>
        </Modal>
    )
}

function EditSettingModal({settings, setSettings,setting, open, handleClose, loginToken, setErrorMessage, setOpenError}: {settings: WebsiteSettings[], setSettings: (settings: WebsiteSettings[]) => void ,setting: WebsiteSettings |undefined, open: boolean, handleClose: () => void, loginToken: string | undefined, setErrorMessage: (message: string) => void, setOpenError: (open: boolean) => void}) {

    const [data, setData] = useState<WebsiteSettings |undefined>(setting)

    useEffect(
        () => {
            if (setting){
                setData(setting)
            }
        }, [setting]
    )
    console.log(data)
    function updateFields(fields: Partial<WebsiteSettings>) {
        if (data){
            // @ts-ignore
            setData(prev => {
                return { ...prev, ...fields }
            })
        }
    }
    async function onSubmit(e: React.FormEvent) {
        e.preventDefault()

        const bearer = "Bearer " + loginToken;
        const response: Response = await fetch( import.meta.env.VITE_API_URL+"/websiteSettings/"+data?.id, {
            method: "PATCH",
            body: JSON.stringify(data),
            headers: {
                "Content-Type": "application/json",
                "Authorization": bearer,
            }
        });
        if (!response.ok) {
            const error =  await response.json()
            setErrorMessage("Erreur : " + await error.message);
            setOpenError(true)
            return;
        }

        const setting = await response.json() //updated setting
        setErrorMessage("Paramètre modifié avec succès");
        setOpenError(true);
        handleClose();
        setSettings(settings.map((s : WebsiteSettings) => s.id === setting.id ? setting : s))
        return;

    }
    return (
        <Modal
            open={open}
            onClose={handleClose}
            aria-labelledby="modal-edit-setting"
            aria-describedby="modale to edit a setting"
            id="modal-edit-setting"
        >
            <Paper elevation={1} className={"paper"} >
                <h1><Settings />  Editer le paramètre </h1>
                <form id="settings-form" onSubmit={onSubmit} >
                    <TextField
                        id="create-setting-title"
                        label="Titre"
                        variant="outlined"
                        size="small"
                        style={{ width: "30vw"}}
                        value={data?.name}
                        onChange={e => updateFields({ name: e.target.value })}
                    />
                    <TextField
                        label="Description"
                        variant="outlined"
                        multiline
                        rows={3}
                        style={{ width: "30vw"}}
                        value={data?.description}
                        onChange={e => updateFields({ description: e.target.value })}
                    /><TextField
                    label="Valeur"
                    variant="outlined"
                    multiline
                    style={{ width: "30vw"}}
                    value={data?.value}
                    onChange={e => updateFields({ value: e.target.value })}
                />
                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        style={{ width: "20vw", marginBottom: "2vh"}}
                        // onClick={onSubmit}
                    >Soumettre</Button>
                </form>
            </Paper>
        </Modal>
    )
}
export function WebsiteSettings() {
    const [settings, setSettings] = useState<WebsiteSettings[]>([])
    const [openModal, setOpenModal] = useState(false)
    const [openEditModal, setOpenEditModal] = useState(false)
    const handleOpenModal = () => setOpenModal(true)
    const handleCloseModal = () => setOpenModal(false)
    const handleCloseEditModal = () => setOpenEditModal(false)
    const [errorMessage, setErrorMessage] = useState<string>("")
    const [openError, setOpenError] = useState(false)
    const userSession = useContext(UserSessionContext)?.userSession
    const userToken = userSession?.loginToken
    const userId = userSession?.userId
    const [selectedSetting, setSelectedSetting] = useState<WebsiteSettings>()

    function handleEditClicked(setting: WebsiteSettings) {
        setSelectedSetting(setting)
        setOpenEditModal(true)
    }

    useEffect(() => {
            if (userToken && userId) {
                const getSettings = async (): Promise<WebsiteSettings[]> => {
                    const bearer = "Bearer " + userToken;
                    const response: Response = await fetch(`${import.meta.env.VITE_API_URL}/websiteSettings`, {
                        headers: {
                            "Authorization": bearer,
                            "Content-Type": "application/json"
                        }
                    });
                    if (!response.ok) {
                        const error = await response.json()
                        console.log(error)
                        setErrorMessage("Erreur : " + await error.message);
                        setOpenError(true)
                        return []
                    }
                    const res = await response.json();
                    if (res.length === 0) {
                        setErrorMessage("Aucun paramètre trouvé")
                        setOpenError(true)
                    }
                    return res;
                }
                getSettings().then(setSettings)
            }
        }
        , [userToken, userId])

    return (
        <div>
            <CreateSettingModal open={openModal} handleClose={handleCloseModal}
                                setErrorMessage={setErrorMessage} loginToken={userToken}
                                setOpenError={setOpenError}
                                setSettings={setSettings}
                                settings={settings}/>
            <EditSettingModal open={openEditModal} handleClose={handleCloseEditModal}
                                setErrorMessage={setErrorMessage} loginToken={userToken}
                                setOpenError={setOpenError}
                                setSettings={setSettings}
                                settings={settings}
                                setting={selectedSetting}/>
            <Snackbar
                open={openError}
                autoHideDuration={3000}
                onClose={() => setOpenError(false)}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                <Alert
                    onClose={() => setOpenError(false)}
                    severity="warning"
                    variant="filled"
                    sx={{ width: '100%' }}
                >{errorMessage}</Alert>
            </Snackbar>
            <div>
                <h2>Gestion des paramètres du site</h2>
                <div style={{display: "flex", alignItems: "center"}}>
                    <p>Vous pouvez gérer les paramètres du site d'ici</p>
                    <Button onClick={handleOpenModal} title={"Ajouter un paramètre"}><AddCircleOutline/></Button>
                </div>

                <TableContainer component={Paper}>
                    <Table aria-label="website settings table">
                        <TableHead>
                            <TableRow>
                                <TableCell>Paramètre</TableCell>
                                <TableCell align="right">Description</TableCell>
                                <TableCell align="right">Valeur</TableCell>
                                <TableCell align="right">Type</TableCell>
                                <TableCell align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {settings.map((setting) => (
                                <TableRow
                                    key={setting.id}
                                    sx={{'&:last-child td, &:last-child th': {border: 0}}}
                                >
                                    <TableCell scope="row">
                                        {setting.name}
                                    </TableCell>
                                    <TableCell align="right">{setting.description}</TableCell>
                                    <TableCell align="right">{setting.value}</TableCell>
                                    <TableCell align="right">{setting.type}</TableCell>
                                    <TableCell align="right">
                                        <Button title={"Modifier"} onClick={()=>handleEditClicked(setting)}><Edit/></Button>
                                        {/*<Button title={"Supprimer"}>{<Delete/>}</Button>*/}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </div>
        </div>
    )
}