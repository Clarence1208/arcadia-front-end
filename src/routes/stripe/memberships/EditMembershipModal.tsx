import React, {useContext, useEffect, useState} from "react";
import {Button, Modal, Paper, TextField} from "@mui/material";
import {Settings} from "@mui/icons-material";
import {ConfigContext} from "../../../index";

// TODO: Fix edit... good luck future me i am tired of it rn but it should be easy
export function EditMembershipModal({settings, setMemberships,setting, open, handleClose, loginToken, setErrorMessage, setOpenError}: {settings: any[], setMemberships: (settings: any[]) => void ,setting: any |undefined, open: boolean, handleClose: () => void, loginToken: string | undefined, setErrorMessage: (message: string) => void, setOpenError: (open: boolean) => void}) {
    const config = useContext(ConfigContext);
    const [data, setData] = useState<any |undefined>(setting)

    useEffect(
        () => {
            if (setting){
                setData(setting)
            }
        }, [setting]
    )
    function updateFields(fields: Partial<any>) {
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
        const response: Response = await fetch( config.apiURL+"/stripe/memberships/"+data?.id, {
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

        const setting = await response.json()
        setErrorMessage("Adhésion modifié avec succès");
        setOpenError(true);
        handleClose();
        setMemberships(settings.map((s : any) => s.id === setting.id ? setting : s))
        return;

    }
    return (
        <Modal
            open={open}
            onClose={handleClose}
            aria-labelledby="modal-edit-membership"
            aria-describedby="modale to edit a membership"
            id="modal-edit-setting"
        >
            <Paper elevation={1} className={"paper"} >
                <h1><Settings />  Editer l'adhésion </h1>
                <form id="settings-form" onSubmit={onSubmit} >
                    <TextField
                        id="create-setting-title"
                        label="Nom de l'adéhsion"
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
                    label="Prix par mois"
                    variant="outlined"
                    multiline
                    style={{ width: "30vw"}}
                    value={data?.default_price.unit_amount / 100}
                    onChange={e => updateFields({ default_price_data: { currency: "eur", unit_amount: parseInt(e.target.value), recurring: { interval: "month", interval_count: 1 } } })}
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