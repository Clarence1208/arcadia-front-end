import React, {useContext, useState} from "react";
import {Button, Modal, Paper, TextField} from "@mui/material";
import {Settings} from "@mui/icons-material";
import {ConfigContext} from "../../../index";

type StripePriceDto = {
    currency: string;
    unit_amount: number;
    recurring: {
        interval: string;
        interval_count: number;
    };
}
type MembershipDTO = {
    name: string;
    description: string;
    default_price_data: StripePriceDto | null;
}
type ModalProps = {accountId: string,
    memberships: any[],
    setMemberships: (memberships: any[]) => void,
    open: boolean,
    handleClose: () => void,
    loginToken: string | undefined,
    setErrorMessage: (message: string) => void,
    setOpenError: (open: boolean) => void
}

export function CreateMembershipModal({accountId, setMemberships, memberships, open, handleClose, loginToken, setErrorMessage, setOpenError}: ModalProps) {
    const config = useContext(ConfigContext);
    const [data, setData] = useState<MembershipDTO>({
        name: "",
        description: "",
        default_price_data: null,
    })

    function updateFields(fields: Partial<MembershipDTO>) {
        setData(prev => {
            return { ...prev, ...fields }
        })
    }
    async function onSubmit(e: React.FormEvent) {
        e.preventDefault()
        console.log(data)

        const bearer = "Bearer " + loginToken;
        const response: Response = await fetch( config.apiURL+"/stripe/memberships?accountId="+accountId, {
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
        setMemberships([...memberships, setting])
        setErrorMessage("Adhésion créée avec succès");
        setOpenError(true);
        handleClose();
        return;

    }
    return (
        <Modal
            open={open}
            onClose={handleClose}
            aria-labelledby="modal-create-membership"
            aria-describedby="modale to create a membership"
            id="modal-create-setting"
        >
            <Paper elevation={1} className={"paper"} >
                <h1><Settings />  Créer une adhésion </h1>
                <form id="settings-form" onSubmit={onSubmit} >
                    <TextField
                        id="create-membership-title"
                        label="Nom de l'adhésion"
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
                    />
                    <TextField
                    label="Prix"
                    variant="outlined"
                    multiline
                    style={{ width: "30vw"}}
                    onChange={e => updateFields({ default_price_data: { currency: "eur", unit_amount: parseInt(e.target.value), recurring: { interval: "month", interval_count: 1 } } })}
                />
                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        style={{ width: "20vw", marginBottom: "2vh"}}
                    >Créer</Button>
                </form>
            </Paper>
        </Modal>
    )
}
