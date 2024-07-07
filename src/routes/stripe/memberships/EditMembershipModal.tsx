import React, {useContext, useEffect, useState} from "react";
import {Button, Modal, Paper, TextField} from "@mui/material";
import {Settings} from "@mui/icons-material";
import {ConfigContext} from "../../../index";

type WebSetting = {
    name: string,
    value: string,
    description: string,
    type: string
}

type FieldUpdatable = {
    name?: string;
    description?: string;
    default_price? : StripePriceDto;
}

type StripePriceDto = {
    currency: string;
    unit_amount: number;
    recurring: {
        interval: string;
        interval_count: number;
    };
}

type MembershipDTO = {
    id?: string;
    name: string;
    description: string;
    default_price: StripePriceDto | null;
}

export function EditMembershipModal({settings, setMemberships,setting, open, handleClose, loginToken, setErrorMessage, setOpenError}: {settings: any[], setMemberships: (settings: any[]) => void ,setting: any |undefined, open: boolean, handleClose: () => void, loginToken: string | undefined, setErrorMessage: (message: string) => void, setOpenError: (open: boolean) => void}) {
    const config = useContext(ConfigContext);
    const [data, setData] = useState<any |undefined>(setting)
    const [dataUpdated, setDataUpdated] = useState<FieldUpdatable>({})
    const [connectedAccount, setConnectedAccountId] = useState<string>("");

    useEffect(
        () => {
            if (setting){
                setData(setting)
            }
        }, [setting]
    )
    function updateFields(fields: Partial<FieldUpdatable>) {
        if (dataUpdated){
            setDataUpdated({...dataUpdated, ...fields})
        }
        if (data){
            setData({...data, ...fields})
        }
    }

    async function getSettings() {
        const response = await fetch(`${config.apiURL}/websiteSettings`);
        const data: WebSetting[] = await response.json();
        return data.find(item => item.name === 'stripe_account_id')?.value || "";
    }

    useEffect(
        () => {
            getSettings().then((data) => setConnectedAccountId(data));
        }, []
    )

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault()

        const bearer = "Bearer " + loginToken;
        const response: Response = await fetch( config.apiURL+"/stripe/memberships/"+data?.id+"?accountId="+connectedAccount, {
            method: "PATCH",
            body: JSON.stringify(dataUpdated),
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
        setMemberships(settings.map((s : MembershipDTO) => s.id === setting.id ? setting : s))
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
                    onChange={e => updateFields({ default_price: { currency: "eur", unit_amount: parseInt(e.target.value), recurring: { interval: "month", interval_count: 1 } } })}
                />
                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        style={{ width: "20vw", marginBottom: "2vh"}}
                    >Modifier</Button>
                </form>
            </Paper>
        </Modal>
    )
}